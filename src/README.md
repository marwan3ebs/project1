# Source Structure

The app is currently a compact Expo prototype. Shared helpers have been organized into folders, while screen extraction is planned for the next development phase.

## Current Active Folders

- `components/`: shared presentational components.
- `constants/`: domain constants and labels.
- `data/`: seed/demo data.
- `utils/`: date, money, commission, agreement, and summary helpers.

## Planned Folders

- `navigation/`: React Navigation or Expo Router setup.
- `screens/`: screen-level components extracted from `App.js`.
- `features/`: feature modules for inventory, agreements, scheduling, reports, teams, and auth.
- `services/`: storage, API, reporting, notification, and agreement services.
- `hooks/`: reusable React hooks.
- `types/`: TypeScript types or JSDoc model definitions.
- `assets/`: feature-level assets if needed. Expo app icons remain in root `assets/`.
