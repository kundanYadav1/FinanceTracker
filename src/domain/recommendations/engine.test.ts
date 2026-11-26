import type { Category } from '@/db/seed';
import type { SavingsGoal } from '@/db/goals';
import type { Transaction } from '@/db/transactions';
import type { BudgetVersion } from '@/domain/budget';

import { BANNED_PHRASES, evaluateRecommendations, maskAmounts } from './index';
import type { Recommendation, RecommendationInput } from './types';

const NOW = new Date(2026, 10, 15); // 15 Nov 2026

const categories: Category[] = [
  ['cat_food', 'Food'],
  ['cat_groceries', 'Groceries'],
  ['cat_shopping', 'Shopping'],
  ['cat_subscriptions', 'Subscriptions'],
  ['cat_rent', 'Rent'],
  ['cat_salary', 'Salary'],
].map(([id, name]) => ({ id, name, type: id === 'cat_salary' ? 'income' : 'expense', color: '', isDefault: true }));

let n = 0;
function tx(date: string, cents: number, categoryId = 'cat_food', type: 'expense' | 'income' = 'expense', isRecurring = false): Transaction {
  n += 1;
  return { id: `t${n}`, type, amount: { currency: 'INR', cents }, categoryId, date, isRecurring, createdAt: '', updatedAt: '' };
}

/** The same expense in each of Aug, Sep and Oct 2026. */
function history(cents: number, categoryId = 'cat_food'): Transaction[] {
  return ['2026-08-10', '2026-09-10', '2026-10-10'].map((d) => tx(d, cents, categoryId));
}

function budget(categoryId: string | null, amountCents: number): BudgetVersion {
  return {
    id: `b-${categoryId ?? 'overall'}`,
    scope: categoryId ? 'category' : 'overall',
    categoryId,
    scopeKey: categoryId ?? 'overall',
    effectiveFromMonth: '2026-01',
    amountCents,
    currency: 'INR',
    createdAt: '',
    updatedAt: '',
  };
}

function goal(p: Partial<SavingsGoal> = {}): SavingsGoal {
  return {
    id: 'g1',
    name: 'Emergency fund',
    targetAmount: { currency: 'INR', cents: 12_000_000 },
    currentAmount: { currency: 'INR', cents: 0 },
    targetDate: '2027-10-30',
    priority: 'high',
    status: 'active',
    createdAt: '',
    updatedAt: '',
    ...p,
  };
}

function run(p: Partial<RecommendationInput>) {
  return evaluateRecommendations({ now: NOW, transactions: [], categories, budgetVersions: [], goals: [], ...p });
}

const byRule = (recs: Recommendation[], id: string) => recs.filter((r) => r.ruleId === id);

describe('history sufficiency', () => {
  it('stays silent about spending and explains why when there are fewer than 3 months', () => {
    const r = run({ transactions: [tx('2026-10-10', 100_000), tx('2026-11-03', 900_000)] });
    expect(r.recommendations).toEqual([]);
    expect(r.notices.map((x) => x.id)).toContain('NEEDS_HISTORY');
    expect(r.notices.find((x) => x.id === 'NEEDS_HISTORY')?.text).toContain('You have 1.');
  });

  it('says all clear when history is enough and nothing triggers', () => {
    const r = run({ transactions: [...history(500_000), tx('2026-11-03', 500_000)], budgetVersions: [budget(null, 5_000_000)] });
    expect(r.recommendations).toEqual([]);
    expect(r.notices.map((x) => x.id)).toEqual(['ALL_CLEAR']);
  });

  it('asks for a budget or goal when there are none', () => {
    expect(run({}).notices.map((x) => x.id)).toContain('NO_GOALS_OR_BUDGETS');
  });
});

