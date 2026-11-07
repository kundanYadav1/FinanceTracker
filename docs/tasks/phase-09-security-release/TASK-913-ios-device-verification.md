# TASK-913 — iOS device verification

> **PROVISIONAL / BLOCKED** — external blocker: macOS/Xcode or an Apple developer account for internal distribution; depends on TASK-908 (OD-15).

## Task Metadata

- **Task ID:** TASK-913
- **Task Name:** iOS verification on simulator/device (VoiceOver, Dynamic Type, dark mode, backup exclusion)
- **Implementation Phase:** 9 — Security, Backup & Release
- **Feature:** F9.6 Release verification
- **Priority:** MEDIUM
- **Status:** BLOCKED (external: macOS / Apple account; OD-15 via TASK-908)
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-908, TASK-909
- **Blocks:** TASK-915, TASK-917
- **PRS References:** NFR-005, NFR-006.1, NFR-004.1, FR-024
- **Design References:** TS §5 (iOS column), NAV §D (iOS swipe gestures), DEP §5

## 1. Objective

Confirm core behaviour on the secondary platform.

## 2. Background and Context

TS §5: development build on simulator (`npx expo run:ios`, macOS) or EAS internal distribution; VoiceOver, largest Dynamic Type, dark mode, iCloud backup exclusion via the TASK-908 test hook.

## 3. Requirements

1. Build per available environment; record which.
2. Run the same functional checklist as TASK-912 (shared file, iOS column) plus: swipe-back, swipe-down modal with dirty-form confirmation, VoiceOver pass, Dynamic Type largest, backup-exclusion hook output.
3. Record results; failures → defect tasks.

## 4. Scope

### Included
- iOS build, checklist execution, evidence.

### Excluded
- Fixes.

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `docs/tests/android-release-checklist.md` | MODIFY (add iOS column) — or create `docs/tests/ios-release-checklist.md` *(proposed path)* | Evidence |

## 6. Implementation Instructions

1. Same synthetic data set as TASK-912.

## 7. Dependencies

- TASK-908, TASK-909.

## 8. Acceptance Criteria

- [ ] Checklist passes on at least one iOS simulator/device (or failures accepted by the PO).
- [ ] Backup exclusion verified.

## 9. Testing Requirements

- **Manual Verification:** checklist.

## 10. Verification Commands

```bash
npx expo run:ios
eas build --profile preview --platform ios
```

## 11. Definition of Done

Checklist complete with evidence.

## 12. Risks and Notes

- If no macOS/Apple account is available, iOS release is blocked; PO decides whether to ship Android-only first.

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
