# Technical Audit

## Summary

The project is now a cleaner Expo React Native CRM demo with separated navigation, screens, reusable components, services, utilities, upgraded seed data, and stronger CRM business logic. It is still a local/demo app, but it is no longer centralized in one large `App.js`.

## Framework, Dependencies, and Scripts

| Item | Finding |
| --- | --- |
| Framework | Expo SDK 54 with React Native 0.81 and React 19. |
| Entry | `index.js` registers `App.js` with Expo. |
| Scripts | `npm start`, `npm run android`, `npm run ios`, `npm run web`. |
| Persistence | AsyncStorage under key `top-agents-collaboration:v2`. |
| Web | `react-native-web` is installed and `npm run web` is configured. |
| Install | `npm install` completed successfully. |

Additional validation:

- `npx expo export --platform web` completed successfully.
- Expo start was validated on a local Metro port and returned HTTP `200`.
- Expo web preview was opened in Playwright; Home, Inventory, Schedule, Reports, and Team rendered without console errors or warnings.
- A `390x844` mobile viewport was checked for the Home screen.
- On `feature/full-crm-upgrade`, final validation also covered Add Agreement, Property Detail, phase advancement, closing a deal, report generation, reset demo data, and AsyncStorage persistence after reload.
- Browser console had no runtime errors. React Native Web emitted a known development warning for deprecated `props.pointerEvents`.

## Architecture

| Area | Current state | Risk |
| --- | --- | --- |
| Screens | Screen files live under `src/screens/`. | Lower; still JavaScript-only. |
| Navigation | Custom Expo-native tab/detail state in `MainNavigator`. | Medium; adequate for demo, but React Navigation is better later. |
| State | Central data state in navigator with CRM service actions. | Medium; enough for demo, replace with store/API later. |
| Persistence | AsyncStorage only. | High for multi-user CRM data. |
| Data models | Plain JavaScript objects. | Medium; missing compile-time safety. |
| Services | `storageService` and `crmService` now exist. | Medium; API service still pending. |
| Validation | Add property form has required-field validation. | Medium; schema validation still pending. |
| Error handling | Storage corruption falls back to seed data and shows a user notice. | Medium. |
| Testing | No test framework or validation scripts. | Medium. |

## Code Quality

Current strengths:

- `App.js` is a small shell.
- Screens, components, services, data, constants, and utilities are separated.
- CRM business actions are centralized in `crmService`.
- AsyncStorage load/save/reset behavior is centralized in `storageService`.
- Report, date, commission, filter, and validation utilities are reusable.
- Demo data now includes properties, agents, teams, tasks, deals, roles, phase history, and timestamps.

Remaining issues:

- There is no TypeScript or schema validation.
- No lint, format, test, or typecheck scripts exist.
- Form date fields are still plain text and should become date pickers.
- Business rules are client-only and should move to backend validation later.
- Lists still use `ScrollView`; large real datasets should use `FlatList`.

## Data Handling

Current data is created by `createSeedData()` and then persisted to AsyncStorage. The local model now includes `agents`, `teams`, `properties`, `tasks`, and `deals`. This makes the demo more realistic, but there is still no sync strategy, authenticated user identity, permissions model, audit trail, conflict handling, or backup/export.

Recommended future split:

- `clients`
- `properties`
- `agreements`
- `deals`
- `tasks`
- `users`
- `teams`
- `activities`
- `commissions`
- `reports`

## Backend/API Readiness

The current app is not backend-ready yet. Add a service layer before connecting APIs:

- `src/services/storageService.js` for local persistence.
- `src/services/apiClient.js` for HTTP calls.
- `src/services/agreementService.js` for agreement code and expiry rules.
- `src/services/reportService.js` for biweekly report calculations.
- `src/services/notificationService.js` for local and remote notifications.

## Security Concerns

- No authentication or role-based authorization.
- CRM and client data is stored locally in plain AsyncStorage.
- No field-level access control.
- No audit log for edits, deletes, or phase changes.
- No backend-side validation or trusted source of truth.

## Scalability Concerns

- Long lists are rendered inside a `ScrollView`, not virtualized lists.
- Large card-heavy inventory views will become slow with real data.
- Manual tab state cannot handle nested workflows.
- Report calculations run in the client on every render and will not scale to large datasets.
- No caching or pagination strategy exists.

## Dependency Audit

`npm install` completed, but `npm audit --audit-level=moderate` reported 11 moderate vulnerabilities from transitive Expo dependencies:

- `postcss` advisory through Expo Metro packages.
- `uuid` advisory through Expo config/prebuild packages.

The suggested `npm audit fix --force` would install `expo@49.0.23`, which is a breaking downgrade from Expo SDK 54. Do not force-fix during this audit. Revisit after choosing an Expo upgrade path.

## Recommended Technical Direction

1. Add React Navigation or Expo Router.
2. Split screens out of `App.js`.
3. Add TypeScript and shared CRM types.
4. Add schema validation with a library such as Zod.
5. Add services for storage, API, agreements, reports, and notifications.
6. Replace `ScrollView` lists with `FlatList` where records can grow.
7. Add linting, formatting, and a basic test setup.
8. Add role-based authentication before real CRM data is used.

## 2026-05-04 Update - Responsive RBAC Branch

- Added a dedicated theme layer under `src/theme/`.
- Added `useResponsive` for mobile/tablet/desktop branching.
- Added `src/auth/` with role constants, permission matrix, demo users, and access-control helpers.
- Navigation now filters data by current user scope before rendering screens.
- CRM write actions still update the full local data set, but permission checks run before mutation.
- Seed data now includes users and richer team hierarchy fields.
- Storage key moved to v3 to avoid stale v2 shape issues.
- Remaining technical risk: this is still a local demo without real auth, backend enforcement, audit logs, or server validation.
