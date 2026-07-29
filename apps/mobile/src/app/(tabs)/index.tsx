import { Ionicons } from '@expo/vector-icons';
import {
  BRAND,
  pregnancyProgress,
  todayEpochDay,
  type DayLog,
} from '@locklune/core';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Platform, Text, View } from 'react-native';
import { CycleChartCard } from '../../components/CycleChartCard';
import { CycleRing } from '../../components/CycleRing';
import { InsightCard } from '../../components/InsightCard';
import { LogTodayButton } from '../../components/LogTodayButton';
import { OutlookChip } from '../../components/OutlookChip';
import { PillButton } from '../../components/PillButton';
import { PregnancyCard } from '../../components/PregnancyCard';
import { StatsRow } from '../../components/StatsRow';
import { TodayEntryCard } from '../../components/TodayEntryCard';
import { TomorrowCard } from '../../components/TomorrowCard';
import { TryingCard } from '../../components/TryingCard';
import { MoonLoader } from '../../components/ui/MoonLoader';
import { Screen } from '../../components/ui/Screen';
import { Txt } from '../../components/ui/Text';
import { formatDay, formatRange } from '../../lib/format';
import * as haptics from '../../lib/haptics';
import { computePhase } from '../../lib/phases';
import { useDataStore } from '../../stores/dataStore';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import { CARD_SHADOW } from '../../theme/shadows';

