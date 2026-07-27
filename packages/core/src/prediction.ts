import { addDays } from './dates.js';
import {
  DEFAULT_SETTINGS,
  type Confidence,
  type Cycle,
  type CyclePrediction,
  type EpochDay,
  type Prediction,
  type Settings,
} from './types.js';

/**
 * Adaptive, research-informed cycle prediction — all computed on the fly from
 * the user's own history, nothing stored.
 *
 * Approach (a lightweight approximation of the state-space / hierarchical-Bayes
 * literature, which is overkill on-device):
 *  - Cycle length is an **exponentially-weighted** average of recent cycles, so
 *    the estimate continually adapts toward the individual and their recent
 *    trend rather than a fixed 28-day assumption.
 *  - Prediction uncertainty comes from the observed spread of the user's own
 *    cycles and widens the further out we project (variance adds over cycles).
 *  - Ovulation is anchored to a relatively-constant luteal phase
 *    (nextPeriodStart − lutealPhaseDays); the fertile window spans sperm (~5d)
 *    and egg (~1d) viability.
 *
 * This is informational only — NOT medical advice or a contraceptive method.
 */

/** Plausible cycle-length band; values outside are treated as logging errors. */
const MIN_PLAUSIBLE_CYCLE = 15;
const MAX_PLAUSIBLE_CYCLE = 90;
/** How many recent cycles feed the estimate. */
const MAX_HISTORY = 12;
/** Recency half-life in cycles (older cycles count for exponentially less). */
const RECENCY_HALF_LIFE = 6;
/** Fertile window relative to ovulation: sperm survival and egg viability. */
const FERTILE_BEFORE_OVULATION = 5;
const FERTILE_AFTER_OVULATION = 1;
/** Spread (days) assumed when we don't yet have enough data to measure it. */
const DEFAULT_VARIABILITY = 4;

function recencyWeights(n: number): number[] {
  // index 0 = most recent, gets the highest weight.
  return Array.from({ length: n }, (_, i) => 2 ** (-i / RECENCY_HALF_LIFE));
}

function weightedMean(values: number[], weights: number[]): number {
  let sum = 0;
  let wsum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i]! * weights[i]!;
    wsum += weights[i]!;
  }
  return wsum === 0 ? 0 : sum / wsum;
}

function weightedStdDev(values: number[], weights: number[], mean: number): number {
  if (values.length < 2) return DEFAULT_VARIABILITY;
  let sum = 0;
  let wsum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += weights[i]! * (values[i]! - mean) ** 2;
    wsum += weights[i]!;
  }
  return wsum === 0 ? DEFAULT_VARIABILITY : Math.sqrt(sum / wsum);
}

function classifyConfidence(cyclesAnalyzed: number, variability: number): Confidence {
  if (cyclesAnalyzed >= 4 && variability <= 3) return 'high';
  if (cyclesAnalyzed >= 2 && variability <= 6) return 'medium';
  return 'low';
}

/** Completed cycle lengths (start-to-next-start) within the plausible band. */
function cycleLengths(sortedCycles: Cycle[]): number[] {
  const lengths: number[] = [];
  for (let i = 1; i < sortedCycles.length; i++) {
    const len = sortedCycles[i]!.startDay - sortedCycles[i - 1]!.startDay;
    if (len >= MIN_PLAUSIBLE_CYCLE && len <= MAX_PLAUSIBLE_CYCLE) lengths.push(len);
  }
  return lengths;
}

/** Mean logged bleed length (inclusive of start and end day), or a default. */
function periodLength(cycles: Cycle[], fallback: number): number {
  const bleeds = cycles
    .filter((c) => c.endDay !== null && c.endDay >= c.startDay)
    .map((c) => c.endDay! - c.startDay + 1)
    .filter((d) => d >= 1 && d <= 15);
  if (bleeds.length === 0) return fallback;
  return bleeds.reduce((a, b) => a + b, 0) / bleeds.length;
}

/**
 * Predict the user's upcoming cycles from their history.
 *
 * @param cycles   All recorded cycles (any order).
 * @param settings Partial overrides of {@link DEFAULT_SETTINGS}.
 * @param options  `count` = how many future cycles to project (default 3).
 */
export function predict(
  cycles: Cycle[],
  settings: Partial<Settings> = {},
  options: { count?: number } = {},
): Prediction {
  const cfg: Settings = { ...DEFAULT_SETTINGS, ...settings };
  const count = Math.max(1, options.count ?? 3);
  const sorted = [...cycles].sort((a, b) => a.startDay - b.startDay);

  const lengths = cycleLengths(sorted).slice(-MAX_HISTORY);
  // Reverse so index 0 is the most recent (for recency weighting).
  const recent = [...lengths].reverse();
  const weights = recencyWeights(recent.length);

  const usingDefaults = recent.length === 0;
  const averageCycleLength = usingDefaults
    ? cfg.defaultCycleLength
    : weightedMean(recent, weights);
  const variability = usingDefaults
    ? DEFAULT_VARIABILITY
    : weightedStdDev(recent, weights, averageCycleLength);
  const averagePeriodLength = periodLength(sorted, cfg.defaultPeriodLength);

  const cyclesAnalyzed = recent.length;
  const confidence = classifyConfidence(cyclesAnalyzed, variability);

  const upcoming: CyclePrediction[] = [];
  const anchor = sorted.length > 0 ? sorted[sorted.length - 1]!.startDay : null;
  if (anchor !== null) {
    const cycleLen = Math.round(averageCycleLength);
    const periodLen = Math.max(1, Math.round(averagePeriodLength));
    for (let k = 1; k <= count; k++) {
      const periodStart: EpochDay = anchor + cycleLen * k;
      // Uncertainty grows with the square root of cycles projected ahead.
      const spread = Math.max(1, Math.round(variability * Math.sqrt(k)));
      const ovulationDay = addDays(periodStart, -cfg.lutealPhaseDays);
      upcoming.push({
        periodStart,
        periodEnd: periodStart + periodLen - 1,
        periodStartRange: { start: periodStart - spread, end: periodStart + spread },
        ovulationDay,
        fertileWindow: {
          start: addDays(ovulationDay, -FERTILE_BEFORE_OVULATION),
          end: addDays(ovulationDay, FERTILE_AFTER_OVULATION),
        },
      });
    }
  }

  return {
    averageCycleLength,
    averagePeriodLength,
    variability,
    confidence,
    cyclesAnalyzed,
    usingDefaults,
    upcoming,
  };
}
