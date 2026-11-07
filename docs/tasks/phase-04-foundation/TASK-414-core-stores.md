# TASK-414 — Core Zustand stores: session, revision, UI

> **PROVISIONAL** — Gate G0 closed. Do not execute until approved.

## Task Metadata

- **Task ID:** TASK-414
- **Task Name:** Core Zustand stores — `sessionStore`, `revisionStore`, `uiStore`
- **Implementation Phase:** 4 — Application Foundation
- **Feature:** F4.5 State management foundation
- **Priority:** HIGH
- **Status:** NOT STARTED
- **Estimated Complexity:** SMALL
- **Dependencies:** TASK-404, TASK-405, TASK-406
- **Blocks:** TASK-415, TASK-416, TASK-418, TASK-421, TASK-422, TASK-424, TASK-505, TASK-510, TASK-604
- **PRS References:** FR-002 (acceptance: reflect changes without restart), FR-006 acceptance, FR-012.2, NFR-002
- **Design References:** ST §1, ST §2 (ownership table), ST §3.1 (revision signals), ST §4 (consistency rules), ADR-0004

## 1. Objective

Create the three global stores that hold only session/UI state and data-change signals — never financial records or totals.

## 2. Background and Context

ADR-0004: SQLite is the single source of truth; Zustand holds UI/session state and *signals*. ST §2 assigns DB status and the profile snapshot to `sessionStore`, revision counters to `revisionStore`, and the toast queue to `uiStore`. No store uses `persist`.

## 3. Requirements

1. `sessionStore`: `dbStatus: 'connecting' | 'migrating' | 'ready' | 'error'`, `dbErrorCode?: ErrorCode`, `profile: ProfileSnapshot | null` where `ProfileSnapshot = { displayName: string; primaryCurrency: CurrencyCode | null; themePreference: 'system'|'light'|'dark'; onboarded: boolean }`. Setters `setDbStatus`, `setProfile`. No other fields.
2. `revisionStore`: `Topic = 'transactions' | 'budgets' | 'goals' | 'profile'`; state `Record<Topic, number>`; `bump(topics: Topic[])` increments each listed topic once; `useRevision(topics)` returns a stable value that changes when any listed topic changes. `bumpAll()` for Delete All Data.
3. `uiStore`: toast queue `{ id, message, tone: 'success'|'error'|'info' }[]`, `showToast`, `dismissToast`. Messages must come from callers as already-safe text (no amounts by convention — toasts like "Expense saved").
4. No `persist` middleware; no store holds arrays of transactions, budgets, goals or any total.
5. Stores live in `src/shared/store/`.

## 4. Scope

### Included
- Three stores, `useRevision` selector, tests.

### Excluded
- `periodStore` (TASK-604), `transactionFilterStore` (TASK-510), Toast rendering (TASK-418).

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/shared/store/sessionStore.ts` | CREATE | DB status + profile snapshot |
| `src/shared/store/revisionStore.ts` | CREATE | Revision counters + `useRevision` |
| `src/shared/store/uiStore.ts` | CREATE | Toast queue |
| `src/shared/store/index.ts` | CREATE | Exports |
| `src/shared/store/*.test.ts` | CREATE | Unit tests |

## 6. Implementation Instructions

1. Zustand v5 `create` with typed state; use `useShallow` (or a computed number) in `useRevision` to avoid re-render loops.
2. `ProfileSnapshot` type is defined here; `CurrencyCode` imported from `@/domain/money`.

## 7. Dependencies

- TASK-404 (shared lib conventions); TASK-405 (`ErrorCode`); TASK-406 (`CurrencyCode`).

## 8. Acceptance Criteria

- [ ] `bump(['transactions'])` changes `useRevision(['transactions'])` and `useRevision(['transactions','budgets'])` but not `useRevision(['goals'])`.
- [ ] `bumpAll()` changes every topic.
- [ ] No store imports `persist`.
- [ ] Toast add/dismiss works in order.

## 9. Testing Requirements

- **Unit Tests:** store transitions; `useRevision` via `renderHook` from RNTL.
- **Integration Tests:** not required.
- **UI Tests:** not required.
- **Manual Verification:** not required.

## 10. Verification Commands

```bash
npx jest src/shared/store
npx tsc --noEmit
npx expo lint
```

## 11. Definition of Done

Global DoD.

## 12. Risks and Notes

- Shared file hotspot: `sessionStore.ts` is later read (not modified) by TASK-421/422. Any new field needs a documented change.

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
