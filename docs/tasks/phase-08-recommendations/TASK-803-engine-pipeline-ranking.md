# TASK-803 — Engine pipeline, context builder and ranking

> **PROVISIONAL** — Gate G0 closed; inherits OD-03/04/05 (via TASK-709) and OD-22 (via TASK-802).

## Task Metadata

- **Task ID:** TASK-803
- **Task Name:** `runEngine` pipeline — context (stage 1), rule registry (stage 2), ranking (stage 4), render (stage 5)
- **Implementation Phase:** 8 — Recommendation Engine
- **Feature:** F8.1 Engine foundation
- **Priority:** CRITICAL
- **Status:** NOT STARTED
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-701, TASK-709, TASK-801, TASK-802
- **Blocks:** TASK-804, TASK-805, TASK-806
- **PRS References:** FR-012, FR-012.1, FR-012.2, FR-006.1, FR-019.7, NFR-003, NFR-008
- **Design References:** RE §A (architecture, stages), RE §A.2, RE §E.2 (ordering), RE §D.6

## 1. Objective

Build the deterministic engine skeleton that turns a `RecommendationInput` into ranked recommendations, with an empty rule registry that rule tasks plug into.

## 2. Background and Context

RE §A.2: (1) build context — current month, `historyMonths`, E, R_total, budget evaluations, category averages/deviations; (2) rules `(ctx) => Candidate[]`, never calling each other; (3) suppress & merge (TASK-807); (4) rank; (5) render text. Evaluated period is always the current month.

## 3. Requirements

1. `buildContext(input)` → `EngineContext` using TASK-701 (`evaluateBudget`), TASK-709 (E, portfolio), TASK-802 (history, averages, deviation).
2. `rules/index.ts` exports `RULES: Rule[] = []` — rule tasks append one entry each.
3. `runEngine(input)` → `{ recommendations: Recommendation[], notices: Notice[] }`: context → candidates from all rules → `mergeAndSuppress` (identity pass-through until TASK-807) → `rank` → render.
4. `rank(candidates)` per RE §E.2: priority, rule rank, magnitude desc, key asc.
5. `topForDashboard(recs)` → first `DASHBOARD_MAX`.
6. `text.ts` shared rendering helpers (money/percent/month formatting, category descriptor).
7. Deterministic: shuffled input arrays → identical output.

## 4. Scope

### Included
- Context, registry, pipeline, ranking, text helpers, tests with a fake rule.

### Excluded
- Real rules (TASK-804 – 806), merge logic and notices (TASK-807).

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/domain/recommendations/context.ts` | CREATE *(proposed path)* | Stage 1 |
| `src/domain/recommendations/engine.ts` | CREATE *(proposed path)* | `runEngine`, `rank`, `topForDashboard` |
| `src/domain/recommendations/rules/index.ts` | CREATE *(proposed path; RE §A.2 "rules/")* | Registry |
| `src/domain/recommendations/text.ts` | CREATE | Render helpers (path named in RE §A.2) |
| `src/domain/recommendations/mergeAndSuppress.ts` | CREATE *(proposed path)* | Pass-through placeholder implemented by TASK-807 |
| tests alongside | CREATE | Tests |

## 6. Implementation Instructions

1. `mergeAndSuppress` starts as identity with a test asserting identity; TASK-807 replaces its body.

## 7. Dependencies

- TASK-701, TASK-709, TASK-801, TASK-802.

## 8. Acceptance Criteria

- [ ] With a fake rule emitting candidates of mixed priority/rule/magnitude, output order matches RE §E.2.
- [ ] Shuffled inputs → identical output (property test).
- [ ] Context values (historyMonths, E, R_total, evaluations) equal those from the underlying domain functions.
- [ ] `topForDashboard` returns ≤ 3.

## 9. Testing Requirements

- **Unit Tests:** all items.

## 10. Verification Commands

```bash
npx jest src/domain/recommendations
npx tsc --noEmit
npx expo lint
```

## 11. Definition of Done

Global DoD.

## 12. Risks and Notes

- `rules/index.ts` is a small hotspot for TASK-804/805/806 (one appended line each).

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
