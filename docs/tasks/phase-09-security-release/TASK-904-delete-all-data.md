# TASK-904 — Delete all data

> **PROVISIONAL** — Gate G0 closed. Do not execute until approved.

## Task Metadata

- **Task ID:** TASK-904
- **Task Name:** Delete All Data — single-transaction wipe, VACUUM, backup/export cleanup, two-step confirmation, reset to onboarding
- **Implementation Phase:** 9 — Security, Backup & Release
- **Feature:** F9.2 Data lifecycle
- **Priority:** CRITICAL
- **Status:** NOT STARTED
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-411, TASK-421, TASK-901, TASK-902, TASK-906
- **Blocks:** TASK-909, TASK-912
- **PRS References:** FR-026.2, FR-025.1, FR-026.3, NFR-004
- **Design References:** DB §J.7, SEC §6 step 4 (export temp cleanup), SEC §7 "Delete All Data", NAV §C "Settings navigation" (reset to onboarding), UX §H "Delete all data", UX §I row, TS §4 #9, TS §2 "Data integrity"

## 1. Objective

Permanently remove all user data on request, leaving no recoverable rows, backups or export files, and return the app to onboarding.

## 2. Background and Context

DB §J.7: one transaction deletes `goal_balance_events` (if present), `transactions`, `budget_versions`, `savings_goals` and resets the profile; seeds stay. Then `VACUUM`, `PRAGMA wal_checkpoint(TRUNCATE)`, delete pre-migration backups and export temp files, bump all revisions, navigate to onboarding.

## 3. Requirements

1. `data/db/deleteAllData.ts` *(proposed path)*: the transaction above; then VACUUM, checkpoint; `deleteMigrationBackups()` (TASK-411); `deleteExportTempFiles()` (TASK-906).
2. `settingsService.deleteAllData()` → `Result`; on success `revisionStore.bumpAll()`, `sessionStore.setProfile(reset snapshot)`; failure → "Delete failed — your data is unchanged" (transaction rolled back).
3. Screen: step 1 explanation (permanent, cannot be undone) with Continue; step 2 a separate confirmation with an explicit destructive "Delete everything" button (UX §H allows "typing or pressing"; this plan uses the pressing variant — typed confirmation is not implemented); blocking "Deleting…" state; on success reset navigation stack to `/onboarding`.
4. Settings row (destructive styling).

## 4. Scope

### Included
- DB function, service, screen/route, tests.

### Excluded
- —

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/data/db/deleteAllData.ts` | CREATE *(proposed path)* | Wipe |
| `src/features/settings/services/settingsService.ts` | MODIFY | Use case |
| `src/features/settings/components/DeleteDataScreen.tsx` | CREATE | UI |
| `src/app/settings/delete-data.tsx` | CREATE | Route |
| `src/features/settings/components/SettingsScreen.tsx` | MODIFY | Row |
| `src/data/db/deleteAllData.test.ts`, `tests/integration/delete-all-data.test.tsx` | CREATE | Tests |

## 6. Implementation Instructions

1. VACUUM cannot run inside a transaction — run after commit.
2. Failure-injection test: throw after the first DELETE → all rows intact.

## 7. Dependencies

- TASK-411 (backup cleanup), TASK-421 (gate/reset), TASK-901 (settings), TASK-902 (file sequencing on `settingsService.ts`), TASK-906 (export temp cleanup helper).

## 8. Acceptance Criteria (TS §4 #9)

- [ ] After deletion: zero transactions, budget versions, goals (and events); profile reset (currency NULL, name empty, theme system, onboarding NULL); seeds intact.
- [ ] No pre-migration backup or export temp file remains.
- [ ] App shows onboarding; all screens empty afterwards.
- [ ] Mid-operation failure leaves data unchanged and shows the failure message.

## 9. Testing Requirements

- **Integration Tests (database + workflow):** all items.
- **UI Tests:** two-step confirmation.
- **Manual Verification:** Android: delete, restart, confirm onboarding and empty data.

## 10. Verification Commands

```bash
npx jest src/data/db/deleteAllData tests/integration/delete-all-data src/features/settings
npx tsc --noEmit
npx expo lint
```

## 11. Definition of Done

Global DoD plus manual Android check.

## 12. Risks and Notes

- Irreversible by design; the confirmation copy is reviewed by the PO in TASK-916.

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
