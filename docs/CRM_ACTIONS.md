# CRM Actions

Updated: 2026-05-04

## Property and Deal Actions

- View details.
- Advance workflow phase.
- Move workflow phase back with a demo reason.
- Add follow-up task.
- Add negotiation meeting.
- Add contract check task.
- Renew agreement for 3 months.
- Upgrade open agreement to exclusive.
- Mark marketing started.
- Schedule buyer preview.
- Close deal.
- Reopen property.
- Mark commission received.
- Duplicate property.
- Archive property.

## Client and Agreement Actions

- Agreement code generation remains automatic on new properties.
- Renewal recalculates agreement dates.
- Agreement type can be upgraded to exclusive.
- Follow-up, meeting, and preview actions create task records linked to the property.

## Task Actions

- Add task.
- Mark task done.
- Reopen task.
- Filtered visibility by role.

## Report Actions

- Generate biweekly report summary.
- Report data is scoped by current role:
  - Manager: company.
  - Team Leader: team.
  - Agent: personal.

## Persistence

All actions update local state and persist through AsyncStorage under the v3 demo storage key.
