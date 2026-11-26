import type { Transaction } from '@/db/transactions';

/** Share of a budget at which spending is flagged as approaching the limit (FR-008). */
export const BUDGET_WARNING_PERCENT = 80;
export const MAX_BUDGET_CENTS = 9_999_999_999;
export const OVERALL_SCOPE_KEY = 'overall';

export type BudgetScope = 'overall' | 'category';
export type BudgetStatus = 'Healthy' | 'Warning' | 'Exceeded';

/** One row of the month-effective budget history. `amountCents: null` means "no budget from this month". */
export type BudgetVersion = {
  id: string;
  scope: BudgetScope;
  categoryId: string | null;
  scopeKey: string;
  effectiveFromMonth: string;
  amountCents: number | null;
  currency: string;
  createdAt: string;
  updatedAt: string;
};

export type BudgetEvaluation = {
  status: BudgetStatus;
  /** Spent as a percent of the budget; null for a zero budget. */
  utilizationPercent: number | null;
  remainingCents: number;
  overspentCents: number;
};

export function scopeKeyFor(scope: BudgetScope, categoryId: string | null): string {
  return scope === 'overall' ? OVERALL_SCOPE_KEY : (categoryId ?? '');
}

/**
 * Status of a budget against spending. Exceeded only when spending is strictly above the budget;
 * a zero budget has no utilization and is Healthy at zero spend.
 */
export function evaluateBudget(amountCents: number, spentCents: number): BudgetEvaluation {
  const remainingCents = Math.max(amountCents - spentCents, 0);
  const overspentCents = Math.max(spentCents - amountCents, 0);
  const utilizationPercent = amountCents > 0 ? (spentCents / amountCents) * 100 : null;
  let status: BudgetStatus = 'Healthy';
  if (spentCents > amountCents) status = 'Exceeded';
  else if (amountCents > 0 && spentCents * 100 >= amountCents * BUDGET_WARNING_PERCENT) status = 'Warning';
  return { status, utilizationPercent, remainingCents, overspentCents };
}

/** Validation message for a budget amount in minor units, or null when valid. */
export function validateBudgetAmount(cents: number): string | null {
  if (!Number.isInteger(cents) || cents < 0) return 'Budget cannot be negative.';
  if (cents > MAX_BUDGET_CENTS) return 'Budget is too large.';
  return null;
}

/** `YYYY-MM` shifted by `offset` months. */
export function shiftMonthKey(month: string, offset: number): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + offset, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** The budget in effect for `month`: the latest version starting on or before it, unless it removes the budget. */
export function resolveBudgetForMonth(
  versions: BudgetVersion[],
  scopeKey: string,
  month: string,
): BudgetVersion | null {
  let best: BudgetVersion | null = null;
  for (const v of versions) {
    if (v.scopeKey !== scopeKey || v.effectiveFromMonth > month) continue;
    if (!best || v.effectiveFromMonth > best.effectiveFromMonth) best = v;
  }
  return best && best.amountCents !== null ? best : null;
}

/** Expense total for the month: every expense for the overall budget, one category otherwise. */
export function spentForScope(transactions: Transaction[], scopeKey: string, month: string): number {
  let total = 0;
  for (const t of transactions) {
    if (t.type !== 'expense' || t.date.slice(0, 7) !== month) continue;
    if (scopeKey !== OVERALL_SCOPE_KEY && t.categoryId !== scopeKey) continue;
    total += t.amount.cents;
  }
  return total;
}

export type BudgetLine = BudgetEvaluation & {
  scope: BudgetScope;
  scopeKey: string;
  categoryId: string | null;
  amountCents: number;
  spentCents: number;
  currency: string;
  /** For progress bars: 0 to 100+, with spending against a zero budget shown as over. */
  progressPercent: number;
};

const SEVERITY: Record<BudgetStatus, number> = { Exceeded: 0, Warning: 1, Healthy: 2 };

/** Every budget in effect for `month` with its status, most severe first (overall budget leads ties). */
export function buildBudgetLines(
  versions: BudgetVersion[],
  transactions: Transaction[],
  month: string,
): BudgetLine[] {
  const keys = Array.from(new Set(versions.map((v) => v.scopeKey)));
  const lines: BudgetLine[] = [];
  for (const key of keys) {
    const v = resolveBudgetForMonth(versions, key, month);
    if (!v || v.amountCents === null) continue;
    const spentCents = spentForScope(transactions, key, month);
    const evaluation = evaluateBudget(v.amountCents, spentCents);
    lines.push({
      ...evaluation,
      scope: v.scope,
      scopeKey: key,
      categoryId: v.categoryId,
      amountCents: v.amountCents,
      spentCents,
      currency: v.currency,
      progressPercent: evaluation.utilizationPercent ?? (spentCents > 0 ? 101 : 0),
    });
  }
  return lines.sort(
    (a, b) =>
      SEVERITY[a.status] - SEVERITY[b.status] ||
      (a.scope === b.scope ? 0 : a.scope === 'overall' ? -1 : 1) ||
      a.scopeKey.localeCompare(b.scopeKey),
  );
}

export type BudgetHistoryPoint = { month: string; amountCents: number | null; spentCents: number };

/** Limit versus spending for one scope over the `count` months ending at `endMonth`, oldest first. */
export function buildBudgetHistory(
  versions: BudgetVersion[],
  transactions: Transaction[],
  scopeKey: string,
  endMonth: string,
  count = 6,
): BudgetHistoryPoint[] {
  const points: BudgetHistoryPoint[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const month = shiftMonthKey(endMonth, -i);
    points.push({
      month,
      amountCents: resolveBudgetForMonth(versions, scopeKey, month)?.amountCents ?? null,
      spentCents: spentForScope(transactions, scopeKey, month),
    });
  }
  return points;
}

/** Plain-language warnings for budgets at or over their limit, most severe first. */
export function budgetWarnings(
  lines: BudgetLine[],
  labelFor: (line: BudgetLine) => string,
  formatAmount: (cents: number, currency: string) => string,
  max = 3,
): string[] {
  return lines
    .filter((l) => l.status !== 'Healthy')
    .slice(0, max)
    .map((l) => {
      const label = labelFor(l);
      if (l.status === 'Exceeded') return `${label} is over by ${formatAmount(l.overspentCents, l.currency)}.`;
      return `You have used ${Math.floor(l.utilizationPercent ?? 0)}% of your ${label}.`;
    });
}

export type MonthlyBudgetSummary = { limitCents: number; spentCents: number; percent: number; fromOverall: boolean };

/**
 * The month's headline budget: the overall budget when set, otherwise the combined category budgets
 * (limits and spending of just those categories). Null when no budget applies.
 */
export function monthlyBudgetSummary(lines: BudgetLine[]): MonthlyBudgetSummary | null {
  const overall = lines.find((l) => l.scope === 'overall');
  const chosen = overall ? [overall] : lines;
  if (chosen.length === 0) return null;
  const limitCents = chosen.reduce((s, l) => s + l.amountCents, 0);
  const spentCents = chosen.reduce((s, l) => s + l.spentCents, 0);
  const percent = limitCents > 0 ? (spentCents / limitCents) * 100 : spentCents > 0 ? 101 : 0;
  return { limitCents, spentCents, percent, fromOverall: Boolean(overall) };
}
