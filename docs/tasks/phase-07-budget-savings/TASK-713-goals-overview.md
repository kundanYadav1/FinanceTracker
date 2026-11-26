# TASK-713 — Goals overview screen

> **PROVISIONAL** — Gate G0 closed; inherits OD-03/04/05.

## Task Metadata

- **Task ID:** TASK-713
- **Task Name:** Goals tab — lifecycle segments, portfolio header, `GoalProgressCard`
- **Implementation Phase:** 7 — Budgets & Savings Goals
- **Feature:** F7.6 Goal progress & status UI
- **Priority:** HIGH
- **Status:** NOT STARTED
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-415, TASK-419, TASK-420, TASK-711, TASK-712
- **Blocks:** TASK-714, TASK-715, TASK-716
- **PRS References:** FR-009, FR-009.2, FR-011, FR-011.2, FR-015.2, FR-006.2 (goal empty state), NFR-006.1, US-003
- **Design References:** UX §E "Goals overview", "Goal status", UX §I "Goals overview" row, TS §3 `GoalProgressCard` row

## 1. Objective

Replace the Goals tab placeholder with the overview of active, paused and archived goals and the portfolio summary.

## 2. Background and Context

UX §E: segments Active · Paused · Archived; Active ordered by priority then target date; header "Your goals need ₹18,750.00/month · You save about ₹15,000.00/month" + coverage, or the not-enough-history note; empty "Set a savings goal to see how much to save each month." [Create goal].

## 3. Requirements

1. `useGoalsOverview()` topics `['transactions','goals']`.
2. `GoalProgressCard`: name, priority chip, progress bar + "25.0%", tracking `StatusBadge` (or lifecycle chip for paused/archived), "₹37,500.00/month needed"; tap → `/goals/[id]`.
3. Portfolio header per §2; segment empty states ("No paused goals").
4. "New goal" → `/goals/new`.
5. Replace `(tabs)/goals.tsx`. Export `GoalProgressCard` and `GoalsSummarySection` *(for TASK-715)*.

## 4. Scope

### Included
- Screen, card, hook, tests.

### Excluded
- Detail (TASK-714), dashboard section (TASK-715).

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/app/(tabs)/goals.tsx` | MODIFY | Render screen |
| `src/features/goals/components/GoalsScreen.tsx` | CREATE | Screen |
| `src/features/goals/components/GoalProgressCard.tsx` | CREATE | Card (UX §J) |
| `src/features/goals/hooks/useGoalsOverview.ts` | CREATE | Hook |
| `src/features/goals/index.ts` | MODIFY | Exports |
| tests alongside | CREATE | Tests |

## 6. Implementation Instructions

1. Badge text + icon for every tracking state (TS §3).

## 7. Dependencies

- TASK-415, TASK-419, TASK-420, TASK-711, TASK-712 (create route).

## 8. Acceptance Criteria

- [ ] Each tracking state renders its badge text + icon; 99.9 % cap rendered.
- [ ] Header shows facts only when E unavailable (FR-015.2).
- [ ] Segments filter by lifecycle; ordering per UX §E.
- [ ] Empty state action opens create.

## 9. Testing Requirements

- **UI Tests:** acceptance items.
- **Integration Tests:** TASK-716.
- **Manual Verification:** Android.

## 10. Verification Commands

```bash
npx jest src/features/goals
npx tsc --noEmit
npx expo lint
```

## 11. Definition of Done

Global DoD.

## 12. Risks and Notes

- None.

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
