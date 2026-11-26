# TASK-708 — Goal progress and required monthly saving calculators

> **PROVISIONAL** — Gate G0 closed. Do not execute until approved.

## Task Metadata

- **Task ID:** TASK-708
- **Task Name:** `calculateGoalProgress` and `calculateRequiredMonthlySaving` (FR-009, FR-010)
- **Implementation Phase:** 7 — Budgets & Savings Goals
- **Feature:** F7.4 Savings goal calculations
- **Priority:** CRITICAL
- **Status:** NOT STARTED
- **Estimated Complexity:** SMALL
- **Dependencies:** TASK-406, TASK-407, TASK-408
- **Blocks:** TASK-709, TASK-710
- **PRS References:** FR-009, FR-010, FR-010.1, FR-010.2, FR-010.3, FR-007.4, NFR-008, AGENTS.md §8 (`calculateGoalProgress`, `calculateRequiredMonthlySaving`)
- **Design References:** BL §B.9, BL §B.10, BL §C.10 – C.11, BL §D (completed/expired), TS §1 "Goals" row (first half)

## 1. Objective

Implement the exact, pure progress and required-monthly-saving calculations with every FR-010.3 edge case.

## 2. Background and Context

BL §B.10: periods `p = monthIndex(target) − monthIndex(today) + 1`; `required = ceilDiv(remaining, p)`; Completed first, then Expired (target before today), then p = 1 / p ≥ 2. BL §B.9: progress display caps at 99.9 % until completed; bar width uses floor.

## 3. Requirements

1. `SavingsGoal` domain type (shared with TASK-710): `{ id, name, target: Money, saved: Money, targetDate: LocalDate, priority, lifecycleStatus, createdAt }`.
2. `calculateGoalProgress(goal)` → `{ remaining: Money, progress: Ratio, aboveTarget: Money, isCompleted }`; `progressDisplay(progress, isCompleted)` → string with the 99.9 % cap rule; `progressBarFraction` (floor).
3. `calculateRequiredMonthlySaving(goal, today)` → `{ kind:'completed' } | { kind:'expired', remaining } | { kind:'required', remaining, periods, required: Money }`.
4. No clock reads; `today` is a parameter.

## 4. Scope

### Included
- Type, two calculators, display helper, tests.

### Excluded
- Expected saving, tracking state, projection, gap (TASK-709).

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/domain/goals/types.ts` | CREATE *(proposed path)* | Goal type |
| `src/domain/goals/progress.ts` | CREATE *(proposed path)* | Progress |
| `src/domain/goals/requiredSaving.ts` | CREATE *(proposed path)* | Required monthly saving |
| `src/domain/goals/index.ts` | CREATE | Exports |
| tests alongside | CREATE | Tests |

## 6. Implementation Instructions

1. Table-driven; include BL examples verbatim.

## 7. Dependencies

- TASK-406/407/408.

## 8. Acceptance Criteria

- [ ] target 10,000,000, saved 2,500,000 → 25.0 %, remaining 7,500,000.
- [ ] saved = target and saved > target → completed, remaining 0, required 0; saved > target shows "above target" amount.
- [ ] today 2026-11-06, target 2026-12-31, remaining 7,500,000 → p = 2, required 3,750,000.
- [ ] remaining 1,000,001, p = 3 → 333,334.
- [ ] target date today → p = 1, not expired; target date yesterday → expired.
- [ ] target later in current month → p = 1, required = remaining.
- [ ] 99.95 % not completed displays "99.9%".
- [ ] All pass under `test:tz`.

## 9. Testing Requirements

- **Unit Tests:** all items.

## 10. Verification Commands

```bash
npx jest src/domain/goals
npm run test:tz
npx tsc --noEmit
npx expo lint
```

## 11. Definition of Done

Global DoD; coverage ≥ 95 %.

## 12. Risks and Notes

- `priority` value set depends on OD-06 (type only; no logic here).

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
