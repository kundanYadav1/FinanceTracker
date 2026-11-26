import type { SavingsGoal } from '@/db/goals';
import { buildBudgetLines, type BudgetLine } from '@/domain/budget';
import {
  buildPortfolio,
  expectedMonthlySaving,
  goalTracking,
  monthIndex,
  savingsGap,
  toToday,
  type ExpectedSaving,
  type GoalTracking,
  type Portfolio,
  type SavingsGap,
} from '@/domain/goals';
import { monthKey, monthLabel, shiftMonth, toDateKey } from '@/domain/overview';
import type { RecommendationInput } from './types';

export type CategorySpend = {
  categoryId: string;
  /** Expense total this calendar month so far. */
  current: number;
  /** Expense total across the 3 complete months before this one (the "Σ3" of the design). */
  prev3: number;
  /** Expense count flagged Recurring this month. */
  recurringCount: number;
};

export type Context = {
  today: string;
  month: string;
  /** `November` */
  monthName: string;
  /** Complete months from the earliest transaction's month through last month. */
  historyMonths: number;
  categoryName: (id: string) => string;
  spend: CategorySpend[];
  currentExpenseCents: number;
  budgetLines: BudgetLine[];
  portfolio: Portfolio;
  expected: ExpectedSaving;
  gap: SavingsGap;
  goalStates: { goal: SavingsGoal; tracking: GoalTracking }[];
};

/** Everything the rules read, derived once from the in-memory data. Pure: `now` is a parameter. */
export function buildContext(input: RecommendationInput): Context {
  const { now, transactions, categories, budgetVersions, goals } = input;
  const month = monthKey(now);
  const previous = new Set([-1, -2, -3].map((o) => shiftMonth(now, o)));
  const todayParts = toToday(now);

  const spendMap = new Map<string, CategorySpend>();
  let currentExpenseCents = 0;
  let earliest: string | null = null;
  for (const t of transactions) {
    const m = t.date.slice(0, 7);
    if (earliest === null || m < earliest) earliest = m;
    if (t.type !== 'expense') continue;
    const isCurrent = m === month;
    if (!isCurrent && !previous.has(m)) continue;
    const entry = spendMap.get(t.categoryId) ?? {
      categoryId: t.categoryId,
      current: 0,
      prev3: 0,
      recurringCount: 0,
    };
    if (isCurrent) {
      entry.current += t.amount.cents;
      currentExpenseCents += t.amount.cents;
      if (t.isRecurring) entry.recurringCount += 1;
    } else {
      entry.prev3 += t.amount.cents;
    }
    spendMap.set(t.categoryId, entry);
  }

  const historyMonths = earliest === null ? 0 : Math.max(0, monthIndex(now.getFullYear(), now.getMonth() + 1) - monthIdx(earliest));
  const budgetLines = buildBudgetLines(budgetVersions, transactions, month);
  const portfolio = buildPortfolio(goals, todayParts);
  const expected = expectedMonthlySaving(transactions, todayParts);

  return {
    today: toDateKey(now),
    month,
    monthName: monthLabel(now).split(' ')[0],
    historyMonths,
    categoryName: (id) => categories.find((c) => c.id === id)?.name ?? id,
    spend: Array.from(spendMap.values()).sort((a, b) => a.categoryId.localeCompare(b.categoryId)),
    currentExpenseCents,
    budgetLines,
    portfolio,
    expected,
    gap: savingsGap(portfolio, expected),
    goalStates: portfolio.goals.map(({ goal }) => ({
      goal,
      tracking: goalTracking(goal, portfolio, expected, todayParts),
    })),
  };
}

function monthIdx(key: string): number {
  const [y, m] = key.split('-').map(Number);
  return monthIndex(y, m);
}