export default function Today() {
  const router = useRouter();
  const today = todayEpochDay();
  const cycles = useDataStore((s) => s.cycles);
  const prediction = useDataStore((s) => s.prediction);
  const settings = useDataStore((s) => s.settings);
  const startPeriod = useDataStore((s) => s.startPeriod);
  const setCurrentPeriodEnd = useDataStore((s) => s.setCurrentPeriodEnd);
  const getDayLog = useDataStore((s) => s.getDayLog);
  const getDayLogsInRange = useDataStore((s) => s.getDayLogsInRange);

  const [todayLog, setTodayLog] = useState<DayLog | null>(null);
  const [logLoaded, setLogLoaded] = useState(false);
  const [recentLogs, setRecentLogs] = useState<DayLog[]>([]);

  useEffect(() => {
    let alive = true;
    // Intentional: show the loading state again whenever `today` changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLogLoaded(false);
    void getDayLog(today).then((log) => {
      if (!alive) return;
      setTodayLog(log ?? null);
      setLogLoaded(true);
    });
    return () => {
      alive = false;
    };
  }, [today, getDayLog, cycles]);

  useFocusEffect(
    useCallback(() => {
      void getDayLogsInRange(today - 90, today).then(setRecentLogs);
    }, [today, getDayLogsInRange]),
  );

  const onStart = () =>
    void (async () => {
      if (await startPeriod(today)) {
        haptics.success();
        // Take the user straight into today's logger to record flow/symptoms.
        router.push({ pathname: '/log', params: { day: String(today) } });
      }
    })();
  const onEnd = () => void (async () => (await setCurrentPeriodEnd(today)) && haptics.success())();

  const last = cycles[cycles.length - 1];
  const onPeriod = last !== undefined && last.endDay === null && today >= last.startDay;
  const periodDay = onPeriod ? today - last!.startDay + 1 : 0;
  const totalPeriod = Math.max(1, Math.round(prediction.averagePeriodLength));
  const periodDaysLeft = onPeriod ? Math.max(0, totalPeriod - periodDay) : 0;

  const next = prediction.upcoming[0];
  const fertility = prediction.fertilityApplicable;
  const pregnant = settings.cycleMode === 'pregnant';
  const trying = settings.cycleMode === 'trying';
  const preg =
    pregnant && settings.pregnancyDueDay != null
      ? pregnancyProgress(settings.pregnancyDueDay, today)
      : null;

  const totalCycle = Math.round(prediction.averageCycleLength);
  const daysAway = next ? next.periodStart - today : 0;
  // Where in the cycle we are, for the hero subtitle + ring progress.
  const cycleDay = last !== undefined && today >= last.startDay ? today - last.startDay + 1 : 0;
  const cycleProgressDay = Math.min(cycleDay, totalCycle);
  const currentPhase = computePhase(onPeriod, cycleDay, next, today, fertility);

  return (
    <Screen>
      {/* Hero */}
      <View style={{ alignItems: 'center', paddingVertical: 32, gap: 14 }}>
        <View
          style={{
            width: 96,
            height: 96,
            borderRadius: 48,
            backgroundColor: colors.primaryGlow,
            borderWidth: 1,
            borderColor: colors.primaryGlowBorder,
            alignItems: 'center',
            justifyContent: 'center',
            // elevation on circular Android views creates a hexagonal shadow
            ...(Platform.OS !== 'android' && {
              shadowColor: colors.primary,
              shadowOpacity: 0.4,
              shadowRadius: 22,
              shadowOffset: { width: 0, height: 0 },
            }),
          }}
        >
          <MoonLoader size={44} />
        </View>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Text
            style={{
              fontFamily: fonts.medium,
              fontSize: 12,
              color: colors.textFaint,
              letterSpacing: 1.2,
              textTransform: 'uppercase',
            }}
          >
            {formatDay(today, { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>
          {!pregnant && currentPhase && (
            <View
              style={{
                borderRadius: 99,
                paddingHorizontal: 12,
                paddingVertical: 4,
                backgroundColor: currentPhase.color + '22',
                borderWidth: 1,
                borderColor: currentPhase.color + '55',
              }}
            >
              <Text
                style={{
                  fontFamily: fonts.medium,
                  fontSize: 11,
                  color: currentPhase.color,
                  letterSpacing: 0.6,
                }}
              >
                {currentPhase.label} phase
              </Text>
            </View>
          )}
        </View>
      </View>

      {pregnant ? (
        <PregnancyCard preg={preg} />
      ) : (
        <>
          {/* Primary status card */}
          <View
            style={{
              borderRadius: 24,
              backgroundColor: colors.surface,
              padding: 24,
              borderWidth: 1,
              borderColor: colors.border,
              ...CARD_SHADOW,
            }}
          >
            {!next && !onPeriod ? (
              // WELCOME
              <View style={{ alignItems: 'center', gap: 16 }}>
                <MoonLoader size={34} />
                <View style={{ alignItems: 'center', gap: 8 }}>
                  <Txt variant="heading" className="text-center">
                    Welcome to {BRAND.name}
                  </Txt>
                  <Txt variant="muted" className="text-center">
                    Log your first period and {BRAND.name} will learn your cycle - all on-device,
                    always private.
                  </Txt>
                </View>
                <PillButton label="Log period started today" large onPress={onStart} />
                <Txt variant="faint" className="text-center">
                  To add entries for previous days, go to the calendar and select the date you want to update.
                </Txt>
              </View>
            ) : onPeriod ? (
              // ON PERIOD
              <View style={{ flexDirection: 'row', gap: 16, alignItems: 'flex-start' }}>
                <View style={{ flex: 1, gap: 6 }}>
                  <Txt variant="label" className="text-period">
                    On your period
                  </Txt>
                  <Text style={{ fontFamily: fonts.display, fontSize: 56, color: colors.moon }}>
                    Day {periodDay}
                  </Text>
                  <View style={{ gap: 2 }}>
                    <Txt variant="faint">Started {formatDay(last!.startDay)}</Txt>
                    {periodDaysLeft > 0 && (
                      <Txt variant="faint">
                        About {periodDaysLeft} more day{periodDaysLeft === 1 ? '' : 's'} expected
                      </Txt>
                    )}
                  </View>
                  <View style={{ flexDirection: 'row', marginTop: 8 }}>
                    <View style={{ flex: 1 }} />
                    <PillButton label="End period" icon="checkmark" onPress={onEnd} />
                  </View>
                </View>
                <CycleRing day={periodDay} total={totalPeriod} size={84} />
              </View>
            ) : trying && next && fertility ? (
              // TRYING TO CONCEIVE - fertile window focus
              <TryingCard
                next={next}
                today={today}
                cycleProgressDay={cycleProgressDay}
                totalCycle={totalCycle}
                cycleDay={cycleDay}
                onStart={onStart}
              />
            ) : (
              // NEXT PERIOD countdown
              <View style={{ flexDirection: 'row', gap: 16, alignItems: 'flex-start' }}>
                <View style={{ flex: 1, gap: 4 }}>
                  <Txt variant="label">
                    {settings.cycleMode === 'contraception' ? 'Next expected bleed' : 'Next period'}
                  </Txt>
                  <Text
                    style={{ fontFamily: fonts.display, fontSize: 64, color: colors.moon, lineHeight: 68 }}
                  >
                    {Math.max(0, daysAway)}
                  </Text>
                  <Txt variant="muted">{daysAway === 1 ? 'day away' : 'days away'}</Txt>
                  <Text
                    style={{ fontFamily: fonts.displaySemibold, fontSize: 20, color: colors.text, marginTop: 4 }}
                  >
                    {formatDay(next!.periodStart)}
                  </Text>
                  <Txt variant="faint">
                    Expected {formatRange(next!.periodStartRange.start, next!.periodStartRange.end)}
                  </Txt>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                    <Txt variant="faint" className="flex-1">
                      {cycleDay > 0 ? `Day ${cycleProgressDay} of ${totalCycle}` : ' '}
                    </Txt>
                    <PillButton label="Start period" icon="add" onPress={onStart} />
                  </View>
                </View>
                <CycleRing day={cycleProgressDay} total={totalCycle} size={84} />
              </View>
            )}
          </View>

          {/* Trying-to-conceive fertility cards - shown during period so user keeps sight of their window */}
          {trying && onPeriod && next && fertility && (() => {
            const daysToFertile = next.fertileWindow.start - today;
            const daysToOvulation = next.ovulationDay - today;
            if (daysToFertile <= 0) return null;
            return (
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View
                  style={{
                    flex: 1,
                    borderRadius: 20,
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.fertile + '55',
                    padding: 16,
                    gap: 6,
                    ...CARD_SHADOW,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="star-outline" size={14} color={colors.fertile} />
                    <Txt variant="label">Fertile window</Txt>
                  </View>
                  <Text style={{ fontFamily: fonts.display, fontSize: 32, color: colors.fertile, lineHeight: 36 }}>
                    {daysToFertile === 1 ? '1 day' : `${daysToFertile} days`}
                  </Text>
                  <Txt variant="faint">{formatRange(next.fertileWindow.start, next.fertileWindow.end)}</Txt>
                </View>
                <View
                  style={{
                    flex: 1,
                    borderRadius: 20,
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.ovulation + '55',
                    padding: 16,
                    gap: 6,
                    ...CARD_SHADOW,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="leaf-outline" size={14} color={colors.ovulation} />
                    <Txt variant="label">Ovulation</Txt>
                  </View>
                  <Text style={{ fontFamily: fonts.display, fontSize: 32, color: colors.ovulation, lineHeight: 36 }}>
                    {daysToOvulation <= 0 ? 'Today' : daysToOvulation === 1 ? '1 day' : `${daysToOvulation} days`}
                  </Text>
                  <Txt variant="faint">{formatDay(next.ovulationDay)}</Txt>
                </View>
              </View>
            );
          })()}

          {/* Outlook chips - hidden in trying mode since TryingCard already shows this */}
          {next && fertility && !trying && (
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <OutlookChip
                icon="leaf-outline"
                iconColor={colors.fertile}
                label="Fertile window"
                value={formatRange(next.fertileWindow.start, next.fertileWindow.end)}
              />
              <OutlookChip
                icon="ellipse-outline"
                iconColor={colors.ovulation}
                label="Ovulation"
                value={formatDay(next.ovulationDay)}
              />
            </View>
          )}
        </>
      )}

      {/* Stats row - mood + symptom trends (shown for all cycle modes) */}
      {recentLogs.length >= 3 && (
        <StatsRow
          logs={recentLogs}
          cycles={cycles}
          currentPhase={currentPhase}
          avgLen={Math.round(prediction.averageCycleLength)}
          avgPeriodLen={Math.round(prediction.averagePeriodLength)}
        />
      )}

      {/* Today's entry */}
      {logLoaded && todayLog && (
        <TodayEntryCard
          log={todayLog}
          onEdit={() => router.push({ pathname: '/log', params: { day: String(today) } })}
        />
      )}
      {logLoaded && !todayLog && (
        <LogTodayButton
          onPress={() => router.push({ pathname: '/log', params: { day: String(today) } })}
        />
      )}

      {/* Tomorrow preview */}
      {!pregnant && cycles.length > 0 && (
        <TomorrowCard
          tomorrow={today + 1}
          cycles={cycles}
          prediction={prediction}
          recentLogs={recentLogs}
          fertility={fertility}
          avgLen={Math.round(prediction.averageCycleLength)}
          avgPeriodLen={Math.round(prediction.averagePeriodLength)}
        />
      )}

      {/* Cycle chart */}
      {!pregnant && cycles.length >= 3 && (
        <CycleChartCard cycles={cycles} />
      )}

      {/* Insight */}
      <InsightCard cycles={cycles} prediction={prediction} settings={settings} today={today} />
    </Screen>
  );
}
