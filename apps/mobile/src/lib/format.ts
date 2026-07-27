import { fromEpochDay, todayEpochDay, type Confidence, type EpochDay } from '@locklune/core';

export function formatDay(
  day: EpochDay,
  opts: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' },
): string {
  return fromEpochDay(day).toLocaleDateString(undefined, opts);
}

export function formatRange(start: EpochDay, end: EpochDay): string {
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${formatDay(start, opts)} – ${formatDay(end, opts)}`;
}

export function relativeDays(day: EpochDay, from: EpochDay = todayEpochDay()): string {
  const diff = day - from;
  if (diff === 0) return 'today';
  if (diff === 1) return 'tomorrow';
  if (diff === -1) return 'yesterday';
  if (diff > 0) return `in ${diff} days`;
  return `${-diff} days ago`;
}

export function confidenceLabel(c: Confidence): string {
  return { low: 'Low confidence', medium: 'Building confidence', high: 'High confidence' }[c];
}
