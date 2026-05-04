export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  TEAM_LEADER: 'team_leader',
  AGENT: 'agent',
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Admin',
  [ROLES.MANAGER]: 'Manager',
  [ROLES.TEAM_LEADER]: 'Team Leader',
  [ROLES.AGENT]: 'Agent',
};

export function isManagerRole(role) {
  return role === ROLES.MANAGER || role === ROLES.ADMIN;
}
