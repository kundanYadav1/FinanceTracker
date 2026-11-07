# TASK-917 — Final regression and release-readiness review

> **PROVISIONAL / BLOCKED** — automated E2E tool adoption needs [DG-09](../design-gaps.md); otherwise a scripted manual regression is used.

## Task Metadata

- **Task ID:** TASK-917
- **Task Name:** Critical-flow regression suite and release-readiness review
- **Implementation Phase:** 9 — Security, Backup & Release
- **Feature:** F9.6 Release verification
- **Priority:** CRITICAL
- **Status:** BLOCKED (DG-09 for the automated variant)
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-911, TASK-912, TASK-913, TASK-915, TASK-916
- **Blocks:** none — release decision (product owner)
- **PRS References:** all MVP FRs and NFRs; §32; §35; §36
- **Design References:** TS §4 (all 11 workflows), TS §5 (proposed E2E flows), requirements-traceability §1 – §3

## 1. Objective

Confirm, on the production build, that every MVP requirement is implemented and verified, nothing out of scope shipped, and no known critical defect remains.

## 2. Background and Context

TS §5 proposes Maestro for ~10 critical E2E flows; Maestro is not installed or approved (DG-09). Without approval, the same flows run as a scripted manual regression.

## 3. Requirements

1. Regression over the TS §5 flows: onboarding · add expense · add income · edit + delete transaction · create budget and exceed it · create goal + update saved amount · view recommendations · reports by custom range · export · delete all data · restart persistence. Automated with Maestro (`e2e/*.yaml`) if DG-09 approved; else scripted manual in `docs/tests/regression-1.0.0.md` *(proposed path)*.
2. Full Jest suite, `test:tz`, coverage gates, lint, type check, expo-doctor on the release commit.
3. Requirements audit: walk `docs/tasks/implementation-matrix.md`; every MVP row has a DONE task and evidence.
4. Scope audit: confirm none of §36 or MVP+/deferred items exist in the build (no notification permission, no app lock, no CSV, no restore, no dismiss controls, no trend reports).
5. Privacy audit: sentinel tests pass; no `fetch`; privacy text accurate.
6. Readiness report `docs/release/readiness-1.0.0.md` *(proposed path)*: GO / NO-GO recommendation with open risks — the release decision belongs to the PO.

## 4. Scope

### Included
- Regression, audits, readiness report.

### Excluded
- Fixes; store submission.

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `e2e/*.yaml` | CREATE (only if DG-09 approved) | Maestro flows |
| `docs/tests/regression-1.0.0.md` | CREATE *(proposed path)* | Regression results |
| `docs/release/readiness-1.0.0.md` | CREATE *(proposed path)* | Readiness report |
| `docs/tasks/task-registry.md` | MODIFY | Final statuses |

## 6. Implementation Instructions

1. Run on the exact build from TASK-915.

## 7. Dependencies

- Listed above.

## 8. Acceptance Criteria

- [ ] All regression flows pass on Android (and iOS unless descoped).
- [ ] All automated checks pass on the release commit.
- [ ] Every MVP requirement mapped to DONE tasks with evidence.
- [ ] Scope and privacy audits pass.
- [ ] Readiness report delivered to the PO.

## 9. Testing Requirements

- **E2E / Manual:** regression flows. **Automated:** full suite.

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

Readiness report accepted by the PO.

## 12. Risks and Notes

- Agents must not declare the product released; that is a PO decision.

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
