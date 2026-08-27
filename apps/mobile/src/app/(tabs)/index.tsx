import { Ionicons } from '@expo/vector-icons';
import { BRAND, CYCLE_MODE, pregnancyProgress, todayEpochDay, type DayLog } from '@locklune/core';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Platform, Text, View } from 'react-native';
import { CycleChartCard } from '../../components/CycleChartCard';
import { CycleRing } from '../../components/CycleRing';
import { InsightCard } from '../../components/InsightCard';
import { OutlookChip } from '../../components/OutlookChip';
import { PregnancyCard } from '../../components/PregnancyCard';
import { StatsRow } from '../../components/StatsRow';
import { TodayEntryCard } from '../../components/TodayEntryCard';
import { TomorrowCard } from '../../components/TomorrowCard';
import { TryingCard } from '../../components/TryingCard';
import { Button } from '../../components/ui/Button';
import { MoonLoader } from '../../components/ui/MoonLoader';
import { Screen } from '../../components/ui/Screen';
import { Txt } from '../../components/ui/Text';
import { t, useLocale } from '../../i18n';
import { formatDay, formatRange } from '../../lib/format';
import * as haptics from '../../lib/haptics';
import { computePhase, phaseLabelKey } from '../../lib/phases';
import { ROUTES } from '../../lib/routes';
import { useDataStore } from '../../stores/dataStore';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import { CARD_SHADOW } from '../../theme/shadows';

