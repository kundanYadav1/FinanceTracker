# TASK-706 — Budget detail screen with change and remove

> **PROVISIONAL** — Gate G0 closed; inherits OD-10.

## Task Metadata

- **Task ID:** TASK-706
- **Task Name:** `/budgets/[scopeKey]` detail — amount in effect, spending, contributing transactions, history, change/remove
- **Implementation Phase:** 7 — Budgets & Savings Goals
- **Feature:** F7.2 Budget workflows
- **Priority:** MEDIUM
- **Status:** NOT STARTED
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-704, TASK-705
- **Blocks:** TASK-716
- **PRS References:** FR-008 (edit), FR-008.3, FR-008.4, FR-026.1
- **Design References:** NAV §B (`budgets/[scopeKey].tsx ?month=`), NAV §C "Budget management" (remove confirmation copy), UX §D "Budget details", NAV §D "Stale targets"

## 1. Objective

Show one budget for a month in detail and let the user change or remove it for the current month onward.

## 2. Background and Context

UX §D: amount in effect with "since Oct 2026", spent, remaining/over, utilization, contributing transactions (tap → detail), 6-month history (not the MVP+ performance report). Remove confirmation: "Remove the Food budget from November onward? Past months keep their budgets."

## 3. Requirements

1. Route params: `scopeKey` (non-empty), `month` (`YYYY-MM`, not future; default current) via `parseRouteParams`.
2. `useBudgetDetail(scopeKey, month)` topics `['transactions','budgets']`.
3. Actions only when `month` = current: Change amount → `/budgets/edit?scope=…&categoryId=…`; Remove → confirmation → `budgetService.removeBudget` → back + toast.
4. Unknown scope / no budget in effect → "This item no longer exists." + Back.

## 4. Scope

### Included
- Route, screen, hook, tests.

### Excluded
- MVP+ budget performance report.

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/app/budgets/[scopeKey].tsx` | CREATE | Route |
| `src/features/budgets/components/BudgetDetailScreen.tsx` | CREATE | Screen |
| `src/features/budgets/hooks/useBudgetDetail.ts` | CREATE | Hook |
| `src/features/budgets/index.ts` | MODIFY | Exports |
| tests alongside | CREATE | Tests |

## 6. Implementation Instructions

1. Reuse `TransactionItem` from the transactions index for the contributing list.

## 7. Dependencies

- TASK-704 (edit route), TASK-705 (card/navigation).

## 8. Acceptance Criteria

- [ ] Shows "since {month}" from `effectiveFromMonth`.
- [ ] History lists the amount in effect for each of the last 6 months.
- [ ] Remove confirmation text matches NAV §C; after removal past months unchanged.
- [ ] Past month detail has no actions.
- [ ] Invalid params → not-found.

## 9. Testing Requirements

- **UI Tests:** states and actions.
- **Integration Tests:** TASK-716 (#7 budget history).
- **Manual Verification:** Android.

## 10. Verification Commands

```bash
npx jest src/features/budgets
npx tsc --noEmit
npx expo lint
```

## 11. Definition of Done

Global DoD.

## 12. Risks and Notes

- None.

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
