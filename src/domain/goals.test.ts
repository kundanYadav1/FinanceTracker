import type { SavingsGoal } from '@/db/goals';
import type { Transaction } from '@/db/transactions';

import {
  buildPortfolio,
  expectedMonthlySaving,
  goalProgress,
  goalTracking,
  requiredMonthlySaving,
  savingsGap,
} from './goals';

const today = { year: 2026, month: 11, day: 6 };

function goal(p: { target: number; saved: number; date: string; id?: string }): SavingsGoal {
  return {
    id: p.id ?? 'g',
    name: 'G',
    targetAmount: { currency: 'INR', cents: p.target },
    currentAmount: { currency: 'INR', cents: p.saved },
    targetDate: p.date,
    priority: 'medium',
    status: 'active',
    createdAt: '',
    updatedAt: '',
  };
}

/** One income (or expense when negative) transaction per month key. */
function net(entries: Record<string, number>): Transaction[] {
  return Object.entries(entries).map(
    ([month, cents], i) =>
      ({
        id: String(i),
        type: cents >= 0 ? 'income' : 'expense',
        amount: { currency: 'INR', cents: Math.abs(cents) },
        date: `${month}-10`,
      }) as unknown as Transaction
  );
}

describe('goalProgress', () => {
  it('computes percent and remaining', () => {
    expect(goalProgress(goal({ target: 10_000_000, saved: 2_500_000, date: '2026-12-31' }))).toEqual({
      remainingCents: 7_500_000,
      percent: 25,
      completed: false,
    });
  });
  it('never shows 100 before completion', () => {
    expect(goalProgress(goal({ target: 100_000, saved: 99_999, date: '2026-12-31' })).percent).toBe(99.9);
  });
  it('caps completed goals', () => {
    expect(goalProgress(goal({ target: 100, saved: 500, date: '2026-12-31' }))).toEqual({
      remainingCents: 0,
      percent: 100,
      completed: true,
    });
  });
});

describe('requiredMonthlySaving', () => {
  it('spreads remaining over months including the current one (design example)', () => {
    expect(requiredMonthlySaving(goal({ target: 10_000_000, saved: 2_500_000, date: '2026-12-31' }), today)).toEqual({
      kind: 'required',
      cents: 3_750_000,
      months: 2,
    });
  });
  it('rounds up', () => {
    const r = requiredMonthlySaving(goal({ target: 1_000_001, saved: 0, date: '2027-01-15' }), today);
    expect(r).toMatchObject({ kind: 'required', cents: 333_334, months: 3 });
  });
  it('treats the target date today as one period, not expired', () => {
    expect(requiredMonthlySaving(goal({ target: 500, saved: 0, date: '2026-11-06' }), today)).toMatchObject({
      kind: 'required',
      cents: 500,
      months: 1,
    });
  });
  it('reports expired and completed', () => {
    expect(requiredMonthlySaving(goal({ target: 500, saved: 0, date: '2026-11-05' }), today).kind).toBe('expired');
    expect(requiredMonthlySaving(goal({ target: 500, saved: 500, date: '2026-11-05' }), today).kind).toBe('completed');
  });
});

describe('expectedMonthlySaving', () => {
  it('is null without complete months', () => {
    expect(expectedMonthlySaving([], today)).toBeNull();
    expect(expectedMonthlySaving(net({ '2026-11': 5_000 }), today)).toBeNull();
  });
  it('averages up to 3 most recent months that have transactions, skipping empty months', () => {
    const tx = net({ '2026-10': 1_400_000, '2026-09': 1_650_000, '2026-07': 1_450_000, '2026-06': 9_000_000 });
    expect(expectedMonthlySaving(tx, today)).toEqual({ totalCents: 4_500_000, months: 3 });
  });
  it('ignores months older than 12', () => {
    expect(expectedMonthlySaving(net({ '2025-10': 100 }), today)).toBeNull();
  });
  it('can be negative', () => {
    expect(expectedMonthlySaving(net({ '2026-10': -500 }), today)).toEqual({ totalCents: -500, months: 1 });
  });
});

