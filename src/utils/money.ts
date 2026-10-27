export type Money = {
  currency: string;
  cents: number;
};

export const ZERO = (currency = 'INR'): Money => ({ currency, cents: 0 });

/** Parse a decimal currency string into exact integer cents. */
export function toCents(value: string | number): number {
  const num = typeof value === 'string' ? parseDecimal(value) : value;
  if (!Number.isFinite(num)) throw new Error(`Invalid monetary value: ${value}`);
  const scaled = Math.round(num * 100);
  return scaled;
}

function parseDecimal(value: string): number {
  const trimmed = value.trim();
  if (!/^-?\d+(\.\d{1,2})?$/.test(trimmed)) {
    throw new Error(`Invalid monetary value: ${value}`);
  }
  return Number(trimmed);
}

/** Format cents into a currency string with two decimals. */
export function formatMoney(money: Money): string {
  const sign = money.cents < 0 ? '-' : '';
  const abs = Math.abs(money.cents);
  const units = Math.floor(abs / 100);
  const frac = String(abs % 100).padStart(2, '0');
  return `${sign}${money.currency} ${units}.${frac}`;
}

export function add(...moneys: Money[]): Money {
  validateSameCurrency(moneys);
  const cents = moneys.reduce((sum, m) => sum + m.cents, 0);
  return { currency: moneys[0].currency, cents };
}

export function subtract(a: Money, b: Money): Money {
  validateSameCurrency([a, b]);
  return { currency: a.currency, cents: a.cents - b.cents };
}

export function multiply(money: Money, factor: number): Money {
  if (!Number.isFinite(factor)) throw new Error(`Invalid multiplier: ${factor}`);
  return { currency: money.currency, cents: Math.round(money.cents * factor) };
}

export function divide(money: Money, divisor: number): Money {
  if (!Number.isFinite(divisor) || divisor === 0) {
    throw new Error('Division by zero is not allowed for monetary values');
  }
  return { currency: money.currency, cents: Math.round(money.cents / divisor) };
}

export function isZero(money: Money): boolean {
  return money.cents === 0;
}

export function isPositive(money: Money): boolean {
  return money.cents > 0;
}

export function isNegative(money: Money): boolean {
  return money.cents < 0;
}

export function compare(a: Money, b: Money): number {
  validateSameCurrency([a, b]);
  return a.cents - b.cents;
}

export function gte(a: Money, b: Money): boolean {
  return compare(a, b) >= 0;
}

export function gt(a: Money, b: Money): boolean {
  return compare(a, b) > 0;
}

export function lte(a: Money, b: Money): boolean {
  return compare(a, b) <= 0;
}

export function lt(a: Money, b: Money): boolean {
  return compare(a, b) < 0;
}

function validateSameCurrency(moneys: Money[]): void {
  if (moneys.length === 0) return;
  const currency = moneys[0].currency;
  for (const m of moneys) {
    if (m.currency !== currency) {
      throw new Error(`Cannot operate on mixed currencies: ${currency} vs ${m.currency}`);
    }
  }
}

export function savingsRate(income: Money, expenses: Money): Money | null {
  if (isZero(income)) return null;
  const savings = subtract(income, expenses);
  const rate = divide(multiply(savings, 100), income.cents);
  return { currency: income.currency, cents: rate.cents };
}
