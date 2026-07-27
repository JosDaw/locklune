import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { fromEpochDay, toEpochDay, todayEpochDay, type EpochDay } from '@locklune/core';
import { Card } from '../../components/ui/Card';
import { Screen } from '../../components/ui/Screen';
import { Txt } from '../../components/ui/Text';
import { colors } from '../../theme/colors';
import { useDataStore } from '../../stores/dataStore';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

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
  const getDayLogsInRange = useDataStore((s) => s.getDayLogsInRange);

  const [anchor, setAnchor] = useState(() => {
    const d = fromEpochDay(today);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const cells = useMonthGrid(anchor);
  const [loggedDays, setLoggedDays] = useState<Set<EpochDay>>(new Set());

  useEffect(() => {
    const validDays = cells.filter((c): c is EpochDay => c !== null);
    if (validDays.length === 0) return;
    const from = validDays[0]!;
    const to = validDays[validDays.length - 1]!;
    let alive = true;
    void getDayLogsInRange(from, to).then((logs) => {
      if (alive) setLoggedDays(new Set(logs.map((l) => l.day)));
    });
    return () => {
      alive = false;
    };
  }, [cells, getDayLogsInRange]);

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
      // Fertile / ovulation markers only when they're meaningful for the mode.
      if (prediction.fertilityApplicable) {
        for (let d = u.fertileWindow.start; d <= u.fertileWindow.end; d++) fertile.add(d);
        ovulation.add(u.ovulationDay);
      }
    }
    // Predicted remaining days of the current, still-open period — the "next few
    // days" of an ongoing bleed, based on the average period length.
    const current = cycles[cycles.length - 1];
    if (current && current.endDay === null) {
      const expectedEnd =
        current.startDay + Math.max(1, Math.round(prediction.averagePeriodLength)) - 1;
      for (let d = today + 1; d <= expectedEnd; d++) predicted.add(d);
    }
    return {
      periodSet: period,
      predictedSet: predicted,
      fertileSet: fertile,
      ovulationSet: ovulation,
    };
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
        <View className="items-center gap-1">
          <View className="flex-row items-center gap-2">
            <Ionicons name="moon" size={15} color={colors.primarySoft} />
            <Txt variant="title">{monthLabel}</Txt>
          </View>
          <Txt variant="faint">Your cycle stays private.</Txt>
        </View>
        <ArrowButton icon="chevron-forward" label="Next month" onPress={() => shiftMonth(1)} />
      </View>

      {/* Calendar — the centerpiece */}
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
                onPress={() =>
                  day !== null && router.push({ pathname: '/log', params: { day: String(day) } })
                }
              />
            ))}
          </View>
        ))}
      </Card>

      {/* Legend as elegant chips */}
      <View className="flex-row flex-wrap gap-2">
        <LegendChip icon="ellipse" color={colors.period} label="Period" />
        <LegendChip icon="moon" color={colors.primarySoft} label="Logged" />
        <LegendChip icon="ellipse-outline" color={colors.period} label="Predicted" />
        {prediction.fertilityApplicable && (
          <>
            <LegendChip icon="sparkles" color={colors.fertile} label="Fertile" />
            <LegendChip icon="leaf" color={colors.ovulation} label="Ovulation" />
          </>
        )}
      </View>

      <Txt variant="faint" className="text-center">
        Tap any day to add, end, or correct a period.
      </Txt>
    </Screen>
  );
}

function ArrowButton({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={styles.arrow}
      className="h-11 w-11 items-center justify-center rounded-full border border-border bg-surface active:opacity-70"
    >
      <Ionicons name={icon} size={20} color={colors.text} />
    </Pressable>
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
  onPress,
}: {
  day: EpochDay | null;
  isToday: boolean;
  isPeriod: boolean;
  isPredicted: boolean;
  isFertile: boolean;
  isOvulation: boolean;
  hasLog: boolean;
  onPress: () => void;
}) {
  if (day === null) return <View className="flex-1 p-1.5" style={{ aspectRatio: 1 }} />;

  const dottedRing = isPredicted && !isPeriod && !isOvulation && !isFertile;
  let fill = '';
  let textClass = 'text-text';
  let glow: object | undefined;
  if (isPeriod) {
    fill = 'bg-period';
    textClass = 'text-ink';
    glow = styles.periodGlow;
  } else if (isOvulation) {
    fill = 'bg-ovulation';
    textClass = 'text-ink';
  } else if (isFertile) {
    fill = 'bg-fertile/15';
  }
  const todayRing = isToday && !isPeriod && !isOvulation ? 'border border-primary-soft' : '';

  const states = [
    isToday && 'today',
    isPeriod && 'period',
    !isPeriod && isPredicted && 'predicted period',
    isOvulation ? 'estimated ovulation' : isFertile && 'fertile window',
    hasLog && 'has a log',
  ].filter(Boolean);
  const label = [
    fromEpochDay(day).toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }),
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
        className={`flex-1 items-center justify-center rounded-full ${fill} ${todayRing}`}
        style={[glow, dottedRing ? styles.dottedRing : null]}
      >
        <Txt className={`${textClass} text-base font-body-medium`}>
          {fromEpochDay(day).getDate()}
        </Txt>
        {isPeriod && <View style={styles.highlight} />}
        {hasLog && <View style={styles.logDot} />}
      </View>
    </Pressable>
  );
}

function LegendChip({
  icon,
  color,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  label: string;
}) {
  return (
    <View className="flex-row items-center gap-2 rounded-full border border-border bg-surface px-3 py-2">
      <Ionicons name={icon} size={13} color={color} />
      <Txt variant="faint" className="text-text-muted">
        {label}
      </Txt>
    </View>
  );
}

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
  dottedRing: {
    borderWidth: 1.5,
    borderColor: colors.period,
    borderStyle: 'dotted',
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
  logDot: {
    position: 'absolute',
    bottom: 5,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.moon,
  },
});
