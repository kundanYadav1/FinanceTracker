# TASK-512 — Phase 5 integration tests and checkpoint

> **PROVISIONAL** — Gate G0 closed. Do not execute until approved.

## Task Metadata

- **Task ID:** TASK-512
- **Task Name:** Transaction workflow integration tests and Phase 5 verification checkpoint
- **Implementation Phase:** 5 — Transaction Management
- **Feature:** F5.6 Phase verification
- **Priority:** HIGH
- **Status:** NOT STARTED
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-508, TASK-509, TASK-510, TASK-511
- **Blocks:** TASK-608
- **PRS References:** FR-002, FR-002.1 – .3, FR-003, FR-003A, FR-005.1, FR-024, FR-026.1, FR-026.3, FR-026.4, FR-027.1, NFR-002, US-001, US-002, US-007
- **Design References:** TS §4 (workflows #1 list part, #2 list part, #6 list part), TS §5 (manual device checks), TS §2 "Data integrity"

## 1. Objective

Verify end to end that users can manage income and expenses locally, and record evidence.

## 2. Background and Context

Dashboard-dependent parts of TS §4 workflows #1/#2/#6 are completed in TASK-608/716/811. This checkpoint covers what Phase 5 delivers.

## 3. Requirements

1. `tests/integration/transactions-workflow.test.tsx`: add expense → visible in history with correct group and summary; add income → summary updates; edit (move to previous month) → disappears from current-month filter, appears under previous; delete → gone; search + filters combined; idempotent double save; failure keeps values; recurring flag stored and shown but creates nothing else (FR-002.1).
2. Sentinel leak test across add/edit/delete failure paths (helper from TASK-505).
3. Manual Android checks: airplane mode for add/view (FR-024); kill app right after save → record persists (NFR-002); reboot persistence; TalkBack reads a row label.
4. Evidence `docs/tests/phase-05-verification.md` *(proposed path)*.

## 4. Scope

### Included
- Integration tests, manual checks, evidence.

### Excluded
- Fixing defects (route to owning task).

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `tests/integration/transactions-workflow.test.tsx` | CREATE | End-to-end Jest workflow |
| `docs/tests/phase-05-verification.md` | CREATE *(proposed path)* | Evidence |
| `docs/tasks/task-registry.md` | MODIFY | Status |

## 6. Implementation Instructions

1. Fixed clock `2026-11-06`; real services/repos; in-memory SQLite.
2. Assert via rendered screens (RNTL), not repository calls, wherever practical.

## 7. Dependencies

TASK-508 – TASK-511.

## 8. Acceptance Criteria

- [ ] All §3.1 scenarios pass.
- [ ] Sentinel test passes.
- [ ] Manual checks pass on an Android device/emulator (recorded).
- [ ] Full verification command set passes.

## 9. Testing Requirements

- **Unit Tests:** —
- **Integration Tests:** §3.1.
- **UI Tests:** —
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
