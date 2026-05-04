import { ROLES, isManagerRole } from './roles.js';
import { getResourceTeamId, getTeamIds, isOwnResource, isTeamResource } from './ownership.js';

export function getUserScope(user, data = {}) {
  if (!user) {
    return { type: 'none', teamIds: [], userIds: [] };
  }

  if (isManagerRole(user.role)) {
    return {
      type: 'company',
      teamIds: (data.teams || []).map((team) => team.id),
      userIds: (data.agents || data.users || []).map((agent) => agent.id),
    };
  }

  const teamIds = getTeamIds(user);

  if (user.role === ROLES.TEAM_LEADER) {
    const teamAgents = (data.agents || data.users || [])
      .filter((agent) => teamIds.includes(agent.teamId) || (agent.teamIds || []).some((teamId) => teamIds.includes(teamId)))
      .map((agent) => agent.id);

    return {
      type: 'team',
      teamIds,
      userIds: [...new Set([user.id, ...teamAgents])],
    };
  }

  return { type: 'own', teamIds, userIds: [user.id] };
}

export function filterPropertiesByScope(user, properties = [], teams = []) {
  if (isManagerRole(user?.role)) {
    return properties;
  }

  if (user?.role === ROLES.TEAM_LEADER) {
    return properties.filter((property) => isTeamResource(user, property, teams) || isOwnResource(user, property));
  }

  return properties.filter((property) => isOwnResource(user, property));
}

export function filterClientsByScope(user, clients = [], properties = [], teams = []) {
  if (isManagerRole(user?.role)) {
    return clients;
  }

  const visiblePropertyIds = new Set(filterPropertiesByScope(user, properties, teams).map((property) => property.id));

  return clients.filter((client) => {
    if (isOwnResource(user, client)) {
      return true;
    }

    if (client.propertyIds?.some((propertyId) => visiblePropertyIds.has(propertyId))) {
      return true;
    }

    const relatedProperty = properties.find((property) => property.clientId === client.id);
    return Boolean(relatedProperty && visiblePropertyIds.has(relatedProperty.id));
  });
}

export function filterAgreementsByScope(user, agreements = [], properties = [], teams = []) {
  if (isManagerRole(user?.role)) {
    return agreements;
  }

  const visiblePropertyIds = new Set(filterPropertiesByScope(user, properties, teams).map((property) => property.id));

  return agreements.filter((agreement) => {
    const propertyId = agreement.propertyId;
    return visiblePropertyIds.has(propertyId) || isOwnResource(user, agreement) || isTeamResource(user, agreement, teams);
  });
}

export function filterDealsByScope(user, deals = [], properties = [], teams = []) {
  if (isManagerRole(user?.role)) {
    return deals;
  }

  const visiblePropertyIds = new Set(filterPropertiesByScope(user, properties, teams).map((property) => property.id));

  return deals.filter((deal) => {
    const teamId = getResourceTeamId(deal, properties);
    return (
      visiblePropertyIds.has(deal.propertyId) ||
      isOwnResource(user, deal) ||
      (teamId && getTeamIds(user).includes(teamId))
    );
  });
}

export function filterTasksByScope(user, tasks = [], properties = [], teams = []) {
  if (isManagerRole(user?.role)) {
    return tasks;
  }

  const visiblePropertyIds = new Set(filterPropertiesByScope(user, properties, teams).map((property) => property.id));

  return tasks.filter((task) => {
    const teamId = getResourceTeamId(task, properties);
    return (
      visiblePropertyIds.has(task.relatedPropertyId) ||
      visiblePropertyIds.has(task.propertyId) ||
      isOwnResource(user, task) ||
      task.assignedAgentId === user?.id ||
      task.agentId === user?.id ||
      (user?.role === ROLES.TEAM_LEADER && teamId && getTeamIds(user).includes(teamId))
    );
  });
}

export function filterAgentsByScope(user, agents = [], teams = []) {
  if (isManagerRole(user?.role)) {
    return agents;
  }

  if (user?.role === ROLES.TEAM_LEADER) {
    const teamIds = getTeamIds(user);
    return agents.filter(
      (agent) =>
        agent.id === user.id ||
        teamIds.includes(agent.teamId) ||
        (agent.teamIds || []).some((teamId) => teamIds.includes(teamId)),
    );
  }

  return agents.filter((agent) => agent.id === user?.id);
}

export function filterTeamsByScope(user, teams = []) {
  if (isManagerRole(user?.role)) {
    return teams;
  }

  const teamIds = getTeamIds(user);
  return teams.filter((team) => teamIds.includes(team.id));
}
