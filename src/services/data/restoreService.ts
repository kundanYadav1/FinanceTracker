import * as DocumentPicker from 'expo-document-picker';
import { deleteDatabaseAsync } from 'expo-sqlite';
import { File } from 'expo-file-system';

import { replaceAllData } from '@/db/backup';
import { copyDatabaseTo, getDatabase } from '@/db/database';
import { SCHEMA_VERSION } from '@/db/schema';
import { MAX_BACKUP_BYTES, parseBackup, type BackupFile, type BackupSummary } from '@/domain/export/backup';
import { refreshNotifications } from '@/services/notifications/scheduler';
import { useAppStore } from '@/store/appStore';

const SAFETY_COPY = 'financetracker.pre-restore.db';

export type PickResult =
  | { status: 'cancelled' }
  | { status: 'invalid'; error: string }
  | { status: 'ready'; backup: BackupFile; summary: BackupSummary };

/** Lets the user choose a backup file and fully validates it. Nothing is written to the database. */
export async function pickAndValidateBackup(): Promise<PickResult> {
  const picked = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/plain', 'application/octet-stream'],
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (picked.canceled || !picked.assets?.[0]) return { status: 'cancelled' };

  const asset = picked.assets[0];
  const file = new File(asset.uri);
  try {
    if ((asset.size ?? file.size ?? 0) > MAX_BACKUP_BYTES) {
      return { status: 'invalid', error: 'This file is too large to be a Kosh backup.' };
    }
    const result = parseBackup(await file.text(), SCHEMA_VERSION);
    return result.ok
      ? { status: 'ready', backup: result.backup, summary: result.summary }
      : { status: 'invalid', error: result.error };
  } catch {
    return { status: 'invalid', error: 'This file could not be read.' };
  } finally {
    try {
      if (file.exists) file.delete();
    } catch {
      // The copy lives in the cache; the OS cleans it up eventually.
    }
  }
}

/**
 * Replaces all data with the validated backup. A safety copy of the current database is taken first, and the
 * replacement is a single transaction, so on any failure the existing data is left exactly as it was.
 */
export async function applyRestore(backup: BackupFile): Promise<void> {
  const db = await getDatabase();
  await copyDatabaseTo(db, SAFETY_COPY);
  try {
    await replaceAllData(db, backup);
  } finally {
    // Whether it succeeded or rolled back, the copy is no longer needed; do not leave a second copy of the data.
    await deleteDatabaseAsync(SAFETY_COPY).catch(() => undefined);
  }
  useAppStore.setState({ profile: null });
  await useAppStore.getState().load();
  await refreshNotifications();
}
