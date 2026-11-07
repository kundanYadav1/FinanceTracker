# TASK-714 — Goal detail, saved-amount update and lifecycle actions

> **PROVISIONAL / BLOCKED** — guidance wording needs [OD-21](../../design/open-decisions.md#od-21).

## Task Metadata

- **Task ID:** TASK-714
- **Task Name:** `/goals/[id]` detail with tracking explanation and projection; `/goals/[id]/saved-amount` modal; pause/resume, archive/unarchive, delete
- **Implementation Phase:** 7 — Budgets & Savings Goals
- **Feature:** F7.6 Goal progress & status UI
- **Priority:** HIGH
- **Status:** BLOCKED (OD-21)
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-712, TASK-713
- **Blocks:** TASK-715, TASK-716
- **PRS References:** FR-009, FR-009.1, FR-009.2, FR-009.3, FR-010, FR-011, FR-011.3, FR-026.1, §32 (estimate wording), US-003
- **Design References:** NAV §B (`goals/[id]/index.tsx`, `saved-amount.tsx`), NAV §C "Goal detail", UX §E "Goal detail", "Update saved amount", DB §G (double-counting note), TS §3 `GoalProgressCard`/detail row

## 1. Objective

Show everything about one goal — progress, required monthly saving, tracking state with explanation, projection — and let the user update the saved amount and lifecycle or delete it.

## 2. Background and Context

UX §E: projection caption "Estimate based on your past savings — not a guarantee."; saved-amount modal has a new-total field plus Add/Withdraw helpers (never below 0) and the note "This only updates the goal. It doesn't record income or an expense." (OD-21 proposes related PRS/help text).

## 3. Requirements

1. `GoalDetailScreen`: header (name, priority chip, lifecycle), progress "25.0% · ₹25,000.00 of ₹1,00,000.00", "₹75,000.00 to go" (or above-target text), required monthly saving line, `GoalTrackingExplanation` (state badge + domain explanation text), projection or reason, actions.
2. `SavedAmountModal`: new total (`AmountInput`, ≥ 0), Add ₹… / Withdraw ₹… helpers computing the new total via domain `add/subtract` clamped at 0 *(computed in the hook via domain functions)*, note text per OD-21, save busy/failure handling.
3. Lifecycle actions: Pause/Resume, Archive/Unarchive (immediate, toast). Delete → confirmation naming the goal ("Delete goal Emergency fund? This can't be undone.") → back.
4. Stale id → "This item no longer exists."

## 4. Scope

### Included
- Detail route/screen, saved-amount route/modal, actions, tests.

### Excluded
- `GOAL-EXPIRED` recommendation (OD-08, deferred TASK-890).

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/app/goals/[id]/index.tsx`, `src/app/goals/[id]/saved-amount.tsx` | CREATE | Routes |
| `src/app/_layout.tsx` | MODIFY | Register saved-amount modal |
| `src/features/goals/components/GoalDetailScreen.tsx` | CREATE | Detail |
| `src/features/goals/components/GoalTrackingExplanation.tsx` | CREATE | UX §J |
| `src/features/goals/components/SavedAmountModal.tsx` | CREATE | Modal |
| `src/features/goals/hooks/useGoalDetail.ts`, `useSavedAmountEditor.ts` | CREATE | Hooks |
| `src/features/goals/index.ts` | MODIFY | Exports |
| tests alongside | CREATE | Tests |

## 6. Implementation Instructions

1. All text with amounts is produced by domain formatters/templates.

## 7. Dependencies

- TASK-712 (edit route), TASK-713 (card/navigation).

## 8. Acceptance Criteria

- [ ] Each tracking state shows badge + explanation with the values used.
- [ ] Projection unavailable shows its reason (FR-009.3).
- [ ] Withdraw more than saved results in 0, not negative.
- [ ] Saved-amount update creates no transaction (integration in TASK-716).
- [ ] Pause removes the tracking badge and shows "Paused".
- [ ] Delete confirmation names the goal.

## 9. Testing Requirements

- **UI Tests:** states, modal helpers, actions.
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
