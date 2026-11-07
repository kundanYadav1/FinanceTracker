# TASK-421 — DatabaseGate, startup sequence and database error screen

> **PROVISIONAL / BLOCKED** — Gate G0 closed. Module placement needs [DG-11](../design-gaps.md); diagnostic-info presentation needs [DG-02](../design-gaps.md).

## Task Metadata

- **Task ID:** TASK-421
- **Task Name:** DatabaseGate — splash-held startup, migration, error screen, app-lifecycle hooks
- **Implementation Phase:** 4 — Application Foundation
- **Feature:** F4.4 Database foundation / F4.7 Navigation foundation
- **Priority:** CRITICAL
- **Status:** BLOCKED (DG-11; DG-02 for the diagnostic section only)
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-411, TASK-412, TASK-414, TASK-418, TASK-420
- **Blocks:** TASK-422, TASK-423, TASK-424, TASK-904, TASK-907, TASK-908, TASK-911
- **PRS References:** FR-027.2, FR-026.5, NFR-002, NFR-004 (backup files), §35
- **Design References:** SA §E.2 rule 6, DB §J.2, DB §J.4 (backup cleanup after successful launch), NAV §C "First launch", NAV §D "App-level loading", SEC §7 (lifecycle), SEC §8 (diagnostic info), ST §2 (`sessionStore.dbStatus`)

## 1. Objective

Ensure no screen mounts before the database is open and migrated, show a blocking, non-destructive error screen when it cannot be, and wire the background/foreground lifecycle hooks.

## 2. Background and Context

FR-027.2: if the database cannot be opened or upgraded, show an error screen, never empty totals, and never delete or recreate the database. NAV §D: keep the splash visible until the gate is `ready` or `error`. DB §J.4: delete the pre-migration backup after the next successful launch at the new version. SEC §7: run `PRAGMA optimize` on background.

## 3. Requirements

1. `DatabaseGate` component in the root layout: on mount → `SplashScreen.preventAutoHideAsync()`; `setDbStatus('connecting')` → `openDatabase()` → `setDbStatus('migrating')` → `migrate(db, { backup: backupBeforeMigration })` → `ready`; hide splash on `ready` or `error`.
2. On `DatabaseUnavailableError` (`DB_OPEN_FAILED`, `DB_MIGRATION_FAILED`, `DB_SCHEMA_NEWER`, `LEGACY_DATA_PRESENT`): set `error` + code; render `DatabaseErrorScreen` **instead of** the navigator (no tabs, no totals).
3. `DatabaseErrorScreen`: catalog message for the code ("Nothing has been deleted"), **Try again** (re-runs the gate), and diagnostic info containing only app version (`expo-constants`), OS, `user_version`, error code, SQLite result code. Presentation of diagnostic info is blocked on DG-02: implement it as **visible, selectable text** only if DG-02 is approved that way; otherwise render the screen without the diagnostic section and record it as remaining work.
4. After `ready` at a newly migrated version, call `deleteMigrationBackups()` on the *next* successful launch (DB §J.4: store nothing extra — detect by "backup exists AND current user_version = LATEST AND this launch did not migrate").
5. `AppState` listener: on `background` run `PRAGMA optimize` (logged at debug level only); errors are logged, never shown.
6. Root `ErrorBoundary` (from TASK-420) also covers failures before the gate is ready.

## 4. Scope

### Included
- Gate, error screen, lifecycle listener, backup cleanup trigger, tests.

### Excluded
- Onboarding guard (TASK-422). iOS backup-exclusion call-site (TASK-908 adds it after open).

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/data/db/startup.ts` | CREATE *(proposed path)* | `initializeDatabase()` orchestration without React (open → migrate → cleanup) |
| `src/data/db/lifecycle.ts` | CREATE *(proposed path)* | `onAppBackground()` → `PRAGMA optimize` |
| `src/features/app-start/services/startupService.ts` | CREATE *(proposed path, [DG-11](../design-gaps.md))* | Calls `initializeDatabase`, maps errors to `Result` |
| `src/features/app-start/components/DatabaseGate.tsx` | CREATE *(proposed path, DG-11)* | Startup gate (status → splash / error screen / children) |
| `src/features/app-start/index.ts` | CREATE *(proposed path, DG-11)* | Public API: `DatabaseGate` |
| `src/shared/ui/DatabaseErrorScreen.tsx` | CREATE | FR-027.2 presentational screen (UX §J "shared") |
| `src/app/_layout.tsx` | MODIFY | Wrap navigator in `DatabaseGate` |
| `src/data/db/startup.test.ts`, `src/features/app-start/components/DatabaseGate.test.tsx` | CREATE | Tests |

## 6. Implementation Instructions

1. The import rules (SA §B.2) forbid `app/` and `shared/` from importing `data/`, while SA §E.2 places the gate "in the root layout". The proposed resolution ([DG-11](../design-gaps.md)) is a small `app-start` feature module that owns the gate; the root layout imports it through `features/app-start/index.ts`. **Do not start this task until DG-11 is approved**; do not weaken lint rules.
2. Test the gate with the real SQLite adapter injected and with forced failures (open throws; migration throws; schema newer).

## 7. Dependencies

- TASK-411/412 (runner, schema), TASK-414 (`sessionStore`), TASK-418 (`ErrorState` pieces), TASK-420 (root layout).

## 8. Acceptance Criteria

- [ ] No route component renders before `ready` (assert with a spy route in tests).
- [ ] Each failure code shows `DatabaseErrorScreen` with its message and no amount/total text; the database file is not deleted or recreated.
- [ ] Try again re-runs initialization; success then renders the navigator.
- [ ] `PRAGMA optimize` runs on background.
- [ ] Pre-migration backup is removed on the launch after a successful migration.
- [ ] Integration test #10 (TS §4): simulated migration failure shows the error screen with no zero totals.

## 9. Testing Requirements

- **Unit Tests:** `startup.ts` state transitions.
- **Integration Tests:** TS §4 workflow #10.
- **UI Tests:** `DatabaseErrorScreen` (TS §3 row: shows no totals; Retry calls the gate).
- **Manual Verification:** Android dev build cold start shows splash then Home; airplane mode irrelevant.

## 10. Verification Commands

```bash
npx jest src/data/db src/shared/ui/DatabaseGate tests/integration
npx tsc --noEmit
npx expo lint
npx expo-doctor
```

## 11. Definition of Done

Global DoD plus DG-02 outcome recorded.

## 12. Risks and Notes

- Layering of startup code must follow the lint rules from TASK-401; do not weaken rules to make it compile (DG-11).

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
