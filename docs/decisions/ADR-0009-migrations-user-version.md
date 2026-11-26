# ADR-0009 — Forward-only migrations on PRAGMA user_version with pre-migration backup

**Status:** Proposed (2026-11-06)

## Context
- FR-026.5 and AGENTS.md §11 require that app updates preserve data.
- FR-027.2 requires that the database is never recreated automatically after a failure.
- The draft `schema_migrations` approach fails on fresh installs.

## Decision
- **Versioning:** the schema version is `PRAGMA user_version`. It is set in the same transaction as each migration's DDL and DML.
- **Forward-only:** migrations only move forward and are immutable once shipped. A hash test enforces this. SQLite table changes use the 12-step rebuild procedure.
- **Backup before upgrade:** before upgrading an existing database, the app copies it with `backupDatabaseAsync` (`*.pre-v{n}.db`). The copy is excluded from OS backup, and is removed after a successful launch or by Delete All Data.
- **Checks after migration:** `foreign_key_check` and `quick_check`.
- **Newer database than the app:** a blocking error, with no writes.
- **Seeding:** part of migrations, using stable IDs and `INSERT OR IGNORE`.

## Alternatives
- **`schema_migrations` table:** works, but the version is not stored atomically with the database header, and this approach caused the current bootstrap bug.
- **Down migrations:** rarely correct for SQLite, and untested paths are risky.

## Consequences
- \+ Upgrades are crash-safe, and a local recovery copy exists.
- − There is no automatic downgrade. A failed migration blocks the app until a fixed build ships. FR-027.2 requires this behavior because it is the safe one.
