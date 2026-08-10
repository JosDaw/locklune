import type { pregnancyProgress } from '@locklune/core';
import { Text, View, type ViewStyle } from 'react-native';
import { Txt } from './ui/Text';
import { t, useLocale } from '../i18n';
import { formatDay } from '../lib/format';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { CARD_SHADOW } from '../theme/shadows';

export function PregnancyCard({ preg }: { preg: ReturnType<typeof pregnancyProgress> | null }) {
  useLocale();
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
          {t('log.pregnancy')}
        </Txt>
        <Txt variant="muted">{t('insights.setWeeks')}</Txt>
      </View>
    );
  }
  return (
    <View style={cardStyle}>
      <Txt variant="label" className="text-primary-soft">
        {t('log.pregnancy')}
      </Txt>
      <Text style={{ fontFamily: fonts.display, fontSize: 48, color: colors.moon }}>
        {preg.dayOfWeek > 0
          ? t('insights.weekPlusDay', { week: preg.week, days: preg.dayOfWeek })
          : t('insights.weekOnly', { week: preg.week })}
      </Text>
      <Txt variant="muted">
        {t('insights.trimesterLine', {
          trimester: preg.trimester,
          remaining:
            preg.daysRemaining >= 0
              ? t('insights.daysToGo', { count: preg.daysRemaining })
              : t('insights.daysOver', { count: -preg.daysRemaining }),
        })}
      </Txt>
      <Txt variant="faint">
        {t('insights.estimatedDue', {
          date: formatDay(preg.dueDay, { weekday: 'short', month: 'long', day: 'numeric' }),
        })}
      </Txt>
    </View>
  );
}
