import { fromMonthInputValue, timeAgo, toMonthInputValue } from './date.utils';

describe('date utils', () => {
  it('timeAgo formats relative times with correct pluralisation', () => {
    const ago = (ms: number) => new Date(Date.now() - ms).toISOString();
    expect(timeAgo(ago(30 * 1000))).toMatch(/^\d+ seconds? ago$/);
    expect(timeAgo(ago(60 * 60 * 1000))).toBe('1 hour ago');
    expect(timeAgo(ago(3 * 24 * 60 * 60 * 1000))).toBe('3 days ago');
    expect(timeAgo(null)).toBe('');
  });

  it('round-trips <input type="month"> values without shifting the month', () => {
    const iso = fromMonthInputValue('2024-02');
    expect(iso).toBe('2024-02-01T12:00:00.000Z');
    expect(toMonthInputValue(iso)).toBe('2024-02');
  });
});
