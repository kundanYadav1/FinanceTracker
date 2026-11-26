import { STATE_LABEL, formatMonthKey } from '@/domain/goals';
import { spendingClassOf } from '../categoryClass';
import type { Context } from '../context';
import { GAP_TOP_CATEGORIES, RULE_VERSION } from '../thresholds';
import { rs } from '../text';
import type { Metric, Recommendation } from '../types';

/** Discretionary categories ranked by their average monthly spend over the available history. */
function topDiscretionaryAverages(ctx: Context): { name: string; avgCents: number }[] {
  const n = Math.max(1, Math.min(3, ctx.historyMonths));
  return ctx.spend
    .filter((s) => s.prev3 > 0 && spendingClassOf(s.categoryId) === 'discretionary')
    .map((s) => ({ id: s.categoryId, avgCents: Math.floor(s.prev3 / n) }))
    .sort((a, b) => b.avgCents - a.avgCents || a.id.localeCompare(b.id))
    .slice(0, GAP_TOP_CATEGORIES)
    .map((s) => ({ name: ctx.categoryName(s.id), avgCents: s.avgCents }));
}

function joinNames(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

/** GAP (goals need more than you save) and GAP-INFO (required saving only, no history yet). */
export function gapRules(ctx: Context): Recommendation[] {
  const common = {
    ruleVersion: RULE_VERSION,
    subject: { type: 'goals' as const },
    month: ctx.month,
    evaluatedOn: ctx.today,
  };

  if (ctx.gap.kind === 'requiredOnly') {
    return [
      {
        ...common,
        key: `GAP-INFO:goals:${ctx.month}`,
        ruleId: 'GAP-INFO',
        kind: 'insight',
        priority: 'low',
        title: 'What your goals need each month',
        reason: `Your active goals need ${rs(ctx.gap.requiredCents)}/month in total. Savings comparisons start after your first complete month of transactions.`,
        supportingMetrics: [{ label: 'Required per month', display: rs(ctx.gap.requiredCents) }],
        suggestedAction: null,
        note: null,
        potentialSavings: null,
        explanation: {
          ruleName: 'Required saving',
          condition: 'Shown because you have active goals but no complete month of transactions to compare against yet.',
        },
        magnitude: ctx.gap.requiredCents,
      },
    ];
  }

  if (ctx.gap.kind !== 'gap') return [];

  const { requiredCents, expectedCents, gapCents } = ctx.gap;
  const months = ctx.expected?.months ?? 1;
  const top = topDiscretionaryAverages(ctx);

  // Goal risk: name every trackable goal that is not on track, most behind first.
  const risky = ctx.goalStates.filter((g) => g.tracking.state === 'atRisk' || g.tracking.state === 'behind');
  const metrics: Metric[] = [
    { label: 'Goals need', display: `${rs(requiredCents)}/month` },
    { label: `You saved (avg of ${months} month${months === 1 ? '' : 's'})`, display: `${rs(Math.max(expectedCents, 0))}/month` },
    { label: 'Gap', display: `${rs(gapCents)}/month` },
  ];
  for (const g of risky) {
    const p = g.tracking.projection;
    const when =
      p.kind === 'month' ? `projected ${formatMonthKey(p.month)}` : p.kind === 'beyond50Years' ? 'no realistic date' : 'no projection';
    metrics.push({ label: g.goal.name, display: `${STATE_LABEL[g.tracking.state]} · ${when}` });
  }
  for (const t of top) metrics.push({ label: `${t.name} (monthly average)`, display: rs(t.avgCents) });

  const goalRisk = risky.length ? ` ${joinNames(risky.map((g) => g.goal.name))} ${risky.length === 1 ? 'is' : 'are'} at risk of missing the target date.` : '';
  const optimise = top.length
    ? `Your largest discretionary categories are ${joinNames(top.map((t) => `${t.name} (about ${rs(t.avgCents)}/month)`))}. Reducing these could help close the gap. You could also consider a later target date or a lower target.`
    : 'You could consider a later target date or a lower target.';

  return [
    {
      ...common,
      key: `GAP:goals:${ctx.month}`,
      ruleId: 'GAP',
      kind: 'suggestion',
      priority: 'high',
      title: 'Your goals need more than you’re currently saving',
      reason: `Your active goals need ${rs(requiredCents)}/month together. Over your last ${months} complete month${months === 1 ? '' : 's'} you saved about ${rs(Math.max(expectedCents, 0))}/month — a gap of about ${rs(gapCents)}/month.${goalRisk}`,
      supportingMetrics: metrics,
      suggestedAction: optimise,
      note: null,
      potentialSavings: null, // filled in by the engine from this month's anomalies
      explanation: {
        ruleName: 'Savings gap',
        condition: 'Shown because the monthly saving your goals need is higher than your recent average monthly saving.',
      },
      magnitude: gapCents,
    },
  ];
}
