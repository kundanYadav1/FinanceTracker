import { formatRupees, groupNepaliDigits } from './money';

describe('formatRupees', () => {
  it('groups digits Nepali-style', () => {
    expect(groupNepaliDigits(999)).toBe('999');
    expect(groupNepaliDigits(1000)).toBe('1,000');
    expect(groupNepaliDigits(100000)).toBe('1,00,000');
    expect(groupNepaliDigits(12345678)).toBe('1,23,45,678');
  });

  it('shows paisa only when non-zero', () => {
    expect(formatRupees({ currency: 'INR', cents: 35000 })).toBe('Rs 350');
    expect(formatRupees({ currency: 'INR', cents: 35005 })).toBe('Rs 350.05');
    expect(formatRupees({ currency: 'INR', cents: 10000000 })).toBe('Rs 1,00,000');
  });

  it('prints an explicit sign when asked, and − for negatives', () => {
    expect(formatRupees({ currency: 'INR', cents: 4000 }, '+')).toBe('+Rs 40');
    expect(formatRupees({ currency: 'INR', cents: -4000 })).toBe('−Rs 40');
  });
});
