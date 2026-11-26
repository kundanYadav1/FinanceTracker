# TASK-907 — Android OS backup exclusion

> **PROVISIONAL / BLOCKED** — device-to-device transfer acceptance needs [OD-15](../../design/open-decisions.md#od-15) (PO) and ADR-0011 acceptance.

## Task Metadata

- **Task ID:** TASK-907
- **Task Name:** Android `allowBackup: false` and backup verification
- **Implementation Phase:** 9 — Security, Backup & Release
- **Feature:** F9.4 Local data protection
- **Priority:** HIGH
- **Status:** BLOCKED (OD-15)
- **Estimated Complexity:** SMALL
- **Dependencies:** TASK-421
- **Blocks:** TASK-912, TASK-914
- **PRS References:** NFR-004, NFR-004.1, §4.2
- **Design References:** SEC §2 (Android bullet), SEC §9, ADR-0011, DEP §5 (needs native build), TS §5 "Backup exclusion" row

## 1. Objective

Prevent Android Auto Backup from copying the financial database to the cloud.

## 2. Background and Context

SEC §2: set `android.allowBackup: false` in app config; Expo docs state no backup or restore will be performed. Caveat: Android 12+ user-initiated device-to-device transfer is not blocked; the design proposes accepting it (OD-15). If the PO rejects that, a config plugin with `dataExtractionRules` is required — that would be a re-planned task.

## 3. Requirements

1. `app.json` → `expo.android.allowBackup: false`.
2. Rebuild a development/preview build; verify with `adb shell bmgr backupnow <package>` that the app is skipped; record output.
3. Record the OD-15 D2D decision in the completion report.

## 4. Scope

### Included
- Config change and verification.

### Excluded
- iOS (TASK-908); D2D blocking plugin (only if OD-15 requires; new task).

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `app.json` | MODIFY | `android.allowBackup: false` |

## 6. Implementation Instructions

1. Do not commit generated `android/` folders.

## 7. Dependencies

- TASK-421 (stable app to build).

## 8. Acceptance Criteria

- [ ] `app.json` contains `android.allowBackup: false`.
- [ ] `bmgr backupnow` reports the package is not eligible/skipped (output recorded).
- [ ] `npx expo-doctor` passes.

## 9. Testing Requirements

- **Manual Verification:** `adb` check on emulator/device.

## 10. Verification Commands

```bash
npx expo-doctor
npx expo run:android
adb shell bmgr backupnow com.kundan2001.FinanceTracker
```

## 11. Definition of Done

Global DoD plus recorded `bmgr` output.

## 12. Risks and Notes

- Expo Go ignores this setting (DEP §5); verify only on a native build.

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
