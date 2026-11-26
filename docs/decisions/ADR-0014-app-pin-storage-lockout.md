# ADR-0014 — App PIN storage and lockout

**Status:** Accepted (2026-11-26)

## Decision
- PIN is 4–6 digits. Only `salt` + iterated SHA-256 hash (expo-crypto, 10k rounds) are stored in expo-secure-store, with lockout state (`attempts`, `lockedUntil`).
- Lock enable flags live in SQLite `app_settings`; the secret never does, so exports/backups cannot leak it.
- Biometrics (expo-local-authentication) are a shortcut with the PIN as fallback.
- No recovery path; reset erases all data.

## Consequences
- Forgetting the PIN without a backup loses data; setup screen warns and offers export.
- A 4-digit PIN is brute-forceable offline by someone who can read the Keystore-protected store; the lock is a privacy barrier, not encryption (see ADR-0012).
