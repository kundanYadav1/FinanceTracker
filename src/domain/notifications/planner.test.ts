import type { SavingsGoal } from '@/db/goals';
import type { Transaction } from '@/db/transactions';
import type { BudgetVersion } from '@/domain/budget';
import { hasExpenseOn, parseTime, planNotifications, reachedMilestone, weekKey } from './planner';
import { DEFAULT_NOTIFICATION_SETTINGS } from './types';

jest.mock('@/db/database', () => ({ getDatabase: jest.fn() }));

const now = new Date(2026, 10, 25); // 2026-11-25

function expense(date: string, cents: number, categoryId = 'cat_food'): Transaction {
  return {
    id: `${date}-${cents}`,
    type: 'expense',
    amount: { currency: 'INR', cents },
    categoryId,
    date,
    isRecurring: false,
    createdAt: date,
    updatedAt: date,
  };
}

function budget(amountCents: number): BudgetVersion {
  return {
    id: 'b1',
    scope: 'overall',
    categoryId: null,
    scopeKey: 'overall',
    effectiveFromMonth: '2026-11',
    amountCents,
    currency: 'INR',
    createdAt: '',
    updatedAt: '',
  };
}

function goal(saved: number, target: number, targetDate = '2027-11-25'): SavingsGoal {
  return {
    id: 'g1',
    name: 'Trip',
    targetAmount: { currency: 'INR', cents: target },
    currentAmount: { currency: 'INR', cents: saved },
    targetDate,
    priority: 'medium',
    status: 'active',
    createdAt: '',
    updatedAt: '',
  };
}

const base = {
  settings: DEFAULT_NOTIFICATION_SETTINGS,
  transactions: [] as Transaction[],
  budgetVersions: [] as BudgetVersion[],
  goals: [] as SavingsGoal[],
  sent: new Set<string>(),
  now,
};

describe('planNotifications budgets', () => {
  it('warns at 80% and exceeds above 100%, without amounts', () => {
    const warn = planNotifications({ ...base, budgetVersions: [budget(10000)], transactions: [expense('2026-11-10', 8000)] });
    expect(warn).toHaveLength(1);
    expect(warn[0].dedupeKey).toBe('budget:overall:2026-11:Warning');
    const over = planNotifications({ ...base, budgetVersions: [budget(10000)], transactions: [expense('2026-11-10', 10001)] });
    expect(over[0].dedupeKey).toBe('budget:overall:2026-11:Exceeded');
    for (const n of [...warn, ...over]) expect(`${n.title} ${n.body}`).not.toMatch(/\d{3,}|₹|Rs/);
  });

  it('stays silent when healthy, already sent, or disabled', () => {
    const input = { ...base, budgetVersions: [budget(10000)], transactions: [expense('2026-11-10', 5000)] };
    expect(planNotifications(input)).toHaveLength(0);
    const hot = { ...input, transactions: [expense('2026-11-10', 9000)] };
    expect(planNotifications({ ...hot, sent: new Set(['budget:overall:2026-11:Warning']) })).toHaveLength(0);
    expect(planNotifications({ ...hot, settings: { ...DEFAULT_NOTIFICATION_SETTINGS, budget: false } })).toHaveLength(0);
  });
});

describe('planNotifications goals', () => {
  it('fires a milestone achievement once', () => {
    const goals = [goal(50000, 100000)];
    const first = planNotifications({ ...base, goals });
    expect(first.find((n) => n.type === 'achievement')?.dedupeKey).toBe('ach:g1:50');
    const again = planNotifications({ ...base, goals, sent: new Set(['ach:g1:50']) });
    expect(again.find((n) => n.type === 'achievement')).toBeUndefined();
  });

  it('fires completion achievement and no reminder for a completed goal', () => {
    const out = planNotifications({ ...base, goals: [goal(100000, 100000)] });
    expect(out.map((n) => n.dedupeKey)).toEqual(['ach:g1:100']);
  });

  it('sends a weekly reminder for a goal that is behind pace', () => {
    // Required ~100000/13 per month; history shows net saving of zero in October.
    const transactions = [expense('2026-10-10', 5000)];
    const out = planNotifications({ ...base, goals: [goal(0, 1_300_000)], transactions });
    const reminder = out.find((n) => n.type === 'goal');
    expect(reminder?.dedupeKey).toBe(`goalrem:g1:${weekKey(now)}`);
  });
});

describe('helpers', () => {
  it('reachedMilestone picks the highest passed', () => {
    expect(reachedMilestone(10, false)).toBeNull();
    expect(reachedMilestone(76, false)).toBe(75);
    expect(reachedMilestone(99.9, true)).toBe(100);
  });

  it('weekKey is the Monday of the week', () => {
    expect(weekKey(new Date(2026, 10, 25))).toBe('2026-11-23');
    expect(weekKey(new Date(2026, 10, 29))).toBe('2026-11-23');
  });

  it('hasExpenseOn only counts expenses on that date', () => {
    expect(hasExpenseOn([expense('2026-11-25', 1)], '2026-11-25')).toBe(true);
    expect(hasExpenseOn([expense('2026-11-24', 1)], '2026-11-25')).toBe(false);
  });

  it('parseTime falls back on invalid input', () => {
    expect(parseTime('07:45')).toEqual({ hour: 7, minute: 45 });
    expect(parseTime('99:99')).toEqual({ hour: 20, minute: 0 });
  });
});