describe('savingsGap', () => {
  const g1 = goal({ id: 'a', target: 2_000_000, saved: 0, date: '2026-12-31' }); // 1,000,000 x2
  const g2 = goal({ id: 'b', target: 1_750_000, saved: 0, date: '2026-12-31' }); // 875,000
  const portfolio = buildPortfolio([g1, g2], today);

  it('matches the design example', () => {
    expect(portfolio.requiredTotalCents).toBe(1_875_000);
    expect(savingsGap(portfolio, { totalCents: 4_500_000, months: 3 })).toEqual({
      kind: 'gap',
      requiredCents: 1_875_000,
      expectedCents: 1_500_000,
      gapCents: 375_000,
    });
  });
  it('is covered when saving meets need', () => {
    expect(savingsGap(portfolio, { totalCents: 1_875_000, months: 1 }).kind).toBe('covered');
  });
  it('states the requirement only when history is missing, none when no goals', () => {
    expect(savingsGap(portfolio, null)).toEqual({ kind: 'requiredOnly', requiredCents: 1_875_000 });
    expect(savingsGap(buildPortfolio([], today), null).kind).toBe('none');
  });
});

describe('goalTracking', () => {
  const g = goal({ target: 10_000_000, saved: 2_500_000, date: '2026-12-31' });
  const portfolio = buildPortfolio([g], today); // required 3,750,000

  it('At Risk at 80% coverage, projecting Jan 2027 (design example)', () => {
    const t = goalTracking(g, portfolio, { totalCents: 3_000_000, months: 1 }, today);
    expect(t.state).toBe('atRisk');
    expect(t.coveragePercent).toBe(80);
    expect(t.projection).toEqual({ kind: 'month', month: '2027-01' });
  });
  it('On Track when saving equals the requirement and projects the target month', () => {
    const t = goalTracking(g, portfolio, { totalCents: 3_750_000, months: 1 }, today);
    expect(t.state).toBe('onTrack');
    expect(t.projection).toEqual({ kind: 'month', month: '2026-12' });
  });
  it('75% is At Risk, just below is Behind', () => {
    expect(goalTracking(g, portfolio, { totalCents: 2_812_500, months: 1 }, today).state).toBe('atRisk');
    expect(goalTracking(g, portfolio, { totalCents: 2_812_499, months: 1 }, today).state).toBe('behind');
  });
  it('negative saving is Behind with no projection', () => {
    const t = goalTracking(g, portfolio, { totalCents: -100, months: 1 }, today);
    expect(t.state).toBe('behind');
    expect(t.projection).toEqual({ kind: 'unavailable', reason: 'noNetSaving' });
  });
  it('no history has no state', () => {
    const t = goalTracking(g, portfolio, null, today);
    expect(t.state).toBe('unknown');
    expect(t.projection).toEqual({ kind: 'unavailable', reason: 'noHistory' });
  });
  it('completed and expired goals', () => {
    const done = goal({ target: 100, saved: 100, date: '2026-12-31' });
    expect(goalTracking(done, portfolio, null, today).state).toBe('completed');
    const old = goal({ target: 100, saved: 0, date: '2026-01-01' });
    expect(goalTracking(old, portfolio, null, today).state).toBe('expired');
  });
  it('more than 50 years at a tiny pace', () => {
    const big = goal({ target: 9_000_000_000, saved: 0, date: '2026-12-31' });
    const t = goalTracking(big, buildPortfolio([big], today), { totalCents: 1, months: 1 }, today);
    expect(t.projection).toEqual({ kind: 'beyond50Years' });
  });

  it('property: projection is on/before target iff saving covers the requirement', () => {
    const goals = [
      goal({ id: 'a', target: 5_000_000, saved: 100_000, date: '2027-03-31' }),
      goal({ id: 'b', target: 1_200_000, saved: 0, date: '2026-12-15' }),
    ];
    const pf = buildPortfolio(goals, today);
    for (const total of [500_000, 1_000_000, 2_000_000, 3_000_000, 5_000_000, 9_000_000]) {
      for (const goalItem of goals) {
        const t = goalTracking(goalItem, pf, { totalCents: total, months: 1 }, today);
        if (t.projection.kind !== 'month') continue;
        const target = goalItem.targetDate.slice(0, 7);
        if (total >= pf.requiredTotalCents) expect(t.projection.month <= target).toBe(true);
        else expect(t.projection.month >= target).toBe(true);
      }
    }
  });
});
