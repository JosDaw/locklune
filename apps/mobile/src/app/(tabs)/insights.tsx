import { useMemo } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { pregnancyProgress, todayEpochDay, type Cycle } from '@locklune/core';
import { Card } from '../../components/ui/Card';
import { Screen } from '../../components/ui/Screen';
import { Txt } from '../../components/ui/Text';
import { confidenceLabel, formatDay, relativeDays } from '../../lib/format';
import * as haptics from '../../lib/haptics';
import { colors } from '../../theme/colors';
import { useDataStore } from '../../stores/dataStore';

export default function Insights() {
  const cycles = useDataStore((s) => s.cycles);
  const prediction = useDataStore((s) => s.prediction);
  const settings = useDataStore((s) => s.settings);
  const deleteCycle = useDataStore((s) => s.deleteCycle);
  const today = todayEpochDay();

  const confirmDelete = (cyc: Cycle) => {
    haptics.warn();
    Alert.alert(
      'Delete this period?',
      `This removes the period starting ${formatDay(cyc.startDay)} from your history. Symptom logs are kept.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => void (async () => (await deleteCycle(cyc.id)) && haptics.success())(),
        },
      ],
    );
  };
  const preg =
    settings.cycleMode === 'pregnant' && settings.pregnancyDueDay != null
      ? pregnancyProgress(settings.pregnancyDueDay, today)
      : null;

  const lengths = useMemo(() => {
    const out: number[] = [];
    for (let i = 1; i < cycles.length; i++) out.push(cycles[i]!.startDay - cycles[i - 1]!.startDay);
    return out.slice(-8);
  }, [cycles]);

  const maxLen = Math.max(35, ...lengths);

  return (
    <Screen>
      <Txt variant="display" className="pt-2">
        Insights
      </Txt>

      <Card>
        <View className="flex-row justify-between">
          <Stat label="Avg cycle" value={`${Math.round(prediction.averageCycleLength)}d`} />
          <Stat label="Avg period" value={`${Math.round(prediction.averagePeriodLength)}d`} />
          <Stat label="Variation" value={`±${Math.round(prediction.variability)}d`} />
        </View>
        <Txt variant="faint" className="mt-4 text-center">
          {confidenceLabel(prediction.confidence)} · {prediction.cyclesAnalyzed} cycle
          {prediction.cyclesAnalyzed === 1 ? '' : 's'} analyzed
        </Txt>
      </Card>

      <Card>
        <Txt variant="title" className="mb-4">
          Recent cycle lengths
        </Txt>
        {lengths.length === 0 ? (
          <Txt variant="muted">Log at least two periods to see your cycle lengths.</Txt>
        ) : (
          <View className="gap-2">
            {lengths.map((len, i) => (
              <View key={i} className="flex-row items-center gap-3">
                <View className="h-4 flex-1 overflow-hidden rounded-full bg-surfaceMuted">
                  <View
                    className="h-4 rounded-full bg-primary"
                    style={{ width: `${Math.min(100, (len / maxLen) * 100)}%` }}
                  />
                </View>
                <Txt variant="muted" className="w-12 text-right">
                  {len}d
                </Txt>
              </View>
            ))}
          </View>
        )}
      </Card>

      {settings.cycleMode === 'pregnant' ? (
        <Card>
          <Txt variant="title" className="mb-4">
            Pregnancy
          </Txt>
          {preg ? (
            <View className="gap-2">
              <Txt variant="heading">
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
          <Txt variant="title" className="mb-4">
            {settings.cycleMode === 'contraception' ? 'Upcoming bleeds' : 'Upcoming periods'}
          </Txt>
          {prediction.upcoming.length === 0 ? (
            <Txt variant="muted">Log your first period to see predictions.</Txt>
          ) : (
            <View className="gap-3">
              {prediction.upcoming.map((u, i) => (
                <View key={i} className="flex-row items-center justify-between">
                  <Txt variant="body">
                    {formatDay(u.periodStart, { month: 'long', day: 'numeric' })}
                  </Txt>
                  <Txt variant="muted">{relativeDays(u.periodStart)}</Txt>
                </View>
              ))}
            </View>
          )}
        </Card>
      )}

      {cycles.length > 0 && (
        <Card>
          <Txt variant="title" className="mb-4">
            Cycle history
          </Txt>
          <View className="gap-3">
            {[...cycles]
              .reverse()
              .slice(0, 12)
              .map((cyc) => (
                <CycleRow key={cyc.id} cycle={cyc} onDelete={() => confirmDelete(cyc)} />
              ))}
          </View>
          <Txt variant="faint" className="mt-4">
            Tap any day in the calendar to add, end, or correct a period.
          </Txt>
        </Card>
      )}

      <Txt variant="faint" className="text-center">
        For organisation only. Locklune is not medical or health advice.
      </Txt>
    </Screen>
  );
}

function CycleRow({ cycle, onDelete }: { cycle: Cycle; onDelete: () => void }) {
  const end = cycle.endDay;
  const length = end != null ? end - cycle.startDay + 1 : null;
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-1 pr-3">
        <Txt variant="body">
          {formatDay(cycle.startDay, opts)}
          {end != null ? ` – ${formatDay(end, opts)}` : ''}
        </Txt>
        <Txt variant="faint">{length != null ? `${length}-day period` : 'Ongoing'}</Txt>
      </View>
      <Pressable
        onPress={onDelete}
        accessibilityRole="button"
        accessibilityLabel={`Delete period starting ${formatDay(cycle.startDay)}`}
        hitSlop={8}
        className="h-9 w-9 items-center justify-center rounded-full active:bg-surfaceMuted"
      >
        <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
      </Pressable>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View className="items-center gap-1">
      <Txt variant="heading">{value}</Txt>
      <Txt variant="faint">{label}</Txt>
    </View>
  );
}
