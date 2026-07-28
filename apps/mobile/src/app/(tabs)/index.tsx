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
  const periodDay = onPeriod ? today - last!.startDay + 1 : 0;
  const periodDaysLeft = onPeriod
    ? Math.max(0, Math.max(1, Math.round(prediction.averagePeriodLength)) - periodDay)
    : 0;
  const next = prediction.upcoming[0];
  const fertility = prediction.fertilityApplicable;
  const pregnant = settings.cycleMode === 'pregnant';
  const preg =
    pregnant && settings.pregnancyDueDay != null
      ? pregnancyProgress(settings.pregnancyDueDay, today)
      : null;

  return (
    <Screen>
      {/* Date header */}
      <View className="flex-row items-center gap-2 pb-1 pt-2">
        <Ionicons name="moon" size={14} color={colors.primarySoft} />
        <Txt variant="faint">
          {formatDay(today, { weekday: 'long', month: 'long', day: 'numeric' })}
        </Txt>
      </View>

      {pregnant ? (
        <Card>
          {preg ? (
            <View className="gap-2">
              <Txt variant="label" className="text-primary-soft">
                Pregnancy
              </Txt>
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
              <View className="flex-row gap-4">
                {/* Period accent stripe */}
                <View
                  style={{
                    width: 3,
                    borderRadius: 99,
                    backgroundColor: colors.period,
                    minHeight: 40,
                  }}
                />
                <View className="flex-1 gap-3">
                  <Txt variant="label" className="text-period">
                    On your period
                  </Txt>
                  <Txt variant="display">Day {periodDay}</Txt>
                  <View className="gap-0.5">
                    <Txt variant="muted">Started {formatDay(last!.startDay)}</Txt>
                    {periodDaysLeft > 0 && (
                      <Txt variant="faint">
                        About {periodDaysLeft} more day{periodDaysLeft === 1 ? '' : 's'} expected
                      </Txt>
                    )}
                  </View>
                  <Button title="End period today" variant="secondary" onPress={onEnd} />
                </View>
              </View>
            ) : next ? (
              <View className="gap-3">
                <Txt variant="label">
                  {settings.cycleMode === 'contraception' ? 'Next expected bleed' : 'Next period'}
                </Txt>
                <Txt variant="display">{relativeDays(next.periodStart)}</Txt>
                <View className="flex-row items-center gap-1.5">
                  <Ionicons name="calendar-outline" size={13} color={colors.textFaint} />
                  <Txt variant="faint">
                    {formatDay(next.periodStart)} · window{' '}
                    {formatRange(next.periodStartRange.start, next.periodStartRange.end)}
                  </Txt>
                </View>
                <Button title="Log period started today" className="mt-1" onPress={onStart} />
              </View>
            ) : (
              <View className="items-center gap-5 py-4">
                <View
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 36,
                    backgroundColor: 'rgba(110,168,254,0.1)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="moon" size={34} color={colors.primarySoft} />
                </View>
                <View className="items-center gap-2">
                  <Txt variant="heading" className="text-center">
                    Welcome
                  </Txt>
                  <Txt variant="muted" className="text-center">
                    Log your first period and {BRAND.name} will learn your cycle — all on-device,
                    always private.
                  </Txt>
                </View>
                <Button title="Log period started today" onPress={onStart} />
              </View>
            )}
          </Card>

          {/* Fertile window emphasis when trying to conceive */}
          {next && fertility && settings.cycleMode === 'trying' && (
            <Card
              style={{
                borderColor: 'rgba(175,200,255,0.3)',
              }}
            >
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
                {prediction.confidence === 'low' && (
                  <Txt variant="faint">Confidence will increase as more data is added.</Txt>
                )}
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
        variant="secondary"
        onPress={() => router.push({ pathname: '/log', params: { day: String(today) } })}
      />

      <Txt variant="faint" className="text-center">
        For educational purposes only. Locklune is not medical or health advice.
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
