# TASK-805 — Spending anomaly rules (ANOM-DISC, ANOM-INFO) and potential savings

> **PROVISIONAL** — Gate G0 closed; inherits OD-22 via TASK-802.

## Task Metadata

- **Task ID:** TASK-805
- **Task Name:** Rules `ANOM-DISC` (discretionary suggestion with potential savings) and `ANOM-INFO` (essential/unclassified insight)
- **Implementation Phase:** 8 — Recommendation Engine
- **Feature:** F8.3 Recommendation rules
- **Priority:** HIGH
- **Status:** NOT STARTED
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-803
- **Blocks:** TASK-807
- **PRS References:** FR-013, FR-013.1 – FR-013.5, FR-016, FR-016.1, FR-017, FR-017.1, §32, US-005
- **Design References:** RE §C.3, RE §C.4, RE §B rows 1, 2, 8 (subscriptions covered by ANOM-DISC), RE §D, RE §E.3

## 1. Objective

Detect category spending meaningfully above the user's own 3-month average in the current month, suggesting reductions only for discretionary categories, with a conservative "up to" potential-savings estimate.

## 2. Background and Context

RE §C.3 trigger: discretionary, history sufficient, Σ3 > 0, current > avg, deviation ≥ 20 %, excess ≥ ₹500. Severity Medium, High when a GAP exists (cross-rule adjustment done in TASK-807). Potential savings = `floorDiv(3·current − Σ3, 3)`, labelled "Up to … (estimate)". RE §C.4: same numbers for essential/unclassified → Low insight, no action, note "This may be expected — for example, an annual or one-time payment."

## 3. Requirements

1. `rules/anomalyRules.ts` *(proposed path)* with two rules over `ctx.categoryAnalyses` (current month vs 3 prior months).
2. Templates verbatim from RE §C.3/C.4; category descriptor for Food = "eating out" style descriptor *(proposed: `category.name` lowercased)*.
3. `supportingMetrics`: this month, 3-month average, increase %.
4. ANOM-INFO: `suggestedAction: null`, `potentialSavings: null`, neutral note in `reason` or a dedicated field per RE §C.4.
5. `magnitude` = excess (minor, floor).
6. Register both.

## 4. Scope

### Included
- Two rules, tests.

### Excluded
- Severity escalation with GAP and merging into budget rules (TASK-807).

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/domain/recommendations/rules/anomalyRules.ts` | CREATE *(proposed path)* | Rules |
| `src/domain/recommendations/rules/index.ts` | MODIFY | Register |
| `src/domain/recommendations/rules/anomalyRules.test.ts` | CREATE | Tests |

## 6. Implementation Instructions

1. Property test: potential savings ≤ excess for random inputs (TS §1).

## 7. Dependencies

- TASK-803.

## 8. Acceptance Criteria

- [ ] FR-013 example (₹6,200 vs ₹4,900) → ANOM-DISC, 26.5 %, "Up to ₹1,300.00 this month (estimate)".
- [ ] Essential category spike → ANOM-INFO only; no action, no potential savings.
- [ ] History of 2 months → no anomaly; zero average → no anomaly.
- [ ] Current ≤ average → none (no extrapolation).
- [ ] Threshold boundaries (20.0/19.9 %, ₹500.00/₹499.99).
- [ ] Potential-savings ≤ excess property holds.

## 9. Testing Requirements

- **Unit Tests:** all items.

## 10. Verification Commands

```bash
npx jest src/domain/recommendations/rules
npx tsc --noEmit
npx expo lint
```

## 11. Definition of Done

Global DoD.

## 12. Risks and Notes

- "Recurring expense analysis" is MVP+ (TASK-891 deferred); the `is_recurring` flag must not be read here (FR-002.1).

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
