import type { BudgetLine } from '@/domain/budget';
import { spendingClassOf } from '../categoryClass';
import type { Context } from '../context';
import { BUDGET_WARNING_PERCENT, RULE_VERSION } from '../thresholds';
import { lower, pct, rs } from '../text';
import type { Recommendation } from '../types';

function labelOf(ctx: Context, line: BudgetLine): string {
  return line.scope === 'overall' ? 'monthly' : ctx.categoryName(line.categoryId ?? '');
}

/** Discretionary categories with spending this month, biggest first (never Essential). */
function topDiscretionary(ctx: Context, max = 3): string[] {
  return ctx.spend
    .filter((s) => s.current > 0 && spendingClassOf(s.categoryId) === 'discretionary')
    .sort((a, b) => b.current - a.current || a.categoryId.localeCompare(b.categoryId))
    .slice(0, max)
    .map((s) => ctx.categoryName(s.categoryId));
}

/** A reduce suggestion is allowed for the overall budget and Discretionary categories only. */
function mayReduce(line: BudgetLine): boolean {
  return line.scope === 'overall' || spendingClassOf(line.categoryId ?? '') === 'discretionary';
}

function base(ctx: Context, line: BudgetLine) {
  const subjectKey = line.scopeKey;
  return {
    ruleVersion: RULE_VERSION,
    subject: { type: 'budget' as const, scopeKey: subjectKey },
    month: ctx.month,
    evaluatedOn: ctx.today,
    potentialSavings: null,
  };
}

/** BUD-OVER — spending is strictly above a budget in effect this month (FR-014). */
export function budgetOverRules(ctx: Context): Recommendation[] {
  const out: Recommendation[] = [];
  for (const line of ctx.budgetLines) {
    if (line.status !== 'Exceeded') continue;
    const label = labelOf(ctx, line);
    const reduce = mayReduce(line);
    const name = line.scope === 'overall' ? 'Monthly budget' : `${label} budget`;
    const reason =
      line.amountCents === 0
        ? `You set a ${rs(0)} budget for ${label} and have spent ${rs(line.spentCents)} this month.`
        : `You've spent ${rs(line.spentCents)} of your ${rs(line.amountCents)} ${line.scope === 'overall' ? 'monthly' : label} budget this month — ${rs(line.overspentCents)} over.`;
    let action: string | null = null;
    if (!reduce) {
      // Insight only: never a reduction, just a pointer to the budget itself.
    } else if (line.scope === 'overall') {
      const top = topDiscretionary(ctx);
      action = top.length
        ? `Consider reviewing your discretionary spending for the rest of ${ctx.monthName}: ${top.join(', ')}.`
        : `Consider reviewing your non-essential spending for the rest of ${ctx.monthName}.`;
    } else {
      action = `Consider holding off on non-essential ${lower(label)} spending for the rest of ${ctx.monthName}.`;
    }
    out.push({
      ...base(ctx, line),
      key: `BUD-OVER:${line.scopeKey}:${ctx.month}`,
      ruleId: 'BUD-OVER',
      kind: reduce ? 'suggestion' : 'insight',
      priority: 'high',
      title: `${name} exceeded`,
      reason,
      supportingMetrics: [
        { label: 'Budget', display: rs(line.amountCents) },
        { label: 'Spent this month', display: rs(line.spentCents) },
        { label: 'Over by', display: rs(line.overspentCents) },
      ],
      suggestedAction: action,
      note: reduce ? null : 'If this level of spending is expected, you may want to adjust the budget amount.',
      explanation: {
        ruleName: 'Budget exceeded',
        condition: `Shown because spending this month is above the budget you set (${rs(line.amountCents)}).`,
      },
      magnitude: line.overspentCents,
    });
  }
  return out;
}

/** BUD-WARN — spending has reached the warning share of a budget but is not over it (FR-014). */
export function budgetWarnRules(ctx: Context): Recommendation[] {
  const out: Recommendation[] = [];
  for (const line of ctx.budgetLines) {
    if (line.status !== 'Warning') continue;
    const label = labelOf(ctx, line);
    const reduce = mayReduce(line);
    const used = line.utilizationPercent ?? 0;
    const name = line.scope === 'overall' ? 'Monthly budget' : `${label} budget`;
    out.push({
      ...base(ctx, line),
      key: `BUD-WARN:${line.scopeKey}:${ctx.month}`,
      ruleId: 'BUD-WARN',
      kind: reduce ? 'suggestion' : 'insight',
      priority: 'medium',
      title: `${name} almost used`,
      reason: `You have used ${pct(used)} of your ${line.scope === 'overall' ? 'monthly' : label} budget. ${rs(line.remainingCents)} remains for ${ctx.monthName}.`,
      supportingMetrics: [
        { label: 'Budget', display: rs(line.amountCents) },
        { label: 'Spent this month', display: rs(line.spentCents) },
        { label: 'Remaining', display: rs(line.remainingCents) },
      ],
      suggestedAction: reduce
        ? `Keeping ${line.scope === 'overall' ? 'overall' : lower(label)} spending under ${rs(line.remainingCents)} for the rest of ${ctx.monthName} would keep you within budget.`
        : null,
      note: null,
      explanation: {
        ruleName: 'Budget approaching limit',
        condition: `Shown because spending has reached ${BUDGET_WARNING_PERCENT}% of the budget but is not above it.`,
      },
      magnitude: line.spentCents,
    });
  }
  return out;
}
