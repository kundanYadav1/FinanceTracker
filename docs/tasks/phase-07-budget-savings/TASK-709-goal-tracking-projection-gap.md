# TASK-709 — Expected monthly saving, goal tracking state, projection and savings gap

> **PROVISIONAL / BLOCKED** — product-visible rules pending [OD-03](../../design/open-decisions.md#od-03) (aggregate tracking + 75 % threshold), [OD-04](../../design/open-decisions.md#od-04) (proportional projection), [OD-05](../../design/open-decisions.md#od-05) (12-month lookback).

## Task Metadata

- **Task ID:** TASK-709
- **Task Name:** `calculateExpectedMonthlySaving`, `calculateGoalTracking` (state + projection), `calculateSavingsGap`
- **Implementation Phase:** 7 — Budgets & Savings Goals
- **Feature:** F7.4 Savings goal calculations
- **Priority:** CRITICAL
- **Status:** BLOCKED (OD-03, OD-04, OD-05)
- **Estimated Complexity:** LARGE
- **Dependencies:** TASK-602, TASK-708
- **Blocks:** TASK-711, TASK-803
- **PRS References:** FR-009.2, FR-009.3, FR-011, FR-011.1 – FR-011.3, FR-015, FR-015.1, FR-015.2, FR-019.6, NFR-003, AGENTS.md §8 (`calculateProjectedGoalDate`, `calculateSavingsGap`)
- **Design References:** BL §B.11, BL §B.12 (state table, projection formula, consistency invariant, > 600 months), BL §D (missing history), TS §1 "Goals" row (second half, property test)

## 1. Objective

Implement the deterministic, explainable goal-tracking engine: expected monthly saving from complete months, a portfolio-level tracking state for active goals, a projected completion month, and the savings gap.

## 2. Background and Context

FR-015.1 forbids presenting one goal as funded while the total is not; BL §B.12 therefore evaluates all trackable goals against the combined requirement `R_total`. Expected saving `E` uses up to 3 most recent complete months **with transactions** within the last 12 (OD-05). Projection uses a proportional share of E (OD-04).

## 3. Requirements

1. `calculateExpectedMonthlySaving(monthly: {month, savings: Money, hasTransactions}[], today)` → `Available<{ E: Ratio, months: MonthKey[] }>` (`NO_COMPLETE_MONTH` when none). Candidate months: currentMonth−1 … currentMonth−12.
2. `buildGoalPortfolio(goals, today)` → trackable goals (active, not completed, not expired) with each `required`, plus `R_total`.
3. `calculateGoalTracking(goal, portfolio, E, today)` → `{ state: 'completed'|'expired'|'onTrack'|'atRisk'|'behind'|null, explanation: ExplanationData, projection: { kind:'month', month } | { kind:'unavailable', reason } | { kind:'beyond50Years' } }`; paused/archived → `state:null` with lifecycle shown by UI. Thresholds: `AT_RISK_COVERAGE_PERCENT = 75`; rules exactly per BL §B.12 (BigInt comparisons `E ≥ R_total`, `4·E ≥ 3·R_total and E > 0`).
4. Explanation data (values only; text rendered via templates in `domain/goals/text.ts` *(proposed)* using BL §B.12 templates and `formatMoney/formatPercent`).
5. Projection: `months_g = ⌈ remaining_g × R_total × |H| / (ΣS_H × required_g) ⌉` (BigInt); `projectedMonth = currentMonth + months_g − 1`; > 600 → `beyond50Years`; unavailable reasons per BL §B.12.
6. `calculateSavingsGap(portfolio, E)` → `{ kind:'none' } | { kind:'requiredOnly', R_total } | { kind:'covered', R_total, E } | { kind:'gap', R_total, E, gap }` (gap display ceil).

## 4. Scope

### Included
- Calculators, explanation templates, tests (incl. property test).

### Excluded
- Persistence, services, UI.

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/domain/goals/expectedSaving.ts` | CREATE *(proposed path)* | E |
| `src/domain/goals/tracking.ts` | CREATE *(proposed path)* | Portfolio, state, projection |
| `src/domain/goals/gap.ts` | CREATE *(proposed path)* | Savings gap |
| `src/domain/goals/constants.ts` | CREATE *(proposed path)* | `AT_RISK_COVERAGE_PERCENT`, lookback 12 |
| `src/domain/goals/text.ts` | CREATE *(proposed path)* | Explanation templates |
| `src/domain/goals/index.ts` | MODIFY | Exports |
| tests alongside | CREATE | Tests |

## 6. Implementation Instructions

1. Monthly savings per month = income − expenses (reuse TASK-602 `calculatePeriodSavings`).
2. Property test (random goals/E/today): if E ≥ R_total every projected month ≤ target month; if E < R_total every projected month ≥ target month.

## 7. Dependencies

- TASK-602 (period savings), TASK-708 (progress, required).

## 8. Acceptance Criteria (TS §1 "Goals")

- [ ] No complete month → E unavailable → no state, no projection, gap `requiredOnly`.
- [ ] Months without transactions inside the lookback are skipped; months older than 12 are ignored.
- [ ] E negative → Behind, projection unavailable (`NON_POSITIVE_EXPECTED_SAVING`).
- [ ] E = R_total → On Track; E = 75 % → At Risk; just below 75 % → Behind.
- [ ] Paused/archived excluded from R_total.
- [ ] BL §B.11 example → gap 375,000 ("₹3,750.00/month"); BL §B.12 example → "Jan 2027", At Risk, 80.0 %.
- [ ] > 600 months → `beyond50Years`.
- [ ] Consistency property test passes.

## 9. Testing Requirements

- **Unit Tests:** all items under `test:tz`.

## 10. Verification Commands

```bash
npx jest src/domain/goals
npm run test:tz
npx tsc --noEmit
npx expo lint
```

## 11. Definition of Done

Global DoD; coverage ≥ 95 %; OD-03/04/05 decisions referenced in the report.

## 12. Risks and Notes

- If OD-03 chooses priority allocation, FR-015.1 needs a PRS change first; re-plan this task.

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
