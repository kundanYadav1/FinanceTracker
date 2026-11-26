# ADR-0012 — No application-level database encryption in the MVP

**Status:** Proposed (2026-11-06)

## Context
- PRS §5.1 defers database encryption to its own specification.
- PRS §35 forbids claiming encryption that has not been implemented.
- expo-sqlite supports SQLCipher through the `useSQLCipher` config plugin option. It does not work in Expo Go.
- Per the Expo docs, if the binary lacks SQLCipher, `PRAGMA key` silently does nothing.

## Decision
- Ship the MVP with an unencrypted SQLite file in app-private storage. Protection comes from OS sandboxing and OS at-rest encryption.
- Keep all database opening inside one `openDatabase()` function. SQLCipher can then be added later, with the key stored in `expo-secure-store` and a fail-closed `PRAGMA cipher_version` check.
- The privacy screen states that the app does not encrypt the database.

## Alternatives
- **SQLCipher now:** gives stronger protection on rooted devices. It would also need:
  - a key-management design
  - a migration from plaintext to encrypted
  - export-compliance declarations
  - performance validation

  The PRS places it outside the MVP.

## Consequences
- \+ A simpler MVP that stays compatible with Expo Go and carries no key-loss risk.
- − Data is readable on compromised (rooted or jailbroken) devices. This risk is accepted temporarily and documented in security-privacy-design.
