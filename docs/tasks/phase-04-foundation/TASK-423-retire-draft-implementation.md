# TASK-423 — Retire the draft implementation

> **PROVISIONAL** — Gate G0 closed. Do not execute until approved.

## Task Metadata

- **Task ID:** TASK-423
- **Task Name:** Retire the draft implementation (`appStore`, `src/db`, `utils/money`, draft components) and update CLAUDE.md
- **Implementation Phase:** 4 — Application Foundation
- **Feature:** F4.9 Draft code retirement
- **Priority:** HIGH
- **Status:** NOT STARTED
- **Estimated Complexity:** SMALL
- **Dependencies:** TASK-420, TASK-421, TASK-422
- **Blocks:** TASK-403, TASK-424
- **PRS References:** NFR-007, FR-026.5 (no user data in draft DBs is guarded by TASK-411)
- **Design References:** SA §0 (starting-point table), ST §5, NAV §B notes, OD "Proposed changes to protected documents" (CLAUDE.md row)

## 1. Objective

Delete every draft module that the design replaces, so no code path can bypass the new layers, and update CLAUDE.md to describe the new architecture.

## 2. Background and Context

SA §0 lists draft elements to retire: `src/db/*` (broken runner, non-conforming schema), `src/store/appStore.ts` (all transactions in memory), `src/utils/money.ts` (float parsing), draft screens (already removed in TASK-420). After TASK-420 they are unreachable dead code.

## 3. Requirements

1. Delete: `src/store/appStore.ts`, `src/db/{database,schema,seed,transactions,budgets,goals}.ts`, `src/utils/money.ts`, `src/components/transaction-form.tsx`, `src/components/ui/button.tsx`, `src/components/ui/collapsible.tsx`, `src/components/hint-row.tsx`, `src/components/external-link.tsx`, `src/components/web-badge.tsx`, `src/components/animated-icon.tsx`, `animated-icon.web.tsx`, `animated-icon.module.css`, `src/constants/theme.ts` (after confirming TASK-416 removed all importers).
2. Keep: `themed-text.tsx`, `themed-view.tsx` (+ test/snapshot), `src/hooks/*`, `src/global.css` only if still imported (otherwise delete and report).
3. Remove the legacy-path exclusions from `eslint.config.js` added by TASK-401.
4. Grep proves no remaining import of any deleted path.
5. Update `CLAUDE.md` "Architecture" and "Database" sections to the new layout (SA §B.2, `PRAGMA user_version`, baseline migration). **Do not edit `AGENTS.md`** — its update needs explicit approval (open-decisions "protected documents"); list the proposed AGENTS.md changes in the completion report instead.

## 4. Scope

### Included
- Deletions, lint exclusion removal, CLAUDE.md update.

### Excluded
- Package removal (TASK-403). Any behaviour change.

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| Files listed in §3.1 | DELETE | Retire draft code |
| `eslint.config.js` | MODIFY | Remove legacy exclusions |
| `CLAUDE.md` | MODIFY | Reflect new architecture |

## 6. Implementation Instructions

1. Delete in one commit (`refactor: retire draft implementation`).
2. Run the full verification suite; fix only import breakages caused by deletion (there should be none).

## 7. Dependencies

- TASK-420 (draft routes gone), TASK-421/422 (replacement startup and profile exist).

## 8. Acceptance Criteria

- [ ] All §3.1 files are gone; `grep -r "appStore\|@/db/\|utils/money" src` returns nothing.
- [ ] Lint passes without legacy exclusions.
- [ ] App starts on Android dev build to onboarding/Home.
- [ ] CLAUDE.md no longer describes `appStore`, `schema_migrations` or the draft tabs.

## 9. Testing Requirements

- **Unit Tests:** full suite passes.
- **Integration Tests:** existing ones pass.
- **UI Tests:** existing ones pass.
- **Manual Verification:** Android dev build launch.

## 10. Verification Commands

```bash
npm test
npx tsc --noEmit
npx expo lint
npx expo-doctor
```

## 11. Definition of Done

Global DoD.

## 12. Risks and Notes

- A device with a draft database is handled by the legacy guard (TASK-411); deleting the draft code does not touch any database file.

## 13. Completion Report Format

Files created · Files modified · Files deleted · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work · Proposed AGENTS.md changes.
