# Project Overview

## Product

Top Agents Collaboration is a React Native / Expo mobile CRM prototype for RE/MAX Top Agents. It is focused on real estate team operations: inventory tracking, resale purchase and rent workflows, seller and buyer agreements, scheduling, reminders, biweekly manager reporting, and team leader visibility.

## Current Status

The app is a working Expo prototype with seeded demo data and local persistence. It does not yet have authentication, a backend API, server-side roles, real notifications, report export, or production-grade validation.

## Tech Stack

| Area | Current choice |
| --- | --- |
| Runtime | Expo SDK 54 |
| UI framework | React Native 0.81 |
| Web preview | React Native Web |
| State | React `useState` and derived `useMemo` values |
| Persistence | `@react-native-async-storage/async-storage` |
| Language | JavaScript |
| Navigation | Manual tab state in `App.js` |
| Data source | Mock seed data plus AsyncStorage |

## Current Run Commands

```bash
npm install
npm start
```

Expo Go should be used from the QR code shown by `npm start`. Web preview can be opened with:

```bash
npm run web
```

## Current Modules

| Module | Current location | Notes |
| --- | --- | --- |
| App shell and screens | `App.js` | Contains dashboard, inventory, schedule, reports, team, cards, and screen logic. |
| Shared UI components | `src/components/index.js` | Card, section header, buttons, fields, segmented control, pills, progress bar, empty state. |
| Constants | `src/constants/index.js` | Company labels, phases, categories, agreement types, sources, task types. |
| Seed data | `src/data/sampleData.js` | Demo agents, teams, properties, agreements, and tasks. |
| Utilities | `src/utils/index.js` | Dates, money formatting, commission, agreement alerts, phase lookup, summaries. |
| Expo assets | `assets/` | Expo icon, splash, adaptive icon, favicon. |

## Data Model Summary

The current data shape has four top-level arrays:

- `agents`: agent identity, phone, leader, target.
- `teams`: team leader identity and title.
- `properties`: property/inventory/agreement/deal records.
- `tasks`: meetings, previews, follow-ups, pricing, contracts, and signing tasks.

Property records currently combine unit details, client information, agreement information, pipeline phase, and commission fields in one object. This is simple for a demo but should be normalized before backend integration.

## Repository Shape

The source is now organized into a clearer `src/` structure, while documentation lives under `docs/`. Screen extraction, navigation setup, services, hooks, and types are documented as next refactors rather than forced during this audit.
