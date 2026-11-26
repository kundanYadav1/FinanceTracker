# Spec — Security & data portability (Phase 8)

Status: approved 2026-11-26. Pulls FR-022.3 (CSV), FR-023 (restore) and FR-025 app lock forward from MVP+/deferred.

## Requirements
- **SP-1 App PIN** — optional 4–6 digit PIN. Stored only as salted, iterated hash in `expo-secure-store` (never in SQLite, never in exports). 5 wrong attempts start an escalating lockout (30s, 1m, 5m, 15m). No recovery; "Erase all data and reset" is the only way out.
- **SP-2 Biometric lock** — optional shortcut, only enabled when a PIN exists. Any failure/cancel/enrollment change falls back to the PIN.
- **SP-3 Auto-lock** — locks on cold start and after a configurable time in background (immediately / 1 min / 5 min). While locked no data screen is mounted.
- **SP-4 CSV export** — transactions only; money as decimal strings derived from integer minor units; spreadsheet-formula-injection safe.
- **SP-5 JSON backup** — `kosh-backup` v1: profile, categories, payment methods, transactions, budget versions, goals. Integer minor units + currency. Excludes lock/PIN data. Warning that the file is unencrypted (FR-022.2).
- **SP-6 Restore (replace-all)** — validate file (format, version, schema, FK integrity, amount/date ranges) before touching data; confirm; safety copy; single transaction; any error leaves current data untouched.
- **SP-7 Migration testing** — real SQL migrations run in jest against fixtures for every historical version; migrations are immutable (hash test); failed migration rolls back; newer DB version refuses.
- **SP-8 Privacy settings** — privacy cover in app switcher, hide amounts on launch, privacy information page (must not claim encryption — ADR-0012).

## Out of scope
DB encryption (SQLCipher), merge restore, encrypted backups, cloud backup, PIN recovery.
