# TASK-607 — Reports service and screen

> **PROVISIONAL** — Gate G0 closed. Do not execute until approved.

## Task Metadata

- **Task ID:** TASK-607
- **Task Name:** Reports tab — income vs expense summary and category distribution with drill-down
- **Implementation Phase:** 6 — Dashboard & Analytics
- **Feature:** F6.5 Reports
- **Priority:** HIGH
- **Status:** NOT STARTED
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-415, TASK-510, TASK-511, TASK-601, TASK-602, TASK-603, TASK-604
- **Blocks:** TASK-608
- **PRS References:** FR-018, FR-018.1, FR-019, FR-019.7, US-004, FR-024
- **Design References:** UX §G, UX §I "Reports" row, NAV §C "Report filtering", SA §C "Reports", BL §B.13, ST §2 (Reports → category row sets filters)

## 1. Objective

Deliver the MVP report for any selected period: income, expenses, savings and rate with a two-bar comparison, and the category distribution whose total exactly equals total expenses, with drill-down into filtered history.

## 2. Background and Context

FR-018.1 defines MVP reports; trend/history reports are MVP+ (TASK-690 deferred) and must not appear, not even as "coming soon" (UX §G). No chart library (DEP §4): bars are Views.

## 3. Requirements

1. `features/reports/services/reportService.ts`: `getReport(period)` → `{ summary: PeriodSummary, distribution }` using TASK-601/602/603 via repositories (reports owns no data).
2. `useReport()` hook: topics `['transactions']`, period from `periodStore`.
3. `ReportsScreen`: `PeriodSelector`; summary block with income/expense two-bar comparison (widths proportional via integer math in the service output as `Ratio`, values always shown as text); category list rows (icon, name, amount, share "23.4%", share bar); footer "Total ₹X" equal to total expenses.
4. Tap category row → set `transactionFilterStore` to `{ period: same period, type:'expense', categoryId }` → navigate to Transactions tab.
5. States: skeleton; "No expenses in this period."; "No transactions in this period" when nothing at all; inline error + Retry.
6. Replace `(tabs)/reports.tsx` placeholder.

## 4. Scope

### Included
- Service, hook, screen, tests.

### Excluded
- MVP+ trend reports (TASK-690, deferred).

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/features/reports/services/reportService.ts` | CREATE | Report query |
| `src/features/reports/hooks/useReport.ts` | CREATE | Hook |
| `src/features/reports/components/ReportsScreen.tsx` | CREATE | Screen |
| `src/features/reports/components/CategoryDistributionList.tsx` | CREATE *(proposed path)* | List |
| `src/features/reports/index.ts` | CREATE | Exports |
| `src/app/(tabs)/reports.tsx` | MODIFY | Render screen |
| tests alongside | CREATE | Service integration + component tests |

## 6. Implementation Instructions

1. Bar width ratios are computed in the service/domain and passed as `Ratio`; components only clamp/render.

## 7. Dependencies

- TASK-415, TASK-510 (filter store), TASK-511 (destination screen), TASK-601 – 604.

## 8. Acceptance Criteria

- [ ] Category totals listed in descending order; footer total equals total expenses exactly (US-004).
- [ ] Shares display one decimal half-away-from-zero.
- [ ] Tapping a row opens Transactions filtered to that category and period.
- [ ] Custom range changes report figures; recommendations unaffected (checked in TASK-811).
- [ ] No trend/history UI exists.

## 9. Testing Requirements

- **Unit Tests:** —
- **Integration Tests:** service with real SQLite (sum invariant).
- **UI Tests:** screen states, drill-down navigation.
- **Manual Verification:** Android, custom range.

## 10. Verification Commands

```bash
npx jest src/features/reports
npx tsc --noEmit
npx expo lint
```

## 11. Definition of Done

Global DoD.

## 12. Risks and Notes

- None.

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
