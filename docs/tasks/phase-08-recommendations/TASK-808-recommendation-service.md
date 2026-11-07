# TASK-808 — Recommendation input loader, service and hook

> **PROVISIONAL** — Gate G0 closed. Do not execute until approved.

## Task Metadata

- **Task ID:** TASK-808
- **Task Name:** `loadRecommendationInput` (≤ 5 aggregate queries), `recommendationService.evaluate`, `useRecommendations`
- **Implementation Phase:** 8 — Recommendation Engine
- **Feature:** F8.5 Recommendation delivery
- **Priority:** HIGH
- **Status:** NOT STARTED
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-415, TASK-501, TASK-601, TASK-702, TASK-710, TASK-807
- **Blocks:** TASK-809
- **PRS References:** FR-012.2, FR-019.7, FR-024, NFR-001.2, ADR-0007
- **Design References:** RE §A (service loads aggregates only), RE §A.1, RE §D.6 (refresh triggers, ≤ 5 queries), SA §D.7, ST §3.3 (topics `transactions`, `budgets`, `goals`)

## 1. Objective

Feed the pure engine from SQLite each time recommendations are displayed, and expose the results to screens with automatic refresh.

## 2. Background and Context

RE §A: database access happens only in the loader, which returns aggregates. Nothing is persisted (ADR-0007). The dashboard's selected period never affects results (FR-019.7).

## 3. Requirements

1. `loadRecommendationInput(today)` in one read transaction: categories; `categoryMonthSpend(currentMonth−3 … currentMonth)`; `monthlyTotals(currentMonth−12 … currentMonth−1)` → savings + hasTransactions; `budgetsRepo.resolveInEffect(currentMonth)` + current-month category/overall spend; `goalsRepo.list()`; `earliestTransactionDate`. Target ≤ 5 queries plus categories (record the actual count).
2. `recommendationService.evaluate()` → `Result<{ recommendations, notices }>`; `getByKey(key)` re-evaluates and returns the match or `NotFoundError`.
3. `useRecommendations()` → topics `['transactions','budgets','goals']`, refreshes on focus and new day (via `useServiceQuery`). Does not read `periodStore`.
4. `features/recommendations/index.ts` public API.

## 4. Scope

### Included
- Loader, service, hook, integration tests.

### Excluded
- UI (TASK-809/810).

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/features/recommendations/services/recommendationService.ts` | CREATE | Loader + evaluate |
| `src/features/recommendations/hooks/useRecommendations.ts` | CREATE | Hook |
| `src/features/recommendations/index.ts` | CREATE | Public API |
| tests alongside | CREATE | Integration tests |

## 6. Implementation Instructions

1. The loader uses repositories directly (services may import data); budgets/goals data via their repos, not their services, to avoid feature cycles (SA §C: no cycles).

## 7. Dependencies

- TASK-415, TASK-501, TASK-601, TASK-702, TASK-710, TASK-807.

## 8. Acceptance Criteria

- [ ] For a 4-month fixture, `evaluate` returns the same output as calling `runEngine` on a hand-built input.
- [ ] Changing the dashboard period does not change results.
- [ ] Adding a transaction/budget/goal triggers recomputation in the hook.
- [ ] Query count recorded and ≤ 6.

## 9. Testing Requirements

- **Integration Tests:** service with real SQLite and fixed clock.
- **UI Tests:** hook via `renderHook`.

## 10. Verification Commands

```bash
npx jest src/features/recommendations
npx tsc --noEmit
npx expo lint
```

## 11. Definition of Done

Global DoD.

## 12. Risks and Notes

- Performance within the 1 s dashboard budget measured in TASK-910.

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
