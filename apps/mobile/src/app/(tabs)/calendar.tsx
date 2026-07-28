import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  fromEpochDay,
  toEpochDay,
  todayEpochDay,
  type DayLog,
  type EpochDay,
} from '@locklune/core';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
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

export default function Calendar() {
  const router = useRouter();
  const today = todayEpochDay();
  const cycles = useDataStore((s) => s.cycles);
  const prediction = useDataStore((s) => s.prediction);
  const settings = useDataStore((s) => s.settings);
  const getDayLogsInRange = useDataStore((s) => s.getDayLogsInRange);

  const pregnant = settings.cycleMode === 'pregnant';
  const pregnantDueDay = pregnant ? settings.pregnancyDueDay : null;

  const todayDate = fromEpochDay(today);
  const [anchor, setAnchor] = useState(() => new Date(todayDate.getFullYear(), todayDate.getMonth(), 1));
  const cells = useMonthGrid(anchor);
  const [monthLogs, setMonthLogs] = useState<DayLog[]>([]);

  const isCurrentMonth =
    anchor.getFullYear() === todayDate.getFullYear() &&
    anchor.getMonth() === todayDate.getMonth();

  const goToToday = () =>
    setAnchor(new Date(todayDate.getFullYear(), todayDate.getMonth(), 1));

  useEffect(() => {
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
    for (const u of prediction.upcoming) {
      for (let d = u.periodStart; d <= u.periodEnd; d++) predicted.add(d);
      if (prediction.fertilityApplicable) {
        for (let d = u.fertileWindow.start; d <= u.fertileWindow.end; d++) fertile.add(d);
        ovulation.add(u.ovulationDay);
      }
    }
    const current = cycles[cycles.length - 1];
    if (current && current.endDay === null) {
      const expectedEnd =
        current.startDay + Math.max(1, Math.round(prediction.averagePeriodLength)) - 1;
      for (let d = today + 1; d <= expectedEnd; d++) predicted.add(d);
    }
    return { periodSet: period, predictedSet: predicted, fertileSet: fertile, ovulationSet: ovulation };
  }, [cycles, prediction, today]);

  const weeks: (EpochDay | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const monthLabel = anchor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const shiftMonth = (delta: number) =>
    setAnchor((a) => new Date(a.getFullYear(), a.getMonth() + delta, 1));

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
          <View key={wi} className="flex-row">
            {week.map((day, di) => (
              <DayCell
                key={di}
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
            {prediction.fertilityApplicable && (
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

      {/* Month log entries */}
      {monthLogs.length > 0 && (
        <View className="gap-3">
          <Txt variant="label">This month</Txt>
          {[...monthLogs].reverse().map((log) => (
            <LogEntry
              key={log.day}
              log={log}
              onPress={() =>
                router.push({ pathname: '/log', params: { day: String(log.day) } })
              }
            />
          ))}
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
  if (day === null) return <View className="flex-1 p-1.5" style={{ aspectRatio: 1 }} />;

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

  let fill = '';
  let textClass = 'text-text';
  let glow: object | undefined;
  let circleBorder: object | null = null;

  if (trimesterBg !== null) {
    if (isDueDay) textClass = 'text-white';
  } else {
    if (isPeriod) {
      fill = 'bg-period';
      textClass = 'text-ink';
      glow = styles.periodGlow;
    } else if (isOvulation) {
      fill = 'bg-ovulation';
      textClass = 'text-ink';
    } else if (isFertile) {
      fill = 'bg-fertile/15';
    } else if (isPredicted) {
      fill = 'bg-period/20';
    }
    if (!isPeriod && !isToday) {
      if (isOvulation) {
        circleBorder = { borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)' };
      } else if (isFertile) {
        circleBorder = { borderWidth: 1.5, borderColor: colors.fertile };
      }
    }
  }

  const todayRingClass = isToday && !isPeriod && trimesterBg === null ? 'border border-primary-soft' : '';
  const todayRingStyle =
    isToday && trimesterBg !== null && !isDueDay
      ? { borderWidth: 1.5, borderColor: colors.primarySoft }
      : null;

  const bgStyle = trimesterBg ? { backgroundColor: trimesterBg } : null;

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
      className="flex-1 p-1.5"
      style={{ aspectRatio: 1 }}
    >
      <View
        className={`flex-1 items-center justify-center rounded-full ${fill} ${todayRingClass}`}
        style={[{ borderRadius: 9999 }, glow, circleBorder, bgStyle, todayRingStyle]}
      >
        <Txt className={`${textClass} text-base font-body-medium`}>
          {fromEpochDay(day).getDate()}
        </Txt>
        {(isDueDay || (!trimesterBg && isPeriod)) && <View style={styles.highlight} />}
        {hasLog && (
          <View style={styles.indicators}>
            <Ionicons
              name="moon"
              size={7}
              color={isPeriod || isDueDay ? 'rgba(255,255,255,0.55)' : colors.primarySoft}
            />
          </View>
        )}
      </View>
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

function LogEntry({ log, onPress }: { log: DayLog; onPress: () => void }) {
  const meta: string[] = [];
  if (log.flow != null) meta.push(FLOW_LABEL[log.flow] ?? '');
  if (log.ovulation) meta.push('Ovulation confirmed');

  const symptomText =
    log.symptoms.length > 0
      ? log.symptoms.slice(0, 3).join(', ') +
        (log.symptoms.length > 3 ? ` +${log.symptoms.length - 3} more` : '')
      : null;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Log for ${fromEpochDay(log.day).toLocaleDateString()}`}
      className="rounded-2xl border border-border bg-surface p-3"
    >
      <View className="flex-row items-center justify-between">
        <Txt variant="label">
          {formatDay(log.day, { weekday: 'short', month: 'short', day: 'numeric' })}
        </Txt>
        <View className="flex-row items-center gap-1.5">
          {log.note && (
            <Ionicons name="document-text-outline" size={14} color={colors.textFaint} />
          )}
          {log.mood != null && MOOD_ICON[log.mood] && (
            <MaterialCommunityIcons
              name={MOOD_ICON[log.mood]!.icon}
              size={18}
              color={MOOD_ICON[log.mood]!.color}
            />
          )}
        </View>
      </View>
      {meta.length > 0 && (
        <Txt variant="faint" className="mt-1">
          {meta.join(' · ')}
        </Txt>
      )}
      {symptomText && (
        <Txt variant="faint" className="mt-0.5">
          {symptomText}
        </Txt>
      )}
      {log.note && (
        <Txt variant="faint" className="mt-0.5" numberOfLines={1}>
          {log.note}
        </Txt>
      )}
    </Pressable>
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
  periodGlow: {
    shadowColor: colors.primary,
    shadowOpacity: 0.55,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 5,
  },
  highlight: {
    position: 'absolute',
    top: 7,
    right: 10,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.75)',
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
