# ADR-0015 — Backup format and replace-all restore

**Status:** Accepted (2026-11-26)

## Decision
- JSON file `{format:"kosh-backup", formatVersion:1, schemaVersion, ...}` validated by Zod plus semantic checks before any write.
- Restore replaces all data in one SQLite transaction after taking a safety copy of the database. Merge restore is out of scope.
- Files with unknown format or newer formatVersion/schemaVersion are rejected.
- Backup excludes PIN/lock settings and notification log.

## Consequences
- Predictable, all-or-nothing behaviour; no ID-conflict resolution needed.
