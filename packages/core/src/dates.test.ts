import { describe, expect, it } from 'vitest';
import {
  addDays,
  daysBetween,
  formatISO,
  fromEpochDay,
  parseISO,
  toEpochDay,
} from './dates.js';

describe('dates', () => {
  it('round-trips a date through epoch-day', () => {
    const d = new Date(2026, 6, 27); // 27 Jul 2026, local
    const day = toEpochDay(d);
    const back = fromEpochDay(day);
    expect(back.getFullYear()).toBe(2026);
    expect(back.getMonth()).toBe(6);
    expect(back.getDate()).toBe(27);
  });

  it('addDays and daysBetween are inverse', () => {
    const day = toEpochDay(new Date(2026, 0, 1));
    expect(daysBetween(day, addDays(day, 28))).toBe(28);
    expect(addDays(day, -1)).toBe(day - 1);
  });

  it('formats and parses ISO strings symmetrically', () => {
    const iso = '2026-07-27';
    expect(formatISO(parseISO(iso))).toBe(iso);
    const day = toEpochDay(new Date(2026, 11, 31));
    expect(parseISO(formatISO(day))).toBe(day);
    expect(formatISO(day)).toBe('2026-12-31');
  });

  it('rejects malformed ISO input', () => {
    expect(() => parseISO('nope')).toThrow();
  });
});
