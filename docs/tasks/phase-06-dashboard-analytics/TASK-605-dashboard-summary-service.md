# TASK-605 — Dashboard summary service and hooks

> **PROVISIONAL** — Gate G0 closed. Do not execute until approved.

## Task Metadata

- **Task ID:** TASK-605
- **Task Name:** Dashboard queries — period summary and recent transactions, with hooks
- **Implementation Phase:** 6 — Dashboard & Analytics
- **Feature:** F6.4 Dashboard
- **Priority:** HIGH
- **Status:** NOT STARTED
- **Estimated Complexity:** SMALL
- **Dependencies:** TASK-415, TASK-509, TASK-601, TASK-602, TASK-604
- **Blocks:** TASK-606
- **PRS References:** FR-006, FR-006.1, FR-006.2, FR-007, FR-024
- **Design References:** SA §D.4 (sequence), SA §C "Dashboard" (no own service; composes others), ST §3.3 (topics), UX §B rows 3–6, 10

## 1. Objective

Provide `useDashboardSummary(period)` and `useRecentTransactions()` that load the summary card and recent list through services, refreshing on transaction changes.

## 2. Background and Context

SA §C: Dashboard has no own service; the summary query is a transactions-service function (`getPeriodSummary`) composed by dashboard hooks. Each dashboard section loads independently so one failure does not hide the others (SA §D.4).

## 3. Requirements

1. In `transactionService`: `getPeriodSummary(period)` → `Result<PeriodSummary>` (TASK-601 `sumByType` + TASK-602 `calculatePeriodSummary`); `getRecent(limit = 5)`.
2. `features/dashboard/hooks/useDashboardSummary.ts` → `useServiceQuery(['dashboardSummary', period], ['transactions'], …)` where `period = resolvePeriod(periodStore.selection, clock.today())`.
3. `useRecentTransactions()` → topics `['transactions']`.
4. Dashboard imports transactions only via `@/features/transactions` index.

## 4. Scope

### Included
- Two service functions, two hooks, tests.

### Excluded
- Screen (TASK-606); budgets/goals/recommendation sections (Phases 7–8).

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/features/transactions/services/transactionService.ts` | MODIFY | `getPeriodSummary`, `getRecent` |
| `src/features/transactions/index.ts` | MODIFY | Export them |
| `src/features/dashboard/hooks/useDashboardSummary.ts` | CREATE | Hook |
| `src/features/dashboard/hooks/useRecentTransactions.ts` | CREATE | Hook |
| tests alongside | CREATE | Service integration + hook tests |

## 6. Implementation Instructions

1. Integration tests with real SQLite and fixed clock.

## 7. Dependencies

- TASK-415, TASK-601, TASK-602, TASK-604; TASK-509 only for file sequencing (both edit `transactionService.ts`).

## 8. Acceptance Criteria

- [ ] Adding a transaction in the selected period bumps the revision and the hook returns updated totals.
- [ ] Empty period → `isEmpty: true`, not a bare ₹0 figure.
- [ ] Changing the period selection reloads.

## 9. Testing Requirements

- **Unit Tests:** —
- **Integration Tests:** service with real SQLite.
- **UI Tests:** hook via `renderHook`.
- **Manual Verification:** —

## 10. Verification Commands

```bash
npx jest src/features/dashboard src/features/transactions/services
npx tsc --noEmit
npx expo lint
```

## 11. Definition of Done

Global DoD.

## 12. Risks and Notes

- None.

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
