import { SUBSCRIPTIONS_CATEGORY_ID, spendingClassOf } from '../categoryClass';
import type { Context } from '../context';
import {
  ANOMALY_MIN_EXCESS_CENTS,
  ANOMALY_MIN_INCREASE_PERCENT,
  HISTORY_MONTHS_REQUIRED,
  RULE_VERSION,
} from '../thresholds';
import { EXPECTED_NOTE, lower, pct, rs } from '../text';
import type { Metric, Recommendation } from '../types';

/**
 * ANOM-DISC / ANOM-INFO — month-to-date spending well above the category's own 3-month average.
 *
 * With Σ3 the spend over the 3 complete months before this one, average = Σ3/3 and, using
 * integers only: excess×3 = 3·current − Σ3. The incomplete month is never extrapolated (FR-013.3).
 */
export function anomalyRules(ctx: Context): Recommendation[] {
  if (ctx.historyMonths < HISTORY_MONTHS_REQUIRED) return [];
  const out: Recommendation[] = [];
  for (const s of ctx.spend) {
    const excess3 = 3 * s.current - s.prev3; // three times the excess over average
    if (s.prev3 <= 0) continue; // zero average: no comparison (FR-013.4)
    if (excess3 <= 0) continue;
    if (excess3 * 100 < ANOMALY_MIN_INCREASE_PERCENT * s.prev3) continue;
    if (excess3 < 3 * ANOMALY_MIN_EXCESS_CENTS) continue;

    const cls = spendingClassOf(s.categoryId);
    const name = ctx.categoryName(s.categoryId);
    const avg = Math.round(s.prev3 / 3);
    const excess = Math.floor(excess3 / 3);
    const deviation = (excess3 * 100) / s.prev3;
    const discretionary = cls === 'discretionary';

    const metrics: Metric[] = [
      { label: `${name} this month`, display: rs(s.current) },
      { label: '3-month average', display: rs(avg) },
      { label: 'Above average by', display: pct(deviation) },
    ];
    if (s.categoryId === SUBSCRIPTIONS_CATEGORY_ID) {
      const share = ctx.currentExpenseCents > 0 ? (s.current * 100) / ctx.currentExpenseCents : 0;
      metrics.push({ label: 'Share of this month’s spending', display: pct(share) });
      if (s.recurringCount > 0) {
        metrics.push({ label: 'Marked as recurring', display: `${s.recurringCount} payment${s.recurringCount === 1 ? '' : 's'}` });
      }
    }

    const common = {
      ruleVersion: RULE_VERSION,
      subject: { type: 'category' as const, categoryId: s.categoryId },
      month: ctx.month,
      evaluatedOn: ctx.today,
      supportingMetrics: metrics,
      magnitude: excess,
    };
    const condition = `Shown because ${lower(name)} spending this month is at least ${ANOMALY_MIN_INCREASE_PERCENT}% and ${rs(ANOMALY_MIN_EXCESS_CENTS)} above your 3-month average.`;

    if (discretionary) {
      out.push({
        ...common,
        key: `ANOM-DISC:${s.categoryId}:${ctx.month}`,
        ruleId: 'ANOM-DISC',
        kind: 'suggestion',
        priority: 'medium',
        title: `${name} spending is above your usual level`,
        reason: `You've spent ${rs(s.current)} on ${lower(name)} so far in ${ctx.monthName}, which is ${pct(deviation)} more than your 3-month average of ${rs(avg)}.`,
        suggestedAction: `Consider cutting back on ${lower(name)} for the rest of ${ctx.monthName}.`,
        note: null,
        potentialSavings: { upToCents: excess, basis: `spending above your usual ${lower(name)} level` },
        explanation: { ruleName: 'Spending above usual level', condition },
      });
    } else {
      out.push({
        ...common,
        key: `ANOM-INFO:${s.categoryId}:${ctx.month}`,
        ruleId: 'ANOM-INFO',
        kind: 'insight',
        priority: 'low',
        title: `${name} spending is higher than usual`,
        reason: `You've spent ${rs(s.current)} on ${lower(name)} so far in ${ctx.monthName}, ${pct(deviation)} more than your 3-month average of ${rs(avg)}.`,
        suggestedAction: null,
        note: EXPECTED_NOTE,
        potentialSavings: null,
        explanation: {
          ruleName: 'Higher than usual (information only)',
          condition: `${condition} This category is not one you would normally cut, so no reduction is suggested.`,
        },
      });
    }
  }
  return out;
}
