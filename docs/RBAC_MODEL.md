# RBAC Model

Updated: 2026-05-04

## Roles

- `manager` / `admin`: company-wide access.
- `team_leader`: only teams listed in `teamIds`.
- `agent`: only owned records where the agent is `ownerAgentId`, `assignedAgentId`, or `agentId`.

## Permission Matrix

| Area | Manager/Admin | Team Leader | Agent |
| --- | --- | --- | --- |
| Properties view | All | Team only | Own only |
| Properties add | Yes | Yes | Yes |
| Properties edit | All | Team only | Own only |
| Properties delete | Yes | No | No |
| Clients view | All | Team only | Own only |
| Clients add/edit | Yes | Yes | Yes |
| Agreements view/create | All | Team only | Own only |
| Agreements approve/override | Yes | No | No |
| Deal pipeline view/move | All | Team only | Own only |
| Mark deal closed | Yes | Yes, team only | Yes, own only |
| Tasks view/create/complete | All | Team only | Own only |
| Company reports | Yes | No | No |
| Team reports | Yes | Own team | No |
| Personal performance | Yes | Yes | Yes |
| Commissions view | All | Team only | Own only |
| Record commission received | Yes | Team only | Own only |
| Manage users/roles | Yes | No | No |
| Company settings | Yes | No | No |

## Implementation

- `src/auth/roles.js`: role constants, labels, and manager/admin role helper.
- `src/auth/permissions.js`: exact permission constants and role permission lists.
- `src/auth/ownership.js`: ownership/team resolution helpers.
- `src/auth/scopeFilters.js`: scoped filters for properties, clients, agreements, deals, tasks, agents, and teams.
- `src/auth/accessControl.js`: `can(user, permission, resource, context)` and business-specific helpers.

Required helpers implemented:

- `can`
- `getUserScope`
- `filterPropertiesByScope`
- `filterClientsByScope`
- `filterAgreementsByScope`
- `filterDealsByScope`
- `filterTasksByScope`
- `filterAgentsByScope`
- `canViewProperty`
- `canEditProperty`
- `canDeleteProperty`
- `canManageUser`
- `canTransferAgent`
- `canReassignProperty`
- `canViewReport`
- `canViewCommission`

## Data Visibility

`MainNavigator` calculates `visibleData` with `filterDataByUserAccess(currentUser, data)` and passes scoped data to every screen. Actions still run against the full local data set, but every important action checks RBAC before mutating state and logs denied attempts.

## Known Limitations

- This is still a local Expo/AsyncStorage demo, not a backend-enforced security system.
- Role switching is intentionally visible for demo validation.
- Hard security must move to server-side policy when a backend is added.
