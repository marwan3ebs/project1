import { PERMISSIONS, ROLE_PERMISSIONS } from './permissions.js';
import { ROLES } from './roles.js';

export function can(user, permission, resource) {
  if (!user?.isActive) {
    return false;
  }

  const allowed = new Set([...(ROLE_PERMISSIONS[user.role] || []), ...(user.permissions || [])]);
  if (!allowed.has(permission)) {
    return false;
  }

  if (!resource) {
    return true;
  }

  if (user.role === ROLES.MANAGER) {
    return true;
  }

  if (permission.includes('_team_') || permission.includes('team_')) {
    return hasTeamAccess(user, resource);
  }

  if (permission.includes('_own_') || permission === PERMISSIONS.ADVANCE_DEAL_PHASE) {
    return ownsResource(user, resource) || hasTeamAccess(user, resource);
  }

  if (permission === PERMISSIONS.CLOSE_DEAL) {
    return ownsResource(user, resource) || user.role === ROLES.TEAM_LEADER && hasTeamAccess(user, resource);
  }

  return true;
}

export function hasTeamAccess(user, resource) {
  const teamIds = user?.teamIds || [user?.teamId].filter(Boolean);
  if (!teamIds.length) {
    return false;
  }
  const resourceTeamIds = [
    resource.teamId,
    ...(resource.teamIds || []),
  ].filter(Boolean);
  return resourceTeamIds.some((teamId) => teamIds.includes(teamId));
}

export function ownsResource(user, resource) {
  return Boolean(user?.id && (resource?.agentId === user.id || resource?.id === user.id));
}

export function canViewProperty(user, property) {
  if (user.role === ROLES.MANAGER) {
    return can(user, PERMISSIONS.VIEW_ALL_PROPERTIES);
  }
  if (user.role === ROLES.TEAM_LEADER) {
    return can(user, PERMISSIONS.VIEW_TEAM_PROPERTIES, property);
  }
  return can(user, PERMISSIONS.VIEW_OWN_PROPERTIES, property) && ownsResource(user, property);
}

export function canEditProperty(user, property) {
  if (user.role === ROLES.MANAGER) {
    return can(user, PERMISSIONS.EDIT_TEAM_PROPERTY);
  }
  if (user.role === ROLES.TEAM_LEADER) {
    return can(user, PERMISSIONS.EDIT_TEAM_PROPERTY, property);
  }
  return can(user, PERMISSIONS.EDIT_OWN_PROPERTY, property) && ownsResource(user, property);
}

export function canCloseDeal(user, property) {
  if (user.role === ROLES.AGENT) {
    return can(user, PERMISSIONS.CLOSE_DEAL, property) && ownsResource(user, property);
  }
  return can(user, PERMISSIONS.CLOSE_DEAL, property);
}

export function canViewReport(user, resource) {
  if (user.role === ROLES.MANAGER) {
    return can(user, PERMISSIONS.VIEW_ALL_REPORTS);
  }
  if (user.role === ROLES.TEAM_LEADER) {
    return can(user, PERMISSIONS.VIEW_TEAM_REPORTS, resource);
  }
  return can(user, PERMISSIONS.VIEW_OWN_REPORTS, resource);
}

export function getVisibleTeams(user, teams) {
  if (user.role === ROLES.MANAGER) {
    return teams;
  }
  const teamIds = user.teamIds || [user.teamId].filter(Boolean);
  return teams.filter((team) => teamIds.includes(team.id));
}

export function getVisibleAgents(user, agents) {
  if (user.role === ROLES.MANAGER) {
    return agents;
  }
  if (user.role === ROLES.TEAM_LEADER) {
    const teamIds = user.teamIds || [user.teamId].filter(Boolean);
    return agents.filter((agent) => agent.id === user.id || teamIds.includes(agent.teamId));
  }
  return agents.filter((agent) => agent.id === user.id);
}

export function filterDataByUserAccess(user, data) {
  const properties = data.properties.filter((property) => canViewProperty(user, property));
  const propertyIds = new Set(properties.map((property) => property.id));
  const agents = getVisibleAgents(user, data.agents || []);
  const agentIds = new Set(agents.map((agent) => agent.id));
  const teams = getVisibleTeams(user, data.teams || []);

  return {
    ...data,
    properties,
    agents,
    users: getVisibleAgents(user, data.users || data.agents || []),
    teams,
    tasks: (data.tasks || []).filter(
      (task) => propertyIds.has(task.relatedPropertyId) || agentIds.has(task.agentId),
    ),
    deals: (data.deals || []).filter((deal) => propertyIds.has(deal.propertyId)),
  };
}
