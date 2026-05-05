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
- Completed on `feature/responsive-rbac-crm-actions`: add role-based demo switch and RBAC-scoped data visibility.
- Completed on `feature/maro-rbac-ownership-analytics`: replace visible role switcher with local demo login and session restore/logout.
- Remaining: replace custom navigation with React Navigation or Expo Router if the project will keep growing.

## Phase 2 - CRM Quality

- Add TypeScript.
- Add data models and validation schemas.
- Add service layer for storage and future API work.
- Completed in local demo form: add agreement renewal and expiry workflows.
- Add calendar view.
- Add client profiles and follow-up history.
- Add fuller client profile and activity timeline screens.
- Add FlatList virtualization for inventory and task lists.
- Add native date pickers and better phone/number formatting.
- Completed in local demo form: professionalize desktop CRM layout, inventory table, report sections, team console sections, and task board sections.

## Phase 3 - Backend and Production Readiness

- Add real authentication mapped to the current local RBAC model.
- Add database/API.
- Completed in local demo form: add role-based permissions.
- Add notifications.
- Add report generation service.
- Completed in local demo form: add local audit logs and ownership history.
- Replace local demo auth, AsyncStorage, and local audit logs with backend auth, database persistence, server-side RBAC, and immutable audit events.
- Add tests and CI.
- Add backup/export.

## Suggested Team Distribution

| Developer | Initial focus |
| --- | --- |
| AbouSeada | Inventory list/detail, property forms, filters, search, sort. |
| AhmedHassan | Scheduling, reminders, expiry rules, notifications, activity timeline. |
| Maro | Reports, team dashboards, commission tracking, export workflows. |
