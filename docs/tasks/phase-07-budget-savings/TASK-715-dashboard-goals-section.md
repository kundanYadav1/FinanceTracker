# TASK-715 — Dashboard goals section

> **PROVISIONAL** — Gate G0 closed. Section order per OD-07 (optional).

## Task Metadata

- **Task ID:** TASK-715
- **Task Name:** Dashboard "Goals" section (up to 3 active goals)
- **Implementation Phase:** 7 — Budgets & Savings Goals
- **Feature:** F7.6 Goal progress & status UI
- **Priority:** MEDIUM
- **Status:** NOT STARTED
- **Estimated Complexity:** SMALL
- **Dependencies:** TASK-707, TASK-713, TASK-714
- **Blocks:** TASK-716, TASK-810
- **PRS References:** FR-006 (goal progress), FR-006.2 (no goals empty state), FR-019.7
- **Design References:** UX §B row 8, NAV §C "Dashboard navigation"

## 1. Objective

Show up to three active goals on Home with progress, state and required monthly saving.

## 2. Background and Context

UX §B row 8: up to 3 Active goals ordered by priority then target date; not affected by the selected period (FR-019.7); empty "No savings goals yet." [Create goal].

## 3. Requirements

1. `GoalsSummarySection` (goals index) using `useGoalsOverview` data (active only, first 3).
2. Row tap → goal detail; "See all" → Goals tab; empty action → `/goals/new`.
3. Insert into the dashboard goals slot (after TASK-707's edit; hotspot order).

## 4. Scope

### Included
- Section, dashboard insertion, tests.

### Excluded
- —

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/features/goals/components/GoalsSummarySection.tsx` | CREATE | Section |
| `src/features/goals/index.ts` | MODIFY | Export |
| `src/features/dashboard/components/DashboardScreen.tsx` | MODIFY | Insert section (hotspot) |
| tests alongside | CREATE | Tests |

## 6. Implementation Instructions

1. Section ignores `periodStore`.

## 7. Dependencies

- TASK-707 (previous dashboard edit), TASK-713 (card, hook), TASK-714 (detail route).

## 8. Acceptance Criteria

- [ ] Max 3 active goals, ordered per UX §E.
- [ ] Changing the dashboard period does not change this section.
- [ ] Empty state action opens goal creation.

## 9. Testing Requirements

- **UI Tests:** acceptance items.
- **Integration Tests:** TASK-716.

## 10. Verification Commands

```bash
npx jest src/features/goals src/features/dashboard
npx tsc --noEmit
npx expo lint
```

## 11. Definition of Done

Global DoD.

## 12. Risks and Notes

- None.

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
