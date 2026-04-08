/**
 * Date/duration utilities for LinkedIn profile normalization.
 *
 * Calculates tenure in months from LinkedIn's { month, year } date objects.
 */

import type { RawTimePeriod } from '../types/profile.types.js';

/**
 * Calculate the number of months between a start date and an end date.
 *
 * If endDate is null/undefined, uses the current date (i.e., ongoing role).
 * Returns null if startDate is missing or invalid.
 */
export function calculateDurationMonths(timePeriod?: RawTimePeriod): number | null {
  if (!timePeriod?.startDate?.year) return null;

  const startYear = timePeriod.startDate.year;
  const startMonth = timePeriod.startDate.month ?? 1; // Default to January

  let endYear: number;
  let endMonth: number;

  if (timePeriod.endDate?.year) {
    endYear = timePeriod.endDate.year;
    endMonth = timePeriod.endDate.month ?? 12; // Default to December
  } else {
    // No end date — role is current, use today
    const now = new Date();
    endYear = now.getFullYear();
    endMonth = now.getMonth() + 1; // getMonth() is 0-indexed
  }

  const months = (endYear - startYear) * 12 + (endMonth - startMonth);
  return Math.max(0, months);
}

/**
 * Determine if a time period represents a current (ongoing) position.
 */
export function isCurrent(timePeriod?: RawTimePeriod): boolean {
  if (!timePeriod) return false;
  return !timePeriod.endDate || (!timePeriod.endDate.year && !timePeriod.endDate.month);
}

/**
 * Normalize a { month, year } date to a consistent shape.
 */
export function normalizeDate(
  date?: { month?: number; year?: number },
): { month: number | null; year: number | null } {
  return {
    month: date?.month ?? null,
    year: date?.year ?? null,
  };
}
