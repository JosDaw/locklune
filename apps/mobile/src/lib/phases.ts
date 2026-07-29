import type { Cycle, CyclePrediction, EpochDay } from '@locklune/core';
import { colors } from '../theme/colors';

export type PhaseInfo = { label: string; color: string };

/** Accent colours for the two phases that aren't already in the palette. */
const FOLLICULAR_COLOR = '#86EFAC';
const LUTEAL_COLOR = '#C084FC';

/** Current cycle phase (label + colour) for the hero subtitle and ring, or null. */
export function computePhase(
  onPeriod: boolean,
  cycleDay: number,
  next: CyclePrediction | undefined,
  today: EpochDay,
  fertility: boolean,
): PhaseInfo | null {
  if (!cycleDay) return null;
  if (onPeriod) return { label: 'Menstrual', color: colors.danger };
  if (!fertility || !next) return null;
  if (today >= next.fertileWindow.start && today <= next.fertileWindow.end)
    return { label: 'Ovulatory', color: colors.ovulation };
  if (today < next.fertileWindow.start) return { label: 'Follicular', color: FOLLICULAR_COLOR };
  return { label: 'Luteal', color: LUTEAL_COLOR };
}

/** Phase label for a past logged day, derived from cycle averages. */
export function phaseForLog(
  day: EpochDay,
  cycles: Cycle[],
  avgLen: number,
  avgPeriodLen: number,
): string | null {
  let cycleStart: number | null = null;
  for (let i = cycles.length - 1; i >= 0; i--) {
    if (day >= cycles[i].startDay) {
      cycleStart = cycles[i].startDay;
      break;
    }
  }
  if (cycleStart === null) return null;
  const cd = day - cycleStart + 1;
  const fertStart = avgLen - 19; // ovulation - 5
  const ovDay = avgLen - 14;
  if (cd <= avgPeriodLen) return 'Menstrual';
  if (cd < fertStart) return 'Follicular';
  if (cd <= ovDay + 1) return 'Ovulatory';
  return 'Luteal';
}
