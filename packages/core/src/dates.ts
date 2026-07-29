import type { EpochDay } from './types.js';

const MS_PER_DAY = 86_400_000;

/**
 * Convert a calendar date to an epoch-day (whole days since 1970-01-01).
 * Only the year/month/day in **local** time are used, so DST and time-of-day
 * never shift a logged date. This is the single conversion boundary between
 * `Date` objects and the integer day-numbers stored everywhere else.
 */
export function toEpochDay(date: Date): EpochDay {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / MS_PER_DAY);
}

/** Convert an epoch-day back to a local `Date` at midnight. */
export function fromEpochDay(day: EpochDay): Date {
  const utc = new Date(day * MS_PER_DAY);
  return new Date(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate());
}

/** Today as an epoch-day. */
export function todayEpochDay(now: Date = new Date()): EpochDay {
  return toEpochDay(now);
}

/** Add (or subtract) whole days. */
export function addDays(day: EpochDay, delta: number): EpochDay {
  return day + delta;
}

/** Whole days from `from` to `to` (to − from). */
export function daysBetween(from: EpochDay, to: EpochDay): number {
  return to - from;
}

/** Format an epoch-day as an ISO `YYYY-MM-DD` string (for display/export). */
export function formatISO(day: EpochDay): string {
  const date = fromEpochDay(day);
  const year = date.getFullYear().toString().padStart(4, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const dayOfMonth = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${dayOfMonth}`;
}

/** Parse an ISO `YYYY-MM-DD` string into an epoch-day. */
export function parseISO(iso: string): EpochDay {
  const [year, month, day] = iso.split('-').map(Number);
  if (year === undefined || month === undefined || day === undefined) {
    throw new Error(`Invalid ISO date: ${iso}`);
  }
  return Math.floor(Date.UTC(year, month - 1, day) / MS_PER_DAY);
}
