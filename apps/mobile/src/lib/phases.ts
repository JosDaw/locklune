import type { Cycle, CyclePrediction, EpochDay } from '@locklune/core';
import { colors } from '../theme/colors';

/** Stable phase identifier - used for logic/equality and as the i18n key suffix. */
export type PhaseId = 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';
export type PhaseInfo = { id: PhaseId; color: string };

/** i18n key for a phase id (translate for display; never compare translated text). */
export function phaseLabelKey(id: PhaseId): string {
  return `data.phase.${id}`;
}

/** Accent colours for the two phases that aren't already in the palette. */
const FOLLICULAR_COLOR = '#86EFAC';
const LUTEAL_COLOR = '#C084FC';

/** Current cycle phase (id + colour) for the hero subtitle and ring, or null. */
export function computePhase(
  onPeriod: boolean,
  cycleDay: number,
  next: CyclePrediction | undefined,
  today: EpochDay,
  fertility: boolean,
): PhaseInfo | null {
  if (!cycleDay) return null;
  if (onPeriod) return { id: 'menstrual', color: colors.danger };
  if (!fertility || !next) return null;
  if (today >= next.fertileWindow.start && today <= next.fertileWindow.end)
    return { id: 'ovulatory', color: colors.ovulation };
  if (today < next.fertileWindow.start) return { id: 'follicular', color: FOLLICULAR_COLOR };
  return { id: 'luteal', color: LUTEAL_COLOR };
}

/** Phase id for a past logged day, derived from cycle averages. */
export function phaseForLog(
  day: EpochDay,
  cycles: Cycle[],
  avgLen: number,
  avgPeriodLen: number,
): PhaseId | null {
  let cycleStart: number | null = null;
  for (let index = cycles.length - 1; index >= 0; index--) {
    if (day >= cycles[index].startDay) {
      cycleStart = cycles[index].startDay;
      break;
    }
  }
  if (cycleStart === null) return null;
  const cycleDay = day - cycleStart + 1;
  const fertStart = avgLen - 19; // ovulation - 5
  const ovDay = avgLen - 14;
  if (cycleDay <= avgPeriodLen) return 'menstrual';
  if (cycleDay < fertStart) return 'follicular';
  if (cycleDay <= ovDay + 1) return 'ovulatory';
  return 'luteal';
}
