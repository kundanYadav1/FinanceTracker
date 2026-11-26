import type { NotificationTarget, NotificationType } from './types';

type Copy = { title: string; body: string; target: NotificationTarget };

/** Static, amount-free and name-free text (spec: lock-screen privacy). */
export const COPY: Record<NotificationType | 'budgetExceeded', Copy> = {
  daily: { title: "Log today's expenses", body: 'Take a moment to record what you spent today.', target: '/transactions' },
  budget: { title: 'Budget nearing its limit', body: 'A budget has passed 80% for this month.', target: '/budgets' },
  budgetExceeded: { title: 'Budget exceeded', body: 'A budget is over its limit this month.', target: '/budgets' },
  goal: { title: 'Savings goal needs attention', body: 'A goal is behind pace. Review your plan.', target: '/goals' },
  monthly: { title: 'Your monthly summary is ready', body: 'See how last month went.', target: '/' },
  achievement: { title: 'Savings milestone reached', body: 'You hit a milestone on a savings goal.', target: '/goals' },
};
