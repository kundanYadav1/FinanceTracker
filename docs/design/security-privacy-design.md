# D8 — Security & Privacy Design

**Phase:** 2 — DESIGN · **Status:** Provisional ([OD-01](open-decisions.md#od-01)) · **PRS:** §4.2, §35, NFR-004, FR-022, FR-025, FR-026.2, FR-027.3
Related: [database-design](database-design.md) · [dependency-design](dependency-design.md) · ADRs [0011](../decisions/ADR-0011-os-backup-exclusion.md), [0012](../decisions/ADR-0012-no-database-encryption-mvp.md)

> **Phase 8 update (2026-11-26)** — [spec](../specs/security-data-portability.md), ADRs [0014](../decisions/ADR-0014-app-pin-storage-lockout.md), [0015](../decisions/ADR-0015-backup-format-replace-restore.md). Supersedes this document where they differ:
> - **T3/T7 now mitigated:** optional app PIN (4–6 digits, salted+iterated hash in `expo-secure-store`, escalating lockout) with optional biometric shortcut, auto-lock timeout, and a privacy cover in the task switcher. §5's "no app-specific PIN" decision is reversed. The lock is a privacy barrier, **not** encryption; the database is still unencrypted (ADR-0012).
> - **T9 / §6:** CSV export (transactions) and JSON restore (replace-all, validated, single transaction, safety copy) are implemented. Backups exclude PIN and lock data.
> - **Migrations:** run through `src/db/migrate.ts`; covered by real-SQLite tests for every historical version, an immutability hash test, rollback and newer-database tests.
> - Still not done: SQLCipher, merge restore, encrypted backups, OS backup exclusion (`allowBackup`, OD-15).

> **The local SQLite database is NOT encrypted by the application in the MVP.** No screen, store listing or document may claim otherwise (§35).

---

## 1. Threat model (single-user, offline app)

| # | Threat | Likelihood | MVP mitigation | Residual risk |
|---|---|---|---|---|
| T1 | Another app reads the database | Low | App sandbox (Android app-private storage, iOS container) | Rooted/jailbroken devices |
| T2 | Data copied off-device via OS cloud backup without user intent | Medium (Android Auto Backup and iCloud are on by default) | Exclude from backup (§2) | Android device-to-device transfer ([OD-15](open-decisions.md#od-15)) |
| T3 | Lost/stolen **unlocked** phone, or a shared phone | Medium | None in the MVP (app lock is MVP+) | **Accepted temporarily** |
| T4 | Lost/stolen **locked** phone | Medium | OS file-based encryption (Android FBE; iOS Data Protection, default class *Complete Until First User Authentication*) | Forensic attack on an AFU device |
| T5 | Financial data leaks via logs, crash reports or analytics | Medium (typical developer mistake) | Redacting logger, no analytics or crash SDK, lint rule (§4) | Low |
| T6 | Exported file shared to the wrong place or left on the device | Medium | Explicit warning (FR-022.2), temp file cleanup (§6) | The user controls where it goes. **Accepted** |
| T7 | App-switcher snapshot or screenshots show balances | Medium | None in the MVP | **Accepted temporarily** (MVP+ with app lock) |
| T8 | Malicious deep link triggers an action | Low | No route acts on load; params validated ([navigation §D](navigation-design.md#d-navigation-states)) | Low |
| T9 | Malformed import corrupts data | — | No import/restore in the MVP (FR-023 deferred) | — |
| T10 | Data loss (uninstall, device loss) | Medium | Privacy text explains it; JSON export (FR-022.1, NFR-004.2) | User responsibility. **Accepted** |

---

## 2. Local data protection (MVP)

- **Storage location:** expo-sqlite default database directory (app-private). No financial data in AsyncStorage, SecureStore, files, or the clipboard.
- **Database file set:** `financetracker.db`, `-wal`, `-shm`, and the transient `financetracker.pre-v*.db` ([database §J.4](database-design.md#j4-rollback-and-recovery)).
- **OS backup exclusion — NFR-004.1** ([ADR-0011](../decisions/ADR-0011-os-backup-exclusion.md)):
  - **Android:** set `android.allowBackup: false` in the app config (a documented Expo config field; per the Expo docs, "no backup or restore of the application will ever be performed"). This change to `app.json` is a BUILD task, not done in this phase. Caveat: for apps targeting Android 12+, `allowBackup=false` disables cloud backup but **not user-initiated device-to-device transfer**. Excluding D2D too needs `android:dataExtractionRules`, which requires a small config plugin. The PRS requirement covers *automatic cloud* backups, so D2D (an explicit user action during phone setup) is proposed as acceptable. Product-owner confirmation is needed ([OD-15](open-decisions.md#od-15)).
  - **iOS:** iCloud/device backup includes the app's Documents and Library (except Caches). Expo exposes no config switch for this. Exclusion requires setting `NSURLIsExcludedFromBackupKey` on each database file. **Proposed:** a small local Expo module (`modules/backup-exclusion`, Swift, about 20 lines) called after the database opens and after any backup file is created. Requires a development build (already the project's workflow). Needs a spike ([OD-15](open-decisions.md#od-15)). Until it ships, the privacy text must not claim iOS exclusion.
- **Durability (NFR-002):** `PRAGMA journal_mode=WAL` + `PRAGMA synchronous=FULL` (FULL rather than NORMAL, so a committed transaction survives power loss as well as an app kill). Every save is a committed transaction before success is reported.
- **Permissions:** the MVP requests **no** runtime permissions. Unused installed modules that declare permissions are reviewed in [OD-17](open-decisions.md#od-17).

---

## 3. Database encryption — evaluation (not in the MVP)

([ADR-0012](../decisions/ADR-0012-no-database-encryption-mvp.md)) The PRS defers encryption to its own specification (§5.1, §35).

| Aspect | Finding |
|---|---|
| Option | SQLCipher through expo-sqlite's config plugin `useSQLCipher: true` (Android, iOS, macOS). No extra package. |
| Key | 256-bit random key generated on first run and stored in `expo-secure-store` (Android Keystore-backed / iOS Keychain; already installed), applied with `PRAGMA key` immediately after open. |
| Verification | Expo docs: if the binary lacks SQLCipher, `PRAGMA key` **silently does nothing** and the database stays plaintext. The design therefore requires checking `PRAGMA cipher_version` and failing closed when it is empty. |
| Platform limits | Not available in Expo Go. Requires prebuild/rebuild. Not applicable on web. |
| Migration | An existing plaintext database must be converted (`ATTACH … KEY …; SELECT sqlcipher_export(...)`), which is a risky one-time operation needing its own test plan. |
| Costs | Some performance overhead (to be measured against NFR-001.2). Key-loss scenarios (e.g. a Keychain reset) make the data unrecoverable. App-store encryption export-compliance declarations become necessary. |
| Value given T1/T4 | Adds protection mainly on rooted devices and forensic AFU attacks. The OS already encrypts at rest when the device is locked. |
| **Decision** | Do **not** introduce it in the MVP. The schema and the connection layer (`openDatabase()` as a single function) keep it a contained future change. |

---

## 4. Sensitive data logging

- `shared/lib/logger.ts` is the **only** logging entry point. An ESLint `no-console` rule applies everywhere except the logger.
- Log events carry `{event, code, op, entity, sqliteCode, schemaVersion}`. **Never** amounts, notes, names, goal names, category of a specific record, dates of specific records, or raw SQL parameters (FR-027.3, AGENTS.md §15).
- `AppError.context` is typed `Record<string, string | number | boolean>`, restricted by convention to the keys above. A unit test feeds sentinel values (amount `987654321`, note `SENTINEL_NOTE`) through every service failure path and asserts they appear in no logger call and no user message.
- Release builds: the logger outputs nothing except errors with codes. No remote sink.
- Test fixtures use synthetic data only.

---

## 5. App lock & biometrics (MVP+, architecture only)

FR-025 app lock is MVP+ and needs its own specification. The proposed shape:
- `expo-local-authentication` (official; Face ID needs `NSFaceIDUsageDescription`) gates the root layout on cold start and on resume after the background exceeds N seconds.
- Fallback: device credential (`disableDeviceFallback: false`). No app-specific PIN in the first iteration, so no secrets need storing.
- Lock state lives in `sessionStore`. The root layout renders `LockScreen` instead of the navigator while locked, so data screens do not mount until unlocked.
- Privacy overlay: on `AppState` change to `inactive/background`, render an opaque cover (hides the app-switcher snapshot). Optionally Android `FLAG_SECURE` via `expo-screen-capture`, which also blocks screenshots (a product decision).
- Biometric considerations: biometrics confirm presence and do not encrypt anything. Enrollment changes and lockout must fall back to the device credential. It must never lock users out of their own data permanently.

---

## 6. Export file handling (FR-022.1/.2, MVP)

1. Settings → Export → warning dialog: "This file is not encrypted and contains all your financial records. Anyone with the file can read it. Share it only somewhere you trust." [Cancel] [Export].
2. The service reads all tables in **one read transaction** (a consistent snapshot) and builds:
   ```json
   { "format": "financetracker-export", "formatVersion": 1, "schemaVersion": 1,
     "exportedAt": "2026-11-06T10:15:00.000Z", "appVersion": "1.0.0",
     "profile": { "displayName": "…", "primaryCurrency": "INR", "themePreference": "system" },
     "categories": [...], "paymentMethods": [...],
     "transactions": [{ "id": "…", "type": "expense", "amountMinor": 125050, "currency": "INR",
                        "categoryId": "cat_food", "paymentMethodId": "pm_upi",
                        "date": "2026-11-04", "note": null, "isRecurring": false,
                        "createdAt": "…", "updatedAt": "…" }],
     "budgetVersions": [...], "savingsGoals": [...] }
   ```
   Money is exported as integer minor units + currency, never as decimal numbers. The structure is validated by a Zod schema in tests (a future restore can reuse it, FR-023).
3. The file is written to the app **cache** directory as `financetracker-export-YYYYMMDD-HHmm.json` (`expo-file-system`), then the OS share sheet opens (`expo-sharing`). The user chooses the destination; this is the explicit action required by §4.2.
4. The temp file is deleted when the share sheet closes. Leftover `financetracker-export-*.json` files in the cache are deleted at startup and by Delete All Data.
5. The export works offline (FR-022.1). Very large exports (50k transactions ≈ 10–15 MB JSON) are built in chunks to avoid UI blocking (NFR-001).
6. **Encrypted export** and **restore** are deferred (FR-023).

---

## 7. App lifecycle

| Event | Behavior |
|---|---|
| Cold start | DatabaseGate: open → PRAGMAs → migrate → ready. No data screen mounts before ready. |
| Background | Run `PRAGMA optimize`. No other work. Nothing pending, because every save commits before reporting success. |
| Process kill | Committed data is safe (WAL + synchronous FULL). Unsaved form input is lost (no draft persistence, which is acceptable). |
| Foreground | If the calendar day changed, refresh "today"-dependent queries. |
| Uninstall | All data is deleted by the OS (stated in the privacy text, NFR-004.2). |
| Delete All Data | [database §J.7](database-design.md#j7-delete-all-data), including VACUUM and removing backups and exports. |

---

## 8. Privacy-safe error reporting

- No crash-reporting or analytics SDK in the MVP (no network, §36 spirit, AGENTS.md §15).
- The database error screen offers **Copy diagnostic info**, which contains only: app version, OS, schema version (`user_version`), error code, and SQLite result code. The user can paste it into a support message. This is explicit and user-initiated.
- Any future crash reporting needs its own specification covering scrubbing (`beforeSend`), opt-in, and a data inventory.

---

## 9. Summary

| Item | MVP | Later | Accepted temporarily |
|---|---|---|---|
| App sandbox + OS at-rest encryption | ✓ (platform) | | |
| OS cloud-backup exclusion (Android `allowBackup=false`) | ✓ | | |
| iOS backup exclusion (local module) | ✓ pending spike [OD-15](open-decisions.md#od-15) | | Until shipped: privacy text omits the iOS claim |
| Android device-to-device transfer exclusion | | Optional | ✓ (user-initiated) |
| Redacting logger, no analytics/crash SDK | ✓ | | |
| Export warning + temp-file cleanup | ✓ | Encrypted export | Plaintext export file |
| Delete all data incl. VACUUM | ✓ | | |
| `synchronous=FULL` durability | ✓ | | |
| App lock / biometrics | | MVP+ | ✓ (no lock) |
| App-switcher privacy cover / FLAG_SECURE | | MVP+ | ✓ |
| SQLCipher database encryption | | Deferred (own spec) | ✓ (plaintext DB on rooted devices) |
| Restore | | Deferred | — |
