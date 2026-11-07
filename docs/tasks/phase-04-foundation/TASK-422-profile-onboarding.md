# TASK-422 — Profile repository and onboarding flow

> **PROVISIONAL** — Gate G0 closed. Name rule depends on [OD-11](../../design/open-decisions.md#od-11) (optional). Do not execute until approved.

## Task Metadata

- **Task ID:** TASK-422
- **Task Name:** Profile repository, onboarding service and onboarding screen with first-launch guard
- **Implementation Phase:** 4 — Application Foundation
- **Feature:** F4.8 Profile & onboarding
- **Priority:** CRITICAL
- **Status:** NOT STARTED
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-412, TASK-413, TASK-414, TASK-415, TASK-419, TASK-421
- **Blocks:** TASK-423, TASK-424, TASK-505, TASK-711, TASK-901
- **PRS References:** FR-001, FR-001.1, FR-001.2, FR-001.3, FR-025.1, NFR-004.2 (privacy note link), FR-026.3
- **Design References:** DB §B.1 (`profile`), NAV §B (`onboarding.tsx`, `Stack.Protected`), NAV §C "First launch", UX §I "Onboarding" row, ST §2 (profile snapshot), ST §4 rule 5, SA §C "Onboarding"

## 1. Objective

Require the user to confirm a primary currency (INR) — and optionally a name — before any financial data can be recorded, and keep the profile snapshot in `sessionStore` in sync with SQLite.

## 2. Background and Context

FR-001.1: currency must be selected before recording any data; the schema triggers already reject money rows while `primary_currency` is NULL (TASK-412). NAV §C describes the onboarding screen and the `Stack.Protected` guard; `replace` navigation prevents returning to onboarding.

## 3. Requirements

1. `profileRepo`: `get()` → profile row mapped to domain; `completeOnboarding({ currency, displayName, nowIso })` sets currency, trimmed name (≤ 40, empty allowed — OD-11), `onboarding_completed_at`, `updated_at` in one transaction. `updateDisplayName`, `updateTheme` (used by TASK-901). Currency change belongs to TASK-902.
2. Onboarding service (`features/onboarding/services/onboardingService.ts`): validates with a Zod schema (currency in registry; name ≤ 40 code points), writes, re-reads the row and sets `sessionStore.profile` (ST §4 rule 5), bumps `profile`. Returns `Result`.
3. Profile snapshot load: after the gate is `ready`, load the profile into `sessionStore` before routing (extend the startup orchestration from TASK-421 with a `loadProfile` step).
4. Guard: root layout uses `Stack.Protected guard={!onboarded}` for `onboarding` and `guard={onboarded}` for `(tabs)` and all other routes.
5. `src/app/onboarding.tsx` + `features/onboarding/components/OnboardingScreen.tsx`: welcome text, currency select (INR only, preselected but requiring explicit confirmation), optional name, privacy note "Your data stays on this device" (link target `/settings/privacy` is created in TASK-903 — until then render the sentence without a link), **Get started** (busy while saving; save failure keeps values and shows "Couldn't save — try again").
6. On success `router.replace('/(tabs)')`.

## 4. Scope

### Included
- Repo (profile only), onboarding service/hook/screen, guard, profile snapshot load, tests.

### Excluded
- Settings screens, currency change, delete-all reset (Phase 9).

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/data/repositories/profileRepo.ts` | CREATE | Profile reads/writes |
| `src/data/repositories/profileRepo.test.ts` | CREATE | DB tests |
| `src/features/onboarding/services/onboardingService.ts` | CREATE | Use case |
| `src/features/onboarding/hooks/useOnboarding.ts` | CREATE | View-model |
| `src/features/onboarding/components/OnboardingScreen.tsx` | CREATE | UI |
| `src/features/onboarding/index.ts` | CREATE | Public API |
| `src/app/onboarding.tsx` | CREATE | Route |
| `src/app/_layout.tsx` | MODIFY | `Stack.Protected` guards |
| `src/features/app-start/services/startupService.ts` *(proposed path, DG-11)* | MODIFY | Load profile snapshot after the DB is ready |
| `src/features/onboarding/**/*.test.ts(x)` | CREATE | Service + component tests |

## 6. Implementation Instructions

1. Domain type `Profile` lives in `src/domain/profile/types.ts` *(proposed path)*.
2. Use `useServiceQuery` only where data is read on screen; onboarding mostly writes.
3. The service reads the currency registry; INR is the only option (FR-001.2).

## 7. Dependencies

- TASK-412 (profile table), TASK-413 (repo helpers), TASK-414 (session store), TASK-415 (hook), TASK-419 (`SegmentedControl`/`Chip` for currency), TASK-421 (startup orchestration).

## 8. Acceptance Criteria

- [ ] Fresh install → onboarding; Home is unreachable (deep link `financetracker:///(tabs)` redirects to onboarding).
- [ ] Get started without confirming currency is rejected with a message naming the field.
- [ ] After success, Home is shown and back does not return to onboarding.
- [ ] Profile persists across app restart (manual) and is in `sessionStore` after startup.
- [ ] Name of 41 code points rejected; empty name accepted.
- [ ] A simulated write failure shows the not-saved message and keeps entered values.
- [ ] Inserting a transaction before onboarding is impossible (DB trigger test already in TASK-412; service-level check added in TASK-505).

## 9. Testing Requirements

- **Unit Tests:** onboarding Zod schema.
- **Integration Tests:** service + real SQLite: complete onboarding, snapshot updated, revision bumped.
- **UI Tests:** onboarding screen states (initial, validation, busy, failure).
- **Manual Verification:** Android fresh install flow; restart persistence.

## 10. Verification Commands

```bash
npx jest src/data/repositories/profileRepo src/features/onboarding
npm test
npx tsc --noEmit
npx expo lint
```

## 11. Definition of Done

Global DoD plus manual fresh-install check.

## 12. Risks and Notes

- `Stack.Protected` availability/API must be verified in the installed expo-router version.

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
