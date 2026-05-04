import { ROLES, isManagerRole } from './roles.js';

export function isActiveUser(user) {
  return Boolean(user && user.status !== 'inactive' && user.isActive !== false);
}

export function getTeamIds(user) {
  return [...new Set([...(user?.teamIds || []), user?.teamId].filter(Boolean))];
}

export function getResourceOwnerId(resource) {
  return (
    resource?.ownerAgentId ||
    resource?.assignedAgentId ||
    resource?.agentId ||
    resource?.userId ||
    resource?.id ||
    null
  );
}

export function getResourceTeamId(resource, properties = []) {
  if (resource?.teamId) {
    return resource.teamId;
  }

  const propertyId = resource?.propertyId || resource?.relatedPropertyId;
  const property = properties.find((item) => item.id === propertyId);
  return property?.teamId || null;
}

export function isOwnResource(user, resource) {
  return Boolean(user?.id && getResourceOwnerId(resource) === user.id);
}

export function isTeamResource(user, resource, teams = []) {
  if (!user) {
    return false;
  }

  const userTeamIds = getTeamIds(user);
  const resourceTeamIds = [
    getResourceTeamId(resource),
    ...(resource?.teamIds || []),
  ].filter(Boolean);

  if (resource?.id && teams.some((team) => team.id === resource.id && userTeamIds.includes(team.id))) {
    return true;
  }

  return resourceTeamIds.some((teamId) => userTeamIds.includes(teamId));
}

export function isInRoleScope(user, resource, teams = []) {
  if (!isActiveUser(user)) {
    return false;
  }

  if (isManagerRole(user.role)) {
    return true;
  }

  if (user.role === ROLES.TEAM_LEADER) {
    return isOwnResource(user, resource) || isTeamResource(user, resource, teams);
  }

  return isOwnResource(user, resource);
}

export function canManageAcrossTeams(user) {
  return isActiveUser(user) && isManagerRole(user.role);
}
