import { createHash as mockCreateHash, randomBytes as mockRandomBytes } from 'crypto';

import { changePin, clearPin, getLockedUntil, hasPin, removePin, setPin, verifyPin } from './pinService';

const mockStore = new Map<string, string>();

jest.mock('expo-secure-store', () => ({
  getItemAsync: async (k: string) => mockStore.get(k) ?? null,
  setItemAsync: async (k: string, v: string) => void mockStore.set(k, v),
  deleteItemAsync: async (k: string) => void mockStore.delete(k),
}));
jest.mock('expo-crypto', () => ({
  CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
  digestStringAsync: async (_a: string, s: string) => mockCreateHash('sha256').update(s).digest('hex'),
  getRandomBytesAsync: async (n: number) => new Uint8Array(mockRandomBytes(n)),
}));

beforeEach(() => mockStore.clear());

describe('pinService', () => {
  it('stores only a salted hash, never the PIN', async () => {
    await setPin('2468');
    const raw = [...mockStore.values()].join('');
    expect(raw).not.toContain('2468');
    expect(await hasPin()).toBe(true);
  });

  it('rejects malformed PINs', async () => {
    await expect(setPin('12')).rejects.toThrow();
    expect(await hasPin()).toBe(false);
  });

  it('verifies the right PIN and rejects a wrong one with attempts left', async () => {
    await setPin('2468');
    expect(await verifyPin('2468')).toEqual({ ok: true });
    const wrong = await verifyPin('0000');
    expect(wrong).toMatchObject({ ok: false, reason: 'wrong', remainingAttempts: 4 });
  });

  it('locks out after 5 wrong attempts, persists it, and unlocks after the delay', async () => {
    await setPin('2468');
    const t0 = 1_000_000;
    for (let i = 0; i < 4; i += 1) await verifyPin('1111', t0);
    const fifth = await verifyPin('1111', t0);
    expect(fifth).toMatchObject({ ok: false, reason: 'wrong', remainingAttempts: 0, lockedUntil: t0 + 30_000 });

    // Even the correct PIN is refused during lockout.
    expect(await verifyPin('2468', t0 + 1000)).toMatchObject({ ok: false, reason: 'locked' });
    expect(await getLockedUntil(t0 + 1000)).toBe(t0 + 30_000);

    expect(await verifyPin('2468', t0 + 30_001)).toEqual({ ok: true });
    expect(await getLockedUntil(t0 + 30_001)).toBe(0);
  });

  it('resets the failure counter after a success', async () => {
    await setPin('2468');
    await verifyPin('1111');
    await verifyPin('1111');
    await verifyPin('2468');
    expect(await verifyPin('1111')).toMatchObject({ remainingAttempts: 4 });
  });

  it('changePin and removePin require the current PIN', async () => {
    await setPin('2468');
    expect(await changePin('9999', '1357')).toMatchObject({ ok: false });
    expect(await verifyPin('2468')).toEqual({ ok: true });

    expect(await changePin('2468', '1357')).toEqual({ ok: true });
    expect(await verifyPin('1357')).toEqual({ ok: true });

    expect(await removePin('0000')).toMatchObject({ ok: false });
    expect(await hasPin()).toBe(true);
    expect(await removePin('1357')).toEqual({ ok: true });
    expect(await hasPin()).toBe(false);
  });

  it('reports no-pin when none is set and clearPin removes it', async () => {
    expect(await verifyPin('1357')).toEqual({ ok: false, reason: 'no-pin' });
    await setPin('2468');
    await clearPin();
    expect(await hasPin()).toBe(false);
  });
});
