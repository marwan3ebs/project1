# Next Backend Plan

The app should stay React Native / Expo. Backend work should be added behind services instead of replacing the app with a web-only stack.

## Recommended Backend Scope

- Authentication and roles.
- Users/agents/teams.
- Properties.
- Agreements.
- Deals and commissions.
- Tasks/follow-ups.
- Activity logs.
- Reports.
- Notifications.

## Suggested API Modules

- `auth`
- `users`
- `teams`
- `properties`
- `agreements`
- `deals`
- `tasks`
- `reports`
- `notifications`
- `activityLogs`

## Suggested Database Tables

- `users`
- `teams`
- `properties`
- `clients`
- `agreements`
- `workflow_phase_history`
- `tasks`
- `deals`
- `commissions`
- `activity_logs`
- `report_runs`
- `notifications`

## Integration Path

1. Keep AsyncStorage as demo/offline fallback.
2. Add `src/services/apiClient.js`.
3. Add authentication service.
4. Mirror current local data fields in backend DTOs.
5. Replace `storageService` calls gradually with API calls.
6. Keep report calculations reusable on the client, then move official report generation server-side.
7. Add audit logs for create, update, phase advance, close deal, and reset/seed actions.

## Security Rules

- Agents can see their own inventory and tasks.
- Team leaders can see their team.
- Managers can see all teams and reports.
- Commission fields should be restricted to team leaders/managers if needed.
- All agreement and deal writes must be validated server-side.
