# TASK-906 — Export file and share flow

> **PROVISIONAL / BLOCKED** — new dependencies `expo-file-system` (direct) and `expo-sharing` need [OD-16](../../design/open-decisions.md#od-16).

## Task Metadata

- **Task ID:** TASK-906
- **Task Name:** `/settings/export` — unencrypted-file warning, write to cache, OS share sheet, temp-file cleanup
- **Implementation Phase:** 9 — Security, Backup & Release
- **Feature:** F9.3 Backup (export)
- **Priority:** HIGH
- **Status:** BLOCKED (OD-16)
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-901, TASK-905
- **Blocks:** TASK-904, TASK-909, TASK-912
- **PRS References:** FR-022.1, FR-022.2, FR-024, §4.2, NFR-004
- **Design References:** SEC §6 steps 1, 3, 4; DEP §3 (`expo-file-system`, `expo-sharing`); UX §H "Data export"; UX §I "Settings / Export" row

## 1. Objective

Let the user export all data to a JSON file and send it wherever they choose, after an explicit warning, leaving no stray copies behind.

## 2. Background and Context

SEC §6: warning dialog "This file is not encrypted and contains all your financial records. Anyone with the file can read it. Share it only somewhere you trust." [Cancel] [Export]; write `financetracker-export-YYYYMMDD-HHmm.json` to the cache dir; open the share sheet; delete the temp file when the sheet closes; delete leftovers at startup and on Delete All Data.

## 3. Requirements

1. `npx expo install expo-file-system expo-sharing` (after OD-16).
2. `exportFileService` *(proposed)*: `exportToShare()` → builds via TASK-905, writes the file, `Sharing.shareAsync(uri, { mimeType: 'application/json' })`, deletes the file in `finally`.
3. `deleteExportTempFiles()` — removes `financetracker-export-*.json` in cache; called at startup (extend startup orchestration, DG-11 path) and by TASK-904.
4. Screen: description, Export button → warning `ConfirmationDialog` → "Preparing file…" progress → share sheet; failure → "Export failed — nothing was shared".
5. Settings row.

## 4. Scope

### Included
- Dependencies, file service, cleanup, screen/route, tests.

### Excluded
- CSV (TASK-992 deferred), encrypted export, restore (deferred).

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `package.json`, `package-lock.json` | MODIFY | Add two Expo packages |
| `src/features/data-export/services/exportFileService.ts` | CREATE *(proposed path)* | File + share |
| `src/features/data-export/components/ExportScreen.tsx` | CREATE | UI |
| `src/app/settings/export.tsx` | CREATE | Route |
| `src/features/settings/components/SettingsScreen.tsx` | MODIFY | Row |
| `src/features/app-start/services/startupService.ts` | MODIFY | Leftover cleanup at startup |
| tests alongside | CREATE | Tests (file system and sharing mocked) |

## 6. Implementation Instructions

1. Mock `expo-file-system`/`expo-sharing` in Jest; assert write → share → delete order, and delete on share failure.

## 7. Dependencies

- TASK-901, TASK-905.

## 8. Acceptance Criteria

- [ ] Warning shown before any file is written; Cancel writes nothing.
- [ ] File name pattern correct; share sheet opened with the file.
- [ ] Temp file deleted after sharing and after a sharing error.
- [ ] Startup removes leftovers.
- [ ] Works in airplane mode (manual).

## 9. Testing Requirements

- **Unit/Integration Tests:** service with mocks.
- **UI Tests:** warning flow.
- **Manual Verification:** Android export to Files/Drive app; offline.

## 10. Verification Commands

```bash
npx jest src/features/data-export
npx tsc --noEmit
npx expo lint
npx expo-doctor
```

## 11. Definition of Done

Global DoD plus OD-16 approval referenced.

## 12. Risks and Notes

- Sharing to a cloud app is a user action (§4.2); the warning is mandatory.

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
