import { createHash } from 'crypto';

import {
  hashPin,
  isValidPin,
  isWeakPin,
  lockoutSeconds,
  remainingLockoutSec,
  safeEqual,
  shouldRelock,
} from './policy';

const digest = async (s: string) => createHash('sha256').update(s).digest('hex');

describe('lock policy', () => {
  it('validates 4-6 digit PINs only', () => {
    for (const ok of ['1357', '13579', '135792']) expect(isValidPin(ok)).toBe(true);
    for (const bad of ['', '123', '1234567', '12a4', '12 4']) expect(isValidPin(bad)).toBe(false);
  });

  it('flags repeated and sequential PINs as weak', () => {
    for (const weak of ['0000', '1111', '1234', '4321', '123456', '654321']) expect(isWeakPin(weak)).toBe(true);
    for (const fine of ['1357', '2580', '1243', '135792']) expect(isWeakPin(fine)).toBe(false);
  });

  it('escalates lockout after 5 wrong attempts', () => {
    expect([0, 1, 4].map(lockoutSeconds)).toEqual([0, 0, 0]);
    expect([5, 6, 7, 8, 20].map(lockoutSeconds)).toEqual([30, 60, 300, 900, 900]);
  });

  it('computes remaining lockout and never goes negative', () => {
    expect(remainingLockoutSec(10_500, 10_000)).toBe(1);
    expect(remainingLockoutSec(10_000, 20_000)).toBe(0);
  });

  it('relocks only after the timeout has elapsed', () => {
    expect(shouldRelock(null, 1000, 0)).toBe(false);
    expect(shouldRelock(1000, 1000, 0)).toBe(true);
    expect(shouldRelock(0, 59_999, 60)).toBe(false);
    expect(shouldRelock(0, 60_000, 60)).toBe(true);
  });

  it('compares strings in constant-time style', () => {
    expect(safeEqual('abc', 'abc')).toBe(true);
    expect(safeEqual('abc', 'abd')).toBe(false);
    expect(safeEqual('abc', 'abcd')).toBe(false);
  });

  it('hashes deterministically per salt and differs across salts and PINs', async () => {
    const a = await hashPin('1357', 's1', digest, 10);
    expect(await hashPin('1357', 's1', digest, 10)).toBe(a);
    expect(await hashPin('1357', 's2', digest, 10)).not.toBe(a);
    expect(await hashPin('1358', 's1', digest, 10)).not.toBe(a);
    expect(a).not.toContain('1357');
  });
});
