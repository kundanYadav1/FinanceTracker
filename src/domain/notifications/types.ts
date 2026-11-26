export type NotificationType = 'daily' | 'budget' | 'goal' | 'monthly' | 'achievement';

export type NotificationSettings = {
  daily: boolean;
  budget: boolean;
  goal: boolean;
  monthly: boolean;
  achievement: boolean;
  /** HH:mm, local time. */
  dailyTime: string;
  permissionAsked: boolean;
};

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  daily: true,
  budget: true,
  goal: true,
  monthly: true,
  achievement: true,
  dailyTime: '20:00',
  permissionAsked: false,
};

/** Where tapping a notification goes. */
export type NotificationTarget = '/' | '/budgets' | '/goals' | '/transactions';

export type PlannedNotification = {
  type: NotificationType;
  dedupeKey: string;
  title: string;
  body: string;
  target: NotificationTarget;
};
