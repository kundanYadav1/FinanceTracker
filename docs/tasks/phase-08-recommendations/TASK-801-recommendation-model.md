# TASK-801 — Recommendation domain model, thresholds and keys

> **PROVISIONAL** — Gate G0 closed. Do not execute until approved.

## Task Metadata

- **Task ID:** TASK-801
- **Task Name:** Recommendation domain model — `Recommendation`, `Metric`, `Notice`, rule IDs, thresholds, deterministic key
- **Implementation Phase:** 8 — Recommendation Engine
- **Feature:** F8.1 Engine foundation
- **Priority:** CRITICAL
- **Status:** NOT STARTED
- **Estimated Complexity:** SMALL
- **Dependencies:** TASK-406, TASK-408, TASK-701
- **Blocks:** TASK-803
- **PRS References:** FR-012, FR-012.1, FR-017, FR-017.1, §32, AGENTS.md §9
- **Design References:** RE §A.1 (`RecommendationInput`), RE §C constants table, RE §C.8 (notices), RE §D.5 (key format), RE §E.1 (model), ADR-0007

## 1. Objective

Define the types and constants every rule produces and consumes, so rules, ranking and UI share one exact contract.

## 2. Background and Context

RE §E.1 defines the `Recommendation` output (key, ruleId, ruleVersion, kind, priority, subject, period, title, reason, supportingMetrics, suggestedAction, potentialSavings, explanation, evaluatedOn). Recommendations are never persisted (ADR-0007), so "recommendation persistence" has no task — by design.

## 3. Requirements

1. Types exactly per RE §E.1 plus `Candidate` (pre-merge rule output with `magnitude: number` for ranking) and `Notice = { id: 'NEEDS_HISTORY'|'NO_GOALS_OR_BUDGETS'|'ALL_CLEAR'; text; data }`.
2. `RecommendationInput` per RE §A.1.
3. `thresholds.ts` owns `ANOMALY_MIN_INCREASE_PERCENT = 20`, `HISTORY_MONTHS_REQUIRED = 3`, `DASHBOARD_MAX = 3`, and re-exports `BUDGET_WARNING_PERCENT` from `domain/budgets` (owner: TASK-701). `ANOMALY_MIN_EXCESS_MINOR` is read from the currency registry (`anomalyMinExcessMinor`, owner: TASK-406). `AT_RISK_COVERAGE_PERCENT` is owned by `domain/goals/constants.ts` (TASK-709) and is **not** re-exported here — the engine consumes goal tracking results, not the threshold.
4. `recommendationKey(ruleId, subjectKey, month)` → `${ruleId}:${subjectKey}:${month}`.
5. `RULE_RANK` map per RE §E.2.

## 4. Scope

### Included
- Types, constants, key helper, tests.

### Excluded
- Engine and rules.

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/domain/recommendations/types.ts` | CREATE *(proposed path)* | Model |
| `src/domain/recommendations/thresholds.ts` | CREATE | Constants (path named in RE §C) |
| `src/domain/recommendations/keys.ts` | CREATE *(proposed path)* | Key + rank |
| `src/domain/recommendations/index.ts` | CREATE | Exports |
| `src/domain/recommendations/keys.test.ts` | CREATE | Tests |

## 6. Implementation Instructions

1. No `dismissed`/`read` fields (FR-012.3).

## 7. Dependencies

- TASK-406/408 (Money, Ratio, MonthKey), TASK-701 (`BUDGET_WARNING_PERCENT`).

## 8. Acceptance Criteria

- [ ] Types compile and match RE §E.1 field-for-field.
- [ ] Key format exact.
- [ ] Thresholds have one source each (no duplicated literals across domain modules — grep check in report).

## 9. Testing Requirements

- **Unit Tests:** key, rank.

## 10. Verification Commands

```bash
npx jest src/domain/recommendations
npx tsc --noEmit
npx expo lint
```

## 11. Definition of Done

Global DoD.

## 12. Risks and Notes

- Single-owner rule for constants: budgets (80 %) → TASK-701; at-risk coverage (75 %) and lookback (12) → TASK-709; anomaly and dashboard constants → this task; per-currency ₹500 floor → TASK-406 registry.

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
