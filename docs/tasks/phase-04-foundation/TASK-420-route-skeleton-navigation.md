# TASK-420 — Route skeleton and tab navigation

> **PROVISIONAL / BLOCKED** — requires [OD-02](../../design/open-decisions.md#od-02) (tab set; ADR-0010) and [OD-13](../../design/open-decisions.md#od-13) (web unsupported).

## Task Metadata

- **Task ID:** TASK-420
- **Task Name:** Route skeleton — root Stack, `(tabs)` group with five NativeTabs, not-found route, route-param validation helper
- **Implementation Phase:** 4 — Application Foundation
- **Feature:** F4.7 Navigation foundation
- **Priority:** CRITICAL
- **Status:** BLOCKED (OD-02, OD-13)
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-417, TASK-418
- **Blocks:** TASK-421, TASK-423, TASK-424, TASK-508, TASK-510, TASK-604, TASK-705, TASK-713, TASK-809, TASK-901
- **PRS References:** FR-006 (primary screen), §5 (six product areas), NFR-005
- **Design References:** NAV §A.1 – A.2, NAV §B (route tree + notes), NAV §D "Back navigation", "Deep links", ADR-0010

## 1. Objective

Create the approved navigation shell so later tasks only fill in screens: root Stack, the `(tabs)` group with Home · Transactions · Budgets · Goals · Reports, placeholder tab screens with honest empty content, a not-found route, and a reusable Zod-based route-param validator.

## 2. Background and Context

Today only `index` and `explore` are reachable tabs (CLAUDE.md). NAV §B defines the full route tree; detail and form routes live in the root Stack above the tabs. NAV §A.2 keeps `NativeTabs` (`expo-router/unstable-native-tabs`) with `expo-symbols` icons. If OD-02 picks the fallback (Settings tab, Budgets pushed), only the tab list changes.

## 3. Requirements

1. `src/app/_layout.tsx`: root `Stack` with providers (theme from TASK-416), a top-level `ErrorBoundary` export, `Toast` host (TASK-418). Guards are added by TASK-421/422 — leave clearly named slots, no fake guard.
2. `src/app/(tabs)/_layout.tsx`: `NativeTabs` with five triggers `index`, `transactions`, `budgets`, `goals`, `reports`, labels and `expo-symbols` icons; Android ≤ 5 items.
3. Placeholder screens `(tabs)/{index,transactions,budgets,goals,reports}.tsx` rendering `Screen` + `EmptyState` titled with the tab name and the body "This screen is being built." *(proposed copy)* — no numbers, no ₹ values.
4. `src/app/+not-found.tsx`: "Page not found" + Go home.
5. `src/shared/lib/routeParams.ts` *(proposed path)*: `parseRouteParams(schema, params)` → typed params or `null`; route files render not-found on `null` (NAV §B notes).
6. Delete draft route files `src/app/{index,transactions,budgets,goals,explore}.tsx` and `src/components/app-tabs.tsx` / `app-tabs.web.tsx` (replaced by the group layout). Draft components they used are deleted in TASK-423.
7. Android back from a non-Home tab root goes to Home (NAV §D) — verify NativeTabs default behaviour; implement only if missing.

## 4. Scope

### Included
- Route shell, placeholders, not-found, param helper, removal of draft routes/tabs.

### Excluded
- DatabaseGate (TASK-421), onboarding guard (TASK-422), any real screen content, settings routes (TASK-901), web support.

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/app/_layout.tsx` | MODIFY | Root Stack, providers, ErrorBoundary |
| `src/app/(tabs)/_layout.tsx` | CREATE | NativeTabs |
| `src/app/(tabs)/index.tsx`, `transactions.tsx`, `budgets.tsx`, `goals.tsx`, `reports.tsx` | CREATE | Placeholder tab screens |
| `src/app/+not-found.tsx` | CREATE | Unknown route |
| `src/shared/lib/routeParams.ts` | CREATE *(proposed path)* | Param validation helper |
| `src/app/index.tsx`, `transactions.tsx`, `budgets.tsx`, `goals.tsx`, `explore.tsx` | DELETE | Draft routes (NAV §B notes) |
| `src/components/app-tabs.tsx`, `app-tabs.web.tsx` | DELETE | Replaced by `(tabs)/_layout.tsx` |
| `src/shared/lib/routeParams.test.ts` | CREATE | Unit tests |

## 6. Implementation Instructions

1. Check the installed `expo-router` SDK 57 API for `NativeTabs` trigger/icon props in `node_modules` type definitions.
2. Route files stay under ~40 lines (SA §B.1).
3. Typed routes are enabled; run `npx expo start` once (or `npx expo customize`-free type generation) so `.expo/types` updates; do not commit `.expo/`.

## 7. Dependencies

- TASK-417 (`Screen`, `Icon`), TASK-418 (`EmptyState`, `Toast` host).

## 8. Acceptance Criteria

- [ ] App launches to the Home tab; all five tabs reachable on Android dev build.
- [ ] No draft screen or `appStore` usage remains reachable from routes.
- [ ] Unknown URL `financetracker://nope` shows not-found with Go home.
- [ ] `parseRouteParams` returns `null` for invalid params (e.g. `month=2026-13`).
- [ ] No placeholder screen shows any monetary value.

## 9. Testing Requirements

- **Unit Tests:** `routeParams`.
- **Integration Tests:** not required.
- **UI Tests:** render each placeholder and not-found with `expectAccessible`.
- **Manual Verification:** Android dev build tab navigation and hardware back.

## 10. Verification Commands

```bash
npm test
npx tsc --noEmit
npx expo lint
npx expo-doctor
npx expo run:android
```

## 11. Definition of Done

Global DoD plus Android manual navigation check.

## 12. Risks and Notes

- `NativeTabs` is marked unstable (NAV §A.2); fallback is JS `Tabs` affecting only `(tabs)/_layout.tsx`.
- After this task, `appStore`/`src/db` are dead code until TASK-423 removes them.

## 13. Completion Report Format

Files created · Files modified · Files deleted · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
