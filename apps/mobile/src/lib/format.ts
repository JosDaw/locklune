import { fromEpochDay, todayEpochDay, type Confidence, type EpochDay } from '@locklune/core';
import { t } from '../i18n';

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
  if (diff === 0) return t('format.today');
  if (diff === 1) return t('format.tomorrow');
  if (diff === -1) return t('format.yesterday');
  if (diff > 0) return t('format.inDays', { count: diff });
  return t('format.daysAgo', { count: -diff });
}

export function confidenceLabel(confidence: Confidence): string {
  return t(`format.confidence.${confidence}`);
}
