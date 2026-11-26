# ADR-0011 — Exclude the database from OS cloud backups

**Status:** Proposed (2026-11-06). Implementation details pending [OD-15](../design/open-decisions.md#od-15).

## Context
NFR-004.1 requires that financial data be excluded from automatic OS cloud backups.
- **Android:** the Expo app config docs say `android.allowBackup` defaults to Android's default, which is `true`. With the setting false, "no backup or restore of the application will ever be performed".
- **iOS:** Expo documents no general switch; `updates.excludeFromBackup` covers only the expo-updates directory. Excluding a file from iOS backup requires setting `NSURLIsExcludedFromBackupKey` on that file.

## Decision
- **Android:** set `android.allowBackup: false` in the app config. This is a BUILD task.
- **iOS:** a project-local Expo module (`modules/backup-exclusion`) marks the database file, its WAL/SHM files and its backup files as excluded. It runs after the database opens and after each file is created. A spike is required first.
- **Privacy text:** claims exclusion only for platforms where it is implemented and verified.

## Alternatives
- **Keep backups on and disclose it:** rejected by PD-11.
- **Store the database in the iOS Caches directory:** not backed up, but the OS can purge it, which would lose data.

## Consequences
- \+ Data leaves the device only through an explicit export.
- − Phone migration does not carry the data across, so users must export before moving devices. The exception is Android user-initiated device-to-device transfer, which stays possible unless `dataExtractionRules` are added.
- − Requires dev builds (already the project's workflow) and native code that must be maintained.
