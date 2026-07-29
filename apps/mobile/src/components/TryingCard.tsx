import type { CyclePrediction, EpochDay } from '@locklune/core';
import { Text, View } from 'react-native';
import { CycleRing } from './CycleRing';
import { PillButton } from './PillButton';
import { Txt } from './ui/Text';
import { formatDay, formatRange } from '../lib/format';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

export function TryingCard({
  next,
  today,
  cycleProgressDay,
  totalCycle,
  cycleDay,
  onStart,
}: {
  next: CyclePrediction;
  today: EpochDay;
  cycleProgressDay: number;
  totalCycle: number;
  cycleDay: number;
  onStart: () => void;
}) {
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
    label = 'Ovulation day';
    accentColor = colors.ovulation;
    bigNumber = 0;
    sublabel = 'Your estimated peak fertility';
    detail = `Fertile window: ${formatRange(next.fertileWindow.start, next.fertileWindow.end)}`;
  } else if (inWindow) {
    const daysToOv = next.ovulationDay - today;
    label = 'In your fertile window';
    accentColor = colors.fertile;
    bigNumber = daysToOv;
    sublabel = `day${daysToOv === 1 ? '' : 's'} until ovulation`;
    detail = `Ovulation: ${formatDay(next.ovulationDay)}`;
  } else if (!afterOvulation) {
    const daysToWindow = next.fertileWindow.start - today;
    label = 'Fertile window';
    accentColor = colors.fertile;
    bigNumber = daysToWindow;
    sublabel = `day${daysToWindow === 1 ? '' : 's'} away`;
    detail = formatRange(next.fertileWindow.start, next.fertileWindow.end);
    detail2 = `Ovulation: ${formatDay(next.ovulationDay)}`;
  } else {
    // Luteal phase - show period countdown so they know the next cycle is coming
    const daysToP = next.periodStart - today;
    label = 'Next fertile window';
    accentColor = colors.primarySoft;
    bigNumber = daysToP;
    sublabel = `day${daysToP === 1 ? '' : 's'} until next period`;
    detail = `New cycle starts ${formatDay(next.periodStart)}`;
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
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
          <Txt variant="faint" className="flex-1">
            {cycleDay > 0 ? `Day ${cycleProgressDay} of ${totalCycle}` : ' '}
          </Txt>
          <PillButton label="Start period" icon="add" onPress={onStart} />
        </View>
      </View>
      <CycleRing day={cycleProgressDay} total={totalCycle} size={84} color={accentColor} />
    </View>
  );
}
