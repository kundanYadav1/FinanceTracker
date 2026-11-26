import { create } from 'zustand';

import * as SettingsDB from '@/db/appSettings';
import { shouldRelock } from '@/domain/lock/policy';
import { DEFAULT_SECURITY_SETTINGS, type SecuritySettings } from '@/domain/security/types';
import { authenticateBiometric, isBiometricAvailable } from '@/services/lock/biometric';
import { getLockedUntil, hasPin, verifyPin, type VerifyResult } from '@/services/lock/pinService';

type LockState = {
  /** Settings have been read; the root layout must not render data screens before this. */
  ready: boolean;
  settings: SecuritySettings;
  locked: boolean;
  /** ms epoch until which PIN entry is refused (0 = not locked out). */
  lockedUntil: number;
  /** When the app last went to the background (null = it has not). */
  backgroundedAt: number | null;
  /** A notification target tapped while locked; opened after unlock. */
  pendingTarget: string | null;

  init: () => Promise<void>;
  updateSettings: (partial: Partial<SecuritySettings>) => Promise<void>;
  unlockWithPin: (pin: string) => Promise<VerifyResult>;
  unlockWithBiometric: () => Promise<boolean>;
  lockNow: () => void;
  onBackground: () => void;
  onForeground: () => void;
  setPendingTarget: (target: string | null) => void;
  /** Called after "erase everything": security returns to defaults and the app is unlocked. */
  resetAfterErase: () => void;
};

export const useLockStore = create<LockState>((set, get) => ({
  ready: false,
  settings: DEFAULT_SECURITY_SETTINGS,
  locked: false,
  lockedUntil: 0,
  backgroundedAt: null,
  pendingTarget: null,

  init: async () => {
    let settings = await SettingsDB.getSecuritySettings();
    // Lock enabled but the PIN is gone (e.g. secure storage was cleared): never trap the user outside their data.
    if (settings.lockEnabled && !(await hasPin())) {
      settings = { ...settings, lockEnabled: false, biometricEnabled: false };
      await SettingsDB.saveSecuritySettings(settings);
    }
    set({
      settings,
      locked: settings.lockEnabled,
      lockedUntil: settings.lockEnabled ? await getLockedUntil() : 0,
      ready: true,
    });
  },

  updateSettings: async (partial) => {
    const next = { ...get().settings, ...partial };
    if (!next.lockEnabled) next.biometricEnabled = false;
    await SettingsDB.saveSecuritySettings(next);
    set({ settings: next });
  },

  unlockWithPin: async (pin) => {
    const result = await verifyPin(pin);
    if (result.ok) set({ locked: false, lockedUntil: 0, backgroundedAt: null });
    else if ('lockedUntil' in result) set({ lockedUntil: result.lockedUntil });
    return result;
  },

  unlockWithBiometric: async () => {
    const { settings } = get();
    if (!settings.biometricEnabled || !(await isBiometricAvailable())) return false;
    const ok = await authenticateBiometric();
    if (ok) set({ locked: false, backgroundedAt: null });
    return ok;
  },

  lockNow: () => set({ locked: get().settings.lockEnabled }),

  onBackground: () => set({ backgroundedAt: Date.now() }),

  onForeground: () => {
    const { settings, backgroundedAt, locked } = get();
    if (!settings.lockEnabled || locked) return;
    if (shouldRelock(backgroundedAt, Date.now(), settings.lockTimeoutSec)) set({ locked: true });
    set({ backgroundedAt: null });
  },

  setPendingTarget: (pendingTarget) => set({ pendingTarget }),

  resetAfterErase: () =>
    set({ settings: DEFAULT_SECURITY_SETTINGS, locked: false, lockedUntil: 0, backgroundedAt: null, pendingTarget: null }),
}));
