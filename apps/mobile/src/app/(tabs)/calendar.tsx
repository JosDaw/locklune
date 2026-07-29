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
import { useDataStore } from '../../stores/dataStore';
import { colors } from '../../theme/colors';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

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
  const router = useRouter();
  const today = todayEpochDay();
  const cycles = useDataStore((store) => store.cycles);
  const prediction = useDataStore((store) => store.prediction);
  const ovulationDays = useDataStore((store) => store.ovulationDays);
  const settings = useDataStore((store) => store.settings);
  const getDayLogsInRange = useDataStore((store) => store.getDayLogsInRange);
  const deleteLog = useDataStore((store) => store.deleteLog);

  const pregnant = settings.cycleMode === CYCLE_MODE.Pregnant;
  const pregnantDueDay = pregnant ? settings.pregnancyDueDay : null;

  const todayDate = fromEpochDay(today);
  const [anchor, setAnchor] = useState(
    () => new Date(todayDate.getFullYear(), todayDate.getMonth(), 1),
  );
  const cells = useMonthGrid(anchor);
  const [monthLogs, setMonthLogs] = useState<DayLog[]>([]);
  const [logsExpanded, setLogsExpanded] = useState(false);

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

  const monthLabel = anchor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const shiftMonth = (delta: number) => {
    setLogsExpanded(false);
    setAnchor((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  return (
    <Screen>
      {/* Header */}
      <View className="flex-row items-center justify-between pt-2">
        <ArrowButton icon="chevron-back" label="Previous month" onPress={() => shiftMonth(-1)} />
        <View className="items-center gap-1.5">
          <View className="flex-row items-center gap-2">
            <Ionicons name="moon" size={15} color={colors.primarySoft} />
            <Txt variant="title">{monthLabel}</Txt>
          </View>
          {isCurrentMonth ? (
            <Txt variant="faint">Your cycle stays private.</Txt>
          ) : (
            <Pressable
              onPress={goToToday}
              accessibilityRole="button"
              accessibilityLabel="Return to today"
              className="rounded-full bg-white px-4 py-1.5"
            >
              <Txt className="text-ink text-xs font-body-medium">Today</Txt>
            </Pressable>
          )}
        </View>
        <ArrowButton icon="chevron-forward" label="Next month" onPress={() => shiftMonth(1)} />
      </View>

      {/* Calendar grid */}
      <Card className="px-3 py-5">
        <View className="mb-1 flex-row">
          {WEEKDAYS.map((weekday, index) => (
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
                  day !== null && router.push({ pathname: '/log', params: { day: String(day) } })
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
            <LegendChip dotColor={T1_COLOR} label="Trimester 1" />
            <LegendChip dotColor={T2_COLOR} label="Trimester 2" />
            <LegendChip dotColor={T3_COLOR} label="Trimester 3" />
            <LegendChip dotColor={DUE_COLOR} label="Due date" />
            {monthLogs.length > 0 && (
              <LegendChip icon="moon" iconColor={colors.primarySoft} label="Logged" />
            )}
          </>
        ) : (
          <>
            <LegendChip icon="ellipse" iconColor={colors.period} label="Period" />
            <LegendChip icon="ellipse" iconColor={colors.predictedDim} label="Predicted" />
            <LegendChip icon="moon" iconColor={colors.primarySoft} label="Logged" />
            {activePrediction.fertilityApplicable && (
              <>
                <LegendChip icon="star-outline" iconColor={colors.fertile} label="Fertile" />
                <LegendChip icon="leaf" iconColor={colors.ovulation} label="Ovulation" />
              </>
            )}
          </>
        )}
      </View>

      <Txt variant="faint" className="text-center">
        Tap any day to add, end, or correct an entry.
      </Txt>

      {/* Month log entries - show 6 initially, expand on demand */}
      {monthLogs.length > 0 && (
        <View className="gap-3">
          <Txt variant="label">This month</Txt>
          {[...monthLogs]
            .reverse()
            .slice(0, logsExpanded ? undefined : LOG_PAGE_SIZE)
            .map((log) => (
              <LogEntry
                key={log.day}
                log={log}
                onPress={() => router.push({ pathname: '/log', params: { day: String(log.day) } })}
                onDelete={() => {
                  Alert.alert(
                    'Delete this log?',
                    'This removes all entries recorded for this day.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Delete',
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
              <Txt variant="faint">Show {monthLogs.length - LOG_PAGE_SIZE} more</Txt>
            </Pressable>
          )}
        </View>
      )}
    </Screen>
  );
}
