import { describe, expect, it } from 'vitest';
import { predict } from './prediction.js';
import { Flow, type Cycle } from './types.js';

/** Build cycles from a starting epoch-day and a list of cycle lengths. */
function cyclesFromLengths(start: number, lengths: number[], bleed = 5): Cycle[] {
  const cycles: Cycle[] = [];
  let day = start;
  let nextId = 1;
  for (const length of lengths) {
    cycles.push({ id: nextId++, startDay: day, endDay: day + bleed - 1 });
    day += length;
  }
  // final cycle (no known next start)
  cycles.push({ id: nextId++, startDay: day, endDay: day + bleed - 1 });
  return cycles;
}

describe('predict', () => {
  it('handles no data with sensible defaults and no projections', () => {
    const prediction = predict([]);
    expect(prediction.usingDefaults).toBe(true);
    expect(prediction.cyclesAnalyzed).toBe(0);
    expect(prediction.averageCycleLength).toBe(28);
    expect(prediction.upcoming).toHaveLength(0);
    expect(prediction.confidence).toBe('low');
  });

  it('projects from a single logged period using defaults', () => {
    const prediction = predict([{ id: 1, startDay: 1000, endDay: 1004 }]);
    expect(prediction.usingDefaults).toBe(true);
    expect(prediction.cyclesAnalyzed).toBe(0);
    expect(prediction.upcoming).toHaveLength(3);
    // anchor 1000 + 28
    expect(prediction.upcoming[0]!.periodStart).toBe(1028);
    expect(prediction.upcoming[0]!.ovulationDay).toBe(1028 - 14);
    expect(prediction.upcoming[0]!.fertileWindow).toEqual({
      start: 1028 - 14 - 5,
      end: 1028 - 14 + 1,
    });
  });

  it('predicts a regular 28-day cycle with high confidence', () => {
    const cycles = cyclesFromLengths(0, [28, 28, 28, 28]); // 5 starts, 4 lengths
    const prediction = predict(cycles);
    expect(prediction.usingDefaults).toBe(false);
    expect(prediction.cyclesAnalyzed).toBe(4);
    expect(Math.round(prediction.averageCycleLength)).toBe(28);
    expect(prediction.variability).toBeCloseTo(0, 6);
    expect(prediction.confidence).toBe('high');
    expect(prediction.averagePeriodLength).toBe(5);
    // anchor is last start = 112
    expect(prediction.upcoming[0]!.periodStart).toBe(140);
    expect(prediction.upcoming[1]!.periodStart).toBe(168);
    // period end inclusive of 5 days
    expect(prediction.upcoming[0]!.periodEnd).toBe(144);
  });

  it('adapts toward recent cycle length', () => {
    // older long cycles, recent short ones - recency weighting pulls the mean down
    const prediction = predict(cyclesFromLengths(0, [34, 34, 26, 26, 26]));
    expect(prediction.averageCycleLength).toBeLessThan(30);
    expect(prediction.averageCycleLength).toBeGreaterThan(26);
  });

  it('widens the uncertainty window further into the future', () => {
    const prediction = predict(cyclesFromLengths(0, [24, 33, 26, 31, 28]));
    expect(prediction.variability).toBeGreaterThan(0);
    const spread0 =
      prediction.upcoming[0]!.periodStartRange.end - prediction.upcoming[0]!.periodStartRange.start;
    const spread2 =
      prediction.upcoming[2]!.periodStartRange.end - prediction.upcoming[2]!.periodStartRange.start;
    expect(spread2).toBeGreaterThan(spread0);
  });

  it('ignores implausible cycle gaps as logging errors', () => {
    // a 400-day gap (e.g. a break in tracking) must not blow up the average
    const prediction = predict(cyclesFromLengths(0, [28, 400, 28, 28]));
    expect(prediction.averageCycleLength).toBeLessThan(40);
  });

  it('respects a custom luteal phase length', () => {
    const prediction = predict(cyclesFromLengths(0, [28, 28, 28, 28]), { lutealPhaseDays: 12 });
    expect(prediction.upcoming[0]!.ovulationDay).toBe(140 - 12);
  });

  it('anchors the next period to a confirmed ovulation in the current cycle', () => {
    const prediction = predict(
      [{ id: 1, startDay: 1000, endDay: 1004 }],
      {},
      { confirmedOvulations: [1015] },
    );
    // No ovulation→next-start pairs yet, so the luteal phase falls back to 14.
    expect(prediction.upcoming[0]!.ovulationDay).toBe(1015);
    expect(prediction.upcoming[0]!.periodStart).toBe(1015 + 14);
    expect(prediction.upcoming[0]!.fertileWindow).toEqual({ start: 1015 - 5, end: 1015 + 1 });
  });

  it('ignores a confirmed ovulation logged on a bleed day', () => {
    // Ovulation "confirmed" on day 1 of the period is physiologically impossible;
    // it must not anchor the prediction (which would report ovulation = today).
    const prediction = predict(
      [{ id: 1, startDay: 1000, endDay: 1004 }],
      {},
      { confirmedOvulations: [1002] },
    );
    // Falls back to the default projection (start + 28), not the bleed-day ovulation.
    expect(prediction.upcoming[0]!.periodStart).toBe(1028);
    expect(prediction.upcoming[0]!.ovulationDay).toBe(1028 - 14);
  });

  it('learns the luteal phase from a past confirmed ovulation', () => {
    const cycles: Cycle[] = [
      { id: 1, startDay: 0, endDay: 4 },
      { id: 2, startDay: 30, endDay: 34 },
    ];
    // Ovulation at 18 with the next period at 30 → luteal 12; it is not in the
    // current cycle, so it refines the luteal length rather than the anchor.
    const prediction = predict(cycles, {}, { confirmedOvulations: [18] });
    expect(prediction.upcoming[0]!.periodStart).toBe(60);
    expect(prediction.upcoming[0]!.ovulationDay).toBe(60 - 12);
  });

  it('defaults to tracking mode with fertility applicable', () => {
    const prediction = predict(cyclesFromLengths(0, [28, 28, 28]));
    expect(prediction.mode).toBe('tracking');
    expect(prediction.fertilityApplicable).toBe(true);
  });

  it('suppresses fertility on hormonal contraception but still predicts bleeds', () => {
    const prediction = predict(cyclesFromLengths(0, [28, 28, 28]), {
      cycleMode: 'contraception',
      contraceptionMethod: 'pill',
    });
    expect(prediction.fertilityApplicable).toBe(false);
    expect(prediction.upcoming.length).toBeGreaterThan(0);
  });

  it('keeps fertility for non-hormonal contraception', () => {
    const prediction = predict(cyclesFromLengths(0, [28, 28, 28]), {
      cycleMode: 'contraception',
      contraceptionMethod: 'copper_iud',
    });
    expect(prediction.fertilityApplicable).toBe(true);
  });

  it('makes no period projections while pregnant', () => {
    const prediction = predict(cyclesFromLengths(0, [28, 28, 28]), { cycleMode: 'pregnant' });
    expect(prediction.mode).toBe('pregnant');
    expect(prediction.upcoming).toHaveLength(0);
    expect(prediction.fertilityApplicable).toBe(false);
  });

  it('anchors a spotting-led period on its first real-flow day', () => {
    const cycles: Cycle[] = [
      { id: 1, startDay: 1000, endDay: 1004 },
      { id: 2, startDay: 1030, endDay: 1035 },
    ];
    // The second period is *recorded* on 1030 but that day is only spotting; real
    // flow starts 1031, which should become day 1 for cycle-length + projection.
    const flowByDay = new Map<number, Flow>([
      [1030, Flow.Spotting],
      [1031, Flow.Light],
    ]);
    const withFlow = predict(cycles, {}, { flowByDay });
    const withoutFlow = predict(cycles, {});
    expect(withoutFlow.averageCycleLength).toBe(30);
    expect(withFlow.averageCycleLength).toBe(31);
    // Projection anchors on the shifted start (1031), not the recorded 1030.
    expect(withFlow.upcoming[0]!.periodStart).toBe(1031 + 31);
  });

  it('does not shift a period that already opens with real flow', () => {
    const cycles: Cycle[] = [
      { id: 1, startDay: 0, endDay: 4 },
      { id: 2, startDay: 30, endDay: 34 },
    ];
    // 30 is logged as spotting but no Light+ follows within the window, so the
    // recorded start stands (spotting-only bleeds aren't silently dropped).
    const flowByDay = new Map<number, Flow>([[30, Flow.Spotting]]);
    const prediction = predict(cycles, {}, { flowByDay });
    expect(prediction.averageCycleLength).toBe(30);
  });
});
