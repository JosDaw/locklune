import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Cycle, DayLog } from '@locklune/core';
import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { t, useLocale } from '../i18n';
import { MOOD_LABEL_KEY, MOOD_META, symptomLabel } from '../lib/logging';
import { phaseForLog, type PhaseInfo } from '../lib/phases';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

function computeStats(logs: DayLog[]): { topMood: number | null; topSymptoms: string[] } {
  const moodCounts: Record<number, number> = {};
  logs.forEach((log) => {
    if (log.mood != null) moodCounts[log.mood] = (moodCounts[log.mood] ?? 0) + 1;
  });
  const topMood =
    Object.keys(moodCounts).length >= 3
      ? Number(Object.entries(moodCounts).sort((first, second) => second[1] - first[1])[0]![0])
      : null;

  const symCounts: Record<string, number> = {};
  logs.forEach((log) =>
    log.symptoms.forEach((symptom) => {
      symCounts[symptom] = (symCounts[symptom] ?? 0) + 1;
    }),
  );
  const topSymptoms = Object.entries(symCounts)
    .sort((first, second) => second[1] - first[1])
    .slice(0, 3)
    .map(([symptom]) => symptom);

  return { topMood, topSymptoms };
}

export function StatsRow({
  logs,
  cycles,
  currentPhase,
  avgLen,
  avgPeriodLen,
}: {
  logs: DayLog[];
  cycles: Cycle[];
  currentPhase: PhaseInfo | null;
  avgLen: number;
  avgPeriodLen: number;
}) {
  useLocale();
  const { topMood, topSymptoms } = computeStats(logs);

  // Phase-specific symptom trend
  const phaseSymptoms = useMemo(() => {
    if (!currentPhase || cycles.length === 0) return [];
    const symCounts: Record<string, number> = {};
    logs.forEach((log) => {
      const phase = phaseForLog(log.day, cycles, avgLen, avgPeriodLen);
      if (phase === currentPhase.id) {
        log.symptoms.forEach((symptom) => {
          symCounts[symptom] = (symCounts[symptom] ?? 0) + 1;
        });
      }
    });
    return Object.entries(symCounts)
      .sort((first, second) => second[1] - first[1])
      .slice(0, 3)
      .map(([symptom]) => symptom);
  }, [logs, cycles, currentPhase, avgLen, avgPeriodLen]);

  const shownSymptoms = phaseSymptoms.length > 0 && currentPhase ? phaseSymptoms : topSymptoms;

  if (topMood === null && shownSymptoms.length === 0) return null;

  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {topMood !== null && (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            gap: 6,
            backgroundColor: colors.surface,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: 12,
            paddingVertical: 14,
          }}
        >
          <MaterialCommunityIcons
            name={MOOD_META[topMood]!.icon}
            size={32}
            color={MOOD_META[topMood]!.color}
          />
          <Text
            style={{
              fontFamily: fonts.regular,
              fontSize: 12,
              color: colors.textMuted,
              textAlign: 'center',
            }}
          >
            {t('statsRow.usuallyMood', { mood: t(MOOD_LABEL_KEY[topMood]) })}
          </Text>
        </View>
      )}
      {shownSymptoms.length > 0 && (
        <View
          style={{
            flex: 1,
            gap: 8,
            backgroundColor: colors.surface,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: 12,
            paddingVertical: 10,
          }}
        >
          <Text
            style={{
              fontFamily: fonts.medium,
              fontSize: 11,
              color: colors.textFaint,
              letterSpacing: 0.4,
            }}
          >
            {t('statsRow.frequentSymptoms')}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
            {shownSymptoms.map((symptom) => (
              <View
                key={symptom}
                style={{
                  borderRadius: 99,
                  backgroundColor: colors.surfaceMuted,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                }}
              >
                <Text style={{ fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted }}>
                  {symptomLabel(symptom)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}
