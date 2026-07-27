import { useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
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
      for (let d = u.fertileWindow.start; d <= u.fertileWindow.end; d++) fertile.add(d);
      ovulation.add(u.ovulationDay);
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
      <View className="flex-row items-center justify-between pt-2">
        <Pressable onPress={() => shiftMonth(-1)} className="h-10 w-10 items-center justify-center rounded-full active:bg-surfaceMuted">
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <Txt variant="title">{monthLabel}</Txt>
        <Pressable onPress={() => shiftMonth(1)} className="h-10 w-10 items-center justify-center rounded-full active:bg-surfaceMuted">
          <Ionicons name="chevron-forward" size={22} color={colors.text} />
        </Pressable>
      </View>

      <Card>
        <View className="flex-row">
          {WEEKDAYS.map((w, i) => (
            <View key={i} className="flex-1 items-center pb-2">
              <Txt variant="faint">{w}</Txt>
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
                  day !== null &&
                  router.push({ pathname: '/log', params: { day: String(day) } })
                }
              />
            ))}
          </View>
        ))}
      </Card>

      <Card>
        <Txt variant="label" className="mb-3">Legend</Txt>
        <View className="gap-2">
          <LegendRow className="bg-period" label="Period (logged)" />
          <LegendRow className="border border-period" label="Predicted period" />
          <LegendRow className="bg-fertile/40" label="Fertile window" />
          <LegendRow className="bg-ovulation" label="Estimated ovulation" />
        </View>
      </Card>
    </Screen>
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
  if (day === null) return <View className="flex-1 p-1" style={{ aspectRatio: 1 }} />;

  const bg = isPeriod
    ? 'bg-period'
    : isOvulation
      ? 'bg-ovulation'
      : isFertile
        ? 'bg-fertile/30'
        : '';
  const ring = isPredicted && !isPeriod ? 'border border-period' : isToday ? 'border border-primary-soft' : '';
  const textClass = isPeriod || isOvulation ? 'text-ink' : 'text-text';

  return (
    <Pressable onPress={onPress} className="flex-1 p-1" style={{ aspectRatio: 1 }}>
      <View className={`flex-1 items-center justify-center rounded-xl ${bg} ${ring}`}>
        <Txt className={textClass}>{fromEpochDay(day).getDate()}</Txt>
        {hasLog && <View className="mt-0.5 h-1 w-1 rounded-full bg-primary-soft" />}
      </View>
    </Pressable>
  );
}

function LegendRow({ className, label }: { className: string; label: string }) {
  return (
    <View className="flex-row items-center gap-3">
      <View className={`h-5 w-5 rounded-md ${className}`} />
      <Txt variant="muted">{label}</Txt>
    </View>
  );
}
