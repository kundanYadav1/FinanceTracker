import {
  DEFAULT_SECURITY_SETTINGS,
  type LockTimeoutSec,
  type SecuritySettings,
} from '@/domain/security/types';
import { getDatabase } from './database';

function toTimeout(value: unknown): LockTimeoutSec {
  const n = Number(value);
  return n === 60 || n === 300 ? n : 0;
}

export function mapSecurityRow(row: Record<string, unknown>): SecuritySettings {
  return {
    lockEnabled: Number(row.lock_enabled) === 1,
    biometricEnabled: Number(row.biometric_enabled) === 1,
    lockTimeoutSec: toTimeout(row.lock_timeout_sec),
    privacyCover: Number(row.privacy_cover_enabled) === 1,
    hideAmountsOnLaunch: Number(row.hide_amounts_on_launch) === 1,
  };
}

export async function getSecuritySettings(): Promise<SecuritySettings> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<Record<string, unknown>>("SELECT * FROM app_settings WHERE id = 'default'");
  return row ? mapSecurityRow(row) : DEFAULT_SECURITY_SETTINGS;
}

export async function saveSecuritySettings(s: SecuritySettings): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO app_settings
       (id, lock_enabled, biometric_enabled, lock_timeout_sec, privacy_cover_enabled, hide_amounts_on_launch, updated_at)
     VALUES ('default', ?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
       lock_enabled = excluded.lock_enabled, biometric_enabled = excluded.biometric_enabled,
       lock_timeout_sec = excluded.lock_timeout_sec, privacy_cover_enabled = excluded.privacy_cover_enabled,
       hide_amounts_on_launch = excluded.hide_amounts_on_launch, updated_at = datetime('now')`,
    [
      s.lockEnabled ? 1 : 0,
      s.biometricEnabled ? 1 : 0,
      s.lockTimeoutSec,
      s.privacyCover ? 1 : 0,
      s.hideAmountsOnLaunch ? 1 : 0,
    ],
  );
}
