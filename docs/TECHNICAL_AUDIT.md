# Technical Audit

## Summary

The project is a small Expo React Native app that can be developed quickly, but most architecture is still centralized in `App.js`. It is appropriate for a university demo prototype. It needs navigation, state boundaries, typed models, service layers, validation, and backend-ready data contracts before it should grow into a full CRM.

## Framework, Dependencies, and Scripts

| Item | Finding |
| --- | --- |
| Framework | Expo SDK 54 with React Native 0.81 and React 19. |
| Entry | `index.js` registers `App.js` with Expo. |
| Scripts | `npm start`, `npm run android`, `npm run ios`, `npm run web`. |
| Persistence | AsyncStorage under key `top-agents-collaboration:v1`. |
| Web | `react-native-web` is installed and `npm run web` is configured. |
| Install | `npm install` completed successfully. |

Additional validation:

- `npx expo export --platform web` completed successfully.
- Expo start was validated on a local Metro port and returned HTTP `200`.
- Expo web preview was opened in Playwright; Home, Inventory, Schedule, Reports, and Team rendered without console errors or warnings.
- A `390x844` mobile viewport was checked for the Home screen.

## Architecture

| Area | Current state | Risk |
| --- | --- | --- |
| Screens | All screen components live in `App.js`. | High as feature count grows. |
| Navigation | Manual tab state, no route stack. | High for detail/edit workflows. |
| State | Central `useState` data object and local mutations. | Medium; simple but hard to test and sync. |
| Persistence | AsyncStorage only. | High for multi-user CRM data. |
| Data models | Plain JavaScript objects. | Medium; missing compile-time safety. |
| Services | No service layer. | High for future API integration. |
| Validation | Minimal alert-based required checks. | High for data quality. |
| Error handling | Storage write errors are ignored. | Medium. |
| Testing | No test framework or validation scripts. | Medium. |

## Code Quality

Strengths:

- Code is readable and uses simple React patterns.
- Domain constants and utility functions are separated from UI.
- Seed data is separated from the main app after the organization pass.
- Utility functions for dates, money, commission, phase lookup, and alerts keep some logic reusable.

Issues:

- `App.js` is about 1,400 lines and mixes app shell, screens, actions, forms, and styles.
- Property records combine property, client, agreement, deal, and commission concerns.
- There are no dedicated feature modules yet.
- There is no TypeScript or schema validation.
- No lint, format, test, or typecheck scripts exist.
- Forms accept invalid dates, invalid numbers, and arbitrary client side values.
- Agreement code generation is based on array length, so duplicate codes are possible after deletion or concurrent creation.
- AsyncStorage parse failures are not handled explicitly.
- Business rules are client-only and can be bypassed if a backend is added later without validation.

## Data Handling

Current data is created by `createSeedData()` and then persisted to AsyncStorage. This makes the demo work offline, but there is no sync strategy, user identity, permissions model, audit trail, conflict handling, or backup/export.

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
