import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BRAND, pregnancyProgress, todayEpochDay } from '@locklune/core';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Screen } from '../../components/ui/Screen';
import { Txt } from '../../components/ui/Text';
import { confidenceLabel, formatDay, formatRange, relativeDays } from '../../lib/format';
import * as haptics from '../../lib/haptics';
import { colors } from '../../theme/colors';
import { useDataStore } from '../../stores/dataStore';

export default function Today() {
  const router = useRouter();
  const today = todayEpochDay();
  const cycles = useDataStore((s) => s.cycles);
  const prediction = useDataStore((s) => s.prediction);
  const settings = useDataStore((s) => s.settings);
  const startPeriod = useDataStore((s) => s.startPeriod);
  const setCurrentPeriodEnd = useDataStore((s) => s.setCurrentPeriodEnd);

  const onStart = () => void (async () => (await startPeriod(today)) && haptics.success())();
  const onEnd = () => void (async () => (await setCurrentPeriodEnd(today)) && haptics.success())();

  const last = cycles[cycles.length - 1];
  const onPeriod = last !== undefined && last.endDay === null && today >= last.startDay;
  const next = prediction.upcoming[0];
  const fertility = prediction.fertilityApplicable;
  const pregnant = settings.cycleMode === 'pregnant';
  const preg =
    pregnant && settings.pregnancyDueDay != null
      ? pregnancyProgress(settings.pregnancyDueDay, today)
      : null;

  return (
    <Screen>
      <View className="gap-1 pt-2">
        <Txt variant="label">
          {formatDay(today, { weekday: 'long', month: 'long', day: 'numeric' })}
        </Txt>
        <Txt variant="display">{BRAND.name}</Txt>
      </View>

      {pregnant ? (
        <Card>
          {preg ? (
            <View className="gap-2">
              <Txt variant="label" className="text-primary-soft">
                Pregnancy
              </Txt>
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
                Estimated due{' '}
                {formatDay(preg.dueDay, { weekday: 'short', month: 'long', day: 'numeric' })}
              </Txt>
            </View>
          ) : (
            <View className="gap-3">
              <Txt variant="heading">Pregnancy</Txt>
              <Txt variant="muted">
                Set how many weeks along you are in Settings to track your pregnancy.
              </Txt>
            </View>
          )}
        </Card>
      ) : (
        <>
          {/* Status */}
          <Card>
            {onPeriod ? (
              <View className="gap-3">
                <Txt variant="label" className="text-period">
                  On your period
                </Txt>
                <Txt variant="heading">Day {today - last!.startDay + 1}</Txt>
                <Txt variant="muted">Started {formatDay(last!.startDay)}</Txt>
                <Button title="End period today" variant="secondary" onPress={onEnd} />
              </View>
            ) : next ? (
              <View className="gap-2">
                <Txt variant="label">
                  {settings.cycleMode === 'contraception' ? 'Next expected bleed' : 'Next period'}
                </Txt>
                <Txt variant="heading">{relativeDays(next.periodStart)}</Txt>
                <Txt variant="muted">
                  {formatDay(next.periodStart)} · window{' '}
                  {formatRange(next.periodStartRange.start, next.periodStartRange.end)}
                </Txt>
                <Button title="Log period started today" className="mt-2" onPress={onStart} />
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
                <Button title="Log period started today" onPress={onStart} />
              </View>
            )}
          </Card>

          {/* Fertile window emphasis when trying to conceive */}
          {next && fertility && settings.cycleMode === 'trying' && (
            <Card className="border-fertile/40">
              <Txt variant="label" className="text-fertile">
                Fertile window
              </Txt>
              <Txt variant="heading" className="mt-1">
                {formatRange(next.fertileWindow.start, next.fertileWindow.end)}
              </Txt>
              <Txt variant="muted" className="mt-0.5">
                Estimated ovulation {formatDay(next.ovulationDay)}
              </Txt>
            </Card>
          )}

          {/* Prediction detail */}
          {next && (
            <Card>
              <View className="gap-4">
                <View className="flex-row items-center justify-between">
                  <Txt variant="title">Cycle outlook</Txt>
                  <Txt variant="faint">{confidenceLabel(prediction.confidence)}</Txt>
                </View>
                {fertility && settings.cycleMode !== 'trying' && (
                  <>
                    <Row
                      label="Fertile window"
                      value={formatRange(next.fertileWindow.start, next.fertileWindow.end)}
                    />
                    <Row label="Estimated ovulation" value={formatDay(next.ovulationDay)} />
                  </>
                )}
                <Row
                  label="Average cycle"
                  value={`${Math.round(prediction.averageCycleLength)} days${prediction.usingDefaults ? ' (default)' : ''}`}
                />
                {!fertility && (
                  <Txt variant="faint">
                    Fertility estimates are hidden on hormonal contraception.
                  </Txt>
                )}
              </View>
            </Card>
          )}
        </>
      )}

      <Button
        title="Log symptoms for today"
        variant="ghost"
        onPress={() => router.push({ pathname: '/log', params: { day: String(today) } })}
      />

      <Txt variant="faint" className="text-center">
        For organisation only. Locklune is not medical or health advice.
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
