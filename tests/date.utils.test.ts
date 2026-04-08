/**
 * Unit tests for date/duration utilities.
 */

import { describe, it, expect } from 'vitest';
import { calculateDurationMonths, isCurrent, normalizeDate } from '../src/utils/date.utils.js';

describe('calculateDurationMonths', () => {
  it('calculates months between two dates', () => {
    const result = calculateDurationMonths({
      startDate: { month: 1, year: 2022 },
      endDate: { month: 6, year: 2023 },
    });
    expect(result).toBe(17); // Jan 2022 to Jun 2023 = 17 months
  });

  it('calculates months for same-year period', () => {
    const result = calculateDurationMonths({
      startDate: { month: 3, year: 2023 },
      endDate: { month: 9, year: 2023 },
    });
    expect(result).toBe(6);
  });

  it('returns a positive number for ongoing roles (no end date)', () => {
    const result = calculateDurationMonths({
      startDate: { month: 1, year: 2023 },
    });
    expect(result).toBeGreaterThan(0);
  });

  it('returns null when start date is missing', () => {
    expect(calculateDurationMonths({})).toBeNull();
    expect(calculateDurationMonths(undefined)).toBeNull();
  });

  it('defaults start month to January when missing', () => {
    const result = calculateDurationMonths({
      startDate: { year: 2022 },
      endDate: { month: 6, year: 2022 },
    });
    expect(result).toBe(5); // Jan → Jun
  });

  it('returns 0 for same month/year', () => {
    const result = calculateDurationMonths({
      startDate: { month: 5, year: 2023 },
      endDate: { month: 5, year: 2023 },
    });
    expect(result).toBe(0);
  });
});

describe('isCurrent', () => {
  it('returns true when no end date', () => {
    expect(isCurrent({ startDate: { month: 1, year: 2023 } })).toBe(true);
  });

  it('returns true when end date is empty', () => {
    expect(isCurrent({ startDate: { month: 1, year: 2023 }, endDate: {} })).toBe(true);
  });

  it('returns false when end date has year', () => {
    expect(
      isCurrent({
        startDate: { month: 1, year: 2022 },
        endDate: { month: 6, year: 2023 },
      }),
    ).toBe(false);
  });

  it('returns false for undefined input', () => {
    expect(isCurrent(undefined)).toBe(false);
  });
});

describe('normalizeDate', () => {
  it('normalizes a complete date', () => {
    expect(normalizeDate({ month: 3, year: 2023 })).toEqual({ month: 3, year: 2023 });
  });

  it('handles missing month', () => {
    expect(normalizeDate({ year: 2023 })).toEqual({ month: null, year: 2023 });
  });

  it('handles undefined input', () => {
    expect(normalizeDate(undefined)).toEqual({ month: null, year: null });
  });
});
