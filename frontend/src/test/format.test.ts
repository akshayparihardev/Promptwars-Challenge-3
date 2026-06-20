import { describe, it, expect } from 'vitest';
import { formatNumber, formatDate } from '../lib/format';

describe('formatNumber', () => {
  it('formats with no decimals by default', () => {
    expect(formatNumber(1234)).toBe('1,234');
  });

  it('formats with specified decimals', () => {
    expect(formatNumber(1234.567, 2)).toBe('1,234.57');
  });

  it('handles zero', () => {
    expect(formatNumber(0)).toBe('0');
  });
});

describe('formatDate', () => {
  it('formats an ISO date string', () => {
    const result = formatDate('2026-01-15T10:30:00Z');
    expect(result).toBeTruthy();
    expect(result.length).toBeGreaterThan(5);
  });
});
