# TASK-914 — Release configuration

> **PROVISIONAL / BLOCKED** — store privacy declarations need [DG-07](../design-gaps.md).

## Task Metadata

- **Task ID:** TASK-914
- **Task Name:** Release configuration — app metadata, permissions review, EAS production profile, store data-safety declarations
- **Implementation Phase:** 9 — Security, Backup & Release
- **Feature:** F9.7 Release
- **Priority:** HIGH
- **Status:** BLOCKED (DG-07)
- **Estimated Complexity:** SMALL
- **Dependencies:** TASK-403, TASK-907
- **Blocks:** TASK-915, TASK-916
- **PRS References:** §35, NFR-004, §36 (no analytics/network), NFR-005
- **Design References:** SEC §2 "Permissions", SEC §8 (no crash/analytics SDK), DEP §5 – §6, `eas.json` profiles (CLAUDE.md), NAV §D (`predictiveBackGestureEnabled` stays false)

## 1. Objective

Make the release build configuration correct and privacy-consistent.

## 2. Background and Context

`eas.json` has `development`, `preview` (APK) and `production` profiles with `appVersionSource: remote`. The MVP requests no runtime permissions and sends no data anywhere; store declarations must say so truthfully (DG-07 — the design does not cover store forms or the iOS privacy manifest).

## 3. Requirements

1. `app.json`: confirm name, slug, `android.package`, iOS `bundleIdentifier` (**missing today** — PO must supply; external input), icons/splash, `userInterfaceStyle: automatic`, `predictiveBackGestureEnabled: false`, `allowBackup: false` (TASK-907).
2. `eas.json` `production`: Android `app-bundle`; iOS defaults; `autoIncrement` for build numbers *(proposed; remote version source)*.
3. Permissions: inspect final Android manifest and iOS Info.plist from a production build log; record that no runtime permissions/usage descriptions are present beyond Expo defaults.
4. Prepare data-safety answers ("no data collected or shared") and iOS privacy manifest notes per DG-07 decision in `docs/release/store-declarations.md` *(proposed path)*.
5. No analytics/crash SDK, no network client present (grep for `fetch(` in `src/`).

## 4. Scope

### Included
- Config edits, permission review, declarations draft.

### Excluded
- Store submission (manual PO action after TASK-917).

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `app.json` | MODIFY | Release metadata (incl. iOS bundle id once provided) |
| `eas.json` | MODIFY | Production profile settings |
| `docs/release/store-declarations.md` | CREATE *(proposed path)* | Data safety / privacy manifest notes |

## 6. Implementation Instructions

1. Do not invent the iOS bundle identifier; block on PO input.

## 7. Dependencies

- TASK-403 (unused packages removed), TASK-907 (allowBackup).

## 8. Acceptance Criteria

- [ ] `npx expo-doctor` passes; `npx expo config --type public` shows the expected values.
- [ ] Permission review recorded: none requested.
- [ ] No `fetch(` or analytics SDK in `src/`.
- [ ] Declarations drafted and reviewed by PO.

## 9. Testing Requirements

- **Manual Verification:** config output and build-log inspection.

## 10. Verification Commands

```bash
npx expo-doctor
npx expo config --type public
```

## 11. Definition of Done

Global DoD plus PO review of declarations.

## 12. Risks and Notes

- iOS bundle identifier and Apple team are external inputs.

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
