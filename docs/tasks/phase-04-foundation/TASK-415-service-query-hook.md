# TASK-415 — `useServiceQuery` data-loading hook

> **PROVISIONAL** — Gate G0 closed. Do not execute until approved.

## Task Metadata

- **Task ID:** TASK-415
- **Task Name:** `useServiceQuery` — revision-aware, focus-aware, stale-while-revalidate query hook
- **Implementation Phase:** 4 — Application Foundation
- **Feature:** F4.5 State management foundation
- **Priority:** HIGH
- **Status:** NOT STARTED
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-404, TASK-405, TASK-414
- **Blocks:** TASK-422, TASK-424, TASK-508, TASK-511, TASK-605, TASK-607, TASK-703, TASK-705, TASK-711, TASK-713, TASK-808
- **PRS References:** FR-002 acceptance, FR-006 acceptance, FR-006.2, FR-012.2, FR-019.2, FR-027.2, NFR-001.2
- **Design References:** ST §3.2 (hook pattern + behaviour), ST §3.3, ST §4 rule 6, NAV §D "Screen loading", BL §C.2, DEP §4 (no TanStack Query)

## 1. Objective

Implement the single hook every screen uses to load data from a service, refreshing automatically when the relevant data changes, the screen regains focus, or the calendar day changes.

## 2. Background and Context

ST §3.2 specifies the signature and behaviour; DEP §4 rejects TanStack Query in favour of this ~80-line internal hook. NAV §D requires stale-while-revalidate (no ₹0 placeholders, no flicker).

## 3. Requirements

1. Signature: `useServiceQuery<T>(key: unknown[], topics: Topic[], load: () => Promise<Result<T, AppError>>) → { status: 'loading'|'ready'|'error'; data?: T; error?: AppError; refetch(): void }`.
2. Re-runs when: `key` changes (deep-compared via stable serialisation), any listed revision changes, the screen gains focus (`useFocusEffect` from expo-router), and the app returns to `active` on a **different** `clock.today()` than the last run.
3. Keeps the previous `data` while reloading; `status` stays `ready` during background refresh (expose `isRefreshing` boolean *(proposed)*).
4. Ignores results of superseded requests (monotonic request counter).
5. Never throws; a rejected promise becomes `status:'error'` with `UnexpectedError`.
6. Clock injected via a module-level `getClock()` *(proposed)* so tests can use a fixed clock.

## 4. Scope

### Included
- Hook, small `useAppDayChange` helper *(proposed)*, tests.

### Excluded
- Any feature service.

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/shared/lib/useServiceQuery.ts` | CREATE | The hook (path from ST §3.2) |
| `src/shared/lib/useAppDayChange.ts` | CREATE *(proposed path)* | AppState + day-change detection |
| `src/shared/lib/useServiceQuery.test.tsx` | CREATE | Tests |

## 6. Implementation Instructions

1. `shared/lib` may use React (it is not `domain/`); keep the hook free of feature imports.
2. Mock `expo-router`'s `useFocusEffect` in tests to call the effect immediately and expose a trigger.
3. Mock `AppState` change events to test day-change refresh.
4. Keep the hook ≤ ~100 lines (ST §3.2 "revisit if it grows beyond about 100 lines").

## 7. Dependencies

- TASK-404 (Result, Clock), TASK-405 (AppError), TASK-414 (`useRevision`).

## 8. Acceptance Criteria

- [ ] First render → `loading`; resolved Ok → `ready` with data.
- [ ] Bumping a listed topic triggers exactly one reload; unrelated topic triggers none.
- [ ] During reload the previous data remains available.
- [ ] A slow first request resolving after a faster second request does not overwrite the newer data.
- [ ] Rejected promise → `error` status, no throw.
- [ ] App resume on a new day triggers reload; resume on the same day does not.

## 9. Testing Requirements

- **Unit Tests:** all acceptance items with `renderHook`, fake timers and a fixed clock.
- **Integration Tests:** exercised by feature integration tests later.
- **UI Tests:** not required.
- **Manual Verification:** not required.

## 10. Verification Commands

```bash
npx jest src/shared/lib/useServiceQuery
npx tsc --noEmit
npx expo lint
```

## 11. Definition of Done

Global DoD.

## 12. Risks and Notes

- React Compiler is enabled (`app.json` experiments); avoid patterns it cannot optimise (mutating refs during render).

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
