import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import type { DayLog } from '@locklune/core';
import { Pressable, Text, View } from 'react-native';
import { Txt } from './ui/Text';
import { t, useLocale } from '../i18n';
import { FLOW_LABEL_KEY, MOOD_META, symptomLabel } from '../lib/logging';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { CARD_SHADOW } from '../theme/shadows';

export function TodayEntryCard({ log, onEdit }: { log: DayLog; onEdit: () => void }) {
  useLocale();
  const moodMeta = log.mood != null ? MOOD_META[log.mood] : null;
  const shownSyms = log.symptoms.slice(0, 4);
  const extra = log.symptoms.length - shownSyms.length;

  return (
    <View
      style={{
        borderRadius: 24,
        backgroundColor: colors.surface,
        padding: 20,
        borderWidth: 1,
        borderColor: colors.border,
        gap: 10,
        ...CARD_SHADOW,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Txt variant="label">{t('todayCard.title')}</Txt>
        {moodMeta && (
          <MaterialCommunityIcons name={moodMeta.icon} size={30} color={moodMeta.color} />
        )}
      </View>

      {log.flow != null && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ flexDirection: 'row', gap: 3 }}>
            {[1, 2, 3, 4].map((level) => (
              <Ionicons
                key={level}
                name="water"
                size={18}
                color={level <= log.flow! ? colors.period : colors.period + '28'}
              />
            ))}
          </View>
          <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted }}>
            {t(FLOW_LABEL_KEY[log.flow])}
          </Text>
        </View>
      )}

      {shownSyms.length > 0 && (
        <View style={{ gap: 6 }}>
          <Text
            style={{
              fontFamily: fonts.medium,
              fontSize: 11,
              color: colors.textFaint,
              letterSpacing: 0.4,
            }}
          >
            {t('todayCard.symptoms')}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {shownSyms.map((symptom) => (
              <View
                key={symptom}
                style={{
                  borderRadius: 99,
                  backgroundColor: colors.surfaceMuted,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                }}
              >
                <Text style={{ fontFamily: fonts.medium, fontSize: 12, color: colors.textMuted }}>
                  {symptomLabel(symptom)}
                </Text>
              </View>
            ))}
            {extra > 0 && (
              <View
                style={{
                  borderRadius: 99,
                  backgroundColor: colors.surfaceMuted,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                }}
              >
                <Text style={{ fontFamily: fonts.medium, fontSize: 12, color: colors.textFaint }}>
                  {t('todayCard.moreCount', { count: extra })}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {log.note && (
        <View style={{ gap: 4 }}>
          <Text
            style={{
              fontFamily: fonts.medium,
              fontSize: 11,
              color: colors.textFaint,
              letterSpacing: 0.4,
            }}
          >
            {t('todayCard.notes')}
          </Text>
          <Text
            numberOfLines={2}
            style={{
              fontFamily: fonts.regular,
              fontSize: 14,
              color: colors.textMuted,
              fontStyle: 'italic',
            }}
          >
            {log.note}
          </Text>
        </View>
      )}

      <Pressable
        onPress={onEdit}
        accessibilityRole="button"
        accessibilityLabel={t('todayCard.edit')}
        style={{
          alignSelf: 'flex-start',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          marginTop: 2,
          borderRadius: 99,
          backgroundColor: colors.surfaceMuted,
          paddingHorizontal: 14,
          paddingVertical: 8,
        }}
      >
        <Ionicons name="pencil-outline" size={16} color={colors.primarySoft} />
        <Text style={{ fontFamily: fonts.semibold, fontSize: 13, color: colors.primarySoft }}>
          {t('todayCard.edit')}
        </Text>
      </Pressable>
    </View>
  );
}
