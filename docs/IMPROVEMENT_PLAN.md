# Improvement Plan

## Feature Gap Analysis

| CRM capability | Current support | Priority | Notes |
| --- | --- | --- | --- |
| Authentication/login roles | Missing | High | Required before real users. |
| Agent role | Partial | High | Agents exist in data, but no agent login/dashboard. |
| Team leader role | Partial | High | Team view exists, but no permissions or drill-down. |
| Manager/admin role | Partial | High | Manager dashboard exists, but no admin controls. |
| Property/unit inventory | Partial | High | Add/search/filter exists, but detail/edit/delete and images are missing. |
| Agreement management | Partial | High | Agreement fields exist inside property records. Needs dedicated workflow. |
| Agreement unique code/ID | Partial | High | Code exists, but generation can duplicate with deletion/concurrency. |
| Agreement start/end date | Present | High | Dates are plain text inputs, not validated. |
| 3-month seller agreement expiry logic | Partial | High | Auto end date and reminders exist, but renewal/escalation is missing. |
| Open/exclusive/rent agreement types | Present | High | Basic agreement type constants exist. |
| Buyer/seller customer details | Partial | High | Basic name/phone/side only. Needs client profiles. |
| Deal pipeline with resale phases | Partial | High | 10 phases exist, but no Kanban/detail/edit history. |
| Scheduling meetings and follow-ups | Partial | High | Task list and add form exist. Needs calendar and reminders. |
| Reminder system | Partial | High | Expiry reminders are calculated in UI. No notifications. |
| Biweekly reports | Partial | High | In-app report exists. No export or saved reports. |
| Agent performance tracking | Partial | Medium | Scorecards exist. Needs targets, trends, and leaderboards. |
| Team performance dashboard | Partial | Medium | Team screen exists. Needs comparisons and drill-down. |
| Commission tracking | Partial | Medium | Commission calculation exists. Needs collection status and splits. |
| Search/filter/sort inventory | Partial | High | Filters exist. Search and sort are missing. |
| Export report feature | Missing | Medium | Needed for manager submission. |
| Notifications | Missing | Medium | Needed for expiry and follow-up reminders. |
| Activity history/logs | Missing | Medium | Needed for accountability and CRM quality. |

## Must-Have Before Demo

- Keep the app running in Expo Go and web preview.
- Add clear role-based demo entry points for Agent, Team Leader, and Manager.
- Split the largest screens out of `App.js` into `src/screens/`.
- Add compact inventory list and property detail screen.
- Add search by agreement code, client name, phone, location, and project.
- Add date validation and numeric validation for agreement forms.
- Add agreement expiry status: valid, ending soon, expired.
- Add report export plan or simple CSV export if time allows.
- Add README, contribution guide, branch strategy, and project docs.

## Should-Have For Better CRM Quality

- Use React Navigation or Expo Router.
- Add TypeScript models for agents, teams, properties, agreements, tasks, and reports.
- Add an agreement detail screen with renewal and status actions.
- Add a Kanban-style resale deal pipeline.
- Add calendar grouping for meetings and reminders.
- Add client profile and follow-up history.
- Add commission collection status.
- Add team leaderboard with target progress.
- Add reusable design tokens for color, spacing, type, and radius.
- Add linting and basic unit tests for utilities.

## Nice-To-Have Advanced Features

- Backend/API integration.
- Database schema and migrations.
- PDF/Excel biweekly report export.
- Push/local notifications for agreements ending soon.
- Property image upload.
- Advanced filters by location, price, area, agent, agreement type, and deal phase.
- Activity timeline per property and client.
- Dark/light theme.
- Analytics charts for pipeline, conversion, inventory value, and agent output.
- Data backup/export.
- Offline sync strategy.

## Suggested Additional Features

- Role-based dashboards for Agent, Team Leader, and Manager.
- Kanban deal pipeline with drag-and-drop phase updates.
- Calendar view for meetings, previews, contract checks, and signing.
- Agreement expiry alerts with renewal action.
- Commission calculator with buyer/seller/rent modes.
- Client follow-up history and next-action reminders.
- Biweekly PDF/Excel export.
- Team leaderboard and target progress.
- Notification center for overdue tasks and expiring agreements.
- Backend-ready database schema.
