import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BRAND, todayEpochDay } from '@locklune/core';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Screen } from '../../components/ui/Screen';
import { Txt } from '../../components/ui/Text';
import { confidenceLabel, formatDay, formatRange, relativeDays } from '../../lib/format';
import { colors } from '../../theme/colors';
import { useDataStore } from '../../stores/dataStore';

export default function Today() {
  const router = useRouter();
  const today = todayEpochDay();
  const cycles = useDataStore((s) => s.cycles);
  const prediction = useDataStore((s) => s.prediction);
  const startPeriod = useDataStore((s) => s.startPeriod);
  const setCurrentPeriodEnd = useDataStore((s) => s.setCurrentPeriodEnd);

  const last = cycles[cycles.length - 1];
  const onPeriod = last !== undefined && last.endDay === null && today >= last.startDay;
  const next = prediction.upcoming[0];

  return (
    <Screen>
      <View className="gap-1 pt-2">
        <Txt variant="label">{formatDay(today, { weekday: 'long', month: 'long', day: 'numeric' })}</Txt>
        <Txt variant="display">{BRAND.name}</Txt>
      </View>

      {/* Status */}
      <Card>
        {onPeriod ? (
          <View className="gap-3">
            <Txt variant="label" className="text-period">On your period</Txt>
            <Txt variant="heading">Day {today - last!.startDay + 1}</Txt>
            <Txt variant="muted">Started {formatDay(last!.startDay)}</Txt>
            <Button
              title="End period today"
              variant="secondary"
              onPress={() => void setCurrentPeriodEnd(today)}
            />
          </View>
        ) : next ? (
          <View className="gap-2">
            <Txt variant="label">Next period</Txt>
            <Txt variant="heading">{relativeDays(next.periodStart)}</Txt>
            <Txt variant="muted">
              {formatDay(next.periodStart)} · window {formatRange(next.periodStartRange.start, next.periodStartRange.end)}
            </Txt>
            <Button title="Log period started today" className="mt-2" onPress={() => void startPeriod(today)} />
          </View>
        ) : (
          <View className="gap-3">
            <View className="flex-row items-center gap-2">
              <Txt variant="heading">Welcome</Txt>
              <Ionicons name="moon" size={22} color={colors.primarySoft} />
            </View>
            <Txt variant="muted">
              Log the first day of your period and {BRAND.name} will start learning your cycle.
            </Txt>
            <Button title="Log period started today" onPress={() => void startPeriod(today)} />
          </View>
        )}
      </Card>

      {/* Prediction detail */}
      {next && (
        <Card>
          <View className="gap-4">
            <View className="flex-row items-center justify-between">
              <Txt variant="title">Cycle outlook</Txt>
              <Txt variant="faint">{confidenceLabel(prediction.confidence)}</Txt>
            </View>
            <Row label="Fertile window" value={formatRange(next.fertileWindow.start, next.fertileWindow.end)} />
            <Row label="Estimated ovulation" value={formatDay(next.ovulationDay)} />
            <Row
              label="Average cycle"
              value={`${Math.round(prediction.averageCycleLength)} days${prediction.usingDefaults ? ' (default)' : ''}`}
            />
          </View>
        </Card>
      )}

      <Button
        title="Log symptoms for today"
        variant="ghost"
        onPress={() => router.push({ pathname: '/log', params: { day: String(today) } })}
      />

      <Txt variant="faint" className="text-center">
        Predictions are estimates for your awareness only — not medical or contraceptive advice.
      </Txt>
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <Txt variant="muted">{label}</Txt>
      <Txt variant="body">{value}</Txt>
    </View>
  );
}