describe('ANOM-DISC / ANOM-INFO', () => {
  it('flags discretionary spending above the 3-month average, with an upper-bound saving', () => {
    const h = [tx('2026-08-10', 450_000), tx('2026-09-10', 520_000), tx('2026-10-10', 500_000)];
    const [rec] = run({ transactions: [...h, tx('2026-11-05', 620_000)] }).recommendations;
    expect(rec).toMatchObject({ ruleId: 'ANOM-DISC', kind: 'suggestion', priority: 'medium', key: 'ANOM-DISC:cat_food:2026-11' });
    expect(rec.reason).toContain('26.5% more than your 3-month average of Rs 4,900');
    expect(rec.potentialSavings).toEqual({ upToCents: 130_000, basis: expect.any(String) });
  });

  it('triggers at exactly 20% and not one paisa below', () => {
    const at = run({ transactions: [...history(1_000_000), tx('2026-11-05', 1_200_000)] });
    const below = run({ transactions: [...history(1_000_000), tx('2026-11-05', 1_199_999)] });
    expect(byRule(at.recommendations, 'ANOM-DISC')).toHaveLength(1);
    expect(below.recommendations).toEqual([]);
  });

  it('ignores a 20% rise that is under the Rs 500 floor', () => {
    expect(run({ transactions: [...history(100_000), tx('2026-11-05', 120_000)] }).recommendations).toEqual([]);
  });

  it('never compares against a zero average', () => {
    const r = run({ transactions: [tx('2026-08-10', 1000, 'cat_rent'), tx('2026-11-05', 900_000)] });
    expect(r.recommendations).toEqual([]);
  });

  it('gives essential categories facts only, with no reduction advice or saving', () => {
    const [rec] = run({ transactions: [...history(1_000_000, 'cat_groceries'), tx('2026-11-05', 1_400_000, 'cat_groceries')] }).recommendations;
    expect(rec).toMatchObject({ ruleId: 'ANOM-INFO', kind: 'insight', priority: 'low', suggestedAction: null, potentialSavings: null });
    expect(rec.note).toContain('may be expected');
  });

  it('adds subscription metrics to the Subscriptions card', () => {
    const txs = [...history(100_000, 'cat_subscriptions'), tx('2026-11-02', 200_000, 'cat_subscriptions', 'expense', true)];
    const [rec] = run({ transactions: txs }).recommendations;
    const labels = rec.supportingMetrics.map((m) => m.label);
    expect(rec.ruleId).toBe('ANOM-DISC');
    expect(labels).toEqual(expect.arrayContaining(['Share of this month’s spending', 'Marked as recurring']));
  });
});

describe('budget rules', () => {
  it('warns at 80% and not at 79.99%', () => {
    const warn = run({ transactions: [tx('2026-11-03', 80_000)], budgetVersions: [budget('cat_food', 100_000)] });
    const ok = run({ transactions: [tx('2026-11-03', 79_999)], budgetVersions: [budget('cat_food', 100_000)] });
    expect(warn.recommendations[0]).toMatchObject({ ruleId: 'BUD-WARN', priority: 'medium', kind: 'suggestion' });
    expect(ok.recommendations).toEqual([]);
  });

  it('reports an exceeded budget as high priority with the overspend', () => {
    const [rec] = run({ transactions: [tx('2026-11-03', 336_000)], budgetVersions: [budget('cat_food', 300_000)] }).recommendations;
    expect(rec).toMatchObject({ ruleId: 'BUD-OVER', priority: 'high', magnitude: 36_000 });
    expect(rec.reason).toContain('Rs 3,360 of your Rs 3,000 Food budget this month — Rs 360 over');
  });

  it('does not suggest cutting an essential category, only reviewing the budget', () => {
    const [rec] = run({ transactions: [tx('2026-11-03', 120_000, 'cat_rent')], budgetVersions: [budget('cat_rent', 100_000)] }).recommendations;
    expect(rec).toMatchObject({ ruleId: 'BUD-OVER', kind: 'insight' });
    expect(rec.suggestedAction).toBeNull();
    expect(rec.note).toContain('adjust the budget');
    expect(rec.note).not.toMatch(/holding off|cutting|reduc/i);
  });

  it('names the biggest discretionary categories for an overall overspend', () => {
    const [rec] = run({
      transactions: [tx('2026-11-03', 600_000, 'cat_shopping'), tx('2026-11-04', 300_000, 'cat_rent'), tx('2026-11-04', 200_000)],
      budgetVersions: [budget(null, 1_000_000)],
    }).recommendations;
    expect(rec.suggestedAction).toContain('Shopping, Food');
    expect(rec.suggestedAction).not.toContain('Rent');
  });

  it('merges a same-category anomaly into the exceeded budget card', () => {
    const r = run({ transactions: [...history(500_000), tx('2026-11-05', 700_000)], budgetVersions: [budget('cat_food', 600_000)] });
    expect(r.recommendations).toHaveLength(1);
    expect(r.recommendations[0]).toMatchObject({ ruleId: 'BUD-OVER' });
    expect(r.recommendations[0].potentialSavings?.upToCents).toBe(200_000);
  });
});

