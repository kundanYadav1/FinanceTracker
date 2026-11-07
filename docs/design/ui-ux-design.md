# D4 — UI/UX Design Specification

**Phase:** 2 — DESIGN · **Status:** Provisional ([OD-01](open-decisions.md#od-01)) · **PRS:** FR-006, FR-002/003, FR-008 – FR-011, FR-017, FR-018.1, FR-025.1, NFR-006.1, §33.1
Related: [navigation-design](navigation-design.md) · [business-logic-design](business-logic-design.md) (all figures) · [recommendation-engine-design](recommendation-engine-design.md)

Design intent: a calm, legible, number-first interface for daily use. Color supports meaning but never carries it alone (NFR-006.1). Financial figures are the most prominent element on every screen; decoration is minimal.

---

## A. Visual direction & design tokens

Tokens live in `src/shared/theme/tokens.ts` and replace `src/constants/theme.ts` `Colors`/`Spacing` (BUILD). Components consume tokens through `useTheme()`; no component uses a literal hex value.

### A.1 Color — light theme

| Token | Hex | Use | Contrast (approx., verify in BUILD) |
|---|---|---|---|
| `bg` | `#F7F8FA` | App background | — |
| `surface` | `#FFFFFF` | Cards, sheets | — |
| `surfaceAlt` | `#F0F2F5` | Inputs, chips, progress track | — |
| `border` | `#E2E5EA` | Card outline, dividers | non-text |
| `text` | `#111827` | Primary text, amounts | ≈ 17:1 on surface |
| `textSecondary` | `#4B5563` | Labels, metadata | ≈ 7.5:1 |
| `textTertiary` | `#6B7280` | Captions, placeholders | ≈ 4.8:1 |
| `primary` | `#0F766E` (teal 700) | Primary buttons, active tab, links, focus | ≈ 5.4:1 (white text on it ≈ 5.4:1) |
| `primaryContainer` / `onPrimaryContainer` | `#CCFBF1` / `#134E4A` | Selected chips, highlights | ≈ 8:1 |
| `secondary` | `#4F46E5` (indigo 600) | Secondary emphasis, chart accent for income | ≈ 6.3:1 |
| `success` / `successContainer` | `#15803D` / `#DCFCE7` | Income amounts, Healthy / On Track | ≈ 5.0:1 |
| `warning` / `warningContainer` | `#B45309` / `#FEF3C7` | Budget Warning, At Risk | ≈ 5.0:1 |
| `error` / `errorContainer` | `#B91C1C` / `#FEE2E2` | Exceeded, Behind, Expired, validation errors, destructive buttons | ≈ 6.5:1 |

### A.2 Color — dark theme

| Token | Hex | | Token | Hex |
|---|---|---|---|---|
| `bg` | `#0B0F14` | | `primary` | `#2DD4BF` (on-primary `#042F2E`) |
| `surface` | `#151A21` | | `primaryContainer` / `on…` | `#134E4A` / `#CCFBF1` |
| `surfaceAlt` | `#1E242C` | | `secondary` | `#A5B4FC` |
| `border` | `#2A313B` | | `success` / container | `#4ADE80` / `#14532D` |
| `text` | `#F3F4F6` | | `warning` / container | `#FBBF24` / `#78350F` |
| `textSecondary` | `#C3C8CF` | | `error` / container | `#F87171` / `#7F1D1D` |
| `textTertiary` | `#9AA2AD` | | | |

Theme selection: `profile.theme_preference` (`system` follows `useColorScheme()`). A BUILD-phase unit test computes WCAG contrast for every text/background token pair and fails below 4.5:1 (3:1 for ≥ 18.66 px bold / 24 px text).

### A.3 Category palette
13 expense + 6 income `color_key` entries per theme, used **only** as the tinted background behind a category icon (the category name is always shown next to it). Muted mid-saturation hues chosen to sit behind a `text`-colored glyph at ≥ 3:1 non-text contrast.

### A.4 Semantic money colors
- Income amounts: `success` with a leading `+` (`+₹50,000.00`).
- Expense amounts: `text` with a leading `−` (`−₹1,250.50`). Expenses are normal, so they are not shown in red.
- Negative savings: `error`, leading `-`, and a text label "Spent more than earned".
- Sign, label or icon always accompany color (NFR-006.1).

### A.5 Typography
System fonts (Roboto on Android, SF Pro on iOS). No custom font download. Amounts use `fontVariant: ['tabular-nums']` so digits align in lists.

| Style | Size / line height (dp) | Weight | Use |
|---|---|---|---|
| `display` | 32 / 40 | 700 | Hero amount (dashboard savings, amount input) |
| `title` | 22 / 28 | 600 | Screen titles |
| `heading` | 17 / 24 | 600 | Section and card titles |
| `body` | 15 / 22 | 400 | Default text |
| `bodyStrong` | 15 / 22 | 600 | Row amounts |
| `label` | 13 / 18 | 500 | Field labels, chips, tab labels |
| `caption` | 12 / 16 | 400 | Metadata, helper text |

Dynamic type: `allowFontScaling` stays on. Layouts wrap rather than truncate amounts. At the largest standard font size, summary rows stack vertically instead of side by side (NFR-006.1). Amounts are never truncated with an ellipsis.

### A.6 Spacing, radius, elevation

| Spacing | `s1` 4 · `s2` 8 · `s3` 12 · `s4` 16 · `s5` 20 · `s6` 24 · `s8` 32 · `s12` 48 |
|---|---|
| Screen padding | 16 horizontal; 24 between sections; 12 inside cards; 8 between related items |
| Radius | `sm` 8 (inputs, chips) · `md` 12 (cards, buttons) · `lg` 16 (sheets, modals) · `full` (pills, progress) |
| Elevation | Flat: cards are `surface` + 1 dp `border`. No drop shadows on cards; platform defaults for modals/sheets. |
| Touch targets | ≥ 48 × 48 dp (NFR-006.1); small icons get `hitSlop` to reach it. |

### A.7 Card style
`surface` background, `md` radius, 1 dp `border`, 12–16 padding, a heading row (title left, optional action link right, e.g. "See all"), content, optional footer. Status cards add a 4 dp left accent bar in the status color **plus** a status label and icon.

### A.8 Progress bars
8 dp tall, `full` radius, track `surfaceAlt`, fill in the status color. The fill is clamped to 100% visually. Overspend is shown as text ("₹360.00 over"), not as an overflowing bar. Each bar has `accessibilityRole="progressbar"` and `accessibilityValue={{min:0,max:100,now}}` plus a text label.

### A.9 Icon conventions
- Library: `expo-symbols` (installed): SF Symbols on iOS, Material Symbols on Android. One `Icon` wrapper maps semantic `icon_key`s (e.g. `food`, `rent`, `upi`) to `{ ios: 'fork.knife', android: 'restaurant' }`.
- Outline style, 24 dp default, 20 dp in dense rows. An icon is never the only label for an action, except universally known glyphs (back, close, settings gear), which still get an `accessibilityLabel`.
- Status icons: Healthy/On Track = check-circle · Warning/At Risk = alert-triangle · Exceeded/Behind/Expired = alert-octagon · Completed = flag/checkmark.

---

## B. Dashboard design (FR-006)

```text
┌──────────────────────────────────────────┐
│ Good evening, Asha                   ⚙   │  1 Greeting + settings
│ [ November 2026 ▾ ]                      │  2 Period chip
├──────────────────────────────────────────┤
│ Monthly savings                          │  3–6 Summary card
│ ₹15,000.00                (display)      │
│ Savings rate 30.0%                       │
│ ─────────────────────────────────────    │
│ ↓ Income  ₹50,000.00 │ ↑ Expenses ₹35,000.00│
├──────────────────────────────────────────┤
│ [ + Add expense ]   [ + Add income ]     │  primary actions
├──────────────────────────────────────────┤
│ Budgets · November              See all  │  7 Budget progress
│ Monthly budget ███████░░ 78.0% Healthy   │
│ Shopping  ██████████ 92.0% ⚠ Warning     │
│ ₹240.00 left                             │
├──────────────────────────────────────────┤
│ Suggestions                     See all  │  9 Recommendations (≤3)
│ ⚠ Shopping budget almost used  →         │
│ ⓘ Food (eating out) is above usual →     │
├──────────────────────────────────────────┤
│ Goals                           See all  │  8 Active goals (≤3)
│ Emergency fund  ██░░░ 25.0%  At risk     │
│ ₹37,500.00/month needed                  │
├──────────────────────────────────────────┤
│ Recent transactions             See all  │  10 Recent (5)
│ 🍴 Food (eating out) · UPI   −₹450.00     │
└──────────────────────────────────────────┘
```

| # | Section | Content & rules | Why here |
|---|---|---|---|
| 1 | Greeting/profile | "Good morning/afternoon/evening, {name}" (or without the name). Gear → Settings. | Orientation; the low-value element stays small. |
| 2 | Period | Chip showing "November 2026", "October 2026" or "1 Oct – 15 Nov 2026" → period modal. Default current month (FR-006.1). | Every figure below depends on it, so it comes before the numbers. |
| 3–6 | Summary | The hero is **Savings** (§2: "how much should I save"), labelled "Monthly savings" or "Savings" for a custom range (FR-007.0). Savings rate, or "Savings rate: not available — No income recorded for this period" (FR-007.2). Income and expense side by side (stacked at large font). | Answers the main question at a glance. |
| — | Actions | Add expense / Add income buttons. | Most frequent task, reachable without scrolling. |
| 7 | Budget progress | Overall budget + up to 3 category budgets ordered by status severity, then utilization. **Always for a calendar month:** the selected month, or the current month with the caption "Budgets are monthly — showing November" when a custom range is selected (FR-008.1). Empty: "No budgets yet. Set a monthly budget to see how much you can safely spend." [Set budget]. | "How much can I safely spend?" is the most actionable daily question. |
| 9 | Recommendations | ≤ 3 cards ordered by priority (FR-006.1). Notices if none (FR-006.2, e.g. "Spending comparisons need 3 complete months of history. You have 1."). Always the current month, independent of the selected period (FR-019.7). | Placed after budgets because suggestions often explain budget state. Placed before goals because they are time-sensitive. |
| 8 | Active goals | Up to 3 Active goals (priority, then target date): progress, tracking-state badge, required/month. Empty: "No savings goals yet." [Create goal]. Not affected by the period. | Longer-horizon information. |
| 10 | Recent transactions | Last 5 by date (any period). Empty: "No transactions in this period" + [Add expense] (FR-006.2). | Confirmation of recent entries; lowest analytical value. |

The order deviates from the requested list (recommendations before goals). Rationale is given in the table; the order is a pure layout choice and can be swapped without design impact.

---

## C. Transaction screens

### C.1 Transaction list (Transactions tab)
- Header: title, search field ("Search notes or categories", FR-002.2), Filter button with an active-filter count badge.
- Active filter chips row (removable): period, type, category, payment method (FR-002.3).
- Period summary strip: "Income ₹X · Expenses ₹Y" for the filtered set.
- `FlatList` grouped by date with section headers "Today", "Yesterday", "Mon, 3 Nov 2026". Keyset pagination of 50 per page; the footer loads more.
- Row (≥ 56 dp): category icon · category name (bodyStrong) · second line: note (1 line, ellipsized) and payment method for expenses · right-aligned signed amount. Accessibility label: "Expense, 1,250 rupees 50 paise, Food (eating out), 4 November 2026, UPI".
- FAB "+" (bottom-right, above the tab bar) → type choice → add form.

### C.2 Add expense / Add income (one form, type toggle)

```text
┌ Cancel        New expense           Save ┐
│ [ Expense | Income ]   (segmented)        │
│ ₹ 1,250.50            (display, numeric)  │
│ Category *                                 │
│ [🍴 Food] [🛒 Groceries] [🚌 Transport] …  │  grid, 3–4 columns
│ Payment method *        (expense only)    │
│ (Cash) (UPI) (Debit card) …  chips        │
│ Date *   [Today] [Yesterday] [📅 6 Nov]    │
│ Note     ______________________  0/200    │
│ [ ] Recurring  "For your reference only — │
│      it doesn't create future entries."   │
└────────────────────────────────────────────┘
```
- The amount gets autofocus with `keyboardType="decimal-pad"`. It shows a live formatted preview below the field ("₹1,250.50"). Input is validated per [business-logic A.2](business-logic-design.md#a2-validation-rules-domaintransactionsschemats-zod). A comma decimal separator from some device keyboards (`12,50`) is rejected with "Use a dot (.) for decimals."
- Income mode: the label "Income source" replaces "Category" and the payment method row is hidden (FR-003.1).
- Defaults: category none, payment method = last used or Cash (FR-005.1), date today.
- Save is disabled while pending (FR-026.4). Errors appear under the field on blur and on submit; a summary banner appears at the top on submit if any field is invalid.
- On failure the banner reads "Expense not saved. Your entries are kept — try again." (FR-027.1).

### C.3 Transaction details
Large signed amount, type label, category with class (expense, e.g. "Discretionary"), date, payment method, note, recurring flag ("Marked as recurring — for your reference"), and a "Last edited" caption. Actions: **Edit** (primary) and **Delete** (destructive text button → confirmation: "Delete expense of ₹1,250.50 for Food (eating out) on 4 Nov 2026? This can't be undone.").

### C.4 Edit transaction
The same form, prefilled, titled "Edit expense/income". The type toggle is allowed (it resets category, [business-logic A.4](business-logic-design.md#a4-editing-and-deletion)).

### C.5 Search & filter
- Search is debounced 250 ms, case-insensitive on note + category name. Results respect active filters.
- Filter sheet: Period (This month · Last month · Custom · All time), Type (All · Expenses · Income), Category (single select, list filtered by type), Payment method (single select; disabled when Type = Income). Buttons: Reset, Apply.
- No results: "No transactions match your search and filters." [Clear filters].

### C.6 Category selection
Grid of icon + name tiles (48 dp minimum). The selected tile has a `primaryContainer` background, a check icon and `accessibilityState={{selected:true}}`. Expense categories are ordered by `sort_order`. The spending class is not shown in the picker (to avoid judgment); it is shown on detail.

### C.7 Date selection
Quick chips Today / Yesterday plus a picker chip showing the chosen date. The picker is the native date picker with `maximumDate = today` and `minimumDate = 2000-01-01` ([dependency-design](dependency-design.md#3-new-dependencies-required-by-the-design)). The picker returns local Y/M/D, which is converted with `toLocalDate`. The JS `Date` is never stored.

---

## D. Budget screens

- **Budget overview (Budgets tab):** a month selector `‹ November 2026 ›`. Future months are disabled; past months are read-only and show the budget amount that was in effect then (FR-008.3).
  - The overall budget card (or empty CTA "Set a monthly budget") shows spent / budget, progress, status badge, and "₹X left" or "₹X over".
  - The "Category budgets" list is sorted Exceeded → Warning → Healthy, then by utilization.
  - "+ Add category budget" lists only categories without a budget this month (FR-008.2).
- **Total monthly budget / category budget form (modal):** amount (≥ 0 allowed, FR-003A.8) and category (category form only; expense categories only). Helper text: "Applies to November and later months until you change it. Unspent budget doesn't carry over." A ₹0 budget shows "Any spending will show as over budget."
- **Budget progress:** the progress bar plus text "₹2,760.00 of ₹3,000.00 · 92.0%" and the status badge (Healthy / Warning / Exceeded, each with an icon). A zero budget hides the percentage (FR-008.6).
- **Overspending warning:** an `errorContainer` banner on the card and detail: "₹360.00 over your Shopping budget this month." Warning state: a `warningContainer` banner "You've used 92.0% — ₹240.00 left."
- **Budget details:** for the selected month: amount in effect (with "since Oct 2026" from `effective_from_month`), spent, remaining/over, utilization, and the list of contributing transactions (tap → transaction detail). Actions in the current month: Change amount, Remove budget (confirmation explains that past months are kept). A small "History" list shows the amount per month for the last 6 months, read from versions (this is the FR-008.3 data; it is not the MVP+ budget performance report).

---

## E. Savings goal screens

- **Goals overview:** segments Active · Paused · Archived. Active cards are ordered by priority (High → Low), then target date. A portfolio header (when Active goals exist): "Your goals need ₹18,750.00/month · You save about ₹15,000.00/month" + coverage, or the "not enough history" note. Empty: "Set a savings goal to see how much to save each month." [Create goal].
- **Create goal (modal):** name (1–60), target amount, saved so far (optional, default ₹0; helper "Money you've already set aside for this goal"), target date (≥ today), priority (High / Medium / Low segmented). A live preview of the required monthly saving updates as the user types (computed by the domain function via the hook).
- **Goal detail:**
  - Header: name, priority chip, lifecycle status.
  - Progress ring or bar: "25.0% · ₹25,000.00 of ₹1,00,000.00", "₹75,000.00 to go".
  - **Required monthly saving:** "₹37,500.00/month for 2 months (Nov – Dec 2026)".
  - **Tracking state** badge + plain-language explanation ([business-logic B.12](business-logic-design.md#b-financial-calculations)), e.g. "At risk — Your goals need ₹37,500.00/month together. Over your last 3 complete months you saved about ₹30,000.00/month (80.0%)."
  - **Projected completion:** "At your recent pace: Jan 2027" or the stated reason it isn't available (FR-009.3). Caption: "Estimate based on your past savings — not a guarantee."
  - Actions: Update saved amount, Edit, Pause/Resume, Archive/Unarchive, Delete.
- **Update saved amount (modal):** a new total amount field, plus quick "Add ₹ …" / "Withdraw ₹ …" helpers that compute the new total (never below 0). An explicit note: "This only updates the goal. It doesn't record income or an expense." (prevents double-counting, [database §G](database-design.md#g-savings-goal-design)).
- **Goal status:** lifecycle (user) shown as a chip. Tracking state (calculated) shown as a colored badge with icon and text: On Track (success), At Risk (warning), Behind (error), Completed (success + flag), Expired (error + calendar-x).

---

## F. Recommendation screens

- **Recommendation card:** a priority indicator (left accent bar + icon + text "High" / "Medium" / "Low" for screen readers), a kind label ("Suggestion" or "Insight"), title, the first sentence of the reason, and the potential-savings chip "Up to ₹1,300.00 this month (estimate)" if present. The whole card is pressable → detail.
- **Recommendation detail:**
  1. "What we noticed" — the facts (`reason` + `supportingMetrics` table, e.g. This month ₹6,200.00 · 3-month average ₹4,900.00 · Increase 26.5%).
  2. "What you could do" — the suggested action (suggestions only).
  3. "Potential savings" — "up to … (estimate)" with its basis.
  4. "Why am I seeing this?" — rule name + condition (FR-012.1).
  5. A footer disclaimer: "Suggestions are based only on data you entered. They're estimates, not financial advice."
  Facts and suggestions are visually separated sections (§32).
- **Recommendations list:** all recommendations, ranked, followed by notices.
- **Dismiss / ignore:** **not supported** (FR-012.3, §36). No dismiss control is rendered.

---

## G. Reports (FR-018.1 MVP)

- **Period** chip shared with Home.
- **Summary — income vs expense:** income, expenses, savings (FR-007), savings rate. A simple two-bar comparison (income bar vs expense bar, widths proportional, built from Views; **no chart library** in the MVP), with text values always visible.
- **Category distribution:** expense categories in descending amount (FR-018.1), each row: icon, name, amount, share "23.4%", and a horizontal share bar. A footer states "Total ₹35,000.00", which exactly equals total expenses (US-004). Tap a row → Transactions filtered by category + period.
- **Spending trends, savings trends, budget performance history, goal progress history:** **MVP+** (FR-018.2). They are **not shown in the MVP** (no "coming soon" placeholders that advertise unapproved scope).
- Empty: "No expenses in this period."

---

## H. Settings (FR-025.1)

| Item | MVP? | Content |
|---|---|---|
| Profile | Yes | Name (optional, ≤ 40). |
| Currency | Yes | Shows "Indian Rupee (₹ INR)". The change control is enabled only when no transactions, budgets or goals exist. Otherwise it is disabled with the FR-001.4 explanation. |
| Theme | Yes | System / Light / Dark (radio). |
| Notification preferences | **No** (MVP+). Not shown. | — |
| App lock | **No** (MVP+). Not shown. | — |
| Privacy | Yes | NFR-004.2 text: stored only on this device; not backed up automatically by the phone; uninstalling deletes it; export to keep a copy; no data sent anywhere; the database is **not encrypted** by the app (§35: no claim of encryption). |
| Data export | Yes | "Export my data (JSON)". Unencrypted-file warning (FR-022.2) → share sheet. |
| Data restore | **No** (Deferred, FR-023). Not shown. | — |
| Delete all data | Yes | Two-step confirmation: (1) the explanation, (2) typing or pressing a "Delete everything" button; the text states the deletion is permanent and cannot be undone (FR-026.2). |
| About | Yes | App name, version, build, open-source licences, the "not financial advice" statement (§32). |

---

## I. UI states

Applies to every major screen. **Offline:** there is no offline state; no screen depends on the network (FR-024, [system-architecture §F](system-architecture.md#f-offline-architecture-fr-024-us-007)). Showing an offline banner is a defect.

| Screen | Initial | Loading | Empty | Success | Validation | Error |
|---|---|---|---|---|---|---|
| Onboarding | Currency preselected but unconfirmed | Saving: button spinner | — | → Home | Currency required | "Couldn't save — try again"; stays |
| Dashboard | Current month | Per-section skeletons | Per section (FR-006.2, §B) | Figures | — | Per-section error card + Retry |
| Transactions list | Current month, no filters | Skeleton rows; footer spinner when paging | "No transactions in this period" + Add; "No matches" + Clear filters | List | — | Inline error + Retry |
| Add/Edit transaction | Defaults (A.3) | Save button busy, inputs locked | — | Dismiss + toast | Inline per field + top summary | Banner "not saved", values kept (FR-027.1) |
| Transaction detail | — | Skeleton | — | Fields | — | "No longer exists" / error + Retry |
| Budgets | Current month | Skeleton cards | "No budgets for November" + Set budget | Cards | — | Inline + Retry |
| Budget form | Prefilled if changing | Busy | — | Dismiss + toast | Amount ≥ 0, category required | Not-saved banner |
| Goals overview | Active segment | Skeleton | Per segment ("No paused goals") | Cards | — | Inline + Retry |
| Goal form / saved amount | Defaults | Busy | — | → Detail | Name, target > 0, date ≥ today, saved ≥ 0 | Not-saved banner |
| Goal detail | — | Skeleton | — | Detail | — | No longer exists / Retry |
| Recommendations | — | Skeleton cards | Notices (needs history / all clear) | Cards | — | Inline + Retry |
| Reports | Current month | Skeleton | "No transactions in this period" | Report | Custom range start ≤ end | Inline + Retry |
| Settings / Export | — | Export: progress "Preparing file…" | — | Share sheet opens | — | "Export failed — nothing was shared" |
| Delete all data | Step 1 | "Deleting…" (blocking) | — | → Onboarding | — | "Delete failed — your data is unchanged" (single transaction) |
| App start | Splash | Splash | — | Home / Onboarding | — | Database error screen (FR-027.2) |

Toasts are announced to screen readers (`AccessibilityInfo.announceForAccessibility`).

---

## J. Reusable components (inventory; not implemented in this phase)

Location: `src/shared/ui/` (generic) or `src/features/*/components/` (feature-specific).

| Component | Location | Purpose / key props | Accessibility |
|---|---|---|---|
| `Screen` | shared | Safe-area container, scroll, padding | — |
| `AppHeader` | shared | Title, left back/close, right actions | Header role; labelled buttons |
| `Card` | shared | Surface container, `title`, `action` | — |
| `SummaryCard` | dashboard | Savings hero, rate (`Available<Ratio>`), income, expense | Reads the full sentence |
| `MoneyText` | shared | Renders `Money` via `formatMoney`; `signDisplay`, `tone` | Spoken form ("1,250 rupees 50 paise") |
| `PercentText` | shared | Renders `Available<Ratio>`; reason when unavailable | — |
| `StatusBadge` | shared | `status` → color + icon + text | Text always present |
| `ProgressBar` | shared | `ratio`, `tone` | progressbar role + value |
| `TransactionItem` | transactions | Row: icon, category, note, method, signed amount | Combined label |
| `TransactionForm` | transactions | RHF + zod; add/edit, type toggle | Field labels, errors linked |
| `CategoryIcon` | shared | `iconKey`, `colorKey`, size | Decorative (hidden) when the name is adjacent |
| `CategoryPicker` | transactions/budgets | Grid; `type`, `value`, `onChange` | Selected state |
| `PaymentMethodPicker` | transactions | Chip row | Selected state |
| `AmountInput` | shared | Text input + live formatted preview; returns text, parsing done by the schema | Label, error |
| `DateSelector` | shared | Today/Yesterday chips + native picker; min/max | Spoken date |
| `PeriodSelector` | shared | Chip + modal (month / previous / custom) | — |
| `MonthStepper` | budgets | ‹ month › with future disabled | Disabled state |
| `BudgetProgressCard` | budgets | Budget evaluation → bar, badge, left/over | — |
| `GoalProgressCard` | goals | Snapshot → progress, state badge, required/month | — |
| `GoalTrackingExplanation` | goals | Explanation text from the domain | — |
| `RecommendationCard` | recommendations | Priority, kind, title, reason, potential savings | Priority read as text |
| `RecommendationDetail` | recommendations | Facts / action / savings / why sections | Headings |
| `NoticeCard` | recommendations | Notice text | — |
| `PrimaryButton` / `SecondaryButton` / `DestructiveButton` / `TextButton` | shared | `label`, `onPress`, `loading`, `disabled` | ≥ 48 dp, busy state |
| `FAB` | shared | Add | Label "Add transaction" |
| `SegmentedControl` | shared | Type toggle, goal segments | tab/radio semantics |
| `Chip` | shared | Selectable / removable | Selected state |
| `SearchBar` | shared | Debounced input, clear | Label |
| `FilterSheet` | transactions | Period, type, category, method | — |
| `EmptyState` | shared | Icon, title, body, action | — |
| `ErrorState` | shared | Message from the catalog, Retry | — |
| `Skeleton` | shared | Placeholder blocks | Hidden from screen readers; container announces "Loading" |
| `ConfirmationDialog` | shared | Title, item-naming message, confirm (destructive) / cancel | Focus trapped; cancel is default |
| `FormErrorBanner` | shared | Not-saved / invalid summary | Live region |
| `Toast` | shared | Short confirmation | Announced |
| `DatabaseErrorScreen` | shared | FR-027.2 screen | — |
