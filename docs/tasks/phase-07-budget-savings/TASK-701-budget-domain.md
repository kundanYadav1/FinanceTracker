# TASK-701 — Budget domain: evaluation, status and ordering

> **PROVISIONAL** — Gate G0 closed. Do not execute until approved.

## Task Metadata

- **Task ID:** TASK-701
- **Task Name:** Budget domain — `evaluateBudget` (utilization, status, remaining/overspent), severity ordering, budget types
- **Implementation Phase:** 7 — Budgets & Savings Goals
- **Feature:** F7.1 Budget core
- **Priority:** CRITICAL
- **Status:** NOT STARTED
- **Estimated Complexity:** SMALL
- **Dependencies:** TASK-406, TASK-407
- **Blocks:** TASK-702, TASK-703, TASK-801, TASK-803
- **PRS References:** FR-008, FR-008.6, FR-008.7, FR-008.8, FR-014, NFR-008, AGENTS.md §8 (`calculateBudgetUsage`)
- **Design References:** BL §B.5, BL §B.6, BL §D (zero budget, negative remaining), RE §C constants (`BUDGET_WARNING_PERCENT = 80`), UX §D (list sort Exceeded → Warning → Healthy, then utilization), TS §1 "Budgets" row, ADR-0006

## 1. Objective

Implement the exact, pure budget evaluation and ordering rules used by the Budgets tab, dashboard and recommendation engine.

## 2. Background and Context

BL §B.5 defines status rules evaluated in order with BigInt comparisons (no division); BL §B.6 guarantees remaining/overspent are never negative; FR-008.7: spent == amount is Warning, not Exceeded.

## 3. Requirements

1. Types: `BudgetScope = { kind:'overall' } | { kind:'category', categoryId }`, `scopeKey(scope)`, `BudgetStatus = 'healthy'|'warning'|'exceeded'`, `BudgetEvaluation = { status, utilization: Available<Ratio>, remaining: Money, overspent: Money }`.
2. `BUDGET_WARNING_PERCENT = 80` in `domain/budgets/constants.ts` *(proposed path)*; RE thresholds (TASK-801) import it from here to keep one source.
3. `evaluateBudget(amount: Money, spent: Money)` per BL §B.5 table order; zero budget → utilization `unavailable: ZERO_BUDGET`.
4. `sortBudgetEvaluations(items)` — Exceeded → Warning → Healthy, then utilization desc, then scope key.

## 4. Scope

### Included
- Types, constants, evaluation, ordering, tests.

### Excluded
- Version resolution SQL (TASK-702).

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/domain/budgets/types.ts`, `constants.ts`, `evaluate.ts` | CREATE *(proposed paths; SA §B.2 `domain/budgets`)* | Domain |
| `src/domain/budgets/index.ts` | CREATE | Exports |
| `src/domain/budgets/evaluate.test.ts` | CREATE | Tests |

## 6. Implementation Instructions

1. Warning test `spent × 100 ≥ amount × 80` in BigInt.
2. Table-drive every TS §1 "Budgets" status case.

## 7. Dependencies

- TASK-406/407.

## 8. Acceptance Criteria

- [ ] 0/0 → Healthy, utilization unavailable; 0 budget + spend → Exceeded, utilization unavailable.
- [ ] 79.99 % Healthy; exactly 80 % Warning; exactly 100 % Warning; 100.01 % Exceeded.
- [ ] amount 300,000, spent 276,000 → Warning, 92.0 %, remaining 24,000.
- [ ] amount 300,000, spent 336,000 → Exceeded, remaining 0, overspent 36,000.
- [ ] Ordering matches UX §D.

## 9. Testing Requirements

- **Unit Tests:** all items (`test:tz` not needed but harmless).
- **Integration/UI/Manual:** via later tasks.

## 10. Verification Commands

```bash
npx jest src/domain/budgets
npx tsc --noEmit
npx expo lint
```

## 11. Definition of Done

Global DoD; coverage ≥ 95 %.

## 12. Risks and Notes

- None.

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
