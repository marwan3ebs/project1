# Top Agents Collaboration

React Native / Expo CRM demo for RE/MAX Top Agents. The app manages real estate inventory, seller and rent agreements, resale workflow phases, agent scheduling, biweekly reporting, role-based dashboards, team performance, and local demo persistence.

## Current Features

- Professional manager dashboard with active inventory, signed agreements, closed deals, potential commission, expiring agreements, and today's tasks.
- Upgraded inventory with search, filters, CRM badges, agreement expiry status, commission estimates, phase progress, view details, advance phase, and close deal actions.
- Property detail screen with customer/contact details, agreement information, phase timeline, related follow-ups, and commission summary.
- Add property/agreement form with required-field validation, generated agreement code, 3-month agreement end-date default, commission fields, and AsyncStorage save.
- Schedule screen for meetings, previews, follow-ups, pricing, contract checks, signing, and agreement expiry tasks.
- Biweekly report screen with agent performance, commission totals, phase distribution, team totals, and export-ready summary text.
- Team leader dashboard with inventory, target progress, closed deals, exclusive listings, follow-up load, and commission scorecards.
- Settings/demo screen for reset, seeding, app info, and role demo explanation.
- Local persistence with AsyncStorage and safe fallback to seed data if stored data is corrupted.
- Responsive desktop CRM layout with sidebar navigation, max-width content, compact tables, and smaller desktop action buttons.
- Role switcher for Manager, Team Leader, and Agent demos with scoped data visibility.
- Advanced local CRM actions including renewal, exclusivity upgrade, task creation, marketing start, buyer preview, duplicate, archive, reopen, and commission received.

## Tech Stack

- Expo SDK 54
- React 19
- React Native 0.81
- React Native Web
- AsyncStorage
- JavaScript

## Installation

```bash
npm install
```

## Running With Expo

```bash
npm start
```

Use Expo Go on a phone by scanning the QR code. For web preview:

```bash
npm run web
```

Useful validation command:

```bash
npx expo export --platform web
```

## Folder Structure

```text
.
|-- App.js
|-- index.js
|-- app.json
|-- package.json
|-- assets/
|-- docs/
`-- src/
    |-- components/
    |-- constants/
    |-- data/
    |-- auth/
    |-- theme/
    |-- navigation/
    |-- screens/
    |-- services/
    |-- utils/
    |-- features/
    |-- hooks/
    |-- types/
    `-- assets/
```

## Main Screens

| Screen | Purpose |
| --- | --- |
| Home | Manager CRM dashboard, urgent reminders, tasks, pipeline summary. |
| Inventory | Search/filter inventory, view details, advance phase, close deals. |
| Property Details | Full CRM record with agreement, customer, timeline, tasks, commission. |
| Add Agreement | Create property/agreement records with validation. |
| Schedule | Add and manage CRM follow-ups and meetings. |
| Reports | Generate biweekly manager report data and export-ready text. |
| Team | Team leader scorecards and performance tracking. |
| Settings | Reset/seed demo data, switch roles, and inspect permission scope. |

## Demo Workflow

1. Start on Home and explain manager summary cards.
2. Open Inventory and search/filter agreements.
3. Open a Property Detail screen and show customer, agreement, timeline, tasks, and commission.
4. Advance a phase and explain the resale workflow.
5. Close a deal and show confirmed commission.
6. Open Reports and generate the biweekly summary.
7. Open Team to show team leader tracking.
8. Switch role to Team Leader or Agent to show scoped data.
9. Open Settings and reset demo data.

## Branch Workflow

Stable flow:

```text
feature branches -> dev -> main
```

Current upgrade branch:

```text
feature/responsive-rbac-crm-actions
```

Do not merge this feature branch into `dev` until validation is complete and reviewed.

## Documentation

- `docs/CRM_DATA_MODEL.md`
- `docs/DEMO_SCRIPT.md`
- `docs/RBAC_MODEL.md`
- `docs/UI_RESPONSIVE_REDESIGN.md`
- `docs/CRM_ACTIONS.md`
- `docs/NEXT_BACKEND_PLAN.md`
- `docs/TECHNICAL_AUDIT.md`
- `docs/UI_UX_AUDIT.md`
- `docs/ROADMAP.md`
- `docs/WORK_LOG.md`
