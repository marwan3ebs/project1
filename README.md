# Top Agents Collaboration

React Native / Expo mobile CRM for RE/MAX Top Agents. The app supports the university project goal of managing real estate inventory, resale purchase and rent workflows, agreement tracking, agent scheduling, biweekly manager reports, and team leader performance views.

## Features

- Manager dashboard with active inventory, signed agreements, closed deals, and potential commission.
- Inventory tracking for primary and resale units.
- Agreement records with unique codes, agreement type, source, start date, end date, customer details, and agent ownership.
- Resale deal pipeline with 10 phases from bringing the unit to closing and commission collection.
- Seller agreement expiry reminders based on a 3-month agreement window.
- Agent scheduling for meetings, previews, follow-ups, pricing, contract checks, and signing appointments.
- Biweekly report screen for signed agreements, closed deals, commission, and phase counts.
- Team leader view with team inventory, closed deals, target progress, and agent scorecards.
- Local demo persistence using AsyncStorage.

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

Start the Expo development server:

```bash
npm start
```

Use Expo Go on a phone by scanning the QR code from the terminal or Expo DevTools.

Run the web preview:

```bash
npm run web
```

Platform shortcuts:

```bash
npm run android
npm run ios
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
|   |-- PROJECT_OVERVIEW.md
|   |-- UI_UX_AUDIT.md
|   |-- TECHNICAL_AUDIT.md
|   |-- IMPROVEMENT_PLAN.md
|   |-- BRANCHING_STRATEGY.md
|   |-- ROADMAP.md
|   `-- PROJECT_AUDIT_REPORT.md
`-- src/
    |-- components/
    |-- constants/
    |-- data/
    |-- utils/
    |-- navigation/
    |-- screens/
    |-- features/
    |-- services/
    |-- hooks/
    |-- types/
    `-- assets/
```

`App.js` currently contains the app shell and screen components. The next refactor should move screens and feature logic into the documented `src/` folders.

## Screens and Modules

| Screen | Purpose |
| --- | --- |
| Home | Manager dashboard, reminders, today actions, pipeline summary. |
| Inventory | Add agreements, filter inventory, advance phases, close deals. |
| Schedule | Add meetings/follow-ups and track agreement deadlines. |
| Reports | Biweekly manager report and agent production summary. |
| Team | Team leader performance, targets, inventory, and commission. |

## Branching Strategy

| Branch | Purpose |
| --- | --- |
| `main` | Stable working branch. |
| `dev` | Integration branch for team development. |
| `AbouSeada` | Developer branch from `dev`. |
| `AhmedHassan` | Developer branch from `dev`. |
| `Maro` | Developer branch from `dev`. |

Expected flow:

```text
developer branches -> dev -> main
```

See `docs/BRANCHING_STRATEGY.md` for the full workflow.

## Team Workflow

1. Pull the latest `dev`.
2. Work on your assigned developer branch.
3. Commit focused changes with clear messages.
4. Push your branch.
5. Merge into `dev` after review/testing.
6. Merge `dev` into `main` only when the app is stable.

## Roadmap

1. Split `App.js` into navigation, screens, and feature modules.
2. Add role-based dashboards for Agent, Team Leader, and Manager.
3. Add compact inventory list, property detail, agreement detail, and edit screens.
4. Add search, filter, sort, date pickers, and stronger validation.
5. Add report export, calendar view, notifications, and activity timeline.
6. Add TypeScript, service layer, backend/API plan, and database schema.

## Documentation

- `docs/PROJECT_OVERVIEW.md`
- `docs/UI_UX_AUDIT.md`
- `docs/TECHNICAL_AUDIT.md`
- `docs/IMPROVEMENT_PLAN.md`
- `docs/BRANCHING_STRATEGY.md`
- `docs/ROADMAP.md`
- `docs/PROJECT_AUDIT_REPORT.md`
- `docs/WORK_LOG.md`
