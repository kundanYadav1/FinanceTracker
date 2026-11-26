import type { Transaction } from '@/db/transactions';

import {
  type BudgetVersion,
  budgetWarnings,
  buildBudgetHistory,
  buildBudgetLines,
  evaluateBudget,
  monthlyBudgetSummary,
  resolveBudgetForMonth,
  shiftMonthKey,
  validateBudgetAmount,
} from './budget';

function version(p: Partial<BudgetVersion> & { effectiveFromMonth: string; amountCents: number | null }): BudgetVersion {
  const categoryId = p.categoryId ?? null;
  return {
    id: `${p.scopeKey ?? 'overall'}-${p.effectiveFromMonth}`,
    scope: categoryId ? 'category' : 'overall',
    categoryId,
    scopeKey: categoryId ?? 'overall',
    currency: 'INR',
    createdAt: '',
    updatedAt: '',
    ...p,
  };
}

function tx(date: string, cents: number, categoryId = 'cat_food', type: 'expense' | 'income' = 'expense'): Transaction {
  return {
    id: `${date}-${cents}-${categoryId}`,
    type,
    amount: { currency: 'INR', cents },
    categoryId,
    date,
    isRecurring: false,
    createdAt: '',
    updatedAt: '',
  };
}

describe('evaluateBudget', () => {
  it('is Healthy below 80%', () => {
    expect(evaluateBudget(10000, 7999).status).toBe('Healthy');
  });
  it('warns at exactly 80% and exactly 100%', () => {
    expect(evaluateBudget(10000, 8000).status).toBe('Warning');
    expect(evaluateBudget(10000, 10000).status).toBe('Warning');
  });
  it('is Exceeded only above 100%', () => {
    expect(evaluateBudget(10000, 10001).status).toBe('Exceeded');
  });
  it('reports remaining and utilization', () => {
    expect(evaluateBudget(300000, 276000)).toEqual({
      status: 'Warning',
      utilizationPercent: 92,
      remainingCents: 24000,
      overspentCents: 0,
    });
  });
  it('never reports negative remaining, and shows the overspend instead', () => {
    expect(evaluateBudget(300000, 336000)).toMatchObject({
      status: 'Exceeded',
      remainingCents: 0,
      overspentCents: 36000,
    });
  });
  it('treats a zero budget as Healthy without spend and Exceeded with spend, with no utilization', () => {
    expect(evaluateBudget(0, 0)).toMatchObject({ status: 'Healthy', utilizationPercent: null });
    expect(evaluateBudget(0, 1)).toMatchObject({ status: 'Exceeded', utilizationPercent: null, overspentCents: 1 });
  });
});

describe('validateBudgetAmount', () => {
  it('accepts zero and the maximum, rejects negative, fractional and too large', () => {
    expect(validateBudgetAmount(0)).toBeNull();
    expect(validateBudgetAmount(9_999_999_999)).toBeNull();
    expect(validateBudgetAmount(-1)).not.toBeNull();
    expect(validateBudgetAmount(1.5)).not.toBeNull();
    expect(validateBudgetAmount(10_000_000_000)).not.toBeNull();
  });
});

describe('resolveBudgetForMonth', () => {
  const versions = [
    version({ effectiveFromMonth: '2026-09', amountCents: 100000 }),
    version({ effectiveFromMonth: '2026-11', amountCents: 150000 }),
  ];
  it('has no budget before the first version', () => {
    expect(resolveBudgetForMonth(versions, 'overall', '2026-08')).toBeNull();
  });
  it('keeps past months at the amount in effect then', () => {
    expect(resolveBudgetForMonth(versions, 'overall', '2026-10')?.amountCents).toBe(100000);
    expect(resolveBudgetForMonth(versions, 'overall', '2026-11')?.amountCents).toBe(150000);
    expect(resolveBudgetForMonth(versions, 'overall', '2027-03')?.amountCents).toBe(150000);
  });
  it('treats a null amount as removed from that month on', () => {
    const removed = [...versions, version({ effectiveFromMonth: '2026-12', amountCents: null })];
    expect(resolveBudgetForMonth(removed, 'overall', '2026-11')?.amountCents).toBe(150000);
    expect(resolveBudgetForMonth(removed, 'overall', '2026-12')).toBeNull();
  });
  it('keeps scopes independent', () => {
    expect(resolveBudgetForMonth(versions, 'cat_food', '2026-11')).toBeNull();
  });
});

