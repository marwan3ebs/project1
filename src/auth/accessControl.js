import { PERMISSIONS, ROLE_PERMISSIONS } from './permissions.js';
import { ROLES, isManagerRole } from './roles.js';
import {
  canManageAcrossTeams,
  getTeamIds,
  isActiveUser,
  isInRoleScope,
  isOwnResource,
  isTeamResource,
} from './ownership.js';
import {
  filterAgentsByScope,
  filterAgreementsByScope,
  filterClientsByScope,
  filterDealsByScope,
  filterPropertiesByScope,
  filterTasksByScope,
  filterTeamsByScope,
  getUserScope,
} from './scopeFilters.js';

function allowedPermission(user, permission) {
  const allowed = new Set([...(ROLE_PERMISSIONS[user?.role] || []), ...(user?.permissions || [])]);
  return allowed.has(permission);
}

export function can(user, permission, resource = null, context = {}) {
  if (!isActiveUser(user) || !allowedPermission(user, permission)) {
    return false;
  }

  if (!resource) {
    return true;
  }

  const teams = context.teams || [];
  const targetAgent = context.targetAgent;

  if (isManagerRole(user.role)) {
    return true;
  }

  switch (permission) {
    case PERMISSIONS.DELETE_PROPERTY:
    case PERMISSIONS.APPROVE_AGREEMENT:
    case PERMISSIONS.OVERRIDE_AGREEMENT:
    case PERMISSIONS.MANAGE_USERS:
    case PERMISSIONS.MANAGE_TEAMS:
    case PERMISSIONS.MANAGE_SETTINGS:
      return false;

    case PERMISSIONS.REASSIGN_PROPERTY:
      return canReassignProperty(user, resource, targetAgent, teams);

    case PERMISSIONS.REASSIGN_TASK:
    case PERMISSIONS.ASSIGN_TASK:
      return user.role === ROLES.TEAM_LEADER && isTeamResource(user, resource, teams);

    case PERMISSIONS.VIEW_ALL_REPORTS:
      return false;

    case PERMISSIONS.VIEW_TEAM_REPORTS:
      return user.role === ROLES.TEAM_LEADER && isTeamResource(user, resource, teams);

    case PERMISSIONS.VIEW_OWN_REPORTS:
      return isOwnResource(user, resource) || isTeamResource(user, resource, teams);

    default:
      return isInRoleScope(user, resource, teams);
  }
}

export function canViewProperty(user, property, teams = []) {
  if (isManagerRole(user?.role)) {
    return can(user, PERMISSIONS.VIEW_ALL_PROPERTIES);
  }

  if (user?.role === ROLES.TEAM_LEADER) {
    return can(user, PERMISSIONS.VIEW_TEAM_PROPERTIES, property, { teams });
  }

  return can(user, PERMISSIONS.VIEW_OWN_PROPERTIES, property, { teams }) && isOwnResource(user, property);
}

export function canEditProperty(user, property, teams = []) {
  if (isManagerRole(user?.role)) {
    return can(user, PERMISSIONS.EDIT_TEAM_PROPERTY);
  }

  if (user?.role === ROLES.TEAM_LEADER) {
    return can(user, PERMISSIONS.EDIT_TEAM_PROPERTY, property, { teams });
  }

  return can(user, PERMISSIONS.EDIT_OWN_PROPERTY, property, { teams }) && isOwnResource(user, property);
}

export function canDeleteProperty(user, property, teams = []) {
  return Boolean(property && isManagerRole(user?.role) && can(user, PERMISSIONS.DELETE_PROPERTY, property, { teams }));
}

export function canCloseDeal(user, property, teams = []) {
  if (isManagerRole(user?.role)) {
    return can(user, PERMISSIONS.CLOSE_DEAL, property, { teams });
  }

  if (user?.role === ROLES.TEAM_LEADER) {
    return can(user, PERMISSIONS.CLOSE_DEAL, property, { teams }) && isTeamResource(user, property, teams);
  }

  return can(user, PERMISSIONS.CLOSE_DEAL, property, { teams }) && isOwnResource(user, property);
}

export function canManageUser(user, targetUser) {
  if (!targetUser) {
    return isManagerRole(user?.role) && can(user, PERMISSIONS.MANAGE_USERS);
  }

  return Boolean(isManagerRole(user?.role) && targetUser.id !== user.id && can(user, PERMISSIONS.MANAGE_USERS));
}

export function canTransferAgent(user, agent, fromTeam, toTeam) {
  if (!agent || !fromTeam || !toTeam || fromTeam.id === toTeam.id) {
    return false;
  }

  if (canManageAcrossTeams(user)) {
    return true;
  }

  const teamIds = getTeamIds(user);
  return Boolean(
    user?.role === ROLES.TEAM_LEADER &&
      teamIds.includes(fromTeam.id) &&
      teamIds.includes(toTeam.id) &&
      agent.role === ROLES.AGENT,
  );
}

export function canReassignProperty(user, property, targetAgent, teams = []) {
  if (!property || !targetAgent || targetAgent.status === 'inactive' || targetAgent.isActive === false) {
    return false;
  }

  if (canManageAcrossTeams(user)) {
    return true;
  }

  if (user?.role !== ROLES.TEAM_LEADER) {
    return false;
  }

  return isTeamResource(user, property, teams) && getTeamIds(user).includes(targetAgent.teamId);
}

export function canViewReport(user, reportScope) {
  if (isManagerRole(user?.role)) {
    return true;
  }

  if (user?.role === ROLES.TEAM_LEADER) {
    return reportScope === 'team' || reportScope === 'personal';
  }

  return reportScope === 'personal';
}

export function canViewCommission(user, commission, teams = []) {
  if (isManagerRole(user?.role)) {
    return can(user, PERMISSIONS.VIEW_COMMISSIONS);
  }

  return can(user, PERMISSIONS.VIEW_COMMISSIONS, commission, { teams });
}

export function getVisibleTeams(user, teams) {
  return filterTeamsByScope(user, teams);
}

export function getVisibleAgents(user, agents, teams = []) {
  return filterAgentsByScope(user, agents, teams);
}

export function filterDataByUserAccess(user, data) {
  const teams = data.teams || [];
  const properties = filterPropertiesByScope(user, data.properties || [], teams);
  const clients = filterClientsByScope(user, data.clients || [], data.properties || [], teams);
  const agreements = filterAgreementsByScope(user, data.agreements || [], data.properties || [], teams);
  const deals = filterDealsByScope(user, data.deals || [], data.properties || [], teams);
  const tasks = filterTasksByScope(user, data.tasks || [], data.properties || [], teams);
  const agents = filterAgentsByScope(user, data.agents || data.users || [], teams);
  const visibleTeams = filterTeamsByScope(user, teams);

  return {
    ...data,
    properties,
    clients,
    agreements,
    deals,
    tasks,
    agents,
    users: agents,
    teams: visibleTeams,
    scope: getUserScope(user, data),
  };
}
