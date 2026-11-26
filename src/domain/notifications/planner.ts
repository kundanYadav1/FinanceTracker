import { buildBudgetLines, type BudgetVersion } from '@/domain/budget';
import { buildPortfolio, expectedMonthlySaving, goalProgress, goalTracking, toToday } from '@/domain/goals';
import type { SavingsGoal } from '@/db/goals';
import type { Transaction } from '@/db/transactions';
import { COPY } from './copy';
import type { NotificationSettings, PlannedNotification } from './types';

export const ACHIEVEMENT_MILESTONES = [25, 50, 75] as const;

export type PlannerInput = {
  settings: NotificationSettings;
  transactions: Transaction[];
  budgetVersions: BudgetVersion[];
  goals: SavingsGoal[];
  /** Dedupe keys already sent. */
  sent: ReadonlySet<string>;
  now: Date;
};

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** Monday-start week key, stable within a week. */
export function weekKey(d: Date): string {
  const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - ((d.getDay() + 6) % 7));
  return `${monday.getFullYear()}-${pad(monday.getMonth() + 1)}-${pad(monday.getDate())}`;
}

/** Highest milestone (25/50/75, or 100 when completed) reached, or null below the first. */
export function reachedMilestone(percent: number, completed: boolean): number | null {
  if (completed) return 100;
  let best: number | null = null;
  for (const m of ACHIEVEMENT_MILESTONES) if (percent >= m) best = m;
  return best;
}

/**
 * Data-driven notifications due now. Pure and deterministic; fixed-time notices (daily, monthly) are
 * scheduled by the adapter. Already-sent dedupe keys are skipped.
 */
export function planNotifications(input: PlannerInput): PlannedNotification[] {
  const { settings, transactions, budgetVersions, goals, sent, now } = input;
  const out: PlannedNotification[] = [];
  const push = (n: PlannedNotification) => {
    if (!sent.has(n.dedupeKey) && !out.some((o) => o.dedupeKey === n.dedupeKey)) out.push(n);
  };

  if (settings.budget) {
    const month = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
    for (const line of buildBudgetLines(budgetVersions, transactions, month)) {
      if (line.status === 'Healthy') continue;
      const copy = line.status === 'Exceeded' ? COPY.budgetExceeded : COPY.budget;
      push({
        type: 'budget',
        dedupeKey: `budget:${line.scopeKey}:${month}:${line.status}`,
        title: copy.title,
        body: copy.body,
        target: copy.target,
      });
    }
  }

  if (settings.goal || settings.achievement) {
    const today = toToday(now);
    const portfolio = buildPortfolio(goals, today);
    const expected = expectedMonthlySaving(transactions, today);
    for (const goal of goals) {
      const progress = goalProgress(goal);
      if (settings.achievement) {
        const milestone = reachedMilestone(progress.percent, progress.completed);
        if (milestone !== null) {
          push({
            type: 'achievement',
            dedupeKey: `ach:${goal.id}:${milestone}`,
            title: COPY.achievement.title,
            body: COPY.achievement.body,
            target: COPY.achievement.target,
          });
        }
      }
      if (settings.goal && !progress.completed) {
        const { state } = goalTracking(goal, portfolio, expected, today);
        if (state === 'atRisk' || state === 'behind') {
          push({
            type: 'goal',
            dedupeKey: `goalrem:${goal.id}:${weekKey(now)}`,
            title: COPY.goal.title,
            body: COPY.goal.body,
            target: COPY.goal.target,
          });
        }
      }
    }
  }
  return out;
}

/** True when an expense is already logged for the local date `dateKey` (daily reminder suppression). */
export function hasExpenseOn(transactions: Transaction[], dateKey: string): boolean {
  return transactions.some((t) => t.type === 'expense' && t.date.slice(0, 10) === dateKey);
}

/** Parses `HH:mm`; falls back to 20:00 for invalid input. */
export function parseTime(value: string): { hour: number; minute: number } {
  const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  return m ? { hour: Number(m[1]), minute: Number(m[2]) } : { hour: 20, minute: 0 };
}
