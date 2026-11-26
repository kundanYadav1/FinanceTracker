# TASK-912 — Android device verification

> **PROVISIONAL** — Gate G0 closed. Do not execute until approved.

## Task Metadata

- **Task ID:** TASK-912
- **Task Name:** Android release-candidate verification on emulators and a physical device
- **Implementation Phase:** 9 — Security, Backup & Release
- **Feature:** F9.6 Release verification
- **Priority:** HIGH
- **Status:** NOT STARTED
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-904, TASK-906, TASK-907, TASK-909, TASK-910, TASK-911
- **Blocks:** TASK-915, TASK-917
- **PRS References:** NFR-002, NFR-005, FR-024, US-007, FR-019.1, NFR-004.1
- **Design References:** TS §5 (Android column, manual checks per release), NAV §D (back navigation), SEC §7

## 1. Objective

Verify the preview APK on the primary platform across OS versions and real-world conditions.

## 2. Background and Context

TS §5: minimum SDK-57-supported Android + latest (two emulators) plus the reference device; manual checks: airplane mode for every FR-024 function, process kill right after save, reboot, time-zone change near midnight, largest font, TalkBack, backup exclusion.

## 3. Requirements

1. Build `eas build --profile preview --platform android` (APK).
2. Run the scripted checklist `docs/tests/android-release-checklist.md` *(proposed path, created here)* covering: onboarding; add/edit/delete expense and income; filters/search; dashboard periods; budgets (warning/exceeded, past month); goals (create, saved amount, pause/archive); recommendations; reports; export; delete all data; airplane mode for all FR-024 functions; kill-after-save; reboot; TZ change after a near-midnight entry (date unchanged, FR-019.1); hardware/gesture back on every modal; `bmgr` check.
3. Record pass/fail per item per device; failures → defect tasks.

## 4. Scope

### Included
- Build, checklist, execution, evidence.

### Excluded
- Fixes.

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `docs/tests/android-release-checklist.md` | CREATE *(proposed path)* | Checklist + results |

## 6. Implementation Instructions

1. Use synthetic data only.

## 7. Dependencies

- Listed above.

## 8. Acceptance Criteria

- [ ] All checklist items pass on two emulators and one physical device (or failures ticketed and accepted by the PO).
- [ ] Evidence committed.

## 9. Testing Requirements

- **Manual Verification:** the checklist.

## 10. Verification Commands

```bash
eas build --profile preview --platform android
```

## 11. Definition of Done

Checklist complete with evidence.

## 12. Risks and Notes

- Requires an Expo/EAS account and a physical device.

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
