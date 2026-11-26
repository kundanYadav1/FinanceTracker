# TASK-802 — Historical spending analysis: averages, deviation, history sufficiency

> **PROVISIONAL / BLOCKED** — history-sufficiency counting rule pending [OD-22](../../design/open-decisions.md#od-22).

## Task Metadata

- **Task ID:** TASK-802
- **Task Name:** `calculateCategoryAverage`, `calculateDeviation`/excess, `calculateHistoryMonths`
- **Implementation Phase:** 8 — Recommendation Engine
- **Feature:** F8.2 Historical analysis
- **Priority:** CRITICAL
- **Status:** BLOCKED (OD-22)
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-406, TASK-408
- **Blocks:** TASK-803
- **PRS References:** FR-013.1, FR-013.2, FR-013.3, FR-013.4, FR-017.1, FR-019.6, NFR-003
- **Design References:** BL §B.7, BL §B.8, BL §C.6, RE §D.1 – D.4, TS §1 "Recommendation rules" (thresholds, zero average, history 2 vs 3)

## 1. Objective

Implement the exact historical-spending calculations the anomaly rules rely on, with no extrapolation of the current month and no division by a zero average.

## 2. Background and Context

BL §B.7: average of the 3 calendar months immediately before M, zero-spend months count as 0, kept as `Ratio{Σ, 3}`. BL §B.8: deviation `(3·current − Σ)·100 / Σ`, excess `(3·current − Σ)/3` with floor for "up to". BL §C.6: `historyMonths = monthIndex(currentMonth) − monthIndex(month(earliestTransactionDate))`; partial first month counts (OD-22).

## 3. Requirements

1. `calculateHistoryMonths(earliest: LocalDate | null, today)` → number (0 when null).
2. `calculateCategoryAverage(spendByMonth, categoryId, month)` → `Available<{ sum: Money, avg: Ratio }>` (`INSUFFICIENT_HISTORY` when caller-provided `historyMonths < 3`).
3. `calculateDeviation(current: Money, sum3: Money)` → `Available<{ deviation: Ratio, excess: Ratio, excessUpTo: Money }>`; `sum3 = 0` → `ZERO_HISTORICAL_AVERAGE`.
4. `meetsAnomalyThresholds(current, sum3, currency)` → boolean: `current > avg` AND `(3·current − Σ)·100 ≥ 20·Σ` AND `3·current − Σ ≥ 3·minExcess` (BigInt).
5. No projection of incomplete-month spending.

## 4. Scope

### Included
- Calculators + tests.

### Excluded
- Rules (TASK-805).

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/domain/recommendations/analysis.ts` | CREATE *(proposed path)* | Calculators |
| `src/domain/recommendations/analysis.test.ts` | CREATE | Tests |
| `src/domain/recommendations/index.ts` | MODIFY | Exports (create the file if TASK-801 is not merged; coordinate) |

## 6. Implementation Instructions

1. Table-drive the threshold boundaries.

## 7. Dependencies

- TASK-406, TASK-408. (Independent of TASK-801; may run in parallel — both touch `index.ts`, resolve by appending.)

## 8. Acceptance Criteria

- [ ] BL §B.7 example → avg 490,000 ("₹4,900.00"); BL §B.8 example → 26.5 %, excess "up to ₹1,300.00".
- [ ] 20.0 % triggers; 19.9 % does not; excess ₹500.00 triggers; ₹499.99 does not.
- [ ] Σ = 0 → unavailable, no infinite percentage.
- [ ] historyMonths 2 → insufficient; 3 → sufficient (OD-22 rule).
- [ ] Month with no spending counts as 0 in the average.

## 9. Testing Requirements

- **Unit Tests:** all items under `test:tz`.

## 10. Verification Commands

```bash
npx jest src/domain/recommendations
npm run test:tz
npx tsc --noEmit
npx expo lint
```

## 11. Definition of Done

Global DoD; coverage ≥ 95 %.

## 12. Risks and Notes

- RE §D.4: one-off large payments inflate later averages; accepted by design (FR-013.1 fixes the mean).

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