export default function Today() {
  useLocale();
  const router = useRouter();
  const today = todayEpochDay();
  const cycles = useDataStore((store) => store.cycles);
  const prediction = useDataStore((store) => store.prediction);
  const settings = useDataStore((store) => store.settings);
  const startPeriod = useDataStore((store) => store.startPeriod);
  const setCurrentPeriodEnd = useDataStore((store) => store.setCurrentPeriodEnd);
  const getDayLog = useDataStore((store) => store.getDayLog);
  const getDayLogsInRange = useDataStore((store) => store.getDayLogsInRange);
  const hasLogs = useDataStore((store) => store.hasLogs);

  const [todayLog, setTodayLog] = useState<DayLog | null>(null);
  const [logLoaded, setLogLoaded] = useState<boolean>(false);
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
        router.push({ pathname: ROUTES.log, params: { day: String(today) } });
      }
    })();
  const onEnd = () => void (async () => (await setCurrentPeriodEnd(today)) && haptics.success())();
  const openLog = () => router.push({ pathname: ROUTES.log, params: { day: String(today) } });

  const last = cycles[cycles.length - 1];
  const onPeriod = last !== undefined && last.endDay === null && today >= last.startDay;
  const periodDay = onPeriod ? today - last!.startDay + 1 : 0;
  const totalPeriod = Math.max(1, Math.round(prediction.averagePeriodLength));
  const periodDaysLeft = onPeriod ? Math.max(0, totalPeriod - periodDay) : 0;

  const next = prediction.upcoming[0];
  const fertility = prediction.fertilityApplicable;
  const pregnant = settings.cycleMode === CYCLE_MODE.Pregnant;
  const trying = settings.cycleMode === CYCLE_MODE.Trying;
  const preg =
    pregnant && settings.pregnancyDueDay != null
      ? pregnancyProgress(settings.pregnancyDueDay, today)
      : null;

  const totalCycle = Math.round(prediction.averageCycleLength);
  const daysAway = next ? next.periodStart - today : 0;
  // Whether to offer period actions (start at the top / end at the bottom); not
  // shown while pregnant or before any cycle exists.
  const showActions = !pregnant && (onPeriod || next !== undefined);
  // No cycle to predict from (no period on record). Split into the genuine
  // first-run state (no logs at all) which shows the welcome onboarding card,
  // versus a user who has logged something but no period yet - for them we drop
  // the top card entirely and let their entry + stats stand as the view.
  const noCycle = !pregnant && !onPeriod && next === undefined;
  const isEmpty = noCycle && !hasLogs;
  // Whether today already has a saved log entry (drives "Log" vs "Edit" CTAs).
  const hasEntry = logLoaded && todayLog !== null;
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
                {t('home.phaseLabel', { phase: t(phaseLabelKey(currentPhase.id)) })}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Primary daily action: always the first button, centered. Reads "Start
          logging" for a brand-new user, "Edit today's log" once today has an
          entry, otherwise "Log today". */}
      {logLoaded && (
        <View style={{ alignItems: 'center' }}>
          <Button
            title={
              isEmpty ? t('home.startLogging') : hasEntry ? t('todayCard.edit') : t('misc.logToday')
            }
            variant="primary"
            size="md"
            onPress={openLog}
          />
        </View>
      )}

      {pregnant ? (
        <PregnancyCard preg={preg} />
      ) : (
        <>
          {/* Start a period (when one isn't already active). */}
          {showActions && !onPeriod && (
            <Button title={t('home.startPeriod')} variant="secondary" onPress={onStart} />
          )}

          {/* Primary status card. Hidden once the user has logged something but
              still has no cycle to predict from - their entry + stats below then
              stand as the view, instead of the first-run welcome onboarding. */}
          {(!noCycle || isEmpty) && (
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
                      {t('home.welcomeTitle', { brand: BRAND.name })}
                    </Txt>
                    <Txt variant="muted" className="text-center">
                      {t('home.welcomeSubtitle', { brand: BRAND.name })}
                    </Txt>
                  </View>
                  <Txt variant="faint" className="text-center">
                    {t('home.previousDaysHint')}
                  </Txt>
                </View>
              ) : onPeriod ? (
                // ON PERIOD
                <View style={{ flexDirection: 'row', gap: 16, alignItems: 'flex-start' }}>
                  <View style={{ flex: 1, gap: 6 }}>
                    <Txt variant="label" className="text-period">
                      {t('home.onPeriod')}
                    </Txt>
                    <Text style={{ fontFamily: fonts.display, fontSize: 56, color: colors.moon }}>
                      {t('home.dayNumber', { count: periodDay })}
                    </Text>
                    <View style={{ gap: 2 }}>
                      <Txt variant="faint">
                        {t('log.startedOn', { date: formatDay(last!.startDay) })}
                      </Txt>
                      {periodDaysLeft > 0 && (
                        <Txt variant="faint">
                          {t('home.moreDaysExpected', { count: periodDaysLeft })}
                        </Txt>
                      )}
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
                />
              ) : (
                // NEXT PERIOD countdown
                <View style={{ flexDirection: 'row', gap: 16, alignItems: 'flex-start' }}>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Txt variant="label">
                      {settings.cycleMode === CYCLE_MODE.Contraception
                        ? t('home.nextExpectedBleed')
                        : t('home.nextPeriod')}
                    </Txt>
                    <Text
                      style={{
                        fontFamily: fonts.display,
                        fontSize: 64,
                        color: colors.moon,
                        lineHeight: 68,
                      }}
                    >
                      {Math.max(0, daysAway)}
                    </Text>
                    <Txt variant="muted">{t('home.dayAway', { count: daysAway })}</Txt>
                    <Text
                      style={{
                        fontFamily: fonts.displaySemibold,
                        fontSize: 20,
                        color: colors.text,
                        marginTop: 4,
                      }}
                    >
                      {formatDay(next!.periodStart)}
                    </Text>
                    <Txt variant="faint">
                      {t('home.expectedRange', {
                        range: formatRange(
                          next!.periodStartRange.start,
                          next!.periodStartRange.end,
                        ),
                      })}
                    </Txt>
                    {cycleDay > 0 && (
                      <Txt variant="faint" className="mt-2.5">
                        {t('home.dayXofY', { current: cycleProgressDay, total: totalCycle })}
                      </Txt>
                    )}
                  </View>
                  <CycleRing day={cycleProgressDay} total={totalCycle} size={84} />
                </View>
              )}
            </View>
          )}

          {/* Trying-to-conceive fertility cards during a period: show the *upcoming*
              fertile window + ovulation (always later in the cycle - you can't be
              fertile/ovulating while bleeding). Hidden if the model's window isn't
              strictly ahead, so we never claim on-period + fertile at once. */}
          {trying &&
            onPeriod &&
            next &&
            fertility &&
            (() => {
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
                      <Txt variant="label">{t('home.fertileWindow')}</Txt>
                    </View>
                    <Text
                      style={{
                        fontFamily: fonts.display,
                        fontSize: 32,
                        color: colors.fertile,
                        lineHeight: 36,
                      }}
                    >
                      {t('home.daysCount', { count: daysToFertile })}
                    </Text>
                    <Txt variant="faint">
                      {formatRange(next.fertileWindow.start, next.fertileWindow.end)}
                    </Txt>
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
                      <Txt variant="label">{t('home.ovulation')}</Txt>
                    </View>
                    <Text
                      style={{
                        fontFamily: fonts.display,
                        fontSize: 32,
                        color: colors.ovulation,
                        lineHeight: 36,
                      }}
                    >
                      {daysToOvulation <= 0
                        ? t('home.today')
                        : t('home.daysCount', { count: daysToOvulation })}
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
                label={t('home.fertileWindow')}
                value={formatRange(next.fertileWindow.start, next.fertileWindow.end)}
              />
              <OutlookChip
                icon="ellipse-outline"
                iconColor={colors.ovulation}
                label={t('home.ovulation')}
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

      {/* Today's entry (display only - editing is via the top action button). */}
      {hasEntry && todayLog && <TodayEntryCard log={todayLog} unit={settings.temperatureUnit} />}

      {/* Tomorrow preview - shows a cycle-based forecast when a period is on
          record, otherwise a lighter mood/symptom forecast from recent logs. */}
      {!pregnant && (cycles.length > 0 || recentLogs.length > 0) && (
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
      {!pregnant && cycles.length >= 3 && <CycleChartCard cycles={cycles} />}

      {/* Insight */}
      <InsightCard cycles={cycles} prediction={prediction} settings={settings} today={today} />

      {/* End-period action lives at the very bottom while a period is active. */}
      {onPeriod && <Button title={t('home.endPeriod')} variant="outline" onPress={onEnd} />}
    </Screen>
  );
}
