import type { SavingsGoal } from '@/db/goals';
import type { Transaction } from '@/db/transactions';

/** Coverage (expected saving / required saving) at or above this share is "At Risk", below is "Behind". */
export const AT_RISK_COVERAGE_PERCENT = 75;
/** How many complete months back we look for months with transactions. */
export const LOOKBACK_MONTHS = 12;
/** How many of those months are averaged. */
export const AVERAGE_MONTHS = 3;
/** Projections beyond this many months are shown as "more than 50 years". */
export const MAX_PROJECTION_MONTHS = 600;

export type TrackingState = 'completed' | 'expired' | 'onTrack' | 'atRisk' | 'behind' | 'unknown';

export type Today = { year: number; month: number; day: number };

export function toToday(d: Date): Today {
  return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
}

export function monthIndex(year: number, month: number): number {
  return year * 12 + (month - 1);
}

function parseDate(date: string): { year: number; month: number; day: number } {
  const [year, month, day] = date.split('-').map(Number);
  return { year, month, day };
}

function dateKey(t: Today): string {
  return `${t.year}-${String(t.month).padStart(2, '0')}-${String(t.day).padStart(2, '0')}`;
}

export function monthKeyFromIndex(index: number): string {
  const year = Math.floor(index / 12);
  return `${year}-${String((index % 12) + 1).padStart(2, '0')}`;
}

// ---------- Progress (B.9) ----------

export type GoalProgress = {
  remainingCents: number;
  /** 0–100, one decimal; a goal that is not complete never shows 100. */
  percent: number;
  completed: boolean;
};

export function goalProgress(goal: Pick<SavingsGoal, 'targetAmount' | 'currentAmount'>): GoalProgress {
  const target = goal.targetAmount.cents;
  const saved = goal.currentAmount.cents;
  const completed = saved >= target;
  const remainingCents = Math.max(0, target - saved);
  if (target <= 0) return { remainingCents, percent: 0, completed };
  if (completed) return { remainingCents, percent: 100, completed };
  const raw = Math.round((Math.max(0, saved) / target) * 1000) / 10;
  return { remainingCents, percent: Math.min(99.9, raw), completed };
}

// ---------- Required monthly saving (B.10) ----------

export type RequiredSaving =
  | { kind: 'completed' }
  | { kind: 'expired' }
  | { kind: 'required'; cents: number; months: number };

export function requiredMonthlySaving(
  goal: Pick<SavingsGoal, 'targetAmount' | 'currentAmount' | 'targetDate'>,
  today: Today
): RequiredSaving {
  const remaining = goal.targetAmount.cents - goal.currentAmount.cents;
  if (remaining <= 0) return { kind: 'completed' };
  if (goal.targetDate.slice(0, 10) < dateKey(today)) return { kind: 'expired' };
  const t = parseDate(goal.targetDate);
  const months = Math.max(1, monthIndex(t.year, t.month) - monthIndex(today.year, today.month) + 1);
  return { kind: 'required', cents: Math.ceil(remaining / months), months };
}

// ---------- Expected monthly saving (B.11) ----------

/** Average is `totalCents / months`; kept as a ratio so nothing is rounded early. */
export type ExpectedSaving = { totalCents: number; months: number } | null;

export function expectedMonthlySaving(transactions: Transaction[], today: Today): ExpectedSaving {
  const current = monthIndex(today.year, today.month);
  const net = new Map<string, number>();
  for (const t of transactions) {
    const key = t.date.slice(0, 7);
    net.set(key, (net.get(key) ?? 0) + (t.type === 'income' ? t.amount.cents : -t.amount.cents));
  }
  let totalCents = 0;
  let months = 0;
  for (let back = 1; back <= LOOKBACK_MONTHS && months < AVERAGE_MONTHS; back++) {
    const key = monthKeyFromIndex(current - back);
    const value = net.get(key);
    if (value === undefined) continue; // no transactions that month
    totalCents += value;
    months++;
  }
  return months === 0 ? null : { totalCents, months };
}

// ---------- Portfolio, gap, tracking (B.11, B.12) ----------

export type TrackableGoal = { goal: SavingsGoal; requiredCents: number; remainingCents: number };
export type Portfolio = { goals: TrackableGoal[]; requiredTotalCents: number };

export function buildPortfolio(goals: SavingsGoal[], today: Today): Portfolio {
  const trackable: TrackableGoal[] = [];
  for (const goal of goals) {
    const r = requiredMonthlySaving(goal, today);
    if (r.kind !== 'required') continue;
    trackable.push({
      goal,
      requiredCents: r.cents,
      remainingCents: goal.targetAmount.cents - goal.currentAmount.cents,
    });
  }
  return { goals: trackable, requiredTotalCents: trackable.reduce((s, g) => s + g.requiredCents, 0) };
}

