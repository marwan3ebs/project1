import { canReassignProperty, canTransferAgent } from '../auth/accessControl.js';
import { daysFromToday } from '../utils/dateUtils.js';
import { appendOwnershipHistory, createOwnershipHistoryEntry } from '../utils/ownershipUtils.js';
import { AUDIT_ACTIONS, logAudit, logDenied } from './auditService.js';

function syncPropertyOwnership(data, propertyId, targetAgent) {
  return data.properties.map((property) =>
    property.id === propertyId
      ? {
          ...property,
          agentId: targetAgent.id,
          ownerAgentId: targetAgent.id,
          agentName: targetAgent.name,
          teamId: targetAgent.teamId,
          updatedBy: targetAgent.id,
          updatedAt: daysFromToday(0),
        }
      : property,
  );
}

export function reassignPropertyOwnership(data, user, propertyId, targetAgentId, reason = 'Ownership reassignment') {
  const property = data.properties.find((item) => item.id === propertyId);
  const targetAgent = data.agents.find((agent) => agent.id === targetAgentId);

  if (!canReassignProperty(user, property, targetAgent, data.teams || [])) {
    return logDenied(data, user, 'property_reassigned', 'property', propertyId, 'Cannot reassign property outside role scope.');
  }

  const properties = syncPropertyOwnership(data, propertyId, targetAgent);
  const tasks = (data.tasks || []).map((task) =>
    task.relatedPropertyId === propertyId
      ? { ...task, teamId: targetAgent.teamId }
      : task,
  );
  const deals = (data.deals || []).map((deal) =>
    deal.propertyId === propertyId
      ? { ...deal, agentId: targetAgent.id, ownerAgentId: targetAgent.id, teamId: targetAgent.teamId }
      : deal,
  );
  const agreements = (data.agreements || []).map((agreement) =>
    agreement.propertyId === propertyId
      ? { ...agreement, agentId: targetAgent.id, ownerAgentId: targetAgent.id, teamId: targetAgent.teamId, updatedAt: daysFromToday(0) }
      : agreement,
  );

  let next = {
    ...data,
    properties,
    tasks,
    deals,
    agreements,
  };

  next = appendOwnershipHistory(next, createOwnershipHistoryEntry({
    action: AUDIT_ACTIONS.PROPERTY_REASSIGNED,
    entityType: 'property',
    entityId: propertyId,
    fromUserId: property.ownerAgentId || property.agentId,
    toUserId: targetAgent.id,
    fromTeamId: property.teamId,
    toTeamId: targetAgent.teamId,
    performedBy: user,
    reason,
    createdAt: daysFromToday(0),
  }));

  return logAudit(next, {
    action: AUDIT_ACTIONS.PROPERTY_REASSIGNED,
    user,
    targetType: 'property',
    targetId: propertyId,
    details: reason,
  });
}

export function reassignTaskOwnership(data, user, taskId, targetAgentId, reason = 'Task reassignment') {
  const task = data.tasks.find((item) => item.id === taskId);
  const targetAgent = data.agents.find((agent) => agent.id === targetAgentId);
  const property = data.properties.find((item) => item.id === task?.relatedPropertyId);
  const canManager = user?.role === 'manager' || user?.role === 'admin';
  const canTeamLeader =
    user?.role === 'team_leader' &&
    task &&
    targetAgent &&
    user.teamIds?.includes(task.teamId || property?.teamId) &&
    user.teamIds?.includes(targetAgent.teamId);

  if (!task || !targetAgent || (!canManager && !canTeamLeader)) {
    return logDenied(data, user, 'task_reassigned', 'task', taskId, 'Cannot reassign task outside role scope.');
  }

  let next = {
    ...data,
    tasks: data.tasks.map((item) =>
      item.id === taskId
        ? {
            ...item,
            agentId: targetAgent.id,
            assignedAgentId: targetAgent.id,
            teamId: targetAgent.teamId,
            updatedAt: daysFromToday(0),
          }
        : item,
    ),
  };

  next = appendOwnershipHistory(next, createOwnershipHistoryEntry({
    action: AUDIT_ACTIONS.TASK_REASSIGNED,
    entityType: 'task',
    entityId: taskId,
    fromUserId: task.assignedAgentId || task.agentId,
    toUserId: targetAgent.id,
    fromTeamId: task.teamId || property?.teamId,
    toTeamId: targetAgent.teamId,
    performedBy: user,
    reason,
    createdAt: daysFromToday(0),
  }));

  return logAudit(next, {
    action: AUDIT_ACTIONS.TASK_REASSIGNED,
    user,
    targetType: 'task',
    targetId: taskId,
    details: reason,
  });
}

export function transferAgentTeam(data, user, agentId, toTeamId, reason = 'Agent transferred') {
  const agent = data.agents.find((item) => item.id === agentId);
  const fromTeam = data.teams.find((team) => team.id === agent?.teamId);
  const toTeam = data.teams.find((team) => team.id === toTeamId);

  if (!canTransferAgent(user, agent, fromTeam, toTeam)) {
    return logDenied(data, user, 'agent_transferred', 'agent', agentId, 'Cannot transfer agent outside role scope.');
  }

  const leaderId = toTeam.teamLeaderIds?.[0] || toTeam.leaderId || null;
  let next = {
    ...data,
    agents: data.agents.map((item) =>
      item.id === agentId
        ? {
            ...item,
            teamId: toTeam.id,
            teamIds: [toTeam.id],
            leaderId,
            updatedAt: daysFromToday(0),
          }
        : item,
    ),
    teams: data.teams.map((team) => {
      if (team.id === fromTeam.id) {
        return { ...team, agentIds: (team.agentIds || []).filter((id) => id !== agentId), updatedAt: daysFromToday(0) };
      }
      if (team.id === toTeam.id) {
        return { ...team, agentIds: [...new Set([...(team.agentIds || []), agentId])], updatedAt: daysFromToday(0) };
      }
      return team;
    }),
    properties: data.properties.map((property) =>
      property.ownerAgentId === agentId || property.agentId === agentId
        ? { ...property, teamId: toTeam.id, updatedAt: daysFromToday(0) }
        : property,
    ),
    tasks: data.tasks.map((task) =>
      task.assignedAgentId === agentId || task.agentId === agentId
        ? { ...task, teamId: toTeam.id, updatedAt: daysFromToday(0) }
        : task,
    ),
    deals: data.deals.map((deal) =>
      deal.ownerAgentId === agentId || deal.agentId === agentId
        ? { ...deal, teamId: toTeam.id }
        : deal,
    ),
    agreements: (data.agreements || []).map((agreement) =>
      agreement.ownerAgentId === agentId || agreement.agentId === agentId
        ? { ...agreement, teamId: toTeam.id, updatedAt: daysFromToday(0) }
        : agreement,
    ),
  };

  next.users = next.agents;
  next = appendOwnershipHistory(next, createOwnershipHistoryEntry({
    action: AUDIT_ACTIONS.AGENT_TRANSFERRED,
    entityType: 'agent',
    entityId: agentId,
    fromUserId: agentId,
    toUserId: agentId,
    fromTeamId: fromTeam.id,
    toTeamId: toTeam.id,
    performedBy: user,
    reason,
    createdAt: daysFromToday(0),
  }));

  return logAudit(next, {
    action: AUDIT_ACTIONS.AGENT_TRANSFERRED,
    user,
    targetType: 'agent',
    targetId: agentId,
    details: reason,
  });
}
