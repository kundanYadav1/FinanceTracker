export type LockTimeoutSec = 0 | 60 | 300;

export const LOCK_TIMEOUT_OPTIONS: { value: LockTimeoutSec; label: string }[] = [
  { value: 0, label: 'Immediately' },
  { value: 60, label: 'After 1 minute' },
  { value: 300, label: 'After 5 minutes' },
];

export type SecuritySettings = {
  lockEnabled: boolean;
  biometricEnabled: boolean;
  lockTimeoutSec: LockTimeoutSec;
  /** Cover the app in the task switcher / when inactive. */
  privacyCover: boolean;
  /** Start each session with amounts masked. */
  hideAmountsOnLaunch: boolean;
};

export const DEFAULT_SECURITY_SETTINGS: SecuritySettings = {
  lockEnabled: false,
  biometricEnabled: false,
  lockTimeoutSec: 0,
  privacyCover: true,
  hideAmountsOnLaunch: false,
};
