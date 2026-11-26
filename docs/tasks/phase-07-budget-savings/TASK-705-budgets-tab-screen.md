# TASK-705 — Budgets tab screen

> **PROVISIONAL / BLOCKED** — earliest selectable past month needs [DG-05](../design-gaps.md).

## Task Metadata

- **Task ID:** TASK-705
- **Task Name:** Budgets tab — month stepper, overall card, category list, `BudgetProgressCard`
- **Implementation Phase:** 7 — Budgets & Savings Goals
- **Feature:** F7.3 Budget progress & warnings
- **Priority:** HIGH
- **Status:** BLOCKED (DG-05)
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-415, TASK-419, TASK-420, TASK-703, TASK-704
- **Blocks:** TASK-706, TASK-707, TASK-716
- **PRS References:** FR-008 (expose amount, spent, remaining, utilization, status), FR-008.3, FR-008.6, FR-008.8, FR-014 (in-screen warnings), NFR-006.1, US-006
- **Design References:** UX §D (overview, progress, overspending warning), UX §A.8, UX §I "Budgets" row, TS §3 `BudgetProgressCard` row, NAV §C "Budget management"

## 1. Objective

Replace the Budgets tab placeholder with a month-by-month budget overview showing progress, status and warnings.

## 2. Background and Context

UX §D: month selector `‹ November 2026 ›` (future disabled; past read-only showing the amount in effect then); overall card or "Set a monthly budget" CTA; category list sorted Exceeded → Warning → Healthy; "+ Add category budget"; warning/overspent banners.

## 3. Requirements

1. `MonthStepper` (UX §J, budgets): future months disabled; lower bound per DG-05.
2. `useBudgetMonth(month)` → `useServiceQuery(['budgets', month], ['transactions','budgets'], …)`.
3. `BudgetProgressCard`: progress bar, "₹2,760.00 of ₹3,000.00 · 92.0%", `StatusBadge`, "₹X left" / "₹X over"; zero budget hides % (FR-008.6); Warning banner "You've used 92.0% — ₹240.00 left."; Exceeded banner "₹360.00 over your Shopping budget this month."; tap → `/budgets/[scopeKey]?month=`.
4. Empty: "No budgets for November" + Set budget; error + Retry; skeleton.
5. In past months hide create/change actions.
6. Replace `(tabs)/budgets.tsx`. Export `BudgetProgressCard` and a `BudgetSummarySection` *(for TASK-707)* from `features/budgets/index.ts`.

## 4. Scope

### Included
- Stepper, card, screen, hook, tests.

### Excluded
- Detail screen (TASK-706), dashboard section (TASK-707).

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/app/(tabs)/budgets.tsx` | MODIFY | Render screen |
| `src/features/budgets/components/BudgetsScreen.tsx` | CREATE | Screen |
| `src/features/budgets/components/BudgetProgressCard.tsx` | CREATE | Card (UX §J) |
| `src/features/budgets/components/MonthStepper.tsx` | CREATE | Stepper (UX §J) |
| `src/features/budgets/hooks/useBudgetMonth.ts` | CREATE | Hook |
| `src/features/budgets/index.ts` | MODIFY | Exports |
| tests alongside | CREATE | Component tests |

## 6. Implementation Instructions

1. Status text + icon always accompany color (TS §3).

## 7. Dependencies

- TASK-415, TASK-419, TASK-420, TASK-703, TASK-704 (create route).

## 8. Acceptance Criteria (TS §3 `BudgetProgressCard` row)

- [ ] Each status shows text + icon; zero budget hides %; overspend shows "₹X over".
- [ ] Past month shows that month's amounts and no edit actions.
- [ ] Future months not selectable.
- [ ] Adding an expense elsewhere updates the card on return (US-006).

## 9. Testing Requirements

- **UI Tests:** card states, stepper bounds, past-month read-only.
- **Integration Tests:** TASK-716.
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
