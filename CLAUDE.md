# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Governing rules

Two `AGENTS.md` files apply and must be followed:

- `../AGENTS.md` (workspace root, `F:\expensendsaving\AGENTS.md`) — the binding development process: **SPEC → DESIGN → TASK → BUILD → TEST**, no silent scope expansion, local-first (no backend/auth/AI APIs unless specified), money as integer minor units with explicit currency, business logic out of components, schema changes only as migrations, deterministic/explainable recommendations, conventional commits. Docs go in `docs/specs/`, `docs/design/`, `docs/tasks/`, `docs/tests/`, `docs/decisions/` (none of these exist yet — create as needed).
- `./AGENTS.md` — project quick reference (partly stale: it still describes the Expo starter; the app has since gained SQLite storage, a store, and finance screens).

The product spec is `docs/requirements/product-requirements.md` (FR-001…FR-025, NFR-001…NFR-008, financial safety/currency/precision constraints, explicit out-of-scope list). Read the relevant FR section before implementing a feature. `docs/project-context.md` and `docs/architecture/system-architecture.md` are currently empty.

## Commands

```bash
npm start                 # expo start (project uses expo-dev-client; Expo Go may not work)
npm run android           # or: npx expo run:android for a native dev build
npm test                  # Jest, jest-expo preset
npx jest src/path/to/file.test.ts   # single test file
npx jest -t "name"        # single test by name
npm run lint              # expo lint (eslint-config-expo flat config)
npx tsc --noEmit          # type check (strict)
npx expo-doctor           # Expo project validation
```

Verification expected after changes (per AGENTS.md): `npm test`, `npx tsc --noEmit`, `npx expo lint`, `npx expo-doctor`. Add Expo packages with `npx expo install <pkg>`. EAS profiles in `eas.json`: `development` (dev client), `preview` (Android APK), `production`.

## Stack

Expo SDK 57, React Native 0.86, React 19.2, TypeScript 6 (strict), expo-router (typed routes, React Compiler enabled in `app.json`), expo-sqlite, Zustand, react-hook-form + Zod, date-fns. Path aliases: `@/*` → `src/*`, `@/assets/*` → `assets/*`.

## Architecture

Intended layering (AGENTS.md): **UI → hook/store → service/use case → repository → database**. Current code is close but collapses some layers:

- `src/app/` — expo-router screens: `index.tsx` (dashboard), `transactions.tsx`, `budgets.tsx`, `goals.tsx`, plus starter `explore.tsx`. Root `_layout.tsx` renders `AppTabs` (`src/components/app-tabs.tsx`, `NativeTabs`; `app-tabs.web.tsx` for web). **Only `index` and `explore` are registered as tabs** — new screens must be added to both tab files to be reachable.
- `src/store/appStore.ts` — single Zustand store holding profile, categories, payment methods, transactions, budgets, goals. Its actions call the repositories and update in-memory state; it also computes derived totals (`getTotals`, `getCategoryTotals`) from in-memory transactions. `load()` seeds defaults and hydrates all slices, but **nothing currently calls it**.
- `src/db/` — repository layer over expo-sqlite:
  - `database.ts` — lazy singleton `getDatabase()` that opens `financetracker.db` and runs migrations on first access.
  - `schema.ts` — `SCHEMA_VERSION` + ordered `MIGRATIONS` array of SQL strings. Each migration inserts its own row into `schema_migrations`. To change the schema, append a new migration and bump `SCHEMA_VERSION`; never edit an existing migration. Note: the runner queries `schema_migrations` before migration 1 creates it, so a fresh database needs that table to exist first.
  - `transactions.ts`, `budgets.ts`, `goals.ts` — CRUD + row mappers (snake_case columns → camelCase domain types). `budgets.ts`/`goals.ts` also export pure calculators (`computeBudgetStatus`, `computeGoalProgress`) that screens import directly; per AGENTS.md such logic belongs in domain/service functions.
  - `seed.ts` — default categories/payment methods (`INSERT OR IGNORE`, stable string IDs like `cat_food`, `pm_upi`) and their read queries.
- `src/utils/money.ts` — `Money = { currency, cents }` with integer-cents arithmetic, currency-mismatch guards, `toCents` (string parse, max 2 decimals), `formatMoney`, `savingsRate`. Use these for all monetary math. DB columns are `*_cents INTEGER` with a `currency TEXT` column (default `INR`). Several store/repository aggregations currently hardcode `'INR'`.
- `src/components/` — themed primitives (`ThemedText`, `ThemedView`, `ui/button`, `ui/collapsible`), `transaction-form.tsx`, and leftover starter components. Theme tokens in `src/constants/theme.ts`; `use-theme`/`use-color-scheme` hooks have `.web.ts` variants (platform-specific files use `.web.tsx`/`.web.ts` suffixes).

IDs are generated client-side as `${Date.now()}-${random}` strings. Dates are stored as ISO strings and compared lexically in SQL.

## Tests

Only one test exists: `src/components/themed-text.test.tsx` (snapshot). `tests/` is empty. Co-locate tests with source using `@testing-library/react-native`. expo-sqlite is native, so repository tests need a mock of `expo-sqlite`; pure functions (`money.ts`, `compute*`) can be unit-tested directly. CSS modules are mapped to `identity-obj-proxy` in `jest.config.js`.

## Gotchas

- Do not commit `.expo/`, `expo-env.d.ts`, or generated `ios/`/`android/` folders; don't edit `expo-env.d.ts`.
- `npm run reset-project` moves starter code to `app-example/` and blanks `src/app/` — destructive to the real screens now in `src/app/`; don't run it.
- `README.md` is the unmodified create-expo-app README.
