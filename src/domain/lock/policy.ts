export const PIN_MIN_LENGTH = 4;
export const PIN_MAX_LENGTH = 6;
/** Wrong attempts allowed before the first lockout. */
export const FREE_ATTEMPTS = 5;
/** Lockout seconds after the 5th, 6th, 7th, 8th+ consecutive wrong attempts. */
const LOCKOUT_STEPS_SEC = [30, 60, 300, 900] as const;

export function isValidPin(pin: string): boolean {
  return new RegExp(`^[0-9]{${PIN_MIN_LENGTH},${PIN_MAX_LENGTH}}$`).test(pin);
}

/** True for PINs that are trivially guessable: repeated digits or a straight run (1234, 4321). */
export function isWeakPin(pin: string): boolean {
  if (!isValidPin(pin)) return false;
  if (/^([0-9])\1+$/.test(pin)) return true;
  const digits = [...pin].map(Number);
  const step = digits[1] - digits[0];
  return (step === 1 || step === -1) && digits.every((d, i) => i === 0 || d - digits[i - 1] === step);
}

/** Seconds the user must wait after `failedAttempts` consecutive wrong PINs (0 = may try now). */
export function lockoutSeconds(failedAttempts: number): number {
  if (failedAttempts < FREE_ATTEMPTS) return 0;
  return LOCKOUT_STEPS_SEC[Math.min(failedAttempts - FREE_ATTEMPTS, LOCKOUT_STEPS_SEC.length - 1)];
}

export function remainingLockoutSec(lockedUntilMs: number, nowMs: number): number {
  return Math.max(0, Math.ceil((lockedUntilMs - nowMs) / 1000));
}

/** Whether returning to the foreground should require authentication again. */
export function shouldRelock(backgroundedAtMs: number | null, nowMs: number, timeoutSec: number): boolean {
  if (backgroundedAtMs === null) return false;
  return nowMs - backgroundedAtMs >= timeoutSec * 1000;
}

/** Constant-time string comparison (avoids leaking how many leading characters matched). */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export type Digest = (input: string) => Promise<string>;

export const HASH_ROUNDS = 2000;

/** Salted, iterated hash. `digest` is injected so the algorithm is testable without native modules. */
export async function hashPin(pin: string, salt: string, digest: Digest, rounds = HASH_ROUNDS): Promise<string> {
  let value = `${salt}:${pin}`;
  for (let i = 0; i < rounds; i += 1) value = await digest(`${salt}:${value}`);
  return value;
}
