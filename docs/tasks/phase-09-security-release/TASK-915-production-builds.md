# TASK-915 — Production builds (Android AAB, iOS)

> **PROVISIONAL / BLOCKED** — external blockers: signing credentials, Play Console and Apple developer accounts.

## Task Metadata

- **Task ID:** TASK-915
- **Task Name:** Android production build and iOS production build via EAS
- **Implementation Phase:** 9 — Security, Backup & Release
- **Feature:** F9.7 Release
- **Priority:** HIGH
- **Status:** BLOCKED (external: credentials/accounts)
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-912, TASK-913, TASK-914
- **Blocks:** TASK-917
- **PRS References:** NFR-005, §35
- **Design References:** DEP §5 – §6, `eas.json` (CLAUDE.md), TS §5

## 1. Objective

Produce signed, installable production artefacts for both platforms from the verified commit.

## 2. Background and Context

Production builds must come from the exact commit verified in TASK-912/913. iOS may be descoped by the PO if TASK-913 remains blocked (record the decision).

## 3. Requirements

1. Tag the release candidate commit (`v1.0.0-rc.N`) — tagging requires PO approval.
2. `eas build --profile production --platform android` → AAB; install via internal testing track or `bundletool` and smoke-test (onboarding, add expense, restart persistence).
3. `eas build --profile production --platform ios` → IPA; TestFlight smoke test (if not descoped).
4. Record build IDs, versions, build numbers, SHA of the commit.
5. Credentials are managed by EAS/the PO; nothing secret is committed (AGENTS.md §18).

## 4. Scope

### Included
- Builds, smoke tests, records.

### Excluded
- Store submission and listing.

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `docs/release/build-record.md` | CREATE *(proposed path)* | Build IDs and smoke-test results |

## 6. Implementation Instructions

1. Never commit keystores, `.p8`, `.p12`, provisioning profiles (`.gitignore` already covers them).

## 7. Dependencies

- TASK-912, TASK-913 (or PO descoping), TASK-914.

## 8. Acceptance Criteria

- [ ] Android AAB built and smoke-tested.
- [ ] iOS IPA built and smoke-tested, or descoping recorded.
- [ ] Build record committed.

## 9. Testing Requirements

- **Manual Verification:** smoke tests.

## 10. Verification Commands

```bash
eas build --profile production --platform android
eas build --profile production --platform ios
```

## 11. Definition of Done

Artefacts exist, smoke-tested, recorded.

## 12. Risks and Notes

- Account availability is outside the project's control.

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
