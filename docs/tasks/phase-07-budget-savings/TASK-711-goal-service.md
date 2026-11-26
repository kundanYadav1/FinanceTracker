# TASK-711 — Goal service

> **PROVISIONAL** — Gate G0 closed; inherits OD-03/04/05/06/09 via TASK-709/710.

## Task Metadata

- **Task ID:** TASK-711
- **Task Name:** Goal service — create, edit, saved amount, lifecycle, delete, goals with tracking, goal detail
- **Implementation Phase:** 7 — Budgets & Savings Goals
- **Feature:** F7.5 Savings goal management
- **Priority:** HIGH
- **Status:** NOT STARTED
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-415, TASK-422, TASK-601, TASK-709, TASK-710
- **Blocks:** TASK-712, TASK-713
- **PRS References:** FR-009, FR-009.1 – .3, FR-010, FR-011, FR-015.2 (portfolio header facts), FR-026.3, FR-027.1, US-003
- **Design References:** SA §D.6, ST §3.3 (topics `transactions`, `goals`), DB §G (no double counting), SA §E.2

## 1. Objective

Expose goal use cases with tracking computed from SQLite data each time, and keep goal balances fully separate from transactions.

## 2. Background and Context

SA §D.6: `goalsRepo.list()` + `transactionsRepo.monthlyTotals(last 12 complete months)` → `calculateExpectedMonthlySaving` → per-goal snapshot. DB §G: updating a saved amount never creates a transaction and vice versa.

## 3. Requirements

1. `createGoal(values)`, `updateGoal(id, values)`, `updateSavedAmount(id, newTotalText)`, `setLifecycle(id, status)`, `deleteGoal(id)` — validated, currency from profile, bump `['goals']`, NotFound handling.
2. `getGoalsOverview(today)` → `{ portfolio: { R_total, E, coverage, gap }, goals: GoalSnapshot[] grouped by lifecycle }`; `GoalSnapshot` = goal + progress + required + tracking + projection + explanation text.
3. `getGoalDetail(id, today)`.
4. `previewRequiredSaving(values, today)` pure pass-through for the live preview (UX §E).
5. Sentinel leak test (goal names are financial-adjacent personal data — must not appear in logs).

## 4. Scope

### Included
- Service, `features/goals/index.ts`, integration tests.

### Excluded
- UI.

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/features/goals/services/goalService.ts` | CREATE | Use cases |
| `src/features/goals/index.ts` | CREATE | Public API |
| `src/features/goals/services/goalService.test.ts` | CREATE | Integration tests |

## 6. Implementation Instructions

1. `today` from the injected clock; monthly totals range = currentMonth−12 … currentMonth−1.

## 7. Dependencies

- TASK-415, TASK-422 (profile), TASK-601 (`monthlyTotals`), TASK-709, TASK-710.

## 8. Acceptance Criteria

- [ ] Create → detail shows required monthly saving per FR-010 for targets this month, next month and in 13 months (TS §4 #4).
- [ ] Tracking state absent until a complete month with transactions exists; appears after.
- [ ] Updating saved amount changes progress and creates no transaction (row count unchanged).
- [ ] Pause removes the goal from R_total; archive likewise.
- [ ] Delete → NotFound afterwards.
- [ ] Sentinel test passes.

## 9. Testing Requirements

- **Integration Tests:** all items with real SQLite and fixed clock.

## 10. Verification Commands

```bash
npx jest src/features/goals
npx tsc --noEmit
npx expo lint
```

## 11. Definition of Done

Global DoD.

## 12. Risks and Notes

- None.

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
