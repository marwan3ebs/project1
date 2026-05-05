# CRM Actions

Updated: 2026-05-05

## Property Actions

- View details.
- Edit through scoped local actions.
- Add follow-up.
- Schedule meeting.
- Schedule initial/buyer preview.
- Add negotiation note.
- Add pricing note.
- Add contract check task.
- Start marketing.
- Upgrade open agreement to exclusive.
- Renew agreement for 3 months.
- Mark agreement expired.
- Advance phase.
- Move back phase with reason.
- Reassign property.
- Transfer agent/team ownership from Team screen.
- Close deal.
- Reopen deal.
- Mark commission received.
- Archive property.
- Delete property, manager/admin only.
- Desktop inventory exposes these through compact action menus instead of crowded visible buttons.

## Client Actions

- Add client through property creation.
- Add client note.
- Log call.
- Schedule follow-up.

## Agreement Actions

- Create agreement through Add Agreement.
- Renew agreement.
- Change open to exclusive.
- Mark expired.
- Request approval via `requiresApproval`.
- Manager/admin approve/override in Property Detail.

## Task Actions

- Add task.
- Edit task through scoped quick actions.
- Complete task.
- Reopen task.
- Change priority.
- Set due date.
- Reassign task from Team screen.

## Action Guarantees

Every important action:

- Checks RBAC in `MainNavigator` or service-level ownership helpers.
- Updates local state.
- Persists through AsyncStorage.
- Logs success or denied attempts into `auditLog`.

## Persistence

Storage key: `top-agents-collaboration:v5`.

Legacy v4/v3 demo data is migrated through `normalizeCrmData`.