describe('GAP and goal risk', () => {
  // Aug–Oct: income 25,000, food 20,000, so saving Rs 5,000/month. Goal needs Rs 10,000/month.
  const earn = ['2026-08-01', '2026-09-01', '2026-10-01'].map((d) => tx(d, 2_500_000, 'cat_salary', 'income'));
  const base = [...earn, ...history(2_000_000)];

  it('reports the gap, names discretionary categories and the at-risk goal', () => {
    const [rec] = run({ transactions: base, goals: [goal()] }).recommendations;
    expect(rec).toMatchObject({ ruleId: 'GAP', priority: 'high', kind: 'suggestion', magnitude: 500_000 });
    expect(rec.reason).toContain('need Rs 10,000/month');
    expect(rec.reason).toContain('Emergency fund');
    expect(rec.suggestedAction).toContain('Food (about Rs 20,000/month)');
    expect(rec.suggestedAction).not.toContain('Rent');
  });

  it('adds anomaly savings to the gap card and raises the anomaly to high priority', () => {
    const r = run({ transactions: [...base, tx('2026-11-05', 2_600_000)], goals: [goal()] });
    expect(r.recommendations.map((x) => x.ruleId)).toEqual(['GAP', 'ANOM-DISC']);
    expect(r.recommendations[0].potentialSavings?.upToCents).toBe(600_000);
    expect(r.recommendations[1].priority).toBe('high');
  });

  it('is silent when saving covers the goal', () => {
    const goalSmall = goal({ targetAmount: { currency: 'INR', cents: 600_000 } });
    expect(run({ transactions: base, goals: [goalSmall] }).recommendations).toEqual([]);
  });

  it('gives the required saving only when there is no complete month yet', () => {
    const [rec] = run({ transactions: [tx('2026-11-03', 100_000)], goals: [goal()] }).recommendations;
    expect(rec).toMatchObject({ ruleId: 'GAP-INFO', kind: 'insight', priority: 'low', suggestedAction: null });
  });

  it('ignores completed and expired goals', () => {
    const done = goal({ currentAmount: { currency: 'INR', cents: 12_000_000 } });
    const past = goal({ id: 'g2', targetDate: '2026-01-01' });
    expect(run({ transactions: base, goals: [done, past] }).recommendations).toEqual([]);
  });
});

describe('ordering, determinism and wording', () => {
  const rich: RecommendationInput = {
    now: NOW,
    categories,
    goals: [goal()],
    budgetVersions: [budget('cat_food', 2_500_000), budget('cat_rent', 100_000), budget(null, 9_000_000)],
    transactions: [
      ...['2026-08-01', '2026-09-01', '2026-10-01'].map((d) => tx(d, 2_500_000, 'cat_salary', 'income')),
      ...history(2_000_000),
      ...history(1_000_000, 'cat_groceries'),
      ...history(100_000, 'cat_subscriptions'),
      tx('2026-11-02', 2_800_000),
      tx('2026-11-03', 120_000, 'cat_rent'),
      tx('2026-11-04', 1_500_000, 'cat_groceries'),
      tx('2026-11-05', 300_000, 'cat_subscriptions', 'expense', true),
    ],
  };

  it('is deterministic and sorted by priority then rule rank', () => {
    const a = evaluateRecommendations(rich);
    const b = evaluateRecommendations({ ...rich, transactions: [...rich.transactions].reverse() });
    expect(b).toEqual(a);
    const order = { high: 0, medium: 1, low: 2 } as const;
    const priorities = a.recommendations.map((r) => order[r.priority]);
    expect([...priorities].sort()).toEqual(priorities);
    expect(new Set(a.recommendations.map((r) => r.key)).size).toBe(a.recommendations.length);
  });

  it('uses no promise or advice wording and always labels savings as upper-bound estimates', () => {
    const { recommendations } = evaluateRecommendations(rich);
    expect(recommendations.length).toBeGreaterThanOrEqual(4);
    for (const r of recommendations) {
      const text = [r.title, r.reason, r.suggestedAction, r.note, r.potentialSavings?.basis, r.explanation.condition]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      for (const phrase of BANNED_PHRASES) expect(text).not.toContain(phrase);
      if (r.kind === 'insight') {
        expect(r.suggestedAction).toBeNull();
        expect(r.potentialSavings).toBeNull();
      }
      expect(r.explanation.ruleName.length).toBeGreaterThan(0);
    }
  });

  it('masks rupee amounts', () => {
    expect(maskAmounts('You spent Rs 1,23,456.50 of Rs 500')).toBe('You spent Rs •••• of Rs ••••');
  });
});
