import { Ionicons } from '@expo/vector-icons';
import {
  CYCLE_MODE,
  fromEpochDay,
  predict,
  toEpochDay,
  todayEpochDay,
  type DayLog,
  type EpochDay,
} from '@locklune/core';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { ArrowButton } from '../../components/ArrowButton';
import { DayCell, DUE_COLOR, T1_COLOR, T2_COLOR, T3_COLOR } from '../../components/DayCell';
import { LegendChip } from '../../components/LegendChip';
import { LogEntry } from '../../components/LogEntry';
import { Card } from '../../components/ui/Card';
import { Screen } from '../../components/ui/Screen';
import { Txt } from '../../components/ui/Text';
import { getLocale, t, useLocale } from '../../i18n';
import { ROUTES } from '../../lib/routes';
import { useDataStore } from '../../stores/dataStore';
import { colors } from '../../theme/colors';

function useMonthGrid(anchor: Date) {
  return useMemo(() => {
    const year = anchor.getFullYear();
    const month = anchor.getMonth();
    const first = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (EpochDay | null)[] = [];
    for (let leadingBlank = 0; leadingBlank < first.getDay(); leadingBlank++) cells.push(null);
    for (let dayOfMonth = 1; dayOfMonth <= daysInMonth; dayOfMonth++)
      cells.push(toEpochDay(new Date(year, month, dayOfMonth)));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [anchor]);
}

const LOG_PAGE_SIZE = 6;

export default function Calendar() {
  const locale = useLocale();
  const router = useRouter();
  const today = todayEpochDay();

  // Localised narrow weekday initials, Sunday-first (2023-01-01 was a Sunday).
  const weekdays = useMemo(() => {
    const format = new Intl.DateTimeFormat(locale, { weekday: 'narrow' }).format;
    return Array.from({ length: 7 }, (_, index) => format(new Date(2023, 0, 1 + index)));
  }, [locale]);
  const cycles = useDataStore((store) => store.cycles);
  const prediction = useDataStore((store) => store.prediction);
  const ovulationDays = useDataStore((store) => store.ovulationDays);
  const settings = useDataStore((store) => store.settings);
  const getDayLogsInRange = useDataStore((store) => store.getDayLogsInRange);
  const deleteLog = useDataStore((store) => store.deleteLog);

  const pregnant = settings.cycleMode === CYCLE_MODE.Pregnant;
  const pregnantDueDay = pregnant ? settings.pregnancyDueDay : null;

  const todayDate = fromEpochDay(today);
  const [anchor, setAnchor] = useState<Date>(
    () => new Date(todayDate.getFullYear(), todayDate.getMonth(), 1),
  );
  const cells = useMonthGrid(anchor);
  const [monthLogs, setMonthLogs] = useState<DayLog[]>([]);
  const [logsExpanded, setLogsExpanded] = useState<boolean>(false);

  // How many months ahead is the current view from today?
  const monthsAhead = useMemo(
    () =>
      (anchor.getFullYear() - todayDate.getFullYear()) * 12 +
      (anchor.getMonth() - todayDate.getMonth()),
    [anchor, todayDate],
  );

  // Lazily extend predictions when the user navigates beyond what the store pre-computed (~6 cycles).
  // predict() is pure synchronous math so this is cheap inside useMemo.
  const activePrediction = useMemo(() => {
    const count = Math.max(6, monthsAhead + 3);
    if (count <= 6) return prediction;
    return predict(cycles, settings, { confirmedOvulations: ovulationDays, count });
  }, [monthsAhead, prediction, cycles, settings, ovulationDays]);

  const isCurrentMonth =
    anchor.getFullYear() === todayDate.getFullYear() && anchor.getMonth() === todayDate.getMonth();

  const goToToday = () => {
    setLogsExpanded(false);
    setAnchor(new Date(todayDate.getFullYear(), todayDate.getMonth(), 1));
  };

  const fetchMonthLogs = useCallback(() => {
    const validDays = cells.filter((cell): cell is EpochDay => cell !== null);
    if (validDays.length === 0) return;
    const from = validDays[0]!;
    const to = validDays[validDays.length - 1]!;
    let alive = true;
    void getDayLogsInRange(from, to).then((logs) => {
      if (alive) setMonthLogs(logs);
    });
    return () => {
      alive = false;
    };
  }, [cells, getDayLogsInRange]);

  useEffect(fetchMonthLogs, [fetchMonthLogs]);
  useFocusEffect(useCallback(() => fetchMonthLogs(), [fetchMonthLogs]));

  const loggedDays = useMemo(() => new Set(monthLogs.map((log) => log.day)), [monthLogs]);

  const { periodSet, predictedSet, fertileSet, ovulationSet } = useMemo(() => {
    const period = new Set<EpochDay>();
    cycles.forEach((cycle, index) => {
      const isLast = index === cycles.length - 1;
      const end = cycle.endDay ?? (isLast ? today : cycle.startDay);
      for (let day = cycle.startDay; day <= end; day++) period.add(day);
    });
    const predicted = new Set<EpochDay>();
    const fertile = new Set<EpochDay>();
    const ovulation = new Set<EpochDay>();
    for (const upcoming of activePrediction.upcoming) {
      for (let day = upcoming.periodStart; day <= upcoming.periodEnd; day++) predicted.add(day);
      if (activePrediction.fertilityApplicable) {
        for (let day = upcoming.fertileWindow.start; day <= upcoming.fertileWindow.end; day++)
          fertile.add(day);
        ovulation.add(upcoming.ovulationDay);
      }
    }
    const current = cycles[cycles.length - 1];
    if (current && current.endDay === null) {
      const expectedEnd =
        current.startDay + Math.max(1, Math.round(activePrediction.averagePeriodLength)) - 1;
      for (let day = today + 1; day <= expectedEnd; day++) predicted.add(day);
    }
    return {
      periodSet: period,
      predictedSet: predicted,
      fertileSet: fertile,
      ovulationSet: ovulation,
    };
  }, [cycles, activePrediction, today]);

  const weeks: (EpochDay | null)[][] = [];
  for (let cellIndex = 0; cellIndex < cells.length; cellIndex += 7)
    weeks.push(cells.slice(cellIndex, cellIndex + 7));

  const monthLabel = anchor.toLocaleDateString(getLocale(), { month: 'long', year: 'numeric' });
  const shiftMonth = (delta: number) => {
    setLogsExpanded(false);
    setAnchor((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  return (
    <Screen>
      {/* Header */}
      <View className="flex-row items-center justify-between pt-2">
        <ArrowButton
          icon="chevron-back"
          label={t('calendar.prevMonth')}
          onPress={() => shiftMonth(-1)}
        />
        <View className="items-center gap-1.5">
          <View className="flex-row items-center gap-2">
            <Ionicons name="moon" size={15} color={colors.primarySoft} />
            <Txt variant="title">{monthLabel}</Txt>
          </View>
          {isCurrentMonth ? (
            <Txt variant="faint">{t('calendar.private')}</Txt>
          ) : (
            <Pressable
              onPress={goToToday}
              accessibilityRole="button"
              accessibilityLabel={t('calendar.returnToday')}
              className="rounded-full bg-white px-4 py-1.5"
            >
              <Txt className="text-ink text-xs font-body-medium">{t('calendar.today')}</Txt>
            </Pressable>
          )}
        </View>
        <ArrowButton
          icon="chevron-forward"
          label={t('calendar.nextMonth')}
          onPress={() => shiftMonth(1)}
        />
      </View>

      {/* Calendar grid */}
      <Card className="px-3 py-5">
        <View className="mb-1 flex-row">
          {weekdays.map((weekday, index) => (
            <View key={index} className="flex-1 items-center pb-3">
              <Txt variant="faint" className="text-2xs uppercase tracking-widest">
                {weekday}
              </Txt>
            </View>
          ))}
        </View>

        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} style={{ flexDirection: 'row' }}>
            {week.map((day, dayIndex) => (
              <DayCell
                key={day !== null ? `d${day}` : `e${weekIndex}-${dayIndex}`}
                day={day}
                isToday={day === today}
                isPeriod={day !== null && periodSet.has(day)}
                isPredicted={day !== null && predictedSet.has(day)}
                isFertile={day !== null && fertileSet.has(day)}
                isOvulation={day !== null && ovulationSet.has(day)}
                hasLog={day !== null && loggedDays.has(day)}
                pregnantDueDay={pregnantDueDay}
                onPress={() =>
                  day !== null &&
                  router.push({ pathname: ROUTES.log, params: { day: String(day) } })
                }
              />
            ))}
          </View>
        ))}
      </Card>

      {/* Legend */}
      <View className="flex-row flex-wrap gap-2">
        {pregnantDueDay !== null ? (
          <>
            <LegendChip dotColor={T1_COLOR} label={t('calendar.trimester1')} />
            <LegendChip dotColor={T2_COLOR} label={t('calendar.trimester2')} />
            <LegendChip dotColor={T3_COLOR} label={t('calendar.trimester3')} />
            <LegendChip dotColor={DUE_COLOR} label={t('calendar.dueDate')} />
            {monthLogs.length > 0 && (
              <LegendChip icon="moon" iconColor={colors.primarySoft} label={t('calendar.logged')} />
            )}
          </>
        ) : (
          <>
            <LegendChip icon="ellipse" iconColor={colors.period} label={t('calendar.period')} />
            <LegendChip
              icon="ellipse"
              iconColor={colors.predictedDim}
              label={t('calendar.predicted')}
            />
            <LegendChip icon="moon" iconColor={colors.primarySoft} label={t('calendar.logged')} />
            {activePrediction.fertilityApplicable && (
              <>
                <LegendChip
                  icon="star-outline"
                  iconColor={colors.fertile}
                  label={t('calendar.fertile')}
                />
                <LegendChip icon="leaf" iconColor={colors.ovulation} label={t('calendar.ovulation')} />
              </>
            )}
          </>
        )}
      </View>

      <Txt variant="faint" className="text-center">
        {t('calendar.tapAnyDay')}
      </Txt>

      {/* Month log entries - show 6 initially, expand on demand */}
      {monthLogs.length > 0 && (
        <View className="gap-3">
          <Txt variant="label">{t('calendar.thisMonth')}</Txt>
          {[...monthLogs]
            .reverse()
            .slice(0, logsExpanded ? undefined : LOG_PAGE_SIZE)
            .map((log) => (
              <LogEntry
                key={log.day}
                log={log}
                onPress={() =>
                  router.push({ pathname: ROUTES.log, params: { day: String(log.day) } })
                }
                onDelete={() => {
                  Alert.alert(
                    t('calendar.deleteLogTitle'),
                    t('calendar.deleteLogBody'),
                    [
                      { text: t('common.cancel'), style: 'cancel' },
                      {
                        text: t('common.delete'),
                        style: 'destructive',
                        onPress: () =>
                          void deleteLog(log.day).then((ok) => {
                            if (ok)
                              setMonthLogs((prev) => prev.filter((entry) => entry.day !== log.day));
                          }),
                      },
                    ],
                  );
                }}
              />
            ))}
          {!logsExpanded && monthLogs.length > LOG_PAGE_SIZE && (
            <Pressable
              onPress={() => setLogsExpanded(true)}
              accessibilityRole="button"
              className="items-center rounded-3xl border border-border bg-surface py-3"
            >
              <Txt variant="faint">
                {t('calendar.showMore', { count: monthLogs.length - LOG_PAGE_SIZE })}
              </Txt>
            </Pressable>
          )}
        </View>
      )}
    </Screen>
  );
}
