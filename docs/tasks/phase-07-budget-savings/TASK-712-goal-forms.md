# TASK-712 — Goal create and edit forms

> **PROVISIONAL** — Gate G0 closed; priority options per OD-06.

## Task Metadata

- **Task ID:** TASK-712
- **Task Name:** `/goals/new` and `/goals/[id]/edit` modals with live required-saving preview
- **Implementation Phase:** 7 — Budgets & Savings Goals
- **Feature:** F7.5 Savings goal management
- **Priority:** HIGH
- **Status:** NOT STARTED
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-418, TASK-419, TASK-506, TASK-711
- **Blocks:** TASK-713, TASK-714, TASK-716
- **PRS References:** FR-009 (create/edit), FR-003A.7, FR-003A.9, FR-010, FR-026.4, FR-027.1, US-003
- **Design References:** NAV §B (`goals/new.tsx`, `goals/[id]/edit.tsx`), NAV §C "Goal creation" (replace to detail), UX §E "Create goal", UX §I "Goal form" row

## 1. Objective

Let the user create and edit goals, seeing the required monthly saving update as they type.

## 2. Background and Context

UX §E: name (1–60), target amount, saved so far (optional, default ₹0, helper "Money you've already set aside for this goal"), target date (≥ today), priority segmented High/Medium/Low; live preview computed by the domain via the hook. After create, `replace` to `/goals/[id]`.

## 3. Requirements

1. `GoalForm` (RHF + goal schema): fields above; edit mode also shows lifecycle status (Active/Paused/Archived) per NAV §B "edit name/target/date/priority/status".
2. Live preview line "₹37,500.00/month for 2 months (Nov – Dec 2026)" or the completed/expired text, from `previewRequiredSaving`.
3. Save busy; success: create → `router.replace('/goals/{id}')`, edit → dismiss; failure → not-saved banner, values kept; dirty discard confirmation.
4. Missing goal id in edit → not-found.

## 4. Scope

### Included
- Two routes, form, editor hook, tests.

### Excluded
- Saved-amount modal (TASK-714).

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/app/goals/new.tsx`, `src/app/goals/[id]/edit.tsx` | CREATE | Modal routes |
| `src/app/_layout.tsx` | MODIFY | Register modals |
| `src/features/goals/components/GoalForm.tsx` | CREATE | Form |
| `src/features/goals/hooks/useGoalEditor.ts` | CREATE | View-model |
| `src/features/goals/index.ts` | MODIFY | Exports |
| tests alongside | CREATE | Tests |

## 6. Implementation Instructions

1. Preview recomputes on watched field changes (RHF `watch`), debounced lightly; no arithmetic in the component.

## 7. Dependencies

- TASK-418, TASK-419 (SegmentedControl), TASK-506 (Amount/Date inputs), TASK-711.

## 8. Acceptance Criteria

- [ ] Valid create navigates to the new goal's detail (back does not reopen the form).
- [ ] Preview shows the required monthly saving and updates as the target or date changes.
- [ ] Invalid fields show messages naming the field.
- [ ] Double tap → one goal.

## 9. Testing Requirements

- **UI Tests:** form validation, preview, busy state.
- **Integration Tests:** TASK-716 (#4).
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
