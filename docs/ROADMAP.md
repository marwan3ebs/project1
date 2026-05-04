# Roadmap

## Phase 0 - Repository and Audit

- Attach local project to GitHub remote.
- Preserve existing remote zip.
- Add professional documentation.
- Confirm install/start behavior.
- Create `main`, `dev`, `AbouSeada`, `AhmedHassan`, and `Maro` branches.

## Phase 1 - Demo Stabilization

- Completed on `feature/full-crm-upgrade`: split `App.js` into navigator, screens, services, utilities, and components.
- Completed: property detail screen.
- Completed: add property/agreement form with validation.
- Completed: search/filter inventory.
- Completed: report export-ready text.
- Remaining: add role-based demo switch or login stub.
- Remaining: replace custom navigation with React Navigation or Expo Router if the project will keep growing.

## Phase 2 - CRM Quality

- Add TypeScript.
- Add data models and validation schemas.
- Add service layer for storage and future API work.
- Add agreement renewal and expiry workflows.
- Add calendar view.
- Add client profiles and follow-up history.
- Add activity timeline.
- Add FlatList virtualization for inventory and task lists.
- Add native date pickers and better phone/number formatting.

## Phase 3 - Backend and Production Readiness

- Add authentication.
- Add database/API.
- Add role-based permissions.
- Add notifications.
- Add report generation service.
- Add audit logs.
- Add tests and CI.
- Add backup/export.

## Suggested Team Distribution

| Developer | Initial focus |
| --- | --- |
| AbouSeada | Inventory list/detail, property forms, filters, search, sort. |
| AhmedHassan | Scheduling, reminders, expiry rules, notifications, activity timeline. |
| Maro | Reports, team dashboards, commission tracking, export workflows. |
