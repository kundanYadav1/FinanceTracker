# TASK-811 — Phase 8 integration tests and checkpoint

> **PROVISIONAL** — Gate G0 closed. Do not execute until approved.

## Task Metadata

- **Task ID:** TASK-811
- **Task Name:** Recommendation workflow integration tests and Phase 8 checkpoint (MVP feature-complete gate)
- **Implementation Phase:** 8 — Recommendation Engine
- **Feature:** F8.6 Phase verification
- **Priority:** HIGH
- **Status:** NOT STARTED
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-716, TASK-810
- **Blocks:** TASK-909, TASK-910
- **PRS References:** FR-012 – FR-017, FR-006.1, FR-019.7, FR-024, §32, US-005, US-006, US-007
- **Design References:** TS §4 workflows #3 (recommendation part), #5, #6 (recommendation part)

## 1. Objective

Verify that users receive transparent, data-driven suggestions that react to every data change, and that the full MVP feature set works together.

## 2. Background and Context

This checkpoint closes the remaining parts of TS §4 #3, #5 and #6.

## 3. Requirements

1. `tests/integration/recommendations-workflow.test.tsx`:
   - #3: budget to 80 % → BUD-WARN on Home; above 100 % → BUD-OVER.
   - #5: 4 months of fixtures → ANOM-DISC for a discretionary spike; ANOM-INFO only for an essential spike; GAP when goals exceed E; Home shows top 3.
   - #6: moving/deleting a transaction updates recommendations.
   - FR-019.7: custom dashboard period leaves recommendations unchanged.
2. Manual Android: recommendations offline (airplane), detail "Why am I seeing this?", TalkBack reads priority text.
3. Evidence `docs/tests/phase-08-verification.md` *(proposed path)*.

## 4. Scope

### Included
- Tests, manual checks, evidence.

### Excluded
- Fixes.

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `tests/integration/recommendations-workflow.test.tsx` | CREATE | Workflows |
| `docs/tests/phase-08-verification.md` | CREATE *(proposed path)* | Evidence |
| `docs/tasks/task-registry.md` | MODIFY | Status |

## 6. Implementation Instructions

1. Real stack, fixed clock, RNTL.

## 7. Dependencies

- TASK-716, TASK-810.

## 8. Acceptance Criteria

- [ ] All §3.1 scenarios pass.
- [ ] Manual checks recorded.
- [ ] Full verification set passes; domain coverage ≥ 95 %.

## 9. Testing Requirements

- **Integration Tests:** §3.1. **Manual:** §3.2.

## 10. Verification Commands

```bash
npm test
npm run test:tz
npm run test:coverage
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
