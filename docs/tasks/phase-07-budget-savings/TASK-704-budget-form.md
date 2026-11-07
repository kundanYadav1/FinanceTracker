# TASK-704 — Budget form modal (total and category budgets)

> **PROVISIONAL** — Gate G0 closed; inherits OD-10.

## Task Metadata

- **Task ID:** TASK-704
- **Task Name:** `/budgets/edit` modal — create or change the monthly total budget or a category budget
- **Implementation Phase:** 7 — Budgets & Savings Goals
- **Feature:** F7.2 Budget workflows
- **Priority:** HIGH
- **Status:** NOT STARTED
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-418, TASK-506, TASK-507, TASK-703
- **Blocks:** TASK-705, TASK-706, TASK-716
- **PRS References:** FR-008 (create, edit), FR-008.2, FR-008.3, FR-008.5, FR-008.6, FR-003A.8, FR-003A.9, FR-026.4, FR-027.1, US-006
- **Design References:** NAV §B (`budgets/edit.tsx ?scope=&categoryId=`), UX §D "Total monthly budget / category budget form", UX §I "Budget form" row, NAV §D "Modal behavior"

## 1. Objective

Let the user set or change the overall monthly budget or a category budget, effective from the current month.

## 2. Background and Context

UX §D: amount ≥ 0; category picker (expense categories without a budget this month) only for category scope; helper "Applies to November and later months until you change it. Unspent budget doesn't carry over."; zero budget note "Any spending will show as over budget."

## 3. Requirements

1. Route params validated: `scope=overall|category`, optional `categoryId` (when changing an existing category budget, prefill and lock the category).
2. `BudgetForm` (RHF + budget schema): `AmountInput`, `CategoryPicker` (from transactions index, filtered to `availableCategoriesForNewBudget`), helper texts with the current month name, zero-budget note shown when the parsed amount is 0.
3. Save busy/disabled; success → dismiss + toast "Budget saved"; failure → not-saved banner, values kept; dirty discard confirmation.

## 4. Scope

### Included
- Route, form component, hook, tests.

### Excluded
- Remove action (on detail, TASK-706).

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/app/budgets/edit.tsx` | CREATE | Modal route |
| `src/app/_layout.tsx` | MODIFY | Register modal |
| `src/features/budgets/components/BudgetForm.tsx` | CREATE | Form |
| `src/features/budgets/hooks/useBudgetEditor.ts` | CREATE | View-model |
| `src/features/budgets/index.ts` | MODIFY | Exports |
| tests alongside | CREATE | Component + hook tests |

## 6. Implementation Instructions

1. Reuse the discard-confirmation pattern from TASK-508.

## 7. Dependencies

- TASK-418, TASK-506 (AmountInput), TASK-507 (CategoryPicker), TASK-703.

## 8. Acceptance Criteria

- [ ] Overall budget can be created and changed; category budget can be created for a category without one.
- [ ] Categories that already have a budget this month are not offered.
- [ ] Amount 0 accepted with the zero-budget note; negative/malformed rejected naming the field.
- [ ] Helper text names the current month.
- [ ] Double tap creates one change; failure keeps values.

## 9. Testing Requirements

- **UI Tests:** acceptance items.
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
