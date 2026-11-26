import { formatRupees, MASKED_AMOUNT } from '@/utils/money';

export const rs = (cents: number): string => formatRupees({ currency: 'INR', cents });

/** One-decimal percent, e.g. `26.5%`. */
export const pct = (value: number): string => `${(Math.round(value * 10) / 10).toFixed(1)}%`;

export const lower = (s: string): string => s.toLowerCase();

/** Hide every rupee amount in a rendered sentence (privacy mask). */
export function maskAmounts(text: string): string {
  return text.replace(/Rs [\d,]+(?:\.\d{2})?/g, MASKED_AMOUNT);
}

/** Phrases that would turn an estimate into a promise or an order (FR-017, §32). */
export const BANNED_PHRASES = [
  'you should',
  'you must',
  'will save',
  'guaranteed',
  'guarantee',
  'certain to',
  'definitely',
  'invest',
  'loan',
  'credit card',
];

export const EXPECTED_NOTE = 'This may be expected — for example, an annual or one-time payment.';
