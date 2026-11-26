# D12 — Open Decisions

**Phase:** 2 — DESIGN · **Date:** 2026-11-06
Every unresolved decision found during DESIGN. The design documents use the **recommended option provisionally** and link back here. None of the "PO approval: Yes" items may be treated as approved until the product owner decides.

Legend: **Blocker** = prevents declaring Phase 2 final · **PO** = product-owner approval needed · **Tech** = technical lead decision.

## Summary

| ID | Topic | Type | Approval |
|---|---|---|---|
| [OD-01](#od-01) | PRS v1.1 final SPEC re-review not recorded | **Blocker** | PO |
| [OD-02](#od-02) | Tab bar: Budgets tab vs Settings tab | Product | PO |
| [OD-03](#od-03) | Goal tracking-state rule (aggregate coverage) | Product | PO |
| [OD-04](#od-04) | Projected completion method (proportional share) | Product | PO |
| [OD-05](#od-05) | Expected-saving lookback window (12 months) | Product / PRS clarification | PO |
| [OD-06](#od-06) | Goal priority values and effect | Product / PRS clarification | PO |
| [OD-07](#od-07) | Dashboard section order | Product (minor) | PO (optional) |
| [OD-08](#od-08) | `GOAL-EXPIRED` recommendation (extension) | Scope | PO |
| [OD-09](#od-09) | Capture goal saved-amount history from day one | Scope / data | PO |
| [OD-10](#od-10) | Budgets only for the current month onward | Product | PO |
| [OD-11](#od-11) | Profile name optional, ≤ 40 characters | Product (minor) | PO (optional) |
| [OD-12](#od-12) | Earliest allowed transaction date | PRS gap (M-13) | PO |
| [OD-13](#od-13) | Web platform unsupported in the MVP | Scope | PO |
| [OD-14](#od-14) | Re-baseline schema vs conversion migration | Tech (+ PO fact) | PO confirms facts; Tech decides |
| [OD-15](#od-15) | iOS backup exclusion module; Android D2D transfer | Tech + Product | PO + Tech |
| [OD-16](#od-16) | New dependencies (file-system, sharing, datetimepicker) | Tech | Tech (AGENTS.md §5) |
| [OD-17](#od-17) | Unused installed packages (notifications etc.) | Tech | Tech |
| [OD-18](#od-18) | NFR-001.2 reference device | Tech + Product | PO |
| [OD-19](#od-19) | Repository test SQLite engine | Tech | Tech |
| [OD-20](#od-20) | Category label "Food (eating out)" | Product (minor) | PO |
| [OD-21](#od-21) | Guidance: don't record goal deposits as expenses | PRS clarification | PO |
| [OD-22](#od-22) | Does a partial first month count as history? | PRS clarification | PO |

---

### OD-01
**PRS v1.1 final SPEC re-review not recorded — BLOCKER**
- **Description:** The PRS header reads "Revised draft v1.1 — product decisions accepted, pending final SPEC re-review". PD-01 – PD-20 are accepted, but the re-review step in the review's "Path to READY FOR DESIGN" (item 3) has no recorded outcome.
- **Why it matters:** The prompt and AGENTS.md §3 require an *approved* specification before the design is final.
- **Alternatives:** (a) PO records approval of v1.1 as-is; (b) PO approves v1.1 together with the PRS clarifications proposed here (OD-05, OD-06, OD-12, OD-21, OD-22); (c) another SPEC iteration.
- **Recommended:** (b). It folds the small clarifications in at once.
- **Advantages:** One approval closes SPEC and makes this design final. **Disadvantages:** It requires a PRS edit (by the PO/spec owner, not by this phase).
- **PO approval needed:** **Yes.**

### OD-02
**Tab bar composition** ([navigation §A](navigation-design.md#a-navigation-structure))
- **Description:** The proposal was Home · Transactions · Goals · Reports · Settings. The design recommends Home · Transactions · **Budgets** · Goals · Reports, with Settings behind a gear icon on Home.
- **Why:** Budgets are one of the six MVP product areas and the most actionable daily screen. Settings is rarely used. The 5-tab maximum on Android forces a choice. AGENTS.md §4 forbids a new navigation structure without authorization.
- **Alternatives:** (a) recommended; (b) the original proposal, with Budgets as a pushed route from Home; (c) 6 tabs (not possible with Android bottom navigation).
- **Advantages (a):** One-tap budgets; matches the product areas. **Disadvantages:** Settings is less discoverable (mitigated by the header gear and empty-state links).
- **PO approval needed:** Yes.

### OD-03
**Goal tracking-state rule** ([business-logic B.12](business-logic-design.md#b-financial-calculations))
- **Description:** FR-011.3 leaves On Track / At Risk / Behind to DESIGN. The design compares expected monthly saving E with the **combined** required saving of all trackable goals: On Track if E ≥ 100%, At Risk if E ≥ 75%, otherwise Behind. All Active goals therefore share one state.
- **Why:** FR-015.1 forbids presenting a single goal as fully funded while the total is unfunded.
- **Alternatives:** (a) aggregate coverage (recommended); (b) allocate E to goals in priority order, so higher-priority goals can be On Track while lower ones are Behind; (c) per goal against all of E (violates FR-015.1).
- **Advantages (a):** Simple, explainable, compliant. **Disadvantages:** Less granular; priority has no effect on states. (b) is more informative but shows funded goals while the total is unfunded, which needs a PRS change to FR-015.1.
- **PO approval needed:** Yes (it changes visible behavior). The 75% threshold is also a product-visible parameter.

### OD-04
**Projected completion method** ([business-logic B.12](business-logic-design.md#b-financial-calculations))
- **Description:** Each goal gets a share of E proportional to its required monthly saving. Months to complete = ⌈remaining / share⌉. Shown as a month.
- **Alternatives:** (a) proportional share (recommended); (b) all of E applied to each goal independently (overstates progress when there are several goals); (c) priority-ordered allocation (consistent with OD-03 b).
- **Advantages (a):** Consistent with OD-03 (On Track ⇔ projection ≤ target month). **Disadvantages:** Assumes the user splits savings proportionally.
- **PO approval needed:** Yes.

### OD-05
**Lookback window for expected monthly saving** (FR-011.1)
- **Description:** "Most recent complete months, up to 3, in which at least one transaction exists" does not bound how far back to search. The design limits the search to the last **12** complete months.
- **Alternatives:** unbounded; 6 months; 12 months (recommended).
- **Advantages:** Prevents a figure from years ago standing in for current behavior after a long break. **Disadvantages:** After 12 months of non-use, tracking pauses until a new complete month exists.
- **PO approval needed:** Yes (proposed PRS clarification to FR-011.1).

### OD-06
**Goal priority values and their effect** (FR-009)
- **Description:** The PRS lists "Priority" without values. The design uses High / Medium / Low (default Medium). Priority affects **ordering only** (goal lists, dashboard), not calculations (see OD-03).
- **Alternatives:** numeric 1–5; High/Medium/Low (recommended); remove priority.
- **PO approval needed:** Yes (PRS clarification).

### OD-07
**Dashboard section order** ([ui-ux §B](ui-ux-design.md#b-dashboard-design-fr-006))
- **Description:** The design places Budgets → Recommendations → Goals → Recent transactions. The requested list had goals before recommendations.
- **Recommended:** the design order (time-sensitive suggestions first). **Disadvantage:** Goals are lower on the screen.
- **PO approval needed:** Optional. It is a pure layout change and can be swapped freely.

### OD-08
**`GOAL-EXPIRED` recommendation** ([RE §C.7](recommendation-engine-design.md#c7-proposed-extensions-not-mvp))
- **Description:** An insight prompting the user to update the target date or archive an expired goal. Not required by the PRS.
- **Alternatives:** include in the MVP; leave it to the Expired badge on the goal (recommended for strict scope).
- **Advantages:** Helpful nudge. **Disadvantages:** Scope expansion (AGENTS.md §4).
- **PO approval needed:** Yes, before any implementation.

### OD-09
**Goal saved-amount history (`goal_balance_events`)** ([DB §B.8](database-design.md#b8-goal_balance_events-optional-pending-od-09))
- **Description:** Record every saved-amount change from the MVP onward, without displaying it.
- **Why:** The MVP+ goal-progress history report (FR-018.2) needs history that cannot be reconstructed later.
- **Alternatives:** (a) capture now (recommended); (b) add with MVP+ (history starts then).
- **Advantages (a):** Future report has full data; low cost (one table, one insert per change). **Disadvantages:** Stores data no MVP feature uses; one more table to delete and export.
- **PO approval needed:** Yes.

### OD-10
**Budget creation limited to the current month onward** ([DB §F](database-design.md#f-budget-design))
- **Description:** Budgets can be set or changed only effective from the current month. Past months are read-only. Scheduling a budget for a future month is not offered.
- **Alternatives:** allow retroactive budgets for past months (rewrites history that FR-008.3 says to preserve); allow future-dated changes.
- **Recommended:** current month only. It matches FR-008.3 ("affect the current month and later months only").
- **PO approval needed:** Yes (confirmation).

### OD-11
**Profile name optional, ≤ 40 characters**
- **Description:** FR-001 lets the user enter a name but does not say whether it is required. The design makes it optional (greeting without a name).
- **PO approval needed:** Optional.

### OD-12
**Earliest allowed transaction date** (review M-13, unresolved in PRS v1.1)
- **Description:** The design uses 1 Jan 2000 as the minimum transaction date.
- **Alternatives:** no minimum (date picker scroll, typo risk such as year 0202); 1 Jan 2000 (recommended); 10 years before today.
- **PO approval needed:** Yes (PRS clarification to FR-003A.4 / FR-019).

### OD-13
**Web platform** ([DEP §2](dependency-design.md#2-installed-but-not-used-by-the-mvp-design))
- **Description:** The PRS targets Android/iOS only, while the starter keeps web files and `react-native-web`. The design treats web as **unsupported** in the MVP: no web testing, `.web.tsx` files not maintained.
- **Alternatives:** support web (expo-sqlite needs WASM + COOP/COEP headers; NativeTabs differ).
- **PO approval needed:** Yes (confirmation).

### OD-14
**Re-baseline the database schema** ([ADR-0005](../decisions/ADR-0005-schema-rebaseline.md), [DB §J.6](database-design.md#j6-transition-from-the-draft-schema))
- **Description:** Replace draft migrations v1–v2 with a new baseline migration 1 (using `PRAGMA user_version`), rather than appending a conversion migration v3.
- **Why:** The draft schema conflicts with PRS v1.1 (budget periods, goal status, missing overall budget and spending class). The draft runner cannot initialize a fresh database (it queries `schema_migrations` before creating it), so no normal installation can hold draft data.
- **Alternatives:** (a) re-baseline, with a legacy guard that refuses to drop non-empty draft tables (recommended); (b) conversion migration v3 (lossy for non-month budgets, permanently carries draft quirks).
- **Fact needed from the PO:** confirm that no device with real user data runs the draft build. CLAUDE.md's rule "never edit an existing migration" protects shipped migrations. These were never shippable, but the exception must be explicit.
- **Approval:** PO confirms the fact; the technical lead approves the ADR.

### OD-15
**OS backup exclusion details** ([SEC §2](security-privacy-design.md#2-local-data-protection-mvp), [ADR-0011](../decisions/ADR-0011-os-backup-exclusion.md))
- **Description:** (1) iOS needs a local native module that sets `NSURLIsExcludedFromBackupKey`, because Expo has no config option. A spike must confirm it works with expo-sqlite's database directory and with the `-wal`/`-shm` files. (2) Android `allowBackup=false` does not stop user-initiated device-to-device transfer on Android 12+.
- **Alternatives (iOS):** local module (recommended); a third-party package; move the database to a non-backed-up location (only Caches, which the OS may purge, so unacceptable). **(Android D2D):** accept (recommended; it is an explicit user action); block with `dataExtractionRules` through a config plugin.
- **Approval:** Tech (module); PO (whether D2D is acceptable under NFR-004.1).

### OD-16
**New dependencies** ([DEP §3](dependency-design.md#3-new-dependencies-required-by-the-design))
- **Description:** `expo-file-system` (direct), `expo-sharing`, `@react-native-community/datetimepicker`, plus the local backup-exclusion module.
- **Alternatives:** `@expo/ui` date picker (already installed, but separate per-platform APIs); a JS date picker.
- **Approval:** Tech lead, per AGENTS.md §5, in the corresponding BUILD tasks.

### OD-17
**Unused installed packages** ([DEP §2](dependency-design.md#2-installed-but-not-used-by-the-mvp-design))
- **Description:** `expo-notifications`, `expo-glass-effect`, `@expo/ui`, `expo-image`, `expo-font`, `expo-web-browser`, `expo-device` are unused by the MVP design. `expo-notifications` may add Android notification permissions to the manifest.
- **Recommended:** a single cleanup task removes the unused packages except `expo-secure-store` (future SQLCipher/app lock), after checking the merged manifest. Alternatively keep them and block permissions.
- **Approval:** Tech lead.

### OD-18
**Reference device for NFR-001.2**
- **Description:** The design proposes a 2024-class mid-range Android device (e.g. Samsung Galaxy A35 or equivalent, 6 GB RAM) running a release/preview build.
- **Why:** The PRS says the device is "chosen in DESIGN". A physical device must actually be available for testing.
- **Approval:** PO confirms the device is available or names another one.

### OD-19
**SQLite engine for Jest repository tests** ([TS §0](testing-strategy.md#0-test-pyramid--tooling))
- **Description:** Node's built-in `node:sqlite` (no dependency; experimental API; Node ≥ 22.13) vs the `better-sqlite3` dev dependency vs mocking expo-sqlite.
- **Recommended:** `node:sqlite`, behind the `Db` adapter, and pin the Node version in `.nvmrc`/`engines`. Mocks are rejected because they cannot verify SQL, constraints or migrations.
- **Disadvantages:** It is an experimental API (it may change in Node updates), and its SQLite version may differ from the device's.
- **Approval:** Tech lead.

### OD-20
**Category label "Food (eating out)"** ([DB §J.5](database-design.md#j5-default-data-seeding))
- **Description:** FR-004.1 defines Food as eating out (discretionary). Labelling it explicitly steers home food purchases to Groceries (essential), which keeps reduction suggestions safe.
- **Alternatives:** keep "Food"; rename to "Dining out".
- **Approval:** PO (FR-004 allows refinement in DESIGN, but the label is user-visible).

### OD-21
**Goal deposits and transfers guidance** ([DB §G](database-design.md#g-savings-goal-design))
- **Description:** Transfers are out of scope (§36). A user who records "moved ₹5,000 to savings" as an expense makes dashboard savings understate and double-counts against goals. Propose a PRS note plus in-app help text: "Don't record money moved to savings as an expense; update the goal's saved amount instead."
- **Approval:** PO (PRS wording).

### OD-22
**History sufficiency: does a partial first month count?** ([BL C.6](business-logic-design.md#c-financial-date-rules))
- **Description:** FR-013.2 requires "3 complete months of transaction history". The design counts the month of the first transaction as a history month even if the user started mid-month (the literal reading). This may understate the average for the first comparisons.
- **Alternatives:** count it (recommended, matches the PRS text); require the first transaction date ≤ the first day of the oldest history month (stricter, delays anomaly insights by up to a month).
- **Approval:** PO (PRS clarification).

---

## Decisions made within design authority

The PRS explicitly delegates these to DESIGN. They are listed for visibility and need no PO approval, but can be revisited.

| Decision | Value | PRS hook | Where |
|---|---|---|---|
| Budget warning threshold | 80% | FR-008.7 | BL §B.5 |
| Anomaly thresholds | ≥ 20% and ≥ ₹500 above the average | FR-013 | RE §C |
| Rounding modes | ceil (required saving, gap), floor (potential savings), half-away-from-zero (display) | FR-007.4, FR-010.2, FR-017.1 | BL §0 |
| Single transactions table | — | §38 "schema deferred to DESIGN" | ADR-0008 |
| Hard delete for transactions/goals | — | FR-026.1 | DB §B.5 |
| Recommendations not persisted | — | FR-012.2 | ADR-0007 |
| Exact settings menu | FR-025.1 list | FR-025 | UX §H |

## Proposed changes to protected documents (not applied)

| Document | Proposed change |
|---|---|
| `docs/requirements/product-requirements.md` | Record v1.1 approval (OD-01). Add clarifications OD-05, OD-06, OD-12, OD-21, OD-22. Confirm or adjust OD-02, OD-03, OD-04, OD-10, OD-13. |
| `./AGENTS.md` (FinanceTracker) | Already flagged as partly stale in CLAUDE.md. After design approval, point it to `docs/design/` and the layer rules in SA §B.2. |
| `CLAUDE.md` | After ADR-0005/0009 are accepted, update the "Database" notes (`PRAGMA user_version`, baseline, the `schema_migrations` caveat no longer applies) and the architecture description. |
| `docs/architecture/system-architecture.md` (empty) | Replace with a pointer to `docs/design/system-architecture.md`, or delete, to avoid two architecture documents. |
