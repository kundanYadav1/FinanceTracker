# TASK-716 — Phase 7 integration tests and checkpoint

> **PROVISIONAL** — Gate G0 closed. Do not execute until approved.

## Task Metadata

- **Task ID:** TASK-716
- **Task Name:** Budget and goal workflow integration tests and Phase 7 checkpoint
- **Implementation Phase:** 7 — Budgets & Savings Goals
- **Feature:** F7.7 Phase verification
- **Priority:** HIGH
- **Status:** NOT STARTED
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-608, TASK-704, TASK-705, TASK-706, TASK-707, TASK-712, TASK-713, TASK-714, TASK-715
- **Blocks:** TASK-811
- **PRS References:** FR-008 (all), FR-009 – FR-011, FR-015.2, FR-006 acceptance (budget/goal updates), US-003, US-006
- **Design References:** TS §4 workflows #3 (budget part), #4, #6 (budget/goal part), #7

## 1. Objective

Verify that users can plan spending and savings targets and that every dependent figure updates after transaction changes.

## 2. Background and Context

Recommendation parts of #3/#5/#6 are verified in TASK-811.

## 3. Requirements

1. `tests/integration/budget-workflow.test.tsx` (#3, #7): create budget → add expenses → Healthy → Warning at 80 % → Exceeded above 100 %; change in Nov keeps Oct; remove keeps Oct.
2. `tests/integration/goal-workflow.test.tsx` (#4): required saving for target dates this month, next month, +13 months; tracking appears only after a complete month exists (advance fixed clock); saved-amount update creates no transaction.
3. `tests/integration/dependents-workflow.test.tsx` (#6 partial): moving a transaction to another month updates both months' budget statuses and E/goal state; deleting reverses.
4. Manual Android: create/edit/remove budget; create goal, update saved amount, pause/archive; airplane mode.
5. Evidence `docs/tests/phase-07-verification.md` *(proposed path)*.

## 4. Scope

### Included
- Tests, manual checks, evidence.

### Excluded
- Fixes.

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `tests/integration/budget-workflow.test.tsx` | CREATE | #3, #7 |
| `tests/integration/goal-workflow.test.tsx` | CREATE | #4 |
| `tests/integration/dependents-workflow.test.tsx` | CREATE | #6 partial |
| `docs/tests/phase-07-verification.md` | CREATE *(proposed path)* | Evidence |
| `docs/tasks/task-registry.md` | MODIFY | Status |

## 6. Implementation Instructions

1. Real stack, fixed clock, RNTL screens.

## 7. Dependencies

Listed above.

## 8. Acceptance Criteria

- [ ] All scenarios in §3.1 – 3.3 pass.
- [ ] Manual checks recorded.
- [ ] Full verification set passes.

## 9. Testing Requirements

- **Integration Tests:** §3.1 – 3.3. **Manual:** §3.4.

## 10. Verification Commands

```bash
npm test
npm run test:tz
npx tsc --noEmit
npx expo lint
npx expo-doctor
```

## 11. Definition of Done

All criteria checked with evidence.

## 12. Risks and Notes

- None.

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
