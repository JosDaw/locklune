import { Ionicons } from '@expo/vector-icons';
import { CYCLE_MODE, pregnancyProgress, todayEpochDay, type Cycle } from '@locklune/core';
import { useMemo } from 'react';
import { Alert, View } from 'react-native';
import { CycleRow } from '../../components/CycleRow';
import { StatTile } from '../../components/StatTile';
import { Card } from '../../components/ui/Card';
import { Screen } from '../../components/ui/Screen';
import { Txt } from '../../components/ui/Text';
import { confidenceLabel, formatDay, relativeDays } from '../../lib/format';
import * as haptics from '../../lib/haptics';
import { useDataStore } from '../../stores/dataStore';
import { colors } from '../../theme/colors';

export default function Insights() {
  const cycles = useDataStore((store) => store.cycles);
  const prediction = useDataStore((store) => store.prediction);
  const settings = useDataStore((store) => store.settings);
  const deleteCycle = useDataStore((store) => store.deleteCycle);
  const today = todayEpochDay();

  const confirmDelete = (cycle: Cycle) => {
    haptics.warn();
    Alert.alert(
      'Delete this period?',
      `This removes the period starting ${formatDay(cycle.startDay)} from your history. Symptom logs are kept.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => void (async () => (await deleteCycle(cycle.id)) && haptics.success())(),
        },
      ],
    );
  };
  const preg =
    settings.cycleMode === CYCLE_MODE.Pregnant && settings.pregnancyDueDay != null
      ? pregnancyProgress(settings.pregnancyDueDay, today)
      : null;

  const lengths = useMemo(() => {
    const result: number[] = [];
    for (let index = 1; index < cycles.length; index++)
      result.push(cycles[index]!.startDay - cycles[index - 1]!.startDay);
    return result.slice(-8);
  }, [cycles]);

  const maxLen = Math.max(35, ...lengths);

  return (
    <Screen>
      <View className="flex-row items-center gap-2 pb-1 pt-2">
        <Ionicons name="stats-chart" size={14} color={colors.primarySoft} />
        <Txt variant="faint">Your cycle, over time</Txt>
      </View>

      {/* Illuminated stat tiles */}
      <Card>
        <View className="flex-row gap-3">
          <StatTile label="Avg cycle" value={`${Math.round(prediction.averageCycleLength)}d`} />
          <StatTile label="Avg period" value={`${Math.round(prediction.averagePeriodLength)}d`} />
          <StatTile label="Variation" value={`±${Math.round(prediction.variability)}d`} />
        </View>
        <Txt variant="faint" className="mt-4 text-center">
          {confidenceLabel(prediction.confidence)} · {prediction.cyclesAnalyzed} cycle
          {prediction.cyclesAnalyzed === 1 ? '' : 's'} analyzed
        </Txt>
      </Card>

      {/* Cycle length bar chart */}
      <Card>
        <Txt variant="title" className="mb-4">
          Recent cycle lengths
        </Txt>
        {lengths.length === 0 ? (
          <View className="items-center gap-3 py-4">
            <Ionicons name="analytics-outline" size={32} color={colors.textFaint} />
            <Txt variant="muted" className="text-center">
              Log at least two periods to see your cycle lengths.
            </Txt>
          </View>
        ) : (
          <View className="gap-3">
            {lengths.map((length, index) => (
              <View key={index} className="flex-row items-center gap-3">
                <Txt variant="faint" className="w-5 text-right text-2xs">
                  {index + 1}
                </Txt>
                <View className="h-4 flex-1 overflow-hidden rounded-full bg-surfaceMuted">
                  <View
                    className="h-4 rounded-full bg-period"
                    style={{
                      width: `${Math.min(100, (length / maxLen) * 100)}%`,
                      opacity: 0.7 + 0.3 * (index / Math.max(1, lengths.length - 1)),
                    }}
                  />
                </View>
                <Txt variant="muted" className="w-12 text-right">
                  {length}d
                </Txt>
              </View>
            ))}
          </View>
        )}
      </Card>

      {/* Upcoming or pregnancy */}
      {settings.cycleMode === CYCLE_MODE.Pregnant ? (
        <Card>
          <View className="flex-row items-center gap-2 mb-4">
            <Ionicons name="heart-outline" size={14} color={colors.textFaint} />
            <Txt variant="title">Pregnancy</Txt>
          </View>
          {preg ? (
            <View className="gap-2">
              <Txt variant="display">
                Week {preg.week}
                {preg.dayOfWeek > 0 ? ` + ${preg.dayOfWeek}d` : ''}
              </Txt>
              <Txt variant="muted">
                Trimester {preg.trimester} ·{' '}
                {preg.daysRemaining >= 0
                  ? `${preg.daysRemaining} days to go`
                  : `${-preg.daysRemaining} days over`}
              </Txt>
              <Txt variant="faint">
                Estimated due {formatDay(preg.dueDay, { month: 'long', day: 'numeric' })}
              </Txt>
            </View>
          ) : (
            <Txt variant="muted">Set how many weeks along you are in Settings.</Txt>
          )}
        </Card>
      ) : (
        <Card>
          <View className="flex-row items-center gap-2 mb-4">
            <Ionicons name="calendar-outline" size={14} color={colors.textFaint} />
            <Txt variant="title">
              {settings.cycleMode === CYCLE_MODE.Contraception
                ? 'Upcoming bleeds'
                : 'Upcoming periods'}
            </Txt>
          </View>
          {prediction.upcoming.length === 0 ? (
            <View className="items-center gap-3 py-2">
              <Txt variant="muted" className="text-center">
                Log your first period to see predictions.
              </Txt>
            </View>
          ) : (
            <View className="gap-3">
              {prediction.upcoming
                .filter((upcoming) => upcoming.periodStart <= today + 183)
                .map((upcoming, index) => (
                  <View
                    key={index}
                    className="flex-row items-center justify-between py-1"
                    style={
                      index > 0 ? { borderTopWidth: 1, borderTopColor: colors.border } : undefined
                    }
                  >
                    <Txt variant="body">
                      {formatDay(upcoming.periodStart, { month: 'long', day: 'numeric' })}
                    </Txt>
                    <Txt variant="faint">{relativeDays(upcoming.periodStart)}</Txt>
                  </View>
                ))}
            </View>
          )}
        </Card>
      )}

      {/* Cycle history */}
      {cycles.length > 0 && (
        <Card>
          <View className="flex-row items-center gap-2 mb-4">
            <Ionicons name="time-outline" size={14} color={colors.textFaint} />
            <Txt variant="title">Cycle history</Txt>
          </View>
          <View className="gap-3">
            {[...cycles]
              .reverse()
              .slice(0, 12)
              .map((cycle) => (
                <CycleRow key={cycle.id} cycle={cycle} onDelete={() => confirmDelete(cycle)} />
              ))}
          </View>
        </Card>
      )}

      <Txt variant="faint" className="text-center">
        For record keeping purposes only. Locklune does not provide medical or health advice.
      </Txt>
    </Screen>
  );
}
