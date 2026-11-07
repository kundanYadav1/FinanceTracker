# TASK-807 — Duplicate suppression, merging, notices and language safety

> **PROVISIONAL** — Gate G0 closed. Do not execute until approved.

## Task Metadata

- **Task ID:** TASK-807
- **Task Name:** `mergeAndSuppress`, cross-rule adjustments, notices, banned-phrase and determinism tests
- **Implementation Phase:** 8 — Recommendation Engine
- **Feature:** F8.4 Prioritization & suppression
- **Priority:** HIGH
- **Status:** NOT STARTED
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-804, TASK-805, TASK-806
- **Blocks:** TASK-808
- **PRS References:** FR-012.1, FR-012.3, FR-013.2, FR-006.2, FR-016.1, FR-017, FR-017.1, §32
- **Design References:** RE §D.5 (merge order, one card per subject), RE §C.3 (ANOM-DISC severity High with GAP; merge into BUD-OVER), RE §C.4 (merge into budget rules), RE §C.5 (GAP potential savings), RE §C.8 (notices), RE §E.3 (language rules), TS §1 "Recommendation rules" row

## 1. Objective

Make the engine output one card per subject, apply the documented cross-rule adjustments, explain silence with notices, and prove the language and determinism guarantees.

## 2. Background and Context

RE §D.5: `BUD-OVER ⊃ BUD-WARN ⊃ ANOM-*` for the same category (higher absorbs facts and potential savings); `GAP ⊃ GAP-INFO`. RE §C.3: ANOM-DISC is High when GAP present. RE §C.5: GAP potential savings = Σ ANOM-DISC potential savings this month. RE §C.8 notices: `NEEDS_HISTORY`, `NO_GOALS_OR_BUDGETS`, `ALL_CLEAR`.

## 3. Requirements

1. Replace the identity body of `mergeAndSuppress(candidates, ctx)`:
   - group by category subject; keep the highest per merge order; append absorbed facts to `supportingMetrics`; carry ANOM-DISC potential savings into a merged BUD-OVER (a merged essential BUD-OVER never gains potential savings);
   - if any GAP exists: set ANOM-DISC priority High; set GAP `potentialSavings` to the sum of remaining ANOM-DISC estimates (or keep null when none);
   - GAP removes GAP-INFO.
2. `buildNotices(ctx, recommendations)` per RE §C.8 (`NEEDS_HISTORY` with n; `NO_GOALS_OR_BUDGETS`; `ALL_CLEAR` only when history sufficient and nothing triggered).
3. Banned-phrase test over every rendered text from a large randomized scenario set: "guarantee", "will save", "you should", "certain" (case-insensitive).
4. Safety property: no recommendation for an essential/unclassified category has `suggestedAction` containing reduction wording or a non-null `potentialSavings`.
5. Determinism: shuffled input → identical output (end to end through `runEngine`).

## 4. Scope

### Included
- Merge/suppress, adjustments, notices, safety/determinism tests.

### Excluded
- Service and UI.

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/domain/recommendations/mergeAndSuppress.ts` | MODIFY | Implementation |
| `src/domain/recommendations/notices.ts` | CREATE *(proposed path)* | Notices |
| `src/domain/recommendations/engine.ts` | MODIFY | Wire notices |
| `src/domain/recommendations/safety.test.ts` | CREATE *(proposed path)* | Banned phrases, essential-safety, determinism |
| `src/domain/recommendations/mergeAndSuppress.test.ts` | CREATE | Merge tests |

## 6. Implementation Instructions

1. Seeded PRNG for scenario generation so failures reproduce.

## 7. Dependencies

- TASK-804, TASK-805, TASK-806.

## 8. Acceptance Criteria

- [ ] Same category with BUD-OVER and ANOM-DISC → one card (BUD-OVER) containing the anomaly facts.
- [ ] BUD-WARN + ANOM-INFO same category → one BUD-WARN card.
- [ ] GAP present → ANOM-DISC High and GAP potential savings = Σ ANOM-DISC estimates.
- [ ] Notices appear exactly under their conditions.
- [ ] Banned-phrase, essential-safety and determinism tests pass.
- [ ] Each key is unique within an evaluation.

## 9. Testing Requirements

- **Unit Tests:** all items (property-based where stated).

## 10. Verification Commands

```bash
npx jest src/domain/recommendations
npx tsc --noEmit
npx expo lint
```

## 11. Definition of Done

Global DoD; `src/domain/recommendations` coverage ≥ 95 %.

## 12. Risks and Notes

- None.

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
