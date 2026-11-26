# TASK-424 — Phase 4 verification checkpoint

> **PROVISIONAL** — Gate G0 closed. Do not execute until approved.

## Task Metadata

- **Task ID:** TASK-424
- **Task Name:** Phase 4 foundation verification checkpoint
- **Implementation Phase:** 4 — Application Foundation
- **Feature:** F4.10 Phase verification
- **Priority:** HIGH
- **Status:** NOT STARTED
- **Estimated Complexity:** SMALL
- **Dependencies:** TASK-401, TASK-402, TASK-404, TASK-405, TASK-406, TASK-407, TASK-408, TASK-409, TASK-410, TASK-411, TASK-412, TASK-413, TASK-414, TASK-415, TASK-416, TASK-417, TASK-418, TASK-419, TASK-420, TASK-421, TASK-422, TASK-423 (the LOW-priority cleanup task is optional and not a dependency)
- **Blocks:** TASK-911 — also the Phase 4 → Phase 5 integration checkpoint (see execution-roadmap)
- **PRS References:** NFR-002, NFR-005, NFR-007, NFR-008, FR-001.1, FR-027.2
- **Design References:** TS §0 (verification commands, coverage gates), TS §5 (device checks), DB §J.8

## 1. Objective

Prove that the foundation is a running, tested application ready for feature work, and record the evidence in `docs/tests/`.

## 2. Background and Context

AGENTS.md §2 TEST and §17 require reported verification. The roadmap uses this checkpoint as the Phase 4 integration gate before transaction features build on it.

## 3. Requirements

1. Run every verification command and record results.
2. Coverage: `src/domain/**` ≥ 95 %, `src/data/repositories/**` ≥ 85 % (TS §0).
3. Android dev build (`npx expo run:android`) on an emulator or device: fresh install → splash → onboarding → Home with five placeholder tabs; restart keeps onboarding completed; dark/light follows OS; no runtime permission prompt.
4. Database checks on device: `user_version = 1` (log at debug level or via a dev-only check), WAL mode.
5. Write `docs/tests/phase-04-verification.md` *(proposed path; `docs/tests/` is the AGENTS.md location)* with the results table, device/OS used, and open issues.
6. Do not fix defects inside this task: open new tasks or reopen the owning task (agent guide §8).

## 4. Scope

### Included
- Verification, evidence document.

### Excluded
- New features or fixes.

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `docs/tests/phase-04-verification.md` | CREATE *(proposed path)* | Evidence |
| `docs/tasks/task-registry.md` | MODIFY | Status update |

## 6. Implementation Instructions

1. Use the checklist in §3; attach command outputs (summaries) to the evidence file.
2. Any failure → status `BLOCKED` with the failing item and the owning task ID.

## 7. Dependencies

All Phase 4 tasks except TASK-403.

## 8. Acceptance Criteria

- [ ] `npm test`, `npx tsc --noEmit`, `npx expo lint`, `npx expo-doctor`, `npm run test:tz` all pass.
- [ ] Coverage gates met.
- [ ] Android manual checks in §3.3 – 3.4 pass.
- [ ] Evidence file committed.

## 9. Testing Requirements

- **Unit/Integration/UI Tests:** full suite.
- **Manual Verification:** §3.3 – 3.4 on Android.

## 10. Verification Commands

```bash
npm test
npm run test:tz
npm run test:coverage
npx tsc --noEmit
npx expo lint
npx expo-doctor
npx expo run:android
```

## 11. Definition of Done

All acceptance criteria checked with evidence; no Phase 4 task left `IN PROGRESS`.

## 12. Risks and Notes

- iOS is not verified at this checkpoint (requires macOS; TASK-913).

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
