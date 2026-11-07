# TASK-608 — Phase 6 integration tests and checkpoint

> **PROVISIONAL** — Gate G0 closed. Do not execute until approved.

## Task Metadata

- **Task ID:** TASK-608
- **Task Name:** Dashboard & reports integration tests and Phase 6 checkpoint
- **Implementation Phase:** 6 — Dashboard & Analytics
- **Feature:** F6.6 Phase verification
- **Priority:** HIGH
- **Status:** NOT STARTED
- **Estimated Complexity:** SMALL
- **Dependencies:** TASK-512, TASK-606, TASK-607
- **Blocks:** TASK-716
- **PRS References:** FR-006 acceptance, FR-007, FR-018.1, FR-019, FR-024, US-001, US-002, US-004, US-007
- **Design References:** TS §4 workflows #1 and #2 (dashboard parts), TS §5

## 1. Objective

Verify that users can understand their financial situation for any period and record evidence.

## 2. Background and Context

Covers the dashboard/summary assertions of TS §4 #1 (add expense → dashboard update) and #2 (add income → savings update, rate becomes available), plus US-004.

## 3. Requirements

1. `tests/integration/dashboard-workflow.test.tsx`: add expense → expenses, savings, rate and recent list update on Home; first income → rate changes from "not available" to a value; edit transaction to previous month → current-month totals drop and previous-month totals rise (switch period); delete → reverses.
2. `tests/integration/reports-workflow.test.tsx`: category totals sum = total expenses; drill-down filter; custom range.
3. Manual Android: airplane mode Home/Reports; period switching; largest font.
4. Evidence `docs/tests/phase-06-verification.md` *(proposed path)*.

## 4. Scope

### Included
- Integration tests, manual checks, evidence.

### Excluded
- Fixes.

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `tests/integration/dashboard-workflow.test.tsx` | CREATE | Workflow #1/#2 dashboard parts |
| `tests/integration/reports-workflow.test.tsx` | CREATE | US-004 |
| `docs/tests/phase-06-verification.md` | CREATE *(proposed path)* | Evidence |
| `docs/tasks/task-registry.md` | MODIFY | Status |

## 6. Implementation Instructions

1. Fixed clock `2026-11-06`; real stack; RNTL.

## 7. Dependencies

TASK-512, TASK-606, TASK-607.

## 8. Acceptance Criteria

- [ ] All §3.1 – 3.2 scenarios pass.
- [ ] Manual checks pass (recorded).
- [ ] Full verification set passes.

## 9. Testing Requirements

- **Integration Tests:** §3.1 – 3.2.
- **Manual Verification:** §3.3.

## 10. Verification Commands

```bash
npm test
npm run test:tz
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
