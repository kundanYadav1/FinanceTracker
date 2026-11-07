# TASK-911 — Database migration and upgrade verification on device

> **PROVISIONAL** — Gate G0 closed. Do not execute until approved.

## Task Metadata

- **Task ID:** TASK-911
- **Task Name:** On-device verification of fresh install, in-place upgrade, legacy draft guard and failure behaviour
- **Implementation Phase:** 9 — Security, Backup & Release
- **Feature:** F9.6 Release verification
- **Priority:** CRITICAL
- **Status:** NOT STARTED
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-411, TASK-412, TASK-421, TASK-424
- **Blocks:** TASK-912, TASK-917
- **PRS References:** FR-026.5, FR-027.2, NFR-002, AGENTS.md §11
- **Design References:** DB §J.2 – J.6, DB §J.8, TS §2 "Migrations", TS §5

## 1. Objective

Prove on a real Android build that application updates preserve all financial data and that database failures never destroy or recreate it.

## 2. Background and Context

Jest already covers migration logic against SQLite (TASK-411/412). This task verifies the same guarantees with expo-sqlite on device, including file-level backup behaviour.

## 3. Requirements

1. Fresh install → `user_version = LATEST`, seeds present.
2. In-place update: install build A, add fixture data (transactions in several months, budgets with history, goals), install build B over it → all records and values preserved (compare export JSON counts and money checksums before/after).
3. Legacy guard: install the **draft** build (commit `e4b2a1e`) with no data → upgrade → baseline created; with data (if the draft build can create any) → `LEGACY_DATA_PRESENT` error screen, data untouched. Record whether the draft build can initialise a DB at all (DB §J.6 says it cannot).
4. If a migration 2 exists by release time: upgrade from v1 with data, pre-migration backup created then removed on the following launch.
5. Evidence `docs/tests/migration-verification.md` *(proposed path)*.

## 4. Scope

### Included
- Manual device verification, evidence.

### Excluded
- Code changes (defects → owning task).

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `docs/tests/migration-verification.md` | CREATE *(proposed path)* | Evidence |

## 6. Implementation Instructions

1. Use the export (TASK-906) as the before/after comparison artefact.

## 7. Dependencies

- TASK-411, 412, 421, 424; TASK-906 recommended for comparison (if not done, compare via a debug query).

## 8. Acceptance Criteria

- [ ] Fresh install and in-place update verified with identical record counts and money checksums.
- [ ] Legacy scenarios verified as described.
- [ ] No scenario deletes or recreates the database.

## 9. Testing Requirements

- **Manual Verification:** all scenarios on Android.

## 10. Verification Commands

```bash
npm test
npx expo run:android
```

## 11. Definition of Done

All scenarios recorded as passing.

## 12. Risks and Notes

- Installing the draft build requires building commit `e4b2a1e`; if impossible, record and rely on the Jest legacy fixture.

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
