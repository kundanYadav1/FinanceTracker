# TASK-417 — Layout and action UI primitives, icon map, accessibility test helper

> **PROVISIONAL** — Gate G0 closed. Do not execute until approved.

## Task Metadata

- **Task ID:** TASK-417
- **Task Name:** Layout & action primitives (`Screen`, `AppHeader`, `Card`, buttons, `FAB`, `Icon`, `CategoryIcon`) and the accessibility test helper
- **Implementation Phase:** 4 — Application Foundation
- **Feature:** F4.6 Theme & shared UI
- **Priority:** HIGH
- **Status:** NOT STARTED
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-416
- **Blocks:** TASK-418, TASK-419, TASK-420, TASK-424, TASK-506
- **PRS References:** NFR-006, NFR-006.1, FR-026.4 (disabled/busy buttons)
- **Design References:** UX §A.6 – A.7 (spacing, cards), UX §A.9 (icons), UX §J (component inventory rows: Screen, AppHeader, Card, buttons, FAB, CategoryIcon), TS §3 "Accessibility" row

## 1. Objective

Build the generic layout and action components that every screen composes, the semantic icon wrapper over `expo-symbols`, and a test helper that asserts accessibility roles and labels.

## 2. Background and Context

UX §J lists the shared inventory. UX §A.9: one `Icon` wrapper maps semantic `icon_key`s to `{ ios, android }` symbol names. TS §3: a helper walks the rendered tree to check every pressable has `accessibilityRole` and a label. NFR-006.1 requires 48×48 dp targets.

## 3. Requirements

1. `Screen` (safe area, optional scroll, 16 dp horizontal padding), `AppHeader` (title, left back/close, right actions, header role), `Card` (`title`, optional `action` link, surface + 1 dp border, `md` radius).
2. `PrimaryButton`, `SecondaryButton`, `DestructiveButton`, `TextButton`: `label`, `onPress`, `loading`, `disabled`; min 48 dp height; `accessibilityState={{ disabled, busy }}`; while `loading`, presses are ignored (FR-026.4 support).
3. `FAB` with required `accessibilityLabel` (e.g. "Add transaction").
4. `Icon({ name, size, color })` where `name` is a semantic key; map file covers every seeded category/payment-method `icon_key` (TASK-412) plus status icons (UX §A.9) and UI glyphs (back, close, settings, add, search, filter, calendar). `CategoryIcon({ iconKey, colorKey, size })` renders the tinted circle; decorative (`accessibilityElementsHidden`) when a name is adjacent.
5. `expectAccessible(tree)` test helper *(proposed path `src/shared/ui/testing/a11y.ts`)*: fails if any pressable lacks `accessibilityRole` or label, or has a hit area < 48 dp without `hitSlop` compensation.

## 4. Scope

### Included
- Components above, icon map, a11y helper, component tests.

### Excluded
- Feedback components (TASK-418), value displays (TASK-419), inputs (TASK-506).

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/shared/ui/Screen.tsx`, `AppHeader.tsx`, `Card.tsx` | CREATE | Layout |
| `src/shared/ui/Button.tsx` | CREATE *(proposed: one file exporting the four buttons)* | Actions |
| `src/shared/ui/FAB.tsx` | CREATE | Floating add button |
| `src/shared/ui/Icon.tsx`, `iconMap.ts`, `CategoryIcon.tsx` | CREATE | Icons |
| `src/shared/ui/testing/a11y.ts` | CREATE *(proposed path)* | Accessibility helper |
| `src/shared/ui/index.ts` | CREATE | Exports |
| `src/shared/ui/*.test.tsx` | CREATE | Component tests |

## 6. Implementation Instructions

1. Use only tokens via `useTheme()`; no hex literals (UX §A).
2. Verify Android Material Symbol names exist in the installed `expo-symbols` types before mapping (DEP §1 notes Android support is confirmed in type definitions).
3. Do not reuse `src/components/ui/button.tsx` (draft); the new button replaces it in TASK-423.

## 7. Dependencies

- TASK-416 (tokens, `useTheme`).

## 8. Acceptance Criteria

- [ ] Every button has role `button`, a label, ≥ 48 dp height, and ignores presses while `loading` (double press → one `onPress`).
- [ ] `Icon` renders for every seeded `icon_key`; an unknown key fails type-check.
- [ ] `expectAccessible` fails on a fixture with an unlabeled pressable and passes on all components in this task.

## 9. Testing Requirements

- **Unit Tests:** icon map completeness against the seed key list.
- **Integration Tests:** not required.
- **UI Tests:** RNTL tests per component (roles, labels, disabled/busy, press handling).
- **Manual Verification:** visual check on Android dev build in TASK-424.

## 10. Verification Commands

```bash
npx jest src/shared/ui
npx tsc --noEmit
npx expo lint
```

## 11. Definition of Done

Global DoD.

## 12. Risks and Notes

- `expo-symbols` Android rendering differs from iOS; visual review on both platforms happens in TASK-912/913.

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
