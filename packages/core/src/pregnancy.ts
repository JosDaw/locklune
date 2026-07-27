import type { EpochDay, Pregnancy } from './types.js';

/** Length of a full-term pregnancy (Naegele's rule: 40 weeks from LMP). */
export const GESTATION_DAYS = 280;

/** Estimate a due date from the last period start (LMP + 280 days). */
export function estimateDueDay(lastPeriodStart: EpochDay): EpochDay {
  return lastPeriodStart + GESTATION_DAYS;
}

/** Turn a "weeks along today" figure into a due date (for onboarding sliders). */
export function dueDayFromWeeksAlong(weeksAlong: number, today: EpochDay): EpochDay {
  return today - Math.round(weeksAlong * 7) + GESTATION_DAYS;
}

/** Pregnancy progress (gestational age, trimester, days remaining) from a due date. */
export function pregnancyProgress(dueDay: EpochDay, today: EpochDay): Pregnancy {
  const lmp = dueDay - GESTATION_DAYS;
  const daysPregnant = Math.max(0, today - lmp);
  const week = Math.floor(daysPregnant / 7);
  const dayOfWeek = daysPregnant % 7;
  const trimester: 1 | 2 | 3 = week < 14 ? 1 : week < 28 ? 2 : 3;
  return { dueDay, daysPregnant, week, dayOfWeek, trimester, daysRemaining: dueDay - today };
}
