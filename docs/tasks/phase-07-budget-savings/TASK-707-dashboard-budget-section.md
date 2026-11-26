# TASK-707 — Dashboard budget section

> **PROVISIONAL** — Gate G0 closed. Do not execute until approved.

## Task Metadata

- **Task ID:** TASK-707
- **Task Name:** Dashboard "Budgets" section (overall + up to 3 category budgets)
- **Implementation Phase:** 7 — Budgets & Savings Goals
- **Feature:** F7.3 Budget progress & warnings
- **Priority:** HIGH
- **Status:** NOT STARTED
- **Estimated Complexity:** SMALL
- **Dependencies:** TASK-606, TASK-705
- **Blocks:** TASK-715, TASK-716
- **PRS References:** FR-006 (budget status), FR-006.2 (no budgets empty state), FR-008.1, US-006
- **Design References:** UX §B row 7, NAV §C "Dashboard navigation" (budget card → Budgets tab)

## 1. Objective

Show budget status on Home for a calendar month, with an empty-state action when no budget exists.

## 2. Background and Context

UX §B row 7: overall budget + up to 3 category budgets ordered by status severity then utilization; always a calendar month — the selected month, or the current month with caption "Budgets are monthly — showing November" when a custom range is selected.

## 3. Requirements

1. `BudgetSummarySection` (from budgets index) receives the month: selected month if the period is a month, else current month + caption.
2. Empty: "No budgets yet. Set a monthly budget to see how much you can safely spend." [Set budget] → `/budgets/edit?scope=overall`.
3. "See all" and card tap → Budgets tab.
4. Insert the section in `DashboardScreen` budgets slot (one-line change).

## 4. Scope

### Included
- Section component, dashboard insertion, tests.

### Excluded
- Recommendations about budgets (TASK-804/810).

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/features/budgets/components/BudgetSummarySection.tsx` | CREATE | Section |
| `src/features/budgets/index.ts` | MODIFY | Export |
| `src/features/dashboard/components/DashboardScreen.tsx` | MODIFY | Insert section (hotspot) |
| tests alongside | CREATE | Component tests |

## 6. Implementation Instructions

1. Respect the hotspot order: TASK-707 → TASK-715 → TASK-810 edit `DashboardScreen.tsx` sequentially.

## 7. Dependencies

- TASK-606 (dashboard slots), TASK-705 (card, hook).

## 8. Acceptance Criteria

- [ ] At most 1 overall + 3 category cards, severity ordered.
- [ ] Custom range shows the current month with the caption.
- [ ] Empty state action opens the budget form.
- [ ] Section error does not hide other sections.

## 9. Testing Requirements

- **UI Tests:** acceptance items.
- **Integration Tests:** TASK-716 (#3 budget part).
- **Manual Verification:** Android.

## 10. Verification Commands

```bash
npx jest src/features/budgets src/features/dashboard
npx tsc --noEmit
npx expo lint
```

## 11. Definition of Done

Global DoD.

## 12. Risks and Notes

- None.

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
