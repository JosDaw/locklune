import type { Cycle, EpochDay } from './types.js';

/** Where a given calendar day sits relative to the user's recorded cycles. */
export interface DayCycleStatus {
  /** The cycle whose bleed range covers `day`, or null if the day is outside every cycle. */
  cycle: Cycle | null;
  /** True when `day` is the first (start) day of a cycle. */
  isStart: boolean;
  /** True when `day` falls within a cycle's bleed range. */
  isBleedDay: boolean;
}

/**
 * Classify a calendar day against recorded cycles: whether it starts a cycle and
 * whether it falls within a bleed.
 *
 * A bleed spans `startDay … (endDay ?? min(nextStart − 1, today))`, so an ongoing
 * (unfinished) period is treated as running up to `today`, and a period left open
 * before a later one is capped the day before the next start.
 *
 * Pure and UI-agnostic: the log screen uses it to decide which start / end / remove
 * action to offer for the day being edited.
 */
export function cycleForDay(cycles: Cycle[], day: EpochDay, today: EpochDay): DayCycleStatus {
  const sorted = [...cycles].sort((a, b) => a.startDay - b.startDay);
  for (let i = 0; i < sorted.length; i++) {
    const c = sorted[i]!;
    // Sorted ascending: once a start is past `day`, no later cycle can contain it.
    if (c.startDay > day) break;
    const nextStart = sorted[i + 1]?.startDay ?? Infinity;
    const bleedEnd = c.endDay ?? Math.min(nextStart - 1, today);
    if (day <= bleedEnd) {
      return { cycle: c, isStart: c.startDay === day, isBleedDay: true };
    }
  }
  return { cycle: null, isStart: false, isBleedDay: false };
}
