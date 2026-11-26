# D10 — Dependency & Platform Design

**Phase:** 2 — DESIGN · **Status:** Provisional ([OD-01](open-decisions.md#od-01))
**Baseline:** `package.json` at commit `e4b2a1e` + working tree (Expo SDK 57, RN 0.86.2, React 19.2.3, TypeScript ~6.0.3). **No packages were installed, removed or upgraded in this phase.**
Policy: AGENTS.md §5. Expo packages are added only through `npx expo install <pkg>` (SDK-compatible versions). Every new dependency below needs approval in its BUILD task ([OD-16](open-decisions.md#od-16)).

---

## 1. Existing dependencies used by the design

| Package (installed) | Purpose in design | Why needed | Expo support | Android | iOS | Native build? | Maintenance | Alternatives |
|---|---|---|---|---|---|---|---|---|
| `expo` ~57.0.15 | Runtime, config, autolinking | Platform | Official | ✓ | ✓ | — | Expo, SDK cadence | — |
| `expo-router` ~57.0.15 | File routes, typed routes, `Stack.Protected`, `NativeTabs`, `ErrorBoundary` | Navigation (D3) | Official | ✓ | ✓ | No (Expo Go OK) | Official | React Navigation directly (more boilerplate) |
| `expo-sqlite` ~57.0.1 | Database, transactions, `backupDatabaseAsync`, `user_version` | Source of truth (D2) | Official | ✓ | ✓ | No (SQLCipher would need a rebuild) | Official | op-sqlite (faster, third-party, dev build) |
| `zustand` ^5.0.15 | UI/session stores, revision signals | D7 | Community, JS-only | ✓ | ✓ | No | Active, small | React context (re-render fan-out) |
| `react-hook-form` ^7.86 + `@hookform/resolvers` ^5.9.1 | Form state; Zod resolver (resolvers v5 supports Zod 4) | Forms (FR-003A) | JS-only | ✓ | ✓ | No | Active | Formik (heavier) |
| `zod` ^4.4.3 | Shared validation schemas (forms + services + export schema + route params) | Validation at boundaries (AGENTS.md §13) | JS-only | ✓ | ✓ | No | Active | Valibot |
| `date-fns` ^4.4.0 | **Display formatting only** of LocalDates (C.13) | Labels like "6 Nov 2026" | JS-only | ✓ | ✓ | No | Active | `Intl.DateTimeFormat` (Hermes output varies by platform ICU) |
| `expo-symbols` ~57.0.2 | Icons: SF Symbols (iOS) + Material Symbols (Android); Android support confirmed in installed type definitions | Category/tab/status icons | Official | ✓ | ✓ | No | Official | `@expo/vector-icons` (**not installed** in this project) |
| `expo-splash-screen` | Hold splash until DatabaseGate resolves | No blank flash | Official | ✓ | ✓ | Config plugin | Official | — |
| `expo-system-ui`, `expo-status-bar` | Root background and status bar per theme | Dark/light | Official | ✓ | ✓ | No | Official | — |
| `expo-constants` | App version for About / diagnostics | FR-025.1 About | Official | ✓ | ✓ | No | Official | `expo-application` |
| `expo-dev-client` | Development builds (required for the local native module) | Project workflow | Official | ✓ | ✓ | Yes (it is the dev build) | Official | — |
| `react-native-safe-area-context`, `react-native-screens`, `react-native-gesture-handler`, `react-native-reanimated`, `react-native-worklets` | Router/navigation peer dependencies; reanimated for minor transitions | Required by expo-router | Expo-bundled | ✓ | ✓ | Included in Expo Go | Software Mansion / Expo | — |
| `jest` ~29.7, `jest-expo` ~57.0.4, `@testing-library/react-native` ^14 | Unit, component and integration tests | D9 | jest-expo official | n/a | n/a | No | Active | — |
| `eslint` 9 + `eslint-config-expo` | Lint + `no-restricted-imports` layer rules, `no-console` | D1 rules | Official config | n/a | n/a | No | Active | — |
| `typescript` ~6.0.3 | Strict typing | NFR-007 | — | n/a | n/a | No | — | — |
| Hermes `BigInt` (engine, not a package) | Exact ratio math (D2 §D) | Precision | RN ≥ 0.70 Hermes | ✓ | ✓ | No | — | `big.js` (unnecessary) |

## 2. Installed but not used by the MVP design

These are left untouched in this phase ([OD-17](open-decisions.md#od-17) decides whether to remove them).

| Package | Status | Concern |
|---|---|---|
| `expo-notifications` | FR-021 is MVP+ | Native module present in builds. Check whether the merged Android manifest gains notification permissions. If kept, add `android.blockedPermissions` or remove the package until FR-021. |
| `expo-secure-store` (+ config plugin in `app.json`) | Needed later for the SQLCipher key / app lock | Harmless. Keeping it avoids churn. |
| `expo-glass-effect`, `@expo/ui` | Not used | `@expo/ui` could provide a native date picker (see §3 alternative) |
| `expo-image`, `expo-font`, `expo-web-browser`, `expo-linking`, `expo-device` | Starter leftovers / router peer (`expo-linking`) | `expo-device` could feed diagnostic info (model/OS) but that is not required |
| `react-native-web`, `react-dom` | Web target | Web is proposed as unsupported for the MVP ([OD-13](open-decisions.md#od-13)). expo-sqlite on web needs WASM + COOP/COEP headers. |

## 3. New dependencies required by the design

| Package | Purpose | Why needed | Expo official? | Android | iOS | Native build req. | Expo Go | Maintenance | Alternatives |
|---|---|---|---|---|---|---|---|---|---|
| `expo-file-system` | Write the export JSON to the cache dir; delete temp files | FR-022.1 | Yes (already in `node_modules` transitively. It must become a direct dependency through `npx expo install`, never imported transitively) | ✓ | ✓ | No | ✓ | Official | — |
| `expo-sharing` | Open the OS share sheet with the export file | FR-022.1, explicit user action (§4.2) | Yes | ✓ | ✓ | No | ✓ | Official | RN `Share` API (cannot share files reliably on Android) |
| `@react-native-community/datetimepicker` | Native date picker for transaction/goal/custom-range dates with min/max | FR-019, C.7 | Listed in the Expo SDK docs; included in Expo Go | ✓ | ✓ | No | ✓ | Community, widely used | `@expo/ui` DateTimePicker (already installed, but separate SwiftUI / Jetpack Compose APIs per platform), or a custom JS calendar (more code, more a11y work) |
| Local Expo module `modules/backup-exclusion` | iOS `NSURLIsExcludedFromBackupKey` on DB files | NFR-004.1 on iOS | Built with `expo-modules-core` (already present) — no npm package | n/a (Android uses `allowBackup`) | ✓ | **Yes**: dev/preview build | ✗ | Owned by the project (~20 lines Swift) | Third-party package (none identified as maintained; spike [OD-15](open-decisions.md#od-15)) |

**Dev-only:** none required if repository tests use Node's built-in `node:sqlite` (Node ≥ 22.13). Fallback: `better-sqlite3` (native Node addon; prebuilt binaries for Windows/macOS/Linux) ([OD-19](open-decisions.md#od-19)). **E2E:** Maestro CLI (not an npm dependency), later.

## 4. Deliberately not added

| Capability | Decision | Reason |
|---|---|---|
| Server/query cache (TanStack Query) | Not added | Local single source; ~80-line internal hook ([state §3.2](state-management-design.md#32-query-hook-pattern)) |
| Charting library | Not added in the MVP | MVP reports are lists + proportional bars (D4 §G). Revisit for MVP+ trend charts (`victory-native`/Skia would need native modules) |
| `@shopify/flash-list` | Not added | `FlatList` + 50-row keyset pages should meet NFR-001.2. Revisit if measurement fails. |
| Decimal/money library (dinero.js, big.js) | Not added | Integer minor units + native BigInt are sufficient and simpler |
| `uuid` / `expo-crypto` | Not added | IDs need only uniqueness within one device (`time36 + 64 random bits`), not cryptographic strength |
| `@react-native-async-storage/async-storage`, Zustand `persist` | Not added | All persistent state lives in SQLite |
| NetInfo, analytics, crash reporting, i18n | Not added | No network features. English-only MVP (§33.1) |
| `expo-local-authentication`, `expo-screen-capture` | MVP+ | App lock / privacy cover |

## 5. Expo Go vs development build

The project already standardizes on `expo-dev-client` (dev builds). These capabilities **require a development or production build** and will not work or cannot be verified in Expo Go:

| Capability | Why |
|---|---|
| iOS backup exclusion | Custom native module |
| Android `allowBackup=false` | App config is applied only to native builds; Expo Go uses its own manifest |
| SQLCipher (future) | Config plugin, rebuild |
| Splash/config plugin changes | Native config |
| Performance measurement (NFR-001.2) | Expo Go and debug builds are not representative; use a release/preview build |

Everything else (SQLite, router, forms, file system, sharing, date picker, symbols) also runs in Expo Go, which is convenient for UI iteration.

## 6. Version policy

- Never hand-edit Expo package versions. Use `npx expo install` and `npx expo install --check` (also run in `npx expo-doctor`).
- No upgrades are part of Phase 2. A future SDK upgrade is its own task with a migration test run.
- Non-Expo JS packages (`zod`, `zustand`, `react-hook-form`, `date-fns`) stay within their current major versions.
