import { useMemo } from 'react';
import { View } from 'react-native';
import { Card } from '../../components/ui/Card';
import { Screen } from '../../components/ui/Screen';
import { Txt } from '../../components/ui/Text';
import { confidenceLabel, formatDay, relativeDays } from '../../lib/format';
import { useDataStore } from '../../stores/dataStore';

export default function Insights() {
  const cycles = useDataStore((s) => s.cycles);
  const prediction = useDataStore((s) => s.prediction);

  const lengths = useMemo(() => {
    const out: number[] = [];
    for (let i = 1; i < cycles.length; i++) out.push(cycles[i]!.startDay - cycles[i - 1]!.startDay);
    return out.slice(-8);
  }, [cycles]);

  const maxLen = Math.max(35, ...lengths);

  return (
    <Screen>
      <Txt variant="display" className="pt-2">Insights</Txt>

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
        <Txt variant="title" className="mb-4">Recent cycle lengths</Txt>
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
                <Txt variant="muted" className="w-12 text-right">{len}d</Txt>
              </View>
            ))}
          </View>
        )}
      </Card>

      <Card>
        <Txt variant="title" className="mb-4">Upcoming periods</Txt>
        {prediction.upcoming.length === 0 ? (
          <Txt variant="muted">Log your first period to see predictions.</Txt>
        ) : (
          <View className="gap-3">
            {prediction.upcoming.map((u, i) => (
              <View key={i} className="flex-row items-center justify-between">
                <Txt variant="body">{formatDay(u.periodStart, { month: 'long', day: 'numeric' })}</Txt>
                <Txt variant="muted">{relativeDays(u.periodStart)}</Txt>
              </View>
            ))}
          </View>
        )}
      </Card>

      <Txt variant="faint" className="text-center">
        Estimates adapt as you log more cycles. For awareness only — not medical advice.
      </Txt>
    </Screen>
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
