# Branching Strategy

## Branches

| Branch | Purpose | Parent |
| --- | --- | --- |
| `main` | Stable branch containing the latest working code. | Remote default branch |
| `dev` | Integration branch for active development. | `main` |
| `AbouSeada` | Developer branch for assigned feature work. | `dev` |
| `AhmedHassan` | Developer branch for assigned feature work. | `dev` |
| `Maro` | Developer branch for assigned feature work. | `dev` |

## Expected Flow

```text
AbouSeada / AhmedHassan / Maro -> dev -> main
```

## Rules

- `main` should stay stable and demo-ready.
- `dev` is where completed developer branch work is integrated and tested.
- Developer branches should be updated from `dev` before starting work.
- Do not commit directly to `main` except for repository setup or approved hotfixes.
- Use pull requests when moving work from developer branches into `dev`.
- Use a pull request from `dev` into `main` after validation.
- Do not delete existing branches or historical artifacts without team agreement.

## Recommended Commands

Start new work:

```bash
git checkout dev
git pull origin dev
git checkout AbouSeada
git merge dev
```

After finishing a task:

```bash
git checkout AbouSeada
git status
git add <changed-files>
git commit -m "Describe the feature or fix"
git push origin AbouSeada
```

Integration flow:

```bash
git checkout dev
git pull origin dev
git merge AbouSeada
git push origin dev
```

Release flow:

```bash
git checkout main
git pull origin main
git merge dev
git push origin main
```

## Branch Ownership Proposal

- `AbouSeada`: inventory, property detail, search/filter/sort.
- `AhmedHassan`: scheduling, reminders, agreement expiry, notifications.
- `Maro`: reports, team dashboard, commission, export.
