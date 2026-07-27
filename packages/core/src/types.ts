/**
 * Domain types for Locklune. Dates are stored as **epoch-days** (integer number
 * of whole days since 1970-01-01 UTC) so that every date is a few bytes and
 * cycle math is plain integer subtraction. See {@link ./dates.ts}.
 */

/** Integer number of whole days since the Unix epoch (1970-01-01). */
export type EpochDay = number;

/** A single menstrual cycle: one row per cycle, not per day. */
export interface Cycle {
  /** Local id (autoincrement in SQLite). */
  id: number;
  /** First day of bleeding. */
  startDay: EpochDay;
  /**
   * Last day of bleeding, if the period has finished. `null` while the current
   * period is still ongoing. The *cycle* length is measured start-to-next-start,
   * independent of this bleed end.
   */
  endDay: EpochDay | null;
}

/** Menstrual flow intensity for a logged day. */
export enum Flow {
  Spotting = 1,
  Light = 2,
  Medium = 3,
  Heavy = 4,
}

/** Coarse mood scale for a logged day. */
export enum Mood {
  Awful = 1,
  Low = 2,
  Okay = 3,
  Good = 4,
  Great = 5,
}

/**
 * A sparse per-day log. A row exists **only** when the user recorded something,
 * so an empty calendar costs zero storage.
 */
export interface DayLog {
  day: EpochDay;
  flow: Flow | null;
  mood: Mood | null;
  /** Free-form symptom tags, e.g. ['cramps', 'headache']. */
  symptoms: string[];
  note: string | null;
}

/** User-configurable settings that influence predictions and locking. */
export interface Settings {
  /** Length of the luteal phase in days (ovulation ≈ nextPeriod − this). */
  lutealPhaseDays: number;
  /** Default assumed cycle length before enough data exists. */
  defaultCycleLength: number;
  /** Default assumed period (bleed) length. */
  defaultPeriodLength: number;
  /** Minutes of inactivity before the app auto-locks. */
  autoLockMinutes: number;
  /** Whether biometric unlock is enrolled. */
  biometricEnabled: boolean;
  /** Local reminders (days before predicted period) to notify on. */
  reminderDaysBefore: number[];
}

export const DEFAULT_SETTINGS: Settings = {
  lutealPhaseDays: 14,
  defaultCycleLength: 28,
  defaultPeriodLength: 5,
  autoLockMinutes: 2,
  biometricEnabled: false,
  reminderDaysBefore: [2],
};

/** Confidence tier attached to a prediction. */
export type Confidence = 'low' | 'medium' | 'high';

/** An inclusive day range. */
export interface DayRange {
  start: EpochDay;
  end: EpochDay;
}

/** A single predicted upcoming cycle. */
export interface CyclePrediction {
  /** Predicted first day of the next period. */
  periodStart: EpochDay;
  /** Predicted last day of that period. */
  periodEnd: EpochDay;
  /** Uncertainty window around {@link periodStart}. */
  periodStartRange: DayRange;
  /** Predicted ovulation day (nextPeriodStart − lutealPhaseDays). */
  ovulationDay: EpochDay;
  /** Predicted fertile window (ovulation − 5 … ovulation + 1). */
  fertileWindow: DayRange;
}

/** The full prediction result derived from a user's cycle history. */
export interface Prediction {
  /** Rolling estimate of the user's cycle length. */
  averageCycleLength: number;
  /** Estimated period (bleed) length. */
  averagePeriodLength: number;
  /** Spread (std-dev, days) of recent cycle lengths. */
  variability: number;
  confidence: Confidence;
  /** Number of complete cycles used for the estimate. */
  cyclesAnalyzed: number;
  /** Whether estimates are still defaults (not enough data yet). */
  usingDefaults: boolean;
  /** Next N predicted cycles (soonest first). */
  upcoming: CyclePrediction[];
}
