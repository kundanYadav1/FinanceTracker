import { csvField, minorToDecimal, neutralizeFormula, transactionsToCsv, type CsvTransaction } from './csv';

const row = (over: Partial<CsvTransaction> = {}): CsvTransaction => ({
  date: '2026-10-04',
  type: 'expense',
  amountMinor: 125050,
  currency: 'INR',
  categoryName: 'Food',
  paymentMethodName: 'UPI',
  note: '',
  recurring: false,
  ...over,
});

describe('csv export', () => {
  it('formats minor units exactly, with no float rounding', () => {
    expect(minorToDecimal(125050)).toBe('1250.50');
    expect(minorToDecimal(5)).toBe('0.05');
    expect(minorToDecimal(0)).toBe('0.00');
    expect(minorToDecimal(9_999_999_999)).toBe('99999999.99');
    expect(minorToDecimal(-250)).toBe('-2.50');
    expect(() => minorToDecimal(1.5)).toThrow();
  });

  it('quotes commas, quotes and newlines (RFC 4180)', () => {
    expect(csvField('plain')).toBe('plain');
    expect(csvField('a,b')).toBe('"a,b"');
    expect(csvField('say "hi"')).toBe('"say ""hi"""');
    expect(csvField('l1\nl2')).toBe('"l1\nl2"');
  });

  it('neutralizes spreadsheet formulas in free text', () => {
    for (const bad of ['=SUM(A1)', '+1', '-1', '@cmd', '\tx', '\rx']) {
      expect(neutralizeFormula(bad)).toBe(`'${bad}`);
    }
    expect(neutralizeFormula('Lunch')).toBe('Lunch');
  });

  it('produces a header, CRLF rows, and keeps numeric columns unquoted and unmodified', () => {
    const csv = transactionsToCsv([row({ amountMinor: 5, note: 'Dinner, with "friends"' }), row({ type: 'income', note: '=HYPERLINK("x")' })]);
    const lines = csv.split('\r\n');
    expect(lines[0]).toBe('Date,Type,Amount,Currency,Category,Payment method,Note,Recurring');
    expect(lines[1]).toBe('2026-10-04,expense,0.05,INR,Food,UPI,"Dinner, with ""friends""",no');
    expect(lines[2]).toBe('2026-10-04,income,1250.50,INR,Food,UPI,"\'=HYPERLINK(""x"")",no');
    expect(lines[3]).toBe('');
  });

  it('handles unicode and an empty list, with an optional BOM', () => {
    expect(transactionsToCsv([row({ note: 'चाय ☕' })])).toContain(',चाय ☕,');
    expect(transactionsToCsv([])).toBe('Date,Type,Amount,Currency,Category,Payment method,Note,Recurring\r\n');
    expect(transactionsToCsv([], { bom: true }).charCodeAt(0)).toBe(0xfeff);
  });
});
