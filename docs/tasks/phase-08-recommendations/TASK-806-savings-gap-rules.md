# TASK-806 — Savings gap rules (GAP, GAP-INFO)

> **PROVISIONAL** — Gate G0 closed; inherits OD-03/05 via TASK-709.

## Task Metadata

- **Task ID:** TASK-806
- **Task Name:** Rules `GAP` (savings gap suggestion — also covers "goal at risk") and `GAP-INFO` (required saving fact)
- **Implementation Phase:** 8 — Recommendation Engine
- **Feature:** F8.3 Recommendation rules
- **Priority:** HIGH
- **Status:** NOT STARTED
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-803
- **Blocks:** TASK-807
- **PRS References:** FR-015, FR-015.1, FR-015.2, FR-011, FR-016.1, FR-017, §32, US-005
- **Design References:** RE §C.5, RE §C.6, RE §B rows 5, 6 (goal at risk via GAP), BL §B.11

## 1. Objective

Tell the user when active goals need more per month than they have recently saved, and point to their largest discretionary categories — never essential ones.

## 2. Background and Context

RE §C.5: trigger `E` available, trackable goals exist, `R_total − E > 0`; High suggestion; supporting list = top 3 discretionary categories by 3-month average (or the average over available complete months if fewer than 3) with avg > 0. Potential savings only when ANOM-DISC exists this month (sum of those) — that cross-rule step is TASK-807. RE §C.6: E unavailable + trackable goals → Low insight with the total required.

## 3. Requirements

1. `rules/gapRules.ts` *(proposed path)* with GAP and GAP-INFO over `ctx.gap` (from TASK-709) and `ctx.discretionaryAverages`.
2. Templates verbatim from RE §C.5/C.6 (incl. "You could also consider a later target date or a lower target.").
3. GAP `potentialSavings: null` here (TASK-807 fills it when applicable).
4. `subject: { type:'goals' }`, key `GAP:goals:{month}`; `magnitude` = gap (ceil, minor).
5. Register both.

## 4. Scope

### Included
- Two rules, tests.

### Excluded
- Notices and cross-rule adjustments (TASK-807). `GOAL-EXPIRED` (OD-08, deferred TASK-890).

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/domain/recommendations/rules/gapRules.ts` | CREATE *(proposed path)* | Rules |
| `src/domain/recommendations/rules/index.ts` | MODIFY | Register |
| `src/domain/recommendations/rules/gapRules.test.ts` | CREATE | Tests |

## 6. Implementation Instructions

1. Use the FR-015 example as a test row (₹18,750 required, ₹15,000 saved, gap ₹3,750).

## 7. Dependencies

- TASK-803.

## 8. Acceptance Criteria

- [ ] FR-015 example produces GAP with the RE §C.5 reason text and amounts.
- [ ] Covered (gap ≤ 0) → no GAP.
- [ ] E unavailable with active goals → GAP-INFO only.
- [ ] No active trackable goals → neither.
- [ ] Essential categories never appear in the supporting list or action.

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

- None.

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
