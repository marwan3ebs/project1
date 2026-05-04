import { canManageUser } from '../auth/accessControl.js';
import { ROLES } from '../auth/roles.js';
import { daysFromToday } from '../utils/dateUtils.js';
import { hasActiveOwnedWork } from '../utils/ownershipUtils.js';
import { AUDIT_ACTIONS, logAudit, logDenied } from './auditService.js';

function buildAgent(form, data, user) {
  const team = data.teams.find((item) => item.id === form.teamId);
  const id = form.id || `agent-${Date.now()}`;
  const now = daysFromToday(0);

  return {
    id,
    name: String(form.name || '').trim(),
    email: String(form.email || '').trim(),
    phone: String(form.phone || '').trim(),
    role: form.role || ROLES.AGENT,
    teamId: form.teamId,
    teamIds: [form.teamId].filter(Boolean),
    leaderId: team?.teamLeaderIds?.[0] || team?.leaderId || null,
    managerId: team?.managerId || user?.id || null,
    status: form.status || 'active',
    isActive: form.status !== 'inactive',
    target: Number(form.target || 0),
    permissions: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function addAgent(data, user, form) {
  if (!canManageUser(user)) {
    return logDenied(data, user, 'agent_created', 'agent', form?.id, 'Only manager/admin can create users.');
  }

  const agent = buildAgent(form, data, user);
  let next = {
    ...data,
    agents: [agent, ...data.agents],
    teams: data.teams.map((team) =>
      team.id === agent.teamId
        ? { ...team, agentIds: [...new Set([...(team.agentIds || []), agent.id])], updatedAt: daysFromToday(0) }
        : team,
    ),
  };
  next.users = next.agents;

  return logAudit(next, {
    action: AUDIT_ACTIONS.AGENT_CREATED,
    user,
    targetType: 'agent',
    targetId: agent.id,
    details: `${agent.name} added to ${agent.teamId}`,
  });
}

export function updateAgent(data, user, agentId, patch) {
  const target = data.agents.find((agent) => agent.id === agentId);

  if (!canManageUser(user, target)) {
    return logDenied(data, user, 'agent_updated', 'agent', agentId, 'Only manager/admin can edit users.');
  }

  let next = {
    ...data,
    agents: data.agents.map((agent) =>
      agent.id === agentId
        ? {
            ...agent,
            name: patch.name ?? agent.name,
            email: patch.email ?? agent.email,
            phone: patch.phone ?? agent.phone,
            target: Number(patch.target ?? agent.target ?? 0),
            role: patch.role || agent.role,
            status: patch.status || agent.status,
            isActive: (patch.status || agent.status) !== 'inactive',
            updatedAt: daysFromToday(0),
          }
        : agent,
    ),
  };
  next.users = next.agents;

  return logAudit(next, {
    action: AUDIT_ACTIONS.AGENT_UPDATED,
    user,
    targetType: 'agent',
    targetId: agentId,
    details: 'Agent profile updated.',
  });
}

export function deactivateAgent(data, user, agentId) {
  const target = data.agents.find((agent) => agent.id === agentId);
  const ownedWork = hasActiveOwnedWork(data, agentId);

  if (!canManageUser(user, target)) {
    return logDenied(data, user, 'agent_deactivated', 'agent', agentId, 'Only manager/admin can deactivate users.');
  }

  if (ownedWork.blocked) {
    return logDenied(
      data,
      user,
      'agent_deactivated',
      'agent',
      agentId,
      `Blocked: ${ownedWork.activeProperties.length} active properties, ${ownedWork.activeTasks.length} active tasks, ${ownedWork.activeDeals.length} open deals.`,
    );
  }

  let next = {
    ...data,
    agents: data.agents.map((agent) =>
      agent.id === agentId
        ? { ...agent, status: 'inactive', isActive: false, updatedAt: daysFromToday(0) }
        : agent,
    ),
  };
  next.users = next.agents;

  return logAudit(next, {
    action: AUDIT_ACTIONS.AGENT_DEACTIVATED,
    user,
    targetType: 'agent',
    targetId: agentId,
    details: 'Agent deactivated after ownership check.',
  });
}

export function deleteAgent(data, user, agentId) {
  const target = data.agents.find((agent) => agent.id === agentId);
  const ownedWork = hasActiveOwnedWork(data, agentId);

  if (!canManageUser(user, target)) {
    return logDenied(data, user, 'agent_deleted', 'agent', agentId, 'Only manager/admin can delete users.');
  }

  if (ownedWork.blocked) {
    return logDenied(
      data,
      user,
      'agent_deleted',
      'agent',
      agentId,
      `Blocked: reassign active work first (${ownedWork.activeProperties.length} properties, ${ownedWork.activeTasks.length} tasks, ${ownedWork.activeDeals.length} deals).`,
    );
  }

  let next = {
    ...data,
    agents: data.agents.filter((agent) => agent.id !== agentId),
    teams: data.teams.map((team) => ({
      ...team,
      agentIds: (team.agentIds || []).filter((id) => id !== agentId),
      teamLeaderIds: (team.teamLeaderIds || []).filter((id) => id !== agentId),
    })),
  };
  next.users = next.agents;

  return logAudit(next, {
    action: AUDIT_ACTIONS.AGENT_DELETED,
    user,
    targetType: 'agent',
    targetId: agentId,
    details: 'Agent hard-deleted after zero active ownership.',
  });
}
