import { describe, expect, it } from 'vitest';
import { predict } from './prediction.js';
import type { Cycle } from './types.js';

/** Build cycles from a starting epoch-day and a list of cycle lengths. */
function cyclesFromLengths(start: number, lengths: number[], bleed = 5): Cycle[] {
  const cycles: Cycle[] = [];
  let day = start;
  let id = 1;
  for (const len of lengths) {
    cycles.push({ id: id++, startDay: day, endDay: day + bleed - 1 });
    day += len;
  }
  // final cycle (no known next start)
  cycles.push({ id: id++, startDay: day, endDay: day + bleed - 1 });
  return cycles;
}

describe('predict', () => {
  it('handles no data with sensible defaults and no projections', () => {
    const p = predict([]);
    expect(p.usingDefaults).toBe(true);
    expect(p.cyclesAnalyzed).toBe(0);
    expect(p.averageCycleLength).toBe(28);
    expect(p.upcoming).toHaveLength(0);
    expect(p.confidence).toBe('low');
  });

  it('projects from a single logged period using defaults', () => {
    const p = predict([{ id: 1, startDay: 1000, endDay: 1004 }]);
    expect(p.usingDefaults).toBe(true);
    expect(p.cyclesAnalyzed).toBe(0);
    expect(p.upcoming).toHaveLength(3);
    // anchor 1000 + 28
    expect(p.upcoming[0]!.periodStart).toBe(1028);
    expect(p.upcoming[0]!.ovulationDay).toBe(1028 - 14);
    expect(p.upcoming[0]!.fertileWindow).toEqual({ start: 1028 - 14 - 5, end: 1028 - 14 + 1 });
  });

  it('predicts a regular 28-day cycle with high confidence', () => {
    const cycles = cyclesFromLengths(0, [28, 28, 28, 28]); // 5 starts, 4 lengths
    const p = predict(cycles);
    expect(p.usingDefaults).toBe(false);
    expect(p.cyclesAnalyzed).toBe(4);
    expect(Math.round(p.averageCycleLength)).toBe(28);
    expect(p.variability).toBeCloseTo(0, 6);
    expect(p.confidence).toBe('high');
    expect(p.averagePeriodLength).toBe(5);
    // anchor is last start = 112
    expect(p.upcoming[0]!.periodStart).toBe(140);
    expect(p.upcoming[1]!.periodStart).toBe(168);
    // period end inclusive of 5 days
    expect(p.upcoming[0]!.periodEnd).toBe(144);
  });

  it('adapts toward recent cycle length', () => {
    // older long cycles, recent short ones — recency weighting pulls the mean down
    const p = predict(cyclesFromLengths(0, [34, 34, 26, 26, 26]));
    expect(p.averageCycleLength).toBeLessThan(30);
    expect(p.averageCycleLength).toBeGreaterThan(26);
  });

  it('widens the uncertainty window further into the future', () => {
    const p = predict(cyclesFromLengths(0, [24, 33, 26, 31, 28]));
    expect(p.variability).toBeGreaterThan(0);
    const spread0 =
      p.upcoming[0]!.periodStartRange.end - p.upcoming[0]!.periodStartRange.start;
    const spread2 =
      p.upcoming[2]!.periodStartRange.end - p.upcoming[2]!.periodStartRange.start;
    expect(spread2).toBeGreaterThan(spread0);
  });

  it('ignores implausible cycle gaps as logging errors', () => {
    // a 400-day gap (e.g. a break in tracking) must not blow up the average
    const p = predict(cyclesFromLengths(0, [28, 400, 28, 28]));
    expect(p.averageCycleLength).toBeLessThan(40);
  });

  it('respects a custom luteal phase length', () => {
    const p = predict(cyclesFromLengths(0, [28, 28, 28, 28]), { lutealPhaseDays: 12 });
    expect(p.upcoming[0]!.ovulationDay).toBe(140 - 12);
  });
});
