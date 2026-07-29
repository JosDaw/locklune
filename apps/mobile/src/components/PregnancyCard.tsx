import type { pregnancyProgress } from '@locklune/core';
import { Text, View, type ViewStyle } from 'react-native';
import { Txt } from './ui/Text';
import { formatDay } from '../lib/format';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { CARD_SHADOW } from '../theme/shadows';

export function PregnancyCard({ preg }: { preg: ReturnType<typeof pregnancyProgress> | null }) {
  const cardStyle: ViewStyle = {
    borderRadius: 24,
    backgroundColor: colors.surface,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
    ...CARD_SHADOW,
  };
  if (!preg) {
    return (
      <View style={cardStyle}>
        <Txt variant="label" className="text-primary-soft">
          Pregnancy
        </Txt>
        <Txt variant="muted">Set how many weeks along you are in Settings.</Txt>
      </View>
    );
  }
  return (
    <View style={cardStyle}>
      <Txt variant="label" className="text-primary-soft">
        Pregnancy
      </Txt>
      <Text style={{ fontFamily: fonts.display, fontSize: 48, color: colors.moon }}>
        Week {preg.week}
        {preg.dayOfWeek > 0 ? ` +${preg.dayOfWeek}d` : ''}
      </Text>
      <Txt variant="muted">
        Trimester {preg.trimester} ·{' '}
        {preg.daysRemaining >= 0
          ? `${preg.daysRemaining} days to go`
          : `${-preg.daysRemaining} days over`}
      </Txt>
      <Txt variant="faint">
        Estimated due{' '}
        {formatDay(preg.dueDay, { weekday: 'short', month: 'long', day: 'numeric' })}
      </Txt>
    </View>
  );
}
