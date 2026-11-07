# TASK-916 — Release documentation

> **PROVISIONAL** — Gate G0 closed. AGENTS.md edits need explicit approval.

## Task Metadata

- **Task ID:** TASK-916
- **Task Name:** README, CHANGELOG, release notes, test summary, project-context and stale-document clean-up
- **Implementation Phase:** 9 — Security, Backup & Release
- **Feature:** F9.7 Release
- **Priority:** MEDIUM
- **Status:** NOT STARTED
- **Estimated Complexity:** SMALL
- **Dependencies:** TASK-903, TASK-914
- **Blocks:** TASK-917
- **PRS References:** NFR-007, §35, §32, NFR-004.2
- **Design References:** OD "Proposed changes to protected documents", AGENTS.md §19 (doc locations)

## 1. Objective

Replace starter documentation with accurate project documentation and release notes that make no unverified claims.

## 2. Background and Context

`README.md` is the unmodified create-expo-app README (CLAUDE.md). `docs/project-context.md` and `docs/architecture/system-architecture.md` are empty; the open-decisions document proposes replacing the latter with a pointer to `docs/design/system-architecture.md`.

## 3. Requirements

1. `README.md`: purpose, privacy stance (local-only, not encrypted, no backup — consistent with TASK-903 text), setup (`npm install`, dev build), commands, test commands, links to `docs/`.
2. `CHANGELOG.md` *(proposed path)* `1.0.0` entry listing MVP features; explicitly list MVP+/deferred items as not included.
3. `docs/release/release-notes-1.0.0.md` *(proposed path)* user-facing notes; reviewed by PO.
4. `docs/tests/README.md` *(proposed path)* indexing all verification evidence files.
5. `docs/architecture/system-architecture.md` → one-line pointer to the design doc; `docs/project-context.md` → short context summary (or delete if PO prefers — record decision).
6. Proposed `AGENTS.md` updates (OD protected-documents row) submitted for approval; apply only if approved.

## 4. Scope

### Included
- Documentation files listed.

### Excluded
- Store listing copy (PO).

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `README.md` | MODIFY | Project README |
| `CHANGELOG.md` | CREATE *(proposed path)* | Changelog |
| `docs/release/release-notes-1.0.0.md` | CREATE *(proposed path)* | Release notes |
| `docs/tests/README.md` | CREATE *(proposed path)* | Evidence index |
| `docs/architecture/system-architecture.md` | MODIFY | Pointer |
| `docs/project-context.md` | MODIFY | Summary |
| `AGENTS.md` | MODIFY (only with approval) | Point to design docs |

## 6. Implementation Instructions

1. Every claim about privacy/security must match verified behaviour (TASK-907/908 evidence).

## 7. Dependencies

- TASK-903 (privacy copy), TASK-914 (release config).

## 8. Acceptance Criteria

- [ ] README contains no starter boilerplate and no encryption claim.
- [ ] CHANGELOG and release notes list only implemented features.
- [ ] Evidence index links resolve.

## 9. Testing Requirements

- **Manual Verification:** link check, PO review.

## 10. Verification Commands

```bash
npx expo lint
```

## 11. Definition of Done

Docs reviewed by PO.

## 12. Risks and Notes

- None.

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