describe('buildBudgetLines', () => {
  const versions = [
    version({ effectiveFromMonth: '2026-11', amountCents: 5000000 }),
    version({ effectiveFromMonth: '2026-11', amountCents: 100000, categoryId: 'cat_food' }),
    version({ effectiveFromMonth: '2026-11', amountCents: 100000, categoryId: 'cat_fun' }),
    version({ effectiveFromMonth: '2026-11', amountCents: 100000, categoryId: 'cat_rent' }),
  ];
  const txs = [
    tx('2026-11-02', 120000, 'cat_food'), // exceeded
    tx('2026-11-03', 85000, 'cat_fun'), // warning
    tx('2026-11-04', 10000, 'cat_rent'), // healthy
    tx('2026-10-30', 999999, 'cat_food'), // other month: ignored
    tx('2026-11-05', 777777, 'cat_food', 'income'), // income: ignored
  ];

  it('sums the overall budget across every expense and category budgets per category', () => {
    const lines = buildBudgetLines(versions, txs, '2026-11');
    expect(lines.find((l) => l.scope === 'overall')?.spentCents).toBe(215000);
    expect(lines.find((l) => l.scopeKey === 'cat_food')?.spentCents).toBe(120000);
  });

  it('orders Exceeded, then Warning, then Healthy', () => {
    const order = buildBudgetLines(versions, txs, '2026-11').map((l) => l.status);
    expect(order).toEqual(['Exceeded', 'Warning', 'Healthy', 'Healthy']);
  });

  it('shows spending against a zero budget as over', () => {
    const zero = [version({ effectiveFromMonth: '2026-11', amountCents: 0, categoryId: 'cat_food' })];
    const [line] = buildBudgetLines(zero, [tx('2026-11-02', 100)], '2026-11');
    expect(line.utilizationPercent).toBeNull();
    expect(line.progressPercent).toBeGreaterThan(100);
  });

  it('skips budgets removed for that month', () => {
    const removed = [
      version({ effectiveFromMonth: '2026-10', amountCents: 100000 }),
      version({ effectiveFromMonth: '2026-11', amountCents: null }),
    ];
    expect(buildBudgetLines(removed, [], '2026-11')).toEqual([]);
    expect(buildBudgetLines(removed, [], '2026-10')).toHaveLength(1);
  });
});

describe('buildBudgetHistory', () => {
  it('lists the last months oldest first with the limit that applied then', () => {
    const versions = [
      version({ effectiveFromMonth: '2026-09', amountCents: 100000 }),
      version({ effectiveFromMonth: '2026-11', amountCents: 150000 }),
    ];
    const h = buildBudgetHistory(versions, [tx('2026-10-03', 40000)], 'overall', '2026-11', 4);
    expect(h.map((p) => p.month)).toEqual(['2026-08', '2026-09', '2026-10', '2026-11']);
    expect(h.map((p) => p.amountCents)).toEqual([null, 100000, 100000, 150000]);
    expect(h[2].spentCents).toBe(40000);
  });
});

describe('budgetWarnings', () => {
  const versions = [
    version({ effectiveFromMonth: '2026-11', amountCents: 100000, categoryId: 'cat_shop' }),
    version({ effectiveFromMonth: '2026-11', amountCents: 100000, categoryId: 'cat_food' }),
    version({ effectiveFromMonth: '2026-11', amountCents: 100000, categoryId: 'cat_rent' }),
  ];
  const lines = buildBudgetLines(
    versions,
    [tx('2026-11-02', 92000, 'cat_shop'), tx('2026-11-02', 130000, 'cat_food'), tx('2026-11-02', 100, 'cat_rent')],
    '2026-11',
  );
  const names: Record<string, string> = { cat_shop: 'Shopping budget', cat_food: 'Food budget', cat_rent: 'Rent budget' };

  it('words approaching and exceeded budgets, worst first, skipping healthy ones', () => {
    const w = budgetWarnings(lines, (l) => names[l.scopeKey], (c) => `Rs ${c / 100}`);
    expect(w).toEqual(['Food budget is over by Rs 300.', 'You have used 92% of your Shopping budget.']);
  });
});

describe('shiftMonthKey', () => {
  it('crosses year boundaries', () => {
    expect(shiftMonthKey('2026-01', -1)).toBe('2025-12');
    expect(shiftMonthKey('2026-12', 1)).toBe('2027-01');
  });
});

describe('monthlyBudgetSummary', () => {
  const cat = [
    version({ effectiveFromMonth: '2026-11', amountCents: 100000, categoryId: 'cat_food' }),
    version({ effectiveFromMonth: '2026-11', amountCents: 50000, categoryId: 'cat_fun' }),
  ];
  const txs = [tx('2026-11-02', 30000, 'cat_food'), tx('2026-11-02', 20000, 'cat_other')];

  it('is null without budgets', () => {
    expect(monthlyBudgetSummary([])).toBeNull();
  });
  it('uses the overall budget when set', () => {
    const lines = buildBudgetLines([...cat, version({ effectiveFromMonth: '2026-11', amountCents: 400000 })], txs, '2026-11');
    expect(monthlyBudgetSummary(lines)).toEqual({ limitCents: 400000, spentCents: 50000, percent: 12.5, fromOverall: true });
  });
  it('falls back to the category budgets and only counts their own spending', () => {
    const summary = monthlyBudgetSummary(buildBudgetLines(cat, txs, '2026-11'));
    expect(summary).toEqual({ limitCents: 150000, spentCents: 30000, percent: 20, fromOverall: false });
  });
});
