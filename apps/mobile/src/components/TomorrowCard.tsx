import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import type { Cycle, DayLog, EpochDay, Prediction } from '@locklune/core';
import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { Txt } from './ui/Text';
import { formatDay } from '../lib/format';
import { FLOW_LABELS, MOOD_LABEL, MOOD_META } from '../lib/logging';
import { computePhase, phaseForLog } from '../lib/phases';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { CARD_SHADOW } from '../theme/shadows';

type TomorrowCardProps = {
  tomorrow: EpochDay;
  cycles: Cycle[];
  prediction: Prediction;
  recentLogs: DayLog[];
  fertility: boolean;
  avgLen: number;
  avgPeriodLen: number;
};

// Thin guard wrapper: bails before any hooks run so TomorrowCardBody always calls
// its hooks unconditionally (keeps hook order stable across renders).
export function TomorrowCard(props: TomorrowCardProps) {
  const last = props.cycles[props.cycles.length - 1];
  if (!last) return null;

  const tomorrowCycleDay = props.tomorrow - last.startDay + 1;
  if (tomorrowCycleDay <= 0) return null;

  return <TomorrowCardBody {...props} last={last} tomorrowCycleDay={tomorrowCycleDay} />;
}

function TomorrowCardBody({
  tomorrow,
  cycles,
  prediction,
  recentLogs,
  fertility,
  avgLen,
  avgPeriodLen,
  last,
  tomorrowCycleDay,
}: TomorrowCardProps & { last: Cycle; tomorrowCycleDay: number }) {
  // Is tomorrow still within an ongoing period?
  const ongoingPeriodEnd = last.endDay === null
    ? last.startDay + Math.max(1, Math.round(avgPeriodLen)) - 1
    : null;
  const ongoingPeriodTomorrow = ongoingPeriodEnd !== null && tomorrow <= ongoingPeriodEnd;
  const isLastOngoingDay = ongoingPeriodEnd !== null && tomorrow === ongoingPeriodEnd;

  // Is tomorrow a predicted future period?
  const predictedUpcoming = prediction.upcoming.find(
    (u) => tomorrow >= u.periodStart && tomorrow <= u.periodEnd,
  );
  const isLastPredictedDay = predictedUpcoming != null && tomorrow === predictedUpcoming.periodEnd;

  const isPeriod = ongoingPeriodTomorrow || predictedUpcoming != null;
  const isPeriodEnding = isPeriod && (isLastOngoingDay || isLastPredictedDay);

  const isOvulation =
    fertility && prediction.upcoming.some((u) => u.ovulationDay === tomorrow);
  const isFertile =
    fertility &&
    !isOvulation &&
    prediction.upcoming.some(
      (u) => tomorrow >= u.fertileWindow.start && tomorrow <= u.fertileWindow.end,
    );

  const next = prediction.upcoming[0];
  const tomorrowPhase = computePhase(isPeriod, tomorrowCycleDay, next, tomorrow, fertility);

  // Historical flow and mood for tomorrow's cycle day across past cycles
  const { expectedFlow, expectedMood } = useMemo(() => {
    const flowValues: number[] = [];
    const moodCounts: Record<number, number> = {};
    recentLogs.forEach((log) => {
      for (let i = cycles.length - 1; i >= 0; i--) {
        if (log.day >= cycles[i]!.startDay) {
          if (log.day - cycles[i]!.startDay + 1 === tomorrowCycleDay) {
            if (log.flow != null) flowValues.push(log.flow);
            if (log.mood != null) moodCounts[log.mood] = (moodCounts[log.mood] ?? 0) + 1;
          }
          break;
        }
      }
    });
    const flow =
      flowValues.length > 0 && isPeriod
        ? Math.round(flowValues.reduce((a, b) => a + b, 0) / flowValues.length)
        : null;
    const moodEntries = Object.entries(moodCounts);
    const mood =
      moodEntries.length > 0
        ? Number(moodEntries.sort((a, b) => b[1] - a[1])[0]![0])
        : null;
    return { expectedFlow: flow, expectedMood: mood };
  }, [isPeriod, recentLogs, cycles, tomorrowCycleDay]);

  const phaseSymptoms = useMemo(() => {
    if (!tomorrowPhase) return [];
    const counts: Record<string, number> = {};
    recentLogs.forEach((log) => {
      if (phaseForLog(log.day, cycles, avgLen, avgPeriodLen) === tomorrowPhase.label) {
        log.symptoms.forEach((s) => { counts[s] = (counts[s] ?? 0) + 1; });
      }
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([s]) => s.charAt(0).toUpperCase() + s.slice(1));
  }, [recentLogs, cycles, tomorrowPhase, avgLen, avgPeriodLen]);

  let statusIcon: keyof typeof Ionicons.glyphMap = 'ellipse-outline';
  let statusColor: string = colors.textMuted;
  let statusText = `Day ${tomorrowCycleDay} of your cycle`;

  if (isPeriod) {
    statusIcon = isPeriodEnding ? 'checkmark-circle-outline' : 'ellipse';
    statusColor = colors.period;
    if (isPeriodEnding) {
      statusText = 'Period likely ending';
    } else {
      statusText = ongoingPeriodTomorrow ? 'Period continues' : 'Period expected';
    }
  } else if (isOvulation) {
    statusIcon = 'leaf-outline';
    statusColor = colors.ovulation;
    statusText = 'Estimated ovulation';
  } else if (isFertile) {
    statusIcon = 'star-outline';
    statusColor = colors.fertile;
    statusText = 'In your fertile window';
  }

  return (
    <View
      style={{
        borderRadius: 20,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 16,
        gap: 10,
        ...CARD_SHADOW,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Txt variant="label">Tomorrow</Txt>
        <Txt variant="faint">
          {formatDay(tomorrow, { weekday: 'short', month: 'short', day: 'numeric' })}
        </Txt>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Ionicons name={statusIcon} size={14} color={statusColor} />
        <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: statusColor }}>
          {statusText}
        </Text>
      </View>

      {/* Expected flow - only shown during period days */}
      {isPeriod && expectedFlow != null && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ flexDirection: 'row', gap: 3 }}>
            {[1, 2, 3, 4].map((level) => (
              <Ionicons
                key={level}
                name="water"
                size={15}
                color={level <= expectedFlow ? colors.period : colors.period + '28'}
              />
            ))}
          </View>
          <Text style={{ fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted }}>
            {FLOW_LABELS[expectedFlow]} expected
          </Text>
        </View>
      )}

      {/* Expected mood */}
      {expectedMood != null && MOOD_META[expectedMood] != null && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <MaterialCommunityIcons
            name={MOOD_META[expectedMood]!.icon}
            size={18}
            color={MOOD_META[expectedMood]!.color}
          />
          <Text style={{ fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted }}>
            Usually feeling {MOOD_LABEL[expectedMood]} on days like this
          </Text>
        </View>
      )}

      {phaseSymptoms.length > 0 && (
        <View style={{ gap: 6 }}>
          <Text
            style={{ fontFamily: fonts.medium, fontSize: 11, color: colors.textFaint, letterSpacing: 0.4 }}
          >
            Often logged on days like this
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
            {phaseSymptoms.map((s) => (
              <View
                key={s}
                style={{
                  borderRadius: 99,
                  backgroundColor: colors.surfaceMuted,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                }}
              >
                <Text
                  style={{ fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted }}
                >
                  {s}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}
