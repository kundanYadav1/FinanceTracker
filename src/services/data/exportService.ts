import Constants from 'expo-constants';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { readCsvRows, readSnapshot } from '@/db/backup';
import { getDatabase } from '@/db/database';
import { transactionsToCsv } from '@/domain/export/csv';

const PREFIX = 'kosh-';

function stamp(now = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}${p(now.getMonth() + 1)}${p(now.getDate())}-${p(now.getHours())}${p(now.getMinutes())}`;
}

export const EXPORT_WARNING =
  'This file is not encrypted and contains your financial records. Anyone who gets it can read it. Share it only somewhere you trust.';

/** Writes `content` to a temporary file, opens the share sheet, then always deletes the file. */
async function shareTemporaryFile(name: string, content: string, mimeType: string, uti: string): Promise<boolean> {
  if (!(await Sharing.isAvailableAsync())) throw new Error('Sharing is not available on this device.');
  const file = new File(Paths.cache, name);
  try {
    if (file.exists) file.delete();
    file.create();
    file.write(content);
    await Sharing.shareAsync(file.uri, { mimeType, UTI: uti, dialogTitle: 'Export from Kosh' });
    return true;
  } finally {
    try {
      if (file.exists) file.delete();
    } catch {
      // Best effort; purgeStaleExports() retries on the next launch.
    }
  }
}

export async function exportJsonBackup(now = new Date()): Promise<boolean> {
  const db = await getDatabase();
  const snapshot = await readSnapshot(db, Constants.expoConfig?.version ?? '0.0.0', now);
  return shareTemporaryFile(
    `${PREFIX}backup-${stamp(now)}.json`,
    JSON.stringify(snapshot),
    'application/json',
    'public.json',
  );
}

export async function exportTransactionsCsv(now = new Date()): Promise<boolean> {
  const db = await getDatabase();
  const csv = transactionsToCsv(await readCsvRows(db), { bom: true });
  return shareTemporaryFile(`${PREFIX}transactions-${stamp(now)}.csv`, csv, 'text/csv', 'public.comma-separated-values-text');
}

/** Removes export files left behind by a crash or an interrupted share. Safe to call at startup. */
export function purgeStaleExports(): void {
  try {
    for (const entry of Paths.cache.list()) {
      if (entry instanceof File && entry.name.startsWith(PREFIX)) entry.delete();
    }
  } catch {
    // Cache cleanup must never block startup.
  }
}
