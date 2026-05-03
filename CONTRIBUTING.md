# Contributing

## Branch Flow

Use this flow for team work:

```text
AbouSeada / AhmedHassan / Maro -> dev -> main
```

Do not delete existing work. Do not commit unrelated changes with your feature.

## Setup

```bash
npm install
npm start
```

For web preview:

```bash
npm run web
```

## Working On A Task

1. Check out your branch.
2. Pull or merge the latest `dev`.
3. Make a focused change.
4. Run the app.
5. Commit with a clear message.
6. Push your branch.

Example:

```bash
git checkout AhmedHassan
git merge dev
git status
git add <changed-files>
git commit -m "Improve scheduling reminders"
git push origin AhmedHassan
```

## Code Guidelines

- Keep screens, components, utilities, and data separate.
- Prefer reusable components over duplicated UI.
- Keep form validation close to the form until a shared validation layer exists.
- Do not add backend-specific assumptions directly inside UI components.
- Keep commits small and explain what changed.
- Update the relevant docs when architecture, workflows, or branch rules change.

## Before Merging

- Confirm `npm install` works.
- Confirm `npm start` starts Expo.
- Confirm web preview works or document the blocker.
- Check that imports are not broken.
- Update `docs/WORK_LOG.md` with meaningful project decisions.
