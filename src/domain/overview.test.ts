import type { Budget } from '@/db/budgets';
import type { Transaction } from '@/db/transactions';

import {
  budgetState,
  buildBudgetView,
  dateGroupLabel,
  findInsight,
  groupByDate,
  monthlyLimit,
  sumMonth,
} from './overview';

jest.mock('@/db/database', () => ({ getDatabase: jest.fn() }));

const now = new Date(2026, 10, 25); // 25 Nov 2026

function tx(p: Partial<Transaction> & { date: string; cents: number }): Transaction {
  return {
    id: `${p.date}-${p.cents}-${p.categoryId ?? 'cat_food'}`,
    type: p.type ?? 'expense',
    amount: { currency: 'INR', cents: p.cents },
    categoryId: p.categoryId ?? 'cat_food',
    date: p.date,
    isRecurring: false,
    createdAt: '',
    updatedAt: '',
  };
}

const budget: Budget = {
  id: 'b1',
  categoryId: 'cat_food',
  amount: { currency: 'INR', cents: 1500000 },
  periodStart: '2026-11-01',
  periodEnd: '2026-11-30',
  createdAt: '',
  updatedAt: '',
};

describe('budget state', () => {
  it('uses the 80% and 100% thresholds', () => {
    expect(budgetState(79.9)).toBe('ok');
    expect(budgetState(80)).toBe('warn');
    expect(budgetState(100)).toBe('warn');
    expect(budgetState(100.1)).toBe('over');
  });

  it('reports amount over or left in words', () => {
    const over = buildBudgetView(budget, [tx({ date: '2026-11-03', cents: 1845000 })]);
    expect(over.state).toBe('over');
    expect(over.detail).toBe('Rs 3,450 over');
    const ok = buildBudgetView(budget, [tx({ date: '2026-11-03', cents: 300000 })]);
    expect(ok.detail).toBe('Rs 12,000 left');
  });

  it('ignores spending outside the period or in other categories', () => {
    const v = buildBudgetView(budget, [
      tx({ date: '2026-10-31', cents: 500000 }),
      tx({ date: '2026-11-05', cents: 500000, categoryId: 'cat_rent' }),
    ]);
    expect(v.spentCents).toBe(0);
  });
});

describe('monthly limit', () => {
  it('is null without an active budget', () => {
    expect(monthlyLimit([budget], [], '2026-12-02')).toBeNull();
  });
  it('sums limit and spending of active budgets', () => {
    const m = monthlyLimit([budget], [tx({ date: '2026-11-03', cents: 750000 })], '2026-11-25');
    expect(m).toEqual({ limitCents: 1500000, spentCents: 750000, percent: 50 });
  });
});

describe('grouping and totals', () => {
  it('labels today, yesterday and older days', () => {
    expect(dateGroupLabel('2026-11-25', now)).toBe('Today');
    expect(dateGroupLabel('2026-11-24', now)).toBe('Yesterday');
    expect(dateGroupLabel('2026-11-01', now)).toBe('1 Nov');
  });

  it('groups newest first with a net total', () => {
    const groups = groupByDate(
      [
        tx({ date: '2026-11-01', cents: 8500000, type: 'income' }),
        tx({ date: '2026-11-25', cents: 28000 }),
        tx({ date: '2026-11-25', cents: 4000 }),
      ],
      now,
    );
    expect(groups.map((g) => g.label)).toEqual(['Today', '1 Nov']);
    expect(groups[0].netCents).toBe(-32000);
  });

  it('sums a month by type', () => {
    const list = [tx({ date: '2026-11-02', cents: 100 }), tx({ date: '2026-10-02', cents: 900 })];
    expect(sumMonth(list, 'expense', '2026-11')).toBe(100);
  });
});

describe('findInsight', () => {
  const categories = [{ id: 'cat_food', type: 'expense' as const, name: 'Food', color: '', isDefault: true }];
  const history = [
    tx({ date: '2026-10-10', cents: 1500000 }),
    tx({ date: '2026-09-10', cents: 1500000 }),
    tx({ date: '2026-08-10', cents: 1500000 }),
  ];

  it('flags a category at least 15% above its 3-month average', () => {
    const i = findInsight([...history, tx({ date: '2026-11-03', cents: 1845000 })], categories, now);
    expect(i).toMatchObject({ categoryName: 'Food', percentAbove: 23, savingCents: 345000 });
  });

  it('returns null when spending is near the average', () => {
    expect(findInsight([...history, tx({ date: '2026-11-03', cents: 1600000 })], categories, now)).toBeNull();
  });

  it('returns null without history to compare against', () => {
    expect(findInsight([tx({ date: '2026-11-03', cents: 1845000 })], categories, now)).toBeNull();
  });
});
