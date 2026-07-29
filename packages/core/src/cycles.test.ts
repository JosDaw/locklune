import { describe, expect, it } from 'vitest';
import { cycleForDay } from './cycles.js';
import type { Cycle } from './types.js';

const TODAY = 1000;

describe('cycleForDay', () => {
  it('returns nothing for a day before any cycle', () => {
    const cycles: Cycle[] = [{ id: 1, startDay: 900, endDay: 904 }];
    expect(cycleForDay(cycles, 890, TODAY)).toEqual({
      cycle: null,
      isStart: false,
      isBleedDay: false,
    });
  });

  it('flags the start day of a cycle', () => {
    const cycles: Cycle[] = [{ id: 1, startDay: 900, endDay: 904 }];
    const status = cycleForDay(cycles, 900, TODAY);
    expect(status.isStart).toBe(true);
    expect(status.isBleedDay).toBe(true);
    expect(status.cycle?.id).toBe(1);
  });

  it('flags an inner bleed day of a completed cycle (not a start)', () => {
    const cycles: Cycle[] = [{ id: 1, startDay: 900, endDay: 904 }];
    const status = cycleForDay(cycles, 903, TODAY);
    expect(status.isBleedDay).toBe(true);
    expect(status.isStart).toBe(false);
    expect(status.cycle?.id).toBe(1);
  });

  it('returns nothing for a gap day after a completed bleed', () => {
    const cycles: Cycle[] = [{ id: 1, startDay: 900, endDay: 904 }];
    expect(cycleForDay(cycles, 905, TODAY).isBleedDay).toBe(false);
  });

  it('treats an ongoing (open-ended) period as running up to today', () => {
    const cycles: Cycle[] = [{ id: 1, startDay: 995, endDay: null }];
    expect(cycleForDay(cycles, 998, TODAY).isBleedDay).toBe(true); // within start..today
    expect(cycleForDay(cycles, TODAY, TODAY).isBleedDay).toBe(true); // today itself
    expect(cycleForDay(cycles, TODAY + 1, TODAY).isBleedDay).toBe(false); // future
  });

  it('caps an open-ended earlier period at the day before the next start', () => {
    const cycles: Cycle[] = [
      { id: 1, startDay: 900, endDay: null },
      { id: 2, startDay: 928, endDay: null },
    ];
    expect(cycleForDay(cycles, 927, TODAY).cycle?.id).toBe(1); // last day before next start
    expect(cycleForDay(cycles, 928, TODAY).cycle?.id).toBe(2); // next start takes over
    expect(cycleForDay(cycles, 927, TODAY).isBleedDay).toBe(true);
  });

  it('is order-independent (sorts its input)', () => {
    const cycles: Cycle[] = [
      { id: 2, startDay: 928, endDay: 932 },
      { id: 1, startDay: 900, endDay: 904 },
    ];
    expect(cycleForDay(cycles, 930, TODAY).cycle?.id).toBe(2);
  });
});
