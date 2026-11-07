# TASK-903 — Privacy information and About screens

> **PROVISIONAL / BLOCKED** — iOS backup claim depends on [OD-15](../../design/open-decisions.md#od-15) / TASK-908; goal-deposit guidance wording on [OD-21](../../design/open-decisions.md#od-21); licences presentation on [DG-06](../design-gaps.md).

## Task Metadata

- **Task ID:** TASK-903
- **Task Name:** `/settings/privacy` (NFR-004.2 text) and `/settings/about` (version, licences, not-financial-advice)
- **Implementation Phase:** 9 — Security, Backup & Release
- **Feature:** F9.1 Settings & privacy controls
- **Priority:** HIGH
- **Status:** BLOCKED (OD-21, DG-06; OD-15 for one sentence)
- **Estimated Complexity:** SMALL
- **Dependencies:** TASK-901 (optional: TASK-908 — the iOS backup sentence is included only once TASK-908 is DONE)
- **Blocks:** TASK-909, TASK-916
- **PRS References:** NFR-004.2, §35 (no encryption claim), §32 (not financial advice), FR-025.1
- **Design References:** UX §H "Privacy", "About" rows, SEC §2 (iOS claim only once shipped), SEC header note (DB not encrypted), DB §G (deposit guidance), NAV §C "First launch" (privacy link)

## 1. Objective

Tell the user truthfully where their data lives and how to protect it, and provide app information.

## 2. Background and Context

NFR-004.2: state where data is stored, that it is not backed up automatically, that uninstalling deletes it, and that export protects against loss. §35: never claim encryption. SEC §2: do not claim iOS backup exclusion until TASK-908 ships.

## 3. Requirements

1. Privacy text (static, English): stored only on this device; not backed up automatically by the phone (Android always; iOS sentence only if TASK-908 is DONE — otherwise omit the iOS claim); uninstalling deletes it; use Export to keep a copy; no data is sent anywhere; the database is **not encrypted** by the app; guidance per OD-21 ("Don't record money moved to savings as an expense; update the goal's saved amount instead").
2. About: app name, version + build (`expo-constants`), licences per DG-06, statement "FinanceTracker is a budgeting tool, not financial advice."
3. Settings rows for both; onboarding privacy note becomes a link to `/settings/privacy` (modify `OnboardingScreen`).

## 4. Scope

### Included
- Two screens/routes, rows, onboarding link, tests.

### Excluded
- Any network link-out (no `expo-web-browser`).

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/features/settings/components/PrivacyScreen.tsx`, `AboutScreen.tsx` | CREATE | UI |
| `src/features/settings/content/privacyText.ts` | CREATE *(proposed path)* | Reviewed static copy |
| `src/app/settings/privacy.tsx`, `about.tsx` | CREATE | Routes |
| `src/features/settings/components/SettingsScreen.tsx` | MODIFY | Rows |
| `src/features/onboarding/components/OnboardingScreen.tsx` | MODIFY | Link to privacy |
| tests alongside | CREATE | Tests |

## 6. Implementation Instructions

1. A test asserts the privacy text contains no "encrypt" claim other than "not encrypted".

## 7. Dependencies

- TASK-901.

## 8. Acceptance Criteria

- [ ] All four NFR-004.2 statements present.
- [ ] No encryption claim; iOS exclusion claim present only if TASK-908 is DONE.
- [ ] About shows version/build and the not-advice statement.
- [ ] Onboarding links to privacy.

## 9. Testing Requirements

- **UI Tests:** text assertions, links.
- **Manual Verification:** copy review by PO before release (TASK-916).

## 10. Verification Commands

```bash
npx jest src/features/settings src/features/onboarding
npx tsc --noEmit
npx expo lint
```

## 11. Definition of Done

Global DoD plus PO copy sign-off recorded.

## 12. Risks and Notes

- Privacy text is a legal-adjacent statement; inaccurate claims are a release blocker.

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