export type SavingsGap =
  | { kind: 'none' }
  | { kind: 'requiredOnly'; requiredCents: number }
  | { kind: 'covered'; requiredCents: number; expectedCents: number }
  | { kind: 'gap'; requiredCents: number; expectedCents: number; gapCents: number };

export function savingsGap(portfolio: Portfolio, expected: ExpectedSaving): SavingsGap {
  if (portfolio.goals.length === 0) return { kind: 'none' };
  const required = portfolio.requiredTotalCents;
  if (!expected) return { kind: 'requiredOnly', requiredCents: required };
  const expectedCents = Math.round(expected.totalCents / expected.months);
  // gap = required − total/n > 0  ⇔  required·n > total
  if (required * expected.months <= expected.totalCents) {
    return { kind: 'covered', requiredCents: required, expectedCents };
  }
  const gapCents = Math.ceil((required * expected.months - expected.totalCents) / expected.months);
  return { kind: 'gap', requiredCents: required, expectedCents, gapCents };
}

export type Projection =
  | { kind: 'month'; month: string }
  | { kind: 'beyond50Years' }
  | { kind: 'reached' }
  | { kind: 'unavailable'; reason: 'expired' | 'noHistory' | 'noNetSaving' };

export type GoalTracking = {
  state: TrackingState;
  /** Expected ÷ required saving across all trackable goals, whole percent. Null when not applicable. */
  coveragePercent: number | null;
  requiredCents: number | null;
  projection: Projection;
};

export function goalTracking(
  goal: SavingsGoal,
  portfolio: Portfolio,
  expected: ExpectedSaving,
  today: Today
): GoalTracking {
  const r = requiredMonthlySaving(goal, today);
  if (r.kind === 'completed') {
    return { state: 'completed', coveragePercent: null, requiredCents: 0, projection: { kind: 'reached' } };
  }
  if (r.kind === 'expired') {
    return {
      state: 'expired',
      coveragePercent: null,
      requiredCents: null,
      projection: { kind: 'unavailable', reason: 'expired' },
    };
  }
  if (!expected) {
    return {
      state: 'unknown',
      coveragePercent: null,
      requiredCents: r.cents,
      projection: { kind: 'unavailable', reason: 'noHistory' },
    };
  }

  const required = portfolio.requiredTotalCents;
  const { totalCents, months: n } = expected;
  // Compare E = total/n with R: E ≥ R ⇔ total ≥ R·n; E ≥ 0.75R ⇔ 4·total ≥ 3·R·n.
  let state: TrackingState;
  if (totalCents >= required * n) state = 'onTrack';
  else if (totalCents > 0 && 4 * totalCents >= 3 * required * n) state = 'atRisk';
  else state = 'behind';

  const coveragePercent = required > 0 ? Math.round((Math.max(0, totalCents) / n / required) * 100) : null;

  if (totalCents <= 0) {
    return {
      state,
      coveragePercent,
      requiredCents: r.cents,
      projection: { kind: 'unavailable', reason: 'noNetSaving' },
    };
  }

  // months = ceil(remaining × R_total × n / (total × required_g)) — BigInt, products can exceed 2^53.
  const remaining = BigInt(goal.targetAmount.cents - goal.currentAmount.cents);
  const num = remaining * BigInt(required) * BigInt(n);
  const den = BigInt(totalCents) * BigInt(r.cents);
  const monthsNeeded = (num + den - BigInt(1)) / den;
  if (monthsNeeded > BigInt(MAX_PROJECTION_MONTHS)) {
    return { state, coveragePercent, requiredCents: r.cents, projection: { kind: 'beyond50Years' } };
  }
  const projected = monthIndex(today.year, today.month) + Number(monthsNeeded) - 1;
  return {
    state,
    coveragePercent,
    requiredCents: r.cents,
    projection: { kind: 'month', month: monthKeyFromIndex(projected) },
  };
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** `2027-01` → `Jan 2027`. */
export function formatMonthKey(key: string): string {
  const [y, m] = key.split('-').map(Number);
  return `${MONTH_NAMES[m - 1]} ${y}`;
}

export const STATE_LABEL: Record<TrackingState, string> = {
  completed: 'Reached',
  expired: 'Expired',
  onTrack: 'On track',
  atRisk: 'At risk',
  behind: 'Behind',
  unknown: 'Not enough history',
};
