# TASK-703 — Budget service

> **PROVISIONAL** — Gate G0 closed; inherits OD-10 via TASK-702.

## Task Metadata

- **Task ID:** TASK-703
- **Task Name:** Budget service — month statuses, set/remove, detail with contributing transactions
- **Implementation Phase:** 7 — Budgets & Savings Goals
- **Feature:** F7.2 Budget workflows
- **Priority:** HIGH
- **Status:** NOT STARTED
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-415, TASK-504, TASK-601, TASK-701, TASK-702
- **Blocks:** TASK-704, TASK-705
- **PRS References:** FR-008, FR-008.1 – FR-008.8, FR-003A.8, FR-003A.9, FR-026.3, FR-027.1, US-006
- **Design References:** SA §D.5, ST §3.3 (topics `transactions`, `budgets`), DB §F, UX §D (detail contents, history), SA §E.2

## 1. Objective

Expose budget use cases to the UI and other features: evaluated statuses for any month, validated set/remove for the current month, and a detail view with contributing transactions and history.

## 2. Background and Context

SA §D.5: resolve versions in effect + category spend for the month → `evaluateBudget` per budget. Past months are read-only (OD-10).

## 3. Requirements

1. `getMonthStatuses(month)` → `{ overall: BudgetStatusItem | null, categories: BudgetStatusItem[] }` sorted per TASK-701; each item includes scope, category (name/icon), amount, spent, evaluation, `effectiveFromMonth`, `editable: month === currentMonth`.
2. `setBudget({ scope, amountText })`: validates with a budget Zod schema (`parseNonNegativeAmount`; category must be an expense category; `BUDGET_AMOUNT_NEGATIVE` etc.), currency from profile, `currentMonth` from clock; bump `['budgets']`.
3. `removeBudget(scope)`: bump `['budgets']`.
4. `getBudgetDetail(scopeKey, month)` → item + `history` (6 months) + first page of contributing transactions via `transactionService.listPage` with `{ period: month, type:'expense', categoryId? }`.
5. `availableCategoriesForNewBudget(month)` → expense categories without a category budget this month (FR-008.2).
6. All return `Result`; failures logged once; sentinel test.

## 4. Scope

### Included
- Service, budget Zod schema, `features/budgets/index.ts`, integration tests.

### Excluded
- UI.

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/domain/budgets/schema.ts` | CREATE *(proposed path)* | Budget input schema |
| `src/features/budgets/services/budgetService.ts` | CREATE | Use cases |
| `src/features/budgets/index.ts` | CREATE | Public API |
| `src/features/budgets/services/budgetService.test.ts` | CREATE | Integration tests |

## 6. Implementation Instructions

1. Use `transactionsRepo.sumExpensesByCategory` and `sumByType` (expenses) for spent amounts.
2. Contributing transactions go through the transactions feature `index.ts`.

## 7. Dependencies

- TASK-415, TASK-504 (list query), TASK-601 (aggregates), TASK-701, TASK-702.

## 8. Acceptance Criteria

- [ ] Overall + category statuses correct for a fixture month, sorted per UX §D.
- [ ] Past month items have `editable:false`; `setBudget` always targets the current month.
- [ ] Negative or malformed amount rejected naming the field; zero accepted.
- [ ] Budget on an income category rejected.
- [ ] Adding an expense changes the status on the next query (revision bump path verified with the hook in TASK-705).
- [ ] Sentinel leak test passes.

## 9. Testing Requirements

- **Unit Tests:** budget schema.
- **Integration Tests:** service with real SQLite.
- **UI/Manual:** —

## 10. Verification Commands

```bash
npx jest src/domain/budgets src/features/budgets
npx tsc --noEmit
npx expo lint
```

## 11. Definition of Done

Global DoD.

## 12. Risks and Notes

- None.

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
