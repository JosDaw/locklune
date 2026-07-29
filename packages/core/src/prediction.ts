import { addDays } from './dates.js';
import {
  CYCLE_MODE,
  DEFAULT_SETTINGS,
  isHormonalContraception,
  type Confidence,
  type Cycle,
  type CycleMode,
  type CyclePrediction,
  type EpochDay,
  type Prediction,
  type Settings,
} from './types.js';

/**
 * Adaptive, research-informed cycle prediction - all computed on the fly from
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
 * This is informational only - NOT medical advice or a contraceptive method.
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

function recencyWeights(count: number): number[] {
  // index 0 = most recent, gets the highest weight.
  return Array.from({ length: count }, (_, index) => 2 ** (-index / RECENCY_HALF_LIFE));
}

function weightedMean(values: number[], weights: number[]): number {
  let sum = 0;
  let weightSum = 0;
  for (let index = 0; index < values.length; index++) {
    sum += values[index]! * weights[index]!;
    weightSum += weights[index]!;
  }
  return weightSum === 0 ? 0 : sum / weightSum;
}

function weightedStdDev(values: number[], weights: number[], mean: number): number {
  if (values.length < 2) return DEFAULT_VARIABILITY;
  let sum = 0;
  let weightSum = 0;
  for (let index = 0; index < values.length; index++) {
    sum += weights[index]! * (values[index]! - mean) ** 2;
    weightSum += weights[index]!;
  }
  return weightSum === 0 ? DEFAULT_VARIABILITY : Math.sqrt(sum / weightSum);
}

function classifyConfidence(cyclesAnalyzed: number, variability: number): Confidence {
  if (cyclesAnalyzed >= 4 && variability <= 3) return 'high';
  if (cyclesAnalyzed >= 2 && variability <= 6) return 'medium';
  return 'low';
}

/** Completed cycle lengths (start-to-next-start) within the plausible band. */
function cycleLengths(sortedCycles: Cycle[]): number[] {
  const lengths: number[] = [];
  for (let index = 1; index < sortedCycles.length; index++) {
    const length = sortedCycles[index]!.startDay - sortedCycles[index - 1]!.startDay;
    if (length >= MIN_PLAUSIBLE_CYCLE && length <= MAX_PLAUSIBLE_CYCLE) lengths.push(length);
  }
  return lengths;
}

/** Mean logged bleed length (inclusive of start and end day), or a default. */
function periodLength(cycles: Cycle[], fallback: number): number {
  const bleeds = cycles
    .filter((cycle) => cycle.endDay !== null && cycle.endDay >= cycle.startDay)
    .map((cycle) => cycle.endDay! - cycle.startDay + 1)
    .filter((bleedLength) => bleedLength >= 1 && bleedLength <= 15);
  if (bleeds.length === 0) return fallback;
  return bleeds.reduce((sum, bleedLength) => sum + bleedLength, 0) / bleeds.length;
}

/**
 * Learn the luteal-phase length from confirmed ovulations that are each followed
 * by a period start (luteal = nextStart − ovulation), falling back to the
 * configured length when there is no such data. Only physiologically plausible
 * gaps (7–20 days) are counted.
 */
function empiricalLutealPhase(
  sortedCycles: Cycle[],
  sortedOvulations: number[],
  fallback: number,
): number {
  const starts = sortedCycles.map((cycle) => cycle.startDay);
  const lengths: number[] = [];
  for (const ovulation of sortedOvulations) {
    const nextStart = starts.find((start) => start > ovulation);
    if (nextStart === undefined) continue;
    const length = nextStart - ovulation;
    if (length >= 7 && length <= 20) lengths.push(length);
  }
  if (lengths.length === 0) return fallback;
  return Math.round(lengths.reduce((sum, length) => sum + length, 0) / lengths.length);
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
  options: { count?: number; confirmedOvulations?: EpochDay[] } = {},
): Prediction {
  const cfg: Settings = { ...DEFAULT_SETTINGS, ...settings };
  const count = Math.max(1, options.count ?? 3);
  const sorted = [...cycles].sort((first, second) => first.startDay - second.startDay);

  const lengths = cycleLengths(sorted).slice(-MAX_HISTORY);
  // Reverse so index 0 is the most recent (for recency weighting).
  const recent = [...lengths].reverse();
  const weights = recencyWeights(recent.length);

  const usingDefaults = recent.length === 0;
  const averageCycleLength = usingDefaults ? cfg.defaultCycleLength : weightedMean(recent, weights);
  const variability = usingDefaults
    ? DEFAULT_VARIABILITY
    : weightedStdDev(recent, weights, averageCycleLength);
  const averagePeriodLength = periodLength(sorted, cfg.defaultPeriodLength);

  const cyclesAnalyzed = recent.length;
  const confidence = classifyConfidence(cyclesAnalyzed, variability);

  const mode: CycleMode = cfg.cycleMode;
  // Fertility estimates are meaningless while pregnant or on ovulation-suppressing
  // (hormonal) contraception.
  const fertilityApplicable =
    mode !== CYCLE_MODE.Pregnant &&
    mode !== CYCLE_MODE.PeriodOnly &&
    !(mode === CYCLE_MODE.Contraception && isHormonalContraception(cfg.contraceptionMethod));

  // Confirmed ovulations refine the luteal phase and can anchor the next period.
  const ovulations = [...(options.confirmedOvulations ?? [])].sort(
    (first, second) => first - second,
  );
  const lutealPhase = empiricalLutealPhase(sorted, ovulations, cfg.lutealPhaseDays);

  const upcoming: CyclePrediction[] = [];
  let anchor: EpochDay | null = sorted.length > 0 ? sorted[sorted.length - 1]!.startDay : null;
  // If the user recently concluded a pregnancy and has no period recorded since,
  // seed predictions so that the first upcoming cycle lands on the expected resumption
  // day (stored directly in postPregnancyAnchorDay, computed from gestational age at
  // the time the user switched out of pregnant mode).
  if (
    cfg.postPregnancyAnchorDay != null &&
    mode !== CYCLE_MODE.Pregnant &&
    (anchor === null || anchor < cfg.postPregnancyAnchorDay)
  ) {
    anchor = cfg.postPregnancyAnchorDay - Math.round(averageCycleLength);
  }
  // No period projections while pregnant.
  if (anchor !== null && mode !== CYCLE_MODE.Pregnant) {
    const cycleLen = Math.round(averageCycleLength);
    const periodLen = Math.max(1, Math.round(averagePeriodLength));
    // A confirmed ovulation in the current cycle (on/after the last period start)
    // anchors the very next period at ovulation + luteal phase.
    const currentOvulation = ovulations.filter((ovulation) => ovulation >= anchor).slice(-1)[0];
    let prevStart = anchor;
    for (let cycleIndex = 1; cycleIndex <= count; cycleIndex++) {
      let periodStart: EpochDay;
      let ovulationDay: EpochDay;
      if (cycleIndex === 1 && currentOvulation !== undefined) {
        ovulationDay = currentOvulation;
        periodStart = currentOvulation + lutealPhase;
      } else {
        periodStart = prevStart + cycleLen;
        ovulationDay = addDays(periodStart, -lutealPhase);
      }
      // Uncertainty grows with the square root of cycles projected ahead.
      const spread = Math.max(1, Math.round(variability * Math.sqrt(cycleIndex)));
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
      prevStart = periodStart;
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
    mode,
    fertilityApplicable,
  };
}
