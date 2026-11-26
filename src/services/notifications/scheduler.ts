import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import * as BudgetDB from '@/db/budgets';
import * as GoalDB from '@/db/goals';
import * as SettingsDB from '@/db/notificationSettings';
import * as TransactionDB from '@/db/transactions';
import { COPY } from '@/domain/notifications/copy';
import { hasExpenseOn, parseTime, planNotifications } from '@/domain/notifications/planner';
import type { NotificationSettings, NotificationTarget } from '@/domain/notifications/types';
import { toDateKey } from '@/domain/overview';

export const CHANNEL_ID = 'kosh-default';
const FIXED_PREFIX = 'fixed:';
const DAILY_ID = `${FIXED_PREFIX}daily`;
const DAILY_TODAY_ID = `${FIXED_PREFIX}daily-today`;
const MONTHLY_ID = `${FIXED_PREFIX}monthly`;

/** Call once at module load: foreground display behaviour. */
export function configureNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
  });
}

async function ensureChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Reminders and alerts',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

export async function hasPermission(): Promise<boolean> {
  const p = await Notifications.getPermissionsAsync();
  return p.granted;
}

/** Asks the OS for permission once (first launch); returns whether it is granted. */
export async function requestPermission(): Promise<boolean> {
  await ensureChannel();
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const next = await Notifications.requestPermissionsAsync();
  return next.granted;
}

async function cancelFixed(id: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined);
}

function content(type: 'daily' | 'monthly', target: NotificationTarget) {
  return { title: COPY[type].title, body: COPY[type].body, data: { target } };
}

/**
 * Rebuilds the fixed-time notifications from settings. Daily reminder repeats; when an expense is
 * already logged today, today's occurrence is skipped by also scheduling a one-off tomorrow start.
 */
export async function syncFixedSchedules(settings: NotificationSettings, now = new Date()): Promise<void> {
  await Promise.all([cancelFixed(DAILY_ID), cancelFixed(DAILY_TODAY_ID), cancelFixed(MONTHLY_ID)]);
  if (!(await hasPermission())) return;
  await ensureChannel();

  if (settings.daily) {
    const { hour, minute } = parseTime(settings.dailyTime);
    const transactions = await TransactionDB.listTransactions({ startDate: toDateKey(now), endDate: toDateKey(now) });
    const loggedToday = hasExpenseOn(transactions, toDateKey(now));
    if (loggedToday) {
      // Skip today: a one-off for tomorrow. The repeating trigger is restored by the next refresh
      // (app open, data change, or the periodic background task).
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, hour, minute);
      await Notifications.scheduleNotificationAsync({
        identifier: DAILY_TODAY_ID,
        content: content('daily', COPY.daily.target),
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: tomorrow, channelId: CHANNEL_ID },
      });
    } else {
      await Notifications.scheduleNotificationAsync({
        identifier: DAILY_ID,
        content: content('daily', COPY.daily.target),
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute, channelId: CHANNEL_ID },
      });
    }
  }

  if (settings.monthly) {
    await Notifications.scheduleNotificationAsync({
      identifier: MONTHLY_ID,
      content: content('monthly', COPY.monthly.target),
      trigger: { type: Notifications.SchedulableTriggerInputTypes.MONTHLY, day: 1, hour: 9, minute: 0, channelId: CHANNEL_ID },
    });
  }
}

/**
 * Evaluates budget, goal and achievement notices from SQLite and posts the ones not yet sent.
 * Reads repositories directly so it also works inside the background task. Returns how many were posted.
 */
export async function runNotificationCheck(now = new Date()): Promise<number> {
  const settings = await SettingsDB.getNotificationSettings();
  if (!(settings.budget || settings.goal || settings.achievement)) return 0;
  if (!(await hasPermission())) return 0;

  const [transactions, budgetVersions, goals, sent] = await Promise.all([
    TransactionDB.listTransactions(),
    BudgetDB.getBudgetVersions(),
    GoalDB.getGoals(),
    SettingsDB.getSentKeys(),
  ]);
  const due = planNotifications({ settings, transactions, budgetVersions, goals, sent, now });
  await ensureChannel();
  for (const n of due) {
    await Notifications.scheduleNotificationAsync({
      content: { title: n.title, body: n.body, data: { target: n.target } },
      trigger: Platform.OS === 'android' ? { channelId: CHANNEL_ID } : null,
    });
    await SettingsDB.markSent(n.dedupeKey, n.type);
  }
  return due.length;
}

/** Full refresh used on app open and after data or settings changes. Never throws. */
export async function refreshNotifications(): Promise<void> {
  try {
    const settings = await SettingsDB.getNotificationSettings();
    await syncFixedSchedules(settings);
    await runNotificationCheck();
  } catch (e) {
    console.warn('Notification refresh failed', e);
  }
}
