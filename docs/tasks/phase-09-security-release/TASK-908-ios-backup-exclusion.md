# TASK-908 — iOS backup exclusion local module (spike + implementation)

> **PROVISIONAL / BLOCKED** — requires [OD-15](../../design/open-decisions.md#od-15) (tech approval of a local native module) and macOS for building/verifying (external blocker).

## Task Metadata

- **Task ID:** TASK-908
- **Task Name:** Local Expo module `modules/backup-exclusion` setting `NSURLIsExcludedFromBackupKey` on database files
- **Implementation Phase:** 9 — Security, Backup & Release
- **Feature:** F9.4 Local data protection
- **Priority:** HIGH
- **Status:** BLOCKED (OD-15; external: macOS/Xcode)
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-411, TASK-421
- **Blocks:** TASK-913 — optional: TASK-903 iOS backup sentence
- **PRS References:** NFR-004.1, NFR-005 (platform API isolated), §35
- **Design References:** SEC §2 (iOS bullet), SEC §9, DEP §3 (local module row), DEP §5, ADR-0011, TS §5 "Backup exclusion" (iOS test hook)

## 1. Objective

Exclude the database and its WAL/SHM/backup files from iCloud/device backup on iOS, isolated behind a small platform module.

## 2. Background and Context

Expo exposes no config for iOS backup exclusion. SEC §2 proposes a ~20-line Swift local module called after the database opens and after any backup file is created; a spike must confirm it works with expo-sqlite's directory and `-wal`/`-shm` files. Until it ships, privacy text must not claim iOS exclusion.

## 3. Requirements

1. **Spike (stop condition):** confirm expo-sqlite's database directory path on iOS and that setting the resource value persists for `financetracker.db`, `-wal`, `-shm`, `financetracker.pre-v*.db`. If not feasible, stop and report.
2. Module `modules/backup-exclusion` (Expo Modules API): `excludeFromBackup(paths: string[]): Promise<void>` and `isExcludedFromBackup(path): Promise<boolean>` (test hook, TS §5). Android/web: no-op JS implementation.
3. TS wrapper `src/data/db/backupExclusion.ts` *(proposed path)* called by startup after open/migrate and after `backupBeforeMigration`; failures logged (code only), never block startup.
4. Requires a dev/preview build; no Expo Go support (DEP §5).

## 4. Scope

### Included
- Spike, module, wrapper, call sites, verification.

### Excluded
- Privacy text update (TASK-903 conditionally includes the iOS sentence once this is DONE).

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `modules/backup-exclusion/**` | CREATE (path named in SEC §2) | Native module (Swift + JS) |
| `src/data/db/backupExclusion.ts` | CREATE *(proposed path)* | Platform-isolated wrapper |
| `src/data/db/startup.ts` | MODIFY | Call after open/migrate |
| `src/data/db/backup.ts` | MODIFY | Call after creating a pre-migration backup |
| tests alongside | CREATE | Wrapper tests (module mocked) |

## 6. Implementation Instructions

1. Use `npx create-expo-module --local` conventions; follow AGENTS.md §5 (no third-party package).

## 7. Dependencies

- TASK-411 (backup file), TASK-421 (startup).

## 8. Acceptance Criteria

- [ ] On an iOS build, `isExcludedFromBackup` returns true for all four file kinds.
- [ ] Android behaviour unchanged.
- [ ] A module failure does not block startup and is logged with a code only.

## 9. Testing Requirements

- **Unit Tests:** wrapper with mocked module.
- **Manual Verification:** iOS simulator/device test hook output recorded (requires macOS).

## 10. Verification Commands

```bash
npm test
npx tsc --noEmit
npx expo lint
npx expo-doctor
npx expo run:ios
```

## 11. Definition of Done

Global DoD plus recorded iOS verification.

## 12. Risks and Notes

- External blocker: no macOS environment is known to be available; EAS cloud builds can build but not run the verification hook.

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
