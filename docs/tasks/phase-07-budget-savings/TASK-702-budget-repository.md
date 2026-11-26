# TASK-702 — Budget repository (effective-from-month versions)

> **PROVISIONAL / BLOCKED** — requires [OD-10](../../design/open-decisions.md#od-10) (budgets set only from the current month) and ADR-0006 acceptance.

## Task Metadata

- **Task ID:** TASK-702
- **Task Name:** Budget repository — set/change, remove, resolve-in-effect, history
- **Implementation Phase:** 7 — Budgets & Savings Goals
- **Feature:** F7.1 Budget core
- **Priority:** CRITICAL
- **Status:** BLOCKED (OD-10)
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-408, TASK-412, TASK-413, TASK-701
- **Blocks:** TASK-703, TASK-808, TASK-902, TASK-905
- **PRS References:** FR-008.1, FR-008.2, FR-008.3, FR-008.5, FR-003A.8, FR-026.3
- **Design References:** DB §B.6, DB §F (resolution query, operations table), DB §B.5 (remove keeps history), TS §1 "Budgets" version-resolution cases, TS §2, ADR-0006

## 1. Objective

Persist budgets as effective-from-month versions so that changes affect the current and later months only, and every past month keeps the amount that was in effect.

## 2. Background and Context

DB §F gives the exact resolution SQL and write operations. "Remove" writes a NULL-amount version when earlier history exists, otherwise deletes the current-month version. OD-10: no retroactive or future-dated budgets.

## 3. Requirements

1. `setBudget(db, { scope, amount: Money, currentMonth })` in one transaction: upsert `(scope_key, currentMonth)` with amount (`ON CONFLICT(scope_key, effective_from_month) DO UPDATE`), then defensively delete versions of that scope with month > currentMonth.
2. `removeBudget(db, { scope, currentMonth })`: if a version with month < currentMonth exists → upsert NULL-amount version at currentMonth; else delete the currentMonth version. Also delete versions > currentMonth.
3. `resolveInEffect(db, month)` → `{ scope, amount: Money, effectiveFromMonth }[]` using DB §F query (NULL amounts excluded).
4. `history(db, scopeKey, toMonth, count = 6)` → amount in effect per month for the last `count` months (resolved per month; NULL → none).
5. `hasAny(db)` → boolean (currency lock UI, TASK-902).
6. IDs via `newId('bv')`; timestamps from Clock.

## 4. Scope

### Included
- Repository + DB tests.

### Excluded
- Spend aggregation (TASK-601), service (TASK-703).

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/data/repositories/budgetsRepo.ts` | CREATE | Versions repository |
| `src/data/repositories/budgetsRepo.test.ts` | CREATE | DB tests |

## 6. Implementation Instructions

1. `currentMonth` is passed in (from `clock.today()` in the service), never computed in the repo.

## 7. Dependencies

- TASK-408, TASK-412, TASK-413, TASK-701 (scope types).

## 8. Acceptance Criteria (TS §1 version resolution)

- [ ] Month before the first version → no budget.
- [ ] Exactly at the version month → that amount; between versions → earlier version.
- [ ] Change in Nov keeps Oct at the old amount (FR-008.3).
- [ ] Remove in Nov with Oct history → Nov+ none, Oct unchanged; remove in the creation month with no history → row deleted.
- [ ] Re-adding after removal works from the current month.
- [ ] Zero budget stored and resolved as 0 (not removed).
- [ ] Overall and category budgets coexist; second budget for the same scope/month impossible.

## 9. Testing Requirements

- **Integration Tests (database):** all items.
- **Unit/UI/Manual:** —

## 10. Verification Commands

```bash
npx jest src/data/repositories/budgetsRepo
npx tsc --noEmit
npx expo lint
```

## 11. Definition of Done

Global DoD; repository coverage ≥ 85 %.

## 12. Risks and Notes

- History preservation is a financial-integrity rule; reviewer verifies no path deletes a version with month < current.

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
