import type { Transaction } from '@/db/transactions';

import {
  budgetState,
  dateGroupLabel,
  findInsight,
  groupByDate,
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

describe('budget state', () => {
  it('uses the 80% and 100% thresholds', () => {
    expect(budgetState(79.9)).toBe('ok');
    expect(budgetState(80)).toBe('warn');
    expect(budgetState(100)).toBe('warn');
    expect(budgetState(100.1)).toBe('over');
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
