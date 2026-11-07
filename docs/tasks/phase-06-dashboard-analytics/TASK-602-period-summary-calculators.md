# TASK-602 — Period summary calculators (income, expenses, savings, savings rate)

> **PROVISIONAL** — Gate G0 closed. Do not execute until approved.

## Task Metadata

- **Task ID:** TASK-602
- **Task Name:** Period summary calculators — `calculateTotalIncome/Expenses`, `calculatePeriodSavings`, `calculateSavingsRate`, `calculatePeriodSummary`
- **Implementation Phase:** 6 — Dashboard & Analytics
- **Feature:** F6.2 Financial calculation services
- **Priority:** CRITICAL
- **Status:** NOT STARTED
- **Estimated Complexity:** SMALL
- **Dependencies:** TASK-406, TASK-407
- **Blocks:** TASK-605, TASK-607, TASK-709
- **PRS References:** FR-007, FR-007.0 – FR-007.4, FR-006.2, NFR-003, NFR-008, AGENTS.md §8
- **Design References:** BL §B.1 – B.4, BL §D (zero income/expenses, negative savings, large values), TS §1 "Totals & savings" row

## 1. Objective

Implement the pure, exact functions that turn period totals into the dashboard/report summary: savings (may be negative), savings rate as `Available<Ratio>`, and the label rule.

## 2. Background and Context

FR-007 forbids division by zero and defines the zero-income, negative and display-rounding rules. BL §B.4 represents the rate as `Ratio{num:(I−X)·100, den:I}`.

## 3. Requirements

1. `calculatePeriodSavings(I, X): Money` (= I − X; negative allowed; never clamped).
2. `calculateSavingsRate(I, X): Available<Ratio>` — `I = 0` → `unavailable: NO_INCOME`; otherwise exact ratio.
3. `calculatePeriodSummary({ income, expenses, hasTransactions, period })` → `{ income, expenses, savings, savingsRate, savingsLabel: 'Monthly savings' | 'Savings', isEmpty: !hasTransactions, isNegative }`.
4. Functions take `Money` inputs from TASK-601 aggregates; no I/O, no clock.
5. Names follow AGENTS.md §8 (`calculateMonthlyIncome` etc. may be provided as aliases for month periods if useful; not required).

## 4. Scope

### Included
- Calculators + table-driven tests.

### Excluded
- SQL (TASK-601), UI (TASK-606).

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/domain/transactions/summary.ts` | CREATE *(proposed path; SA §B.2 "totals calculators" under domain/transactions)* | Calculators |
| `src/domain/transactions/summary.test.ts` | CREATE | Tests |
| `src/domain/transactions/index.ts` | MODIFY | Exports |

## 6. Implementation Instructions

1. Use `money.subtract` and `ratio` helpers only.
2. Include BL examples verbatim as test rows.

## 7. Dependencies

- TASK-406 (Money, Ratio), TASK-407 (`formatPercent` used in tests to assert display).

## 8. Acceptance Criteria

- [ ] I = 5,000,000, X = 3,500,000 → savings 1,500,000, rate displays "30.0%".
- [ ] I = 0 → rate unavailable `NO_INCOME`, savings = −X.
- [ ] X = 0, I > 0 → "100.0%".
- [ ] X > I > 0 → negative rate (e.g. "-12.5%").
- [ ] Rate 26.45 % → "26.5%"; −26.45 % → "-26.5%".
- [ ] Custom period → label "Savings"; month → "Monthly savings".
- [ ] Values at `maxPerRecord × 50,000` stay exact.

## 9. Testing Requirements

- **Unit Tests:** all items (TS §1 row) under `test:tz`.
- **Integration Tests:** via TASK-605/608.
- **UI Tests:** not required.
- **Manual Verification:** not required.

## 10. Verification Commands

```bash
npx jest src/domain/transactions/summary
npm run test:tz
npx tsc --noEmit
npx expo lint
```

## 11. Definition of Done

Global DoD; domain coverage ≥ 95 %.

## 12. Risks and Notes

- None.

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
