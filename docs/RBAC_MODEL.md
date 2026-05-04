# RBAC Model

Updated: 2026-05-04

## Hierarchy

- Manager sees all teams, agents, properties, tasks, deals, and reports.
- Team Leader sees assigned team data and can manage team inventory, team tasks, and team reports.
- Agent sees only personal properties, tasks, deals, commissions, and reports.

## Demo Users

- Manager demo: `agent-manager`
- Team Leader demo: `agent-hana`
- Agent demo: `agent-sara`

The role switcher is available in the desktop header and Settings screen.

## Permission Matrix

| Permission | Manager | Team Leader | Agent |
| --- | --- | --- | --- |
| View properties | All | Team only | Own only |
| Create property | Yes | Yes | Yes |
| Edit property | All | Team only | Own only |
| Advance deal phase | All | Team only | Own only |
| Close deal | All | Team only | Own only |
| View reports | All | Team only | Own only |
| Manage users/teams | Yes | No | No |
| Assign/reassign property | Yes | Team only | No |
| View commissions | All | Team only | Own only |
| Create/complete tasks | All | Team only | Own only |
| Manage settings | Yes | No | No |

## Implementation

- `src/auth/roles.js` defines role names and labels.
- `src/auth/permissions.js` defines permission constants and role permissions.
- `src/auth/accessControl.js` implements `can`, property/report visibility, and scoped data filtering.
- `src/auth/currentUserDemo.js` defines demo users for role switching.

Screens receive already-filtered data from `MainNavigator`, while actions still update the full local data set after permission checks.
