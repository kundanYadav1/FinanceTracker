import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

import { FREE_ATTEMPTS, hashPin, isValidPin, lockoutSeconds, safeEqual, type Digest } from '@/domain/lock/policy';

const KEY = 'kosh.pin.v1';

type StoredPin = { salt: string; hash: string; failedAttempts: number; lockedUntil: number };

export type VerifyResult =
  | { ok: true }
  | { ok: false; reason: 'wrong'; remainingAttempts: number; lockedUntil: number }
  | { ok: false; reason: 'locked'; lockedUntil: number }
  | { ok: false; reason: 'no-pin' };

const digest: Digest = (input) => Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, input);

async function read(): Promise<StoredPin | null> {
  const raw = await SecureStore.getItemAsync(KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredPin;
    return typeof parsed.hash === 'string' && typeof parsed.salt === 'string' ? parsed : null;
  } catch {
    return null;
  }
}

async function write(value: StoredPin): Promise<void> {
  await SecureStore.setItemAsync(KEY, JSON.stringify(value));
}

async function newSalt(): Promise<string> {
  const bytes = await Crypto.getRandomBytesAsync(16);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function hasPin(): Promise<boolean> {
  return (await read()) !== null;
}

/** Lockout deadline (ms epoch) persisted across restarts, or 0 when not locked out. */
export async function getLockedUntil(now = Date.now()): Promise<number> {
  const stored = await read();
  return stored && stored.lockedUntil > now ? stored.lockedUntil : 0;
}

export async function setPin(pin: string): Promise<void> {
  if (!isValidPin(pin)) throw new Error('PIN must be 4 to 6 digits.');
  const salt = await newSalt();
  await write({ salt, hash: await hashPin(pin, salt, digest), failedAttempts: 0, lockedUntil: 0 });
}

export async function verifyPin(pin: string, now = Date.now()): Promise<VerifyResult> {
  const stored = await read();
  if (!stored) return { ok: false, reason: 'no-pin' };
  if (stored.lockedUntil > now) return { ok: false, reason: 'locked', lockedUntil: stored.lockedUntil };

  const candidate = await hashPin(pin, stored.salt, digest);
  if (safeEqual(candidate, stored.hash)) {
    if (stored.failedAttempts > 0 || stored.lockedUntil > 0) {
      await write({ ...stored, failedAttempts: 0, lockedUntil: 0 });
    }
    return { ok: true };
  }

  const failedAttempts = stored.failedAttempts + 1;
  const wait = lockoutSeconds(failedAttempts);
  const lockedUntil = wait > 0 ? now + wait * 1000 : 0;
  await write({ ...stored, failedAttempts, lockedUntil });
  return {
    ok: false,
    reason: 'wrong',
    remainingAttempts: Math.max(0, FREE_ATTEMPTS - failedAttempts),
    lockedUntil,
  };
}

/** Changing requires the current PIN. */
export async function changePin(currentPin: string, nextPin: string): Promise<VerifyResult> {
  const result = await verifyPin(currentPin);
  if (result.ok) await setPin(nextPin);
  return result;
}

export async function removePin(currentPin: string): Promise<VerifyResult> {
  const result = await verifyPin(currentPin);
  if (result.ok) await SecureStore.deleteItemAsync(KEY);
  return result;
}

/** Used by "erase everything and reset"; no PIN is needed because the data is being destroyed. */
export async function clearPin(): Promise<void> {
  await SecureStore.deleteItemAsync(KEY);
}
