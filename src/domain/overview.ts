import { BUDGET_WARNING_PERCENT } from '@/domain/budget';
import type { Category } from '@/db/seed';
import type { Transaction } from '@/db/transactions';
import type { Money } from '@/utils/money';

export const DEFAULT_CURRENCY = 'INR';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** Local calendar date as YYYY-MM-DD. */
export function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function monthKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

/** Month key `offset` months before (negative) or after `d`. */
export function shiftMonth(d: Date, offset: number): string {
  return monthKey(new Date(d.getFullYear(), d.getMonth() + offset, 1));
}

export function monthLabel(d: Date): string {
  return `${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][d.getMonth()]} ${d.getFullYear()}`;
}

/** `20 Nov`, or `Today` / `Yesterday` relative to `now`. */
export function dateGroupLabel(dateKey: string, now: Date): string {
  if (dateKey === toDateKey(now)) return 'Today';
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  if (dateKey === toDateKey(yesterday)) return 'Yesterday';
  const [, m, d] = dateKey.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]}`;
}

export function daysLeftInMonth(now: Date): number {
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return last - now.getDate();
}

function inMonth(t: Transaction, key: string): boolean {
  return t.date.slice(0, 7) === key;
}

export function sumMonth(transactions: Transaction[], type: 'income' | 'expense', key: string): number {
  return transactions
    .filter((t) => t.type === type && inMonth(t, key))
    .reduce((sum, t) => sum + t.amount.cents, 0);
}

export type DateGroup = { dateKey: string; label: string; netCents: number; rows: Transaction[] };

/** Group transactions by day, newest day first. `netCents` is income minus expenses. */
export function groupByDate(transactions: Transaction[], now: Date): DateGroup[] {
  const map = new Map<string, Transaction[]>();
  for (const t of transactions) {
    const key = t.date.slice(0, 10);
    const list = map.get(key);
    if (list) list.push(t);
    else map.set(key, [t]);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => (a < b ? 1 : a > b ? -1 : 0))
    .map(([dateKey, rows]) => ({
      dateKey,
      label: dateGroupLabel(dateKey, now),
      netCents: rows.reduce((s, t) => s + (t.type === 'income' ? t.amount.cents : -t.amount.cents), 0),
      rows,
    }));
}

/** Progress-bar state for a percent of budget used (80% warns, strictly above 100% is over). */
export function budgetState(percent: number): 'ok' | 'warn' | 'over' {
  return percent > 100 ? 'over' : percent >= BUDGET_WARNING_PERCENT ? 'warn' : 'ok';
}

export type Insight = {
  categoryName: string;
  percentAbove: number;
  thisMonthCents: number;
  averageCents: number;
  savingCents: number;
};

/**
 * Deterministic rule: the expense category whose spending this month is at least 15% above its
 * average over the previous three months. Returns the largest overspend, or null.
 */
export function findInsight(transactions: Transaction[], categories: Category[], now: Date): Insight | null {
  const current = monthKey(now);
  const previous = [-1, -2, -3].map((o) => shiftMonth(now, o));
  const totals = new Map<string, { now: number; prev: number }>();
  for (const t of transactions) {
    if (t.type !== 'expense') continue;
    const m = t.date.slice(0, 7);
    const entry = totals.get(t.categoryId) ?? { now: 0, prev: 0 };
    if (m === current) entry.now += t.amount.cents;
    else if (previous.includes(m)) entry.prev += t.amount.cents;
    else continue;
    totals.set(t.categoryId, entry);
  }
  let best: Insight | null = null;
  for (const [categoryId, { now: n, prev }] of totals) {
    const average = Math.round(prev / 3);
    if (average <= 0 || n < average * 1.15) continue;
    const saving = n - average;
    if (!best || saving > best.savingCents) {
      best = {
        categoryName: categories.find((c) => c.id === categoryId)?.name ?? categoryId,
        percentAbove: Math.round(((n - average) / average) * 100),
        thisMonthCents: n,
        averageCents: average,
        savingCents: saving,
      };
    }
  }
  return best;
}

export function money(cents: number, currency = DEFAULT_CURRENCY): Money {
  return { currency, cents };
}
