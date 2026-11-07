# TASK-416 — Theme tokens and theme resolution

> **PROVISIONAL** — Gate G0 closed. Do not execute until approved.

## Task Metadata

- **Task ID:** TASK-416
- **Task Name:** Theme tokens (light/dark, typography, spacing, category palette) and theme-preference resolution
- **Implementation Phase:** 4 — Application Foundation
- **Feature:** F4.6 Theme & shared UI
- **Priority:** HIGH
- **Status:** NOT STARTED
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-414
- **Blocks:** TASK-417, TASK-424, TASK-901
- **PRS References:** FR-001 (theme preference), FR-025.1, NFR-006.1 (contrast)
- **Design References:** UX §A.1 – A.6 (tokens), UX §A.3 (category palette), UX §A.2 (theme selection + contrast test), ST §2 "Theme" row

## 1. Objective

Replace the starter `Colors`/`Spacing` constants with the approved design tokens and make `useTheme()` resolve the scheme from the profile preference (`system | light | dark`), with an automated WCAG contrast test.

## 2. Background and Context

UX §A states tokens live in `src/shared/theme/tokens.ts`, replace `src/constants/theme.ts`, and that a BUILD-phase unit test computes contrast for every text/background pair (≥ 4.5:1; 3:1 for large text). The existing `use-theme`/`use-color-scheme` hooks and `ThemedText`/`ThemedView` are reusable (SA §0) and are extended here.

## 3. Requirements

1. `tokens.ts`: light and dark color tokens exactly as UX §A.1/A.2; typography styles UX §A.5 (`display`…`caption`, with `tabular-nums` variant for amounts); spacing, radius per UX §A.6; touch-target constant 48.
2. Category palette: 13 expense + 6 income `color_key` entries per theme (UX §A.3), keys equal to the seeded `color_key` values (TASK-412).
3. `useTheme()` returns `{ scheme, colors, typography, spacing, radius }`; scheme = `profile.themePreference` from `sessionStore`, or `useColorScheme()` when `system` / when the profile is not yet loaded.
4. `ThemedText`/`ThemedView` consume tokens; existing snapshot test updated intentionally (document the snapshot change).
5. Contrast test: every `text*`/`on*` token against `bg`, `surface`, `surfaceAlt` and its container pair, both themes; category palette swatches vs `text` glyph ≥ 3:1.
6. `src/constants/theme.ts` remains only until TASK-423 removes its last importers; new code must not import it.

## 4. Scope

### Included
- Tokens, palette, hook changes, themed primitives update, contrast test.

### Excluded
- Status bar / system UI background wiring (TASK-421 root layout). Appearance settings screen (TASK-901).

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/shared/theme/tokens.ts` | CREATE | Design tokens |
| `src/shared/theme/categoryPalette.ts` | CREATE *(proposed path)* | Category color keys |
| `src/shared/theme/contrast.ts` | CREATE *(proposed path)* | WCAG contrast utility (test helper) |
| `src/shared/theme/contrast.test.ts` | CREATE | Contrast assertions |
| `src/hooks/use-theme.ts` | MODIFY | Resolve from profile + tokens |
| `src/components/themed-text.tsx`, `themed-view.tsx` | MODIFY | Use tokens |
| `src/components/__snapshots__/themed-text.test.tsx.snap` | MODIFY | Intentional update |

## 6. Implementation Instructions

1. Implement relative luminance per WCAG 2.x; table-drive the pairs.
2. If a design token fails contrast, **stop** and report (do not change the hex) — UX §A.1 says "verify in BUILD"; a failing value is a design issue.
3. Keep `use-theme.web.ts` untouched (web unsupported, OD-13).

## 7. Dependencies

- TASK-414 (`sessionStore` profile snapshot).

## 8. Acceptance Criteria

- [ ] All token values match UX §A.1/A.2.
- [ ] Contrast test passes for every listed pair, or failures are reported as a design gap with no hex changed.
- [ ] `themePreference = 'dark'` forces dark tokens regardless of the OS scheme; `system` follows the OS.
- [ ] No new code imports `src/constants/theme.ts`.

## 9. Testing Requirements

- **Unit Tests:** contrast; theme resolution with mocked `useColorScheme` and store.
- **Integration Tests:** not required.
- **UI Tests:** updated ThemedText snapshot.
- **Manual Verification:** toggle OS dark mode on an Android dev build (TASK-424).

## 10. Verification Commands

```bash
npx jest src/shared/theme src/components
npx tsc --noEmit
npx expo lint
```

## 11. Definition of Done

Global DoD plus contrast report in the completion report.

## 12. Risks and Notes

- Several light-theme values are marked "approx., verify in BUILD"; failures route back to DESIGN.

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
