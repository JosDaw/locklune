import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  fromEpochDay,
  predict,
  toEpochDay,
  todayEpochDay,
  type DayLog,
  type EpochDay,
} from '@locklune/core';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Circle as SvgCircle } from 'react-native-svg';
import { Card } from '../../components/ui/Card';
import { Screen } from '../../components/ui/Screen';
import { Txt } from '../../components/ui/Text';
import { formatDay } from '../../lib/format';
import { useDataStore } from '../../stores/dataStore';
import { colors } from '../../theme/colors';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const FLOW_LABEL: Record<number, string> = {
  1: 'Spotting',
  2: 'Light',
  3: 'Medium',
  4: 'Heavy',
};

// Trimester day boundaries from LMP (= dueDay − 280).
const PREGNANCY_DAYS = 280;
const T1_END_DAY = 83;   // weeks 1–12
const T2_END_DAY = 188;  // weeks 13–26, T3 is 189–279

const T1_COLOR = 'rgba(52, 211, 153, 0.18)';
const T2_COLOR = 'rgba(251, 191, 36, 0.18)';
const T3_COLOR = 'rgba(167, 139, 250, 0.18)';
const DUE_COLOR = 'rgba(139, 92, 246, 0.6)';

function useMonthGrid(anchor: Date) {
  return useMemo(() => {
    const year = anchor.getFullYear();
    const month = anchor.getMonth();
    const first = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (EpochDay | null)[] = [];
    for (let i = 0; i < first.getDay(); i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(toEpochDay(new Date(year, month, d)));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [anchor]);
}

const LOG_PAGE_SIZE = 6;

export default function Calendar() {
  const router = useRouter();
  const today = todayEpochDay();
  const cycles = useDataStore((s) => s.cycles);
  const prediction = useDataStore((s) => s.prediction);
  const ovulationDays = useDataStore((s) => s.ovulationDays);
  const settings = useDataStore((s) => s.settings);
  const getDayLogsInRange = useDataStore((s) => s.getDayLogsInRange);
  const deleteLog = useDataStore((s) => s.deleteLog);

  const pregnant = settings.cycleMode === 'pregnant';
  const pregnantDueDay = pregnant ? settings.pregnancyDueDay : null;

  const todayDate = fromEpochDay(today);
  const [anchor, setAnchor] = useState(() => new Date(todayDate.getFullYear(), todayDate.getMonth(), 1));
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
    anchor.getFullYear() === todayDate.getFullYear() &&
    anchor.getMonth() === todayDate.getMonth();

  const goToToday = () => {
    setLogsExpanded(false);
    setAnchor(new Date(todayDate.getFullYear(), todayDate.getMonth(), 1));
  };

  const fetchMonthLogs = useCallback(() => {
    const validDays = cells.filter((c): c is EpochDay => c !== null);
    if (validDays.length === 0) return;
    const from = validDays[0]!;
    const to = validDays[validDays.length - 1]!;
    let alive = true;
    void getDayLogsInRange(from, to).then((logs) => {
      if (alive) setMonthLogs(logs);
    });
    return () => { alive = false; };
  }, [cells, getDayLogsInRange]);

  useEffect(fetchMonthLogs, [fetchMonthLogs]);
  useFocusEffect(useCallback(fetchMonthLogs, [fetchMonthLogs]));

  const loggedDays = useMemo(() => new Set(monthLogs.map((l) => l.day)), [monthLogs]);

  const { periodSet, predictedSet, fertileSet, ovulationSet } = useMemo(() => {
    const period = new Set<EpochDay>();
    cycles.forEach((c, i) => {
      const isLast = i === cycles.length - 1;
      const end = c.endDay ?? (isLast ? today : c.startDay);
      for (let d = c.startDay; d <= end; d++) period.add(d);
    });
    const predicted = new Set<EpochDay>();
    const fertile = new Set<EpochDay>();
    const ovulation = new Set<EpochDay>();
    for (const u of activePrediction.upcoming) {
      for (let d = u.periodStart; d <= u.periodEnd; d++) predicted.add(d);
      if (activePrediction.fertilityApplicable) {
        for (let d = u.fertileWindow.start; d <= u.fertileWindow.end; d++) fertile.add(d);
        ovulation.add(u.ovulationDay);
      }
    }
    const current = cycles[cycles.length - 1];
    if (current && current.endDay === null) {
      const expectedEnd =
        current.startDay + Math.max(1, Math.round(activePrediction.averagePeriodLength)) - 1;
      for (let d = today + 1; d <= expectedEnd; d++) predicted.add(d);
    }
    return { periodSet: period, predictedSet: predicted, fertileSet: fertile, ovulationSet: ovulation };
  }, [cycles, activePrediction, today]);

  const weeks: (EpochDay | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const monthLabel = anchor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const shiftMonth = (delta: number) => {
    setLogsExpanded(false);
    setAnchor((a) => new Date(a.getFullYear(), a.getMonth() + delta, 1));
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
          {WEEKDAYS.map((w, i) => (
            <View key={i} className="flex-1 items-center pb-3">
              <Txt variant="faint" className="text-2xs uppercase tracking-widest">
                {w}
              </Txt>
            </View>
          ))}
        </View>

        {weeks.map((week, wi) => (
          <View key={wi} style={{ flexDirection: 'row' }}>
            {week.map((day, di) => (
              <DayCell
                key={day !== null ? `d${day}` : `e${wi}-${di}`}
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
            <LegendChip icon="ellipse" iconColor="rgba(110,168,254,0.3)" label="Predicted" />
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
                onPress={() =>
                  router.push({ pathname: '/log', params: { day: String(log.day) } })
                }
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
                            if (ok) setMonthLogs((prev) => prev.filter((l) => l.day !== log.day));
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

const ARROW_SPRING = { damping: 18, stiffness: 350, mass: 0.5 } as const;

function ArrowButton({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={[styles.arrow, anim]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.9, ARROW_SPRING); }}
        onPressOut={() => { scale.value = withSpring(1, ARROW_SPRING); }}
        accessibilityRole="button"
        accessibilityLabel={label}
        className="h-11 w-11 items-center justify-center rounded-full border border-border bg-surface"
      >
        <Ionicons name={icon} size={20} color={colors.text} />
      </Pressable>
    </Animated.View>
  );
}

function DayCell({
  day,
  isToday,
  isPeriod,
  isPredicted,
  isFertile,
  isOvulation,
  hasLog,
  pregnantDueDay,
  onPress,
}: {
  day: EpochDay | null;
  isToday: boolean;
  isPeriod: boolean;
  isPredicted: boolean;
  isFertile: boolean;
  isOvulation: boolean;
  hasLog: boolean;
  pregnantDueDay: EpochDay | null;
  onPress: () => void;
}) {
  if (day === null) return <View style={{ flex: 1, padding: 6, aspectRatio: 1 }} />;

  // Pregnancy trimester coloring takes precedence over cycle coloring.
  let trimesterBg: string | null = null;
  let isDueDay = false;
  if (pregnantDueDay !== null) {
    const lmp = pregnantDueDay - PREGNANCY_DAYS;
    const daysPreg = day - lmp;
    if (day === pregnantDueDay) {
      isDueDay = true;
      trimesterBg = DUE_COLOR;
    } else if (daysPreg >= 0 && daysPreg < PREGNANCY_DAYS) {
      if (daysPreg <= T1_END_DAY) trimesterBg = T1_COLOR;
      else if (daysPreg <= T2_END_DAY) trimesterBg = T2_COLOR;
      else trimesterBg = T3_COLOR;
    }
  }

  let textColor: string = colors.text;
  let bgColor: string | undefined;
  // Solid border rendered via CSS (works reliably for solid styles + borderRadius)
  let solidBorder: { borderWidth: number; borderColor: string } | undefined;
  // Whether to draw a dashed SVG circle overlay (CSS dashed+borderRadius is broken on Android)
  let dashedSvgColor: string | undefined;

  if (trimesterBg !== null) {
    bgColor = trimesterBg;
    if (isDueDay) { textColor = '#FFFFFF'; }
  } else {
    if (isPeriod) {
      bgColor = colors.period;
      textColor = colors.ink;
    } else if (isPredicted) {
      bgColor = 'rgba(110,168,254,0.20)';
    }

    if (!isPeriod && !isToday) {
      if (isPredicted) {
        // Use SVG dashed circle - CSS borderStyle:'dashed'+borderRadius is broken on Android
        dashedSvgColor = 'rgba(110,168,254,0.6)';
      }
    }
  }

  if (isToday && !isPeriod) {
    solidBorder = { borderWidth: 1.5, borderColor: colors.primarySoft };
  }

  const states = [
    isToday && 'today',
    isPeriod && 'period',
    isDueDay && 'due date',
    trimesterBg && !isDueDay && 'pregnancy',
    !isPeriod && isPredicted && 'predicted period',
    isOvulation ? 'estimated ovulation' : isFertile && 'fertile window',
    hasLog && 'has a log',
  ].filter(Boolean);
  const label = [
    fromEpochDay(day).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }),
    ...states,
  ].join(', ');

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{ flex: 1, padding: 6, aspectRatio: 1 }}
    >
      {/*
        overflow:'hidden' + borderRadius guarantees the background is clipped to a
        circle on Android - no style-array merging, no elevation interference.
        Solid borders sit on this same view; they render correctly with borderRadius.
      */}
      <View
        style={{
          flex: 1,
          borderRadius: 9999,
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: bgColor,
          ...solidBorder,
        }}
      >
        <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: textColor }}>
          {fromEpochDay(day).getDate()}
        </Text>
        {(hasLog || isOvulation || isFertile) && (
          <View style={styles.indicators}>
            {isOvulation && (
              <Ionicons name="leaf" size={8} color={colors.ovulation} />
            )}
            {isFertile && !isOvulation && (
              <Ionicons name="star" size={7} color={colors.fertile} />
            )}
            {hasLog && (
              <Ionicons
                name="moon"
                size={7}
                color={isPeriod || isDueDay ? 'rgba(255,255,255,0.55)' : colors.primarySoft}
              />
            )}
          </View>
        )}
      </View>
      {/*
        SVG dashed circle - absolutely covers the cell, drawn on top of the content
        view. SVG strokes handle dashes + curvature correctly on every platform.
      */}
      {dashedSvgColor !== undefined && (
        <Svg
          style={{ position: 'absolute', top: 6, left: 6, right: 6, bottom: 6 }}
          viewBox="0 0 100 100"
        >
          <SvgCircle
            cx={50}
            cy={50}
            r={47}
            fill="none"
            stroke={dashedSvgColor}
            strokeWidth={3}
            strokeDasharray="10 7"
          />
        </Svg>
      )}
    </Pressable>
  );
}

function LegendChip({
  icon,
  iconColor,
  dotColor,
  label,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  dotColor?: string;
  label: string;
}) {
  return (
    <View className="flex-row items-center gap-2 rounded-full border border-border bg-surface px-3 py-2">
      {icon && iconColor ? (
        <Ionicons name={icon} size={13} color={iconColor} />
      ) : dotColor ? (
        <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: dotColor }} />
      ) : null}
      <Txt variant="faint" className="text-text-muted">
        {label}
      </Txt>
    </View>
  );
}

function LogEntry({
  log,
  onPress,
  onDelete,
}: {
  log: DayLog;
  onPress: () => void;
  onDelete: () => void;
}) {
  const moodIcon = log.mood != null ? MOOD_ICON[log.mood] : null;
  const swipeRef = useRef<Swipeable>(null);

  const renderRightActions = () => (
    <Pressable
      onPress={() => {
        swipeRef.current?.close();
        onDelete();
      }}
      accessibilityRole="button"
      accessibilityLabel="Delete log"
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        width: 72,
        borderRadius: 16,
        backgroundColor: colors.danger,
        marginLeft: 8,
      }}
    >
      <Ionicons name="trash-outline" size={20} color="#fff" />
    </Pressable>
  );

  return (
    <Swipeable ref={swipeRef} renderRightActions={renderRightActions} overshootRight={false}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Log for ${fromEpochDay(log.day).toLocaleDateString()}`}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.surface,
          paddingHorizontal: 14,
          paddingVertical: 10,
        }}
      >
        {/* Date */}
        <Text
          style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: colors.text, flex: 1 }}
          numberOfLines={1}
        >
          {formatDay(log.day, { weekday: 'short', month: 'short', day: 'numeric' })}
        </Text>

        {/* Flow drops */}
        {log.flow != null && (
          <View style={{ flexDirection: 'row', gap: 2 }}>
            {[1, 2, 3, 4].map((level) => (
              <Ionicons
                key={level}
                name="water"
                size={11}
                color={level <= log.flow! ? colors.period : colors.period + '28'}
              />
            ))}
          </View>
        )}

        {/* Mood icon */}
        {moodIcon && (
          <MaterialCommunityIcons name={moodIcon.icon} size={16} color={moodIcon.color} />
        )}

        {/* Symptoms indicator */}
        {log.symptoms.length > 0 && (
          <Ionicons name="pulse-outline" size={14} color={colors.textFaint} />
        )}

        {/* Note indicator */}
        {log.note && (
          <Ionicons name="document-text-outline" size={14} color={colors.textFaint} />
        )}
      </Pressable>
    </Swipeable>
  );
}

const MOOD_ICON: Record<number, { icon: keyof typeof MaterialCommunityIcons.glyphMap; color: string }> = {
  1: { icon: 'emoticon-cry-outline',     color: '#94A3B8' },
  2: { icon: 'emoticon-sad-outline',     color: '#7DD3FC' },
  3: { icon: 'emoticon-neutral-outline', color: '#86EFAC' },
  4: { icon: 'emoticon-happy-outline',   color: '#FDE68A' },
  5: { icon: 'emoticon-excited-outline', color: '#FCA5A5' },
};

const styles = StyleSheet.create({
  arrow: {
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  indicators: {
    position: 'absolute',
    bottom: 4,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
  },
});
