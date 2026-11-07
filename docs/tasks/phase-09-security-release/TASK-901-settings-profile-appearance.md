# TASK-901 — Settings hub, profile and appearance

> **PROVISIONAL** — Gate G0 closed; name rule per OD-11 (optional).

## Task Metadata

- **Task ID:** TASK-901
- **Task Name:** `/settings` hub, profile name screen, appearance (theme) screen, Home header gear
- **Implementation Phase:** 9 — Security, Backup & Release
- **Feature:** F9.1 Settings & privacy controls
- **Priority:** HIGH
- **Status:** NOT STARTED
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-416, TASK-420, TASK-422, TASK-606, TASK-810 (last prior edit of `DashboardScreen.tsx`)
- **Blocks:** TASK-902, TASK-903, TASK-904, TASK-906
- **PRS References:** FR-001 (name, theme), FR-025, FR-025.1, NFR-006.1
- **Design References:** NAV §B (`settings/index`, `profile`, `appearance`), NAV §C "Settings navigation", UX §H (settings table), ST §2 (profile snapshot, theme), ST §4 rule 5

## 1. Objective

Provide the MVP settings list and the two simplest settings (name and theme), reachable from a gear in the Home header.

## 2. Background and Context

UX §H lists MVP items: Profile, Currency, Theme, Privacy, Data export, Delete all data, About. Notifications and App lock are MVP+ and **not shown**; restore is deferred and **not shown**. Settings opens from the Home header gear (ADR-0010, OD-02).

## 3. Requirements

1. `settingsService`: `updateDisplayName(name)` and `updateTheme(pref)` via `profileRepo` (TASK-422), re-read row → `sessionStore.setProfile`, bump `['profile']`.
2. Routes `settings/index.tsx` (list of the 7 MVP items, items for Currency/Privacy/Export/Delete/About link to routes added by TASK-902 – 906; until those exist, list only implemented items — each later task adds its row), `settings/profile.tsx`, `settings/appearance.tsx` (System/Light/Dark radio; applies immediately via TASK-416 resolution).
3. Gear button in the dashboard header (`accessibilityLabel="Settings"`) → `/settings`.
4. No notification, app-lock or restore rows.

## 4. Scope

### Included
- Service functions, three routes/screens, gear, tests.

### Excluded
- Currency (TASK-902), privacy/about (TASK-903), delete (TASK-904), export (TASK-906).

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/features/settings/services/settingsService.ts` | CREATE | Profile/theme use cases |
| `src/features/settings/components/SettingsScreen.tsx`, `ProfileScreen.tsx`, `AppearanceScreen.tsx` | CREATE | UI |
| `src/features/settings/index.ts` | CREATE | Public API |
| `src/app/settings/index.tsx`, `profile.tsx`, `appearance.tsx` | CREATE | Routes |
| `src/features/dashboard/components/DashboardScreen.tsx` | MODIFY | Gear in header |
| tests alongside | CREATE | Service integration + component tests |

## 6. Implementation Instructions

1. The settings list is a data array; later tasks append rows (small hotspot).

## 7. Dependencies

- TASK-416 (theme resolution), TASK-420 (routes), TASK-422 (profile repo), TASK-606 (dashboard header).

## 8. Acceptance Criteria

- [ ] Gear opens Settings; list shows only MVP items.
- [ ] Name change persists across restart; ≤ 40 code points enforced.
- [ ] Theme Dark applies immediately and persists; System follows OS.
- [ ] Save failure keeps values with the not-saved message.

## 9. Testing Requirements

- **Integration Tests:** settings service with real SQLite.
- **UI Tests:** screens; `expectAccessible`.
- **Manual Verification:** Android theme switching.

## 10. Verification Commands

```bash
npx jest src/features/settings
npx tsc --noEmit
npx expo lint
```

## 11. Definition of Done

Global DoD.

## 12. Risks and Notes

- `DashboardScreen.tsx` hotspot: run after TASK-810.

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
