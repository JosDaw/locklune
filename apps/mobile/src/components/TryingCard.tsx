import type { CyclePrediction, EpochDay } from '@locklune/core';
import { Text, View } from 'react-native';
import { CycleRing } from './CycleRing';
import { Txt } from './ui/Text';
import { t, useLocale } from '../i18n';
import { formatDay, formatRange } from '../lib/format';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

export function TryingCard({
  next,
  today,
  cycleProgressDay,
  totalCycle,
  cycleDay,
}: {
  next: CyclePrediction;
  today: EpochDay;
  cycleProgressDay: number;
  totalCycle: number;
  cycleDay: number;
}) {
  useLocale();
  const inWindow = today >= next.fertileWindow.start && today <= next.fertileWindow.end;
  const isOvulationDay = today === next.ovulationDay;
  const afterOvulation = today > next.ovulationDay;

  let label: string;
  let accentColor: string;
  let bigNumber: number;
  let sublabel: string;
  let detail: string;
  let detail2: string | null = null;

  if (isOvulationDay) {
    label = t('tryingCard.ovulationDay');
    accentColor = colors.ovulation;
    bigNumber = 0;
    sublabel = t('tryingCard.peakFertility');
    detail = t('tryingCard.fertileWindowRange', {
      range: formatRange(next.fertileWindow.start, next.fertileWindow.end),
    });
  } else if (inWindow) {
    const daysToOv = next.ovulationDay - today;
    label = t('tryingCard.inFertileWindow');
    accentColor = colors.fertile;
    bigNumber = daysToOv;
    sublabel = t('tryingCard.daysUntilOvulation', { count: daysToOv });
    detail = t('tryingCard.ovulationOn', { date: formatDay(next.ovulationDay) });
  } else if (!afterOvulation) {
    const daysToWindow = next.fertileWindow.start - today;
    label = t('tryingCard.fertileWindow');
    accentColor = colors.fertile;
    bigNumber = daysToWindow;
    sublabel = t('tryingCard.daysAway', { count: daysToWindow });
    detail = formatRange(next.fertileWindow.start, next.fertileWindow.end);
    detail2 = t('tryingCard.ovulationOn', { date: formatDay(next.ovulationDay) });
  } else {
    // Luteal phase - show period countdown so they know the next cycle is coming
    const daysToP = next.periodStart - today;
    label = t('tryingCard.nextFertileWindow');
    accentColor = colors.primarySoft;
    bigNumber = daysToP;
    sublabel = t('tryingCard.daysUntilNextPeriod', { count: daysToP });
    detail = t('tryingCard.newCycleStarts', { date: formatDay(next.periodStart) });
  }

  return (
    <View style={{ flexDirection: 'row', gap: 16, alignItems: 'flex-start' }}>
      <View style={{ flex: 1, gap: 4 }}>
        <Text
          style={{
            fontFamily: fonts.semibold,
            fontSize: 12,
            color: accentColor,
            letterSpacing: 0.5,
            textTransform: 'uppercase',
          }}
        >
          {label}
        </Text>
        <Text
          style={{ fontFamily: fonts.display, fontSize: 64, color: accentColor, lineHeight: 68 }}
        >
          {Math.max(0, bigNumber)}
        </Text>
        <Txt variant="muted">{sublabel}</Txt>
        <Text
          style={{
            fontFamily: fonts.displaySemibold,
            fontSize: 18,
            color: colors.text,
            marginTop: 4,
          }}
        >
          {detail}
        </Text>
        {detail2 && <Txt variant="faint">{detail2}</Txt>}
        {cycleDay > 0 && (
          <Txt variant="faint" className="mt-2.5">
            {t('home.dayXofY', { current: cycleProgressDay, total: totalCycle })}
          </Txt>
        )}
      </View>
      <CycleRing day={cycleProgressDay} total={totalCycle} size={84} color={accentColor} />
    </View>
  );
}
