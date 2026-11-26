import { DEFAULT_NOTIFICATION_SETTINGS, type NotificationSettings } from '@/domain/notifications/types';
import { getDatabase } from './database';

function mapRow(row: Record<string, unknown>): NotificationSettings {
  return {
    daily: Number(row.daily_enabled) === 1,
    budget: Number(row.budget_enabled) === 1,
    goal: Number(row.goal_enabled) === 1,
    monthly: Number(row.monthly_enabled) === 1,
    achievement: Number(row.achievement_enabled) === 1,
    dailyTime: String(row.daily_time ?? DEFAULT_NOTIFICATION_SETTINGS.dailyTime),
    permissionAsked: Number(row.permission_asked) === 1,
  };
}

export async function getNotificationSettings(): Promise<NotificationSettings> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<Record<string, unknown>>(
    "SELECT * FROM notification_settings WHERE id = 'default'",
  );
  return row ? mapRow(row) : DEFAULT_NOTIFICATION_SETTINGS;
}

export async function saveNotificationSettings(s: NotificationSettings): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO notification_settings
       (id, daily_enabled, budget_enabled, goal_enabled, monthly_enabled, achievement_enabled, daily_time, permission_asked, updated_at)
     VALUES ('default', ?, ?, ?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
       daily_enabled = excluded.daily_enabled, budget_enabled = excluded.budget_enabled,
       goal_enabled = excluded.goal_enabled, monthly_enabled = excluded.monthly_enabled,
       achievement_enabled = excluded.achievement_enabled, daily_time = excluded.daily_time,
       permission_asked = excluded.permission_asked, updated_at = datetime('now')`,
    [
      s.daily ? 1 : 0,
      s.budget ? 1 : 0,
      s.goal ? 1 : 0,
      s.monthly ? 1 : 0,
      s.achievement ? 1 : 0,
      s.dailyTime,
      s.permissionAsked ? 1 : 0,
    ],
  );
}

export async function getSentKeys(): Promise<Set<string>> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ dedupe_key: string }>('SELECT dedupe_key FROM notification_log');
  return new Set(rows.map((r) => r.dedupe_key));
}

export async function markSent(dedupeKey: string, type: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('INSERT OR IGNORE INTO notification_log (dedupe_key, type) VALUES (?, ?)', [dedupeKey, type]);
}
