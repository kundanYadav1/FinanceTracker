import * as Notifications from 'expo-notifications';
import { deleteDatabaseAsync } from 'expo-sqlite';

import { deleteAllUserData } from '@/db/backup';
import { getDatabase, preUpgradeDatabaseName } from '@/db/database';
import { SCHEMA_VERSION } from '@/db/schema';
import { clearPin } from '@/services/lock/pinService';
import { useAppStore } from '@/store/appStore';
import { useLockStore } from '@/store/lockStore';

/**
 * Permanently deletes every record and resets preferences and the PIN (FR-026.2).
 * Used by Settings → Delete all data and by the lock screen's "forgot PIN" path.
 */
export async function eraseEverything(): Promise<void> {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    await deleteAllUserData(db);
    await db.runAsync('DELETE FROM notification_settings');
    await db.runAsync("INSERT INTO notification_settings (id) VALUES ('default')");
    await db.runAsync('DELETE FROM app_settings');
    await db.runAsync("INSERT INTO app_settings (id) VALUES ('default')");
  });
  // Rewrites the file so deleted rows are not left behind in free pages.
  await db.execAsync('VACUUM');

  await clearPin();
  await Notifications.cancelAllScheduledNotificationsAsync().catch(() => undefined);
  for (let v = 1; v <= SCHEMA_VERSION; v += 1) {
    await deleteDatabaseAsync(preUpgradeDatabaseName(v)).catch(() => undefined);
  }
  await deleteDatabaseAsync('financetracker.pre-restore.db').catch(() => undefined);

  useLockStore.getState().resetAfterErase();
  useAppStore.setState({ profile: null, transactions: [], budgetVersions: [], goals: [], hideAmounts: false });
  await useAppStore.getState().load();
}
