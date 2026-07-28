import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  BRAND,
  pregnancyProgress,
  todayEpochDay,
  type Cycle,
  type CyclePrediction,
  type DayLog,
  type EpochDay,
  type Prediction,
  type Settings,
} from '@locklune/core';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, Text, View, useWindowDimensions, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Svg, { Circle, Line, Rect } from 'react-native-svg';
import { MoonLoader } from '../../components/ui/MoonLoader';
import { Screen } from '../../components/ui/Screen';
import { Txt } from '../../components/ui/Text';
import { formatDay, formatRange, relativeDays } from '../../lib/format';
import * as haptics from '../../lib/haptics';
import { useDataStore } from '../../stores/dataStore';
import { colors } from '../../theme/colors';

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOpacity: 0.3,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 10 },
  elevation: 3,
} as const;

const MOOD_META: Record<number, { icon: keyof typeof MaterialCommunityIcons.glyphMap; color: string }> = {
  1: { icon: 'emoticon-cry-outline', color: '#94A3B8' },
  2: { icon: 'emoticon-sad-outline', color: '#7DD3FC' },
  3: { icon: 'emoticon-neutral-outline', color: '#86EFAC' },
  4: { icon: 'emoticon-happy-outline', color: '#FDE68A' },
  5: { icon: 'emoticon-excited-outline', color: '#FCA5A5' },
};

const FLOW_LABELS: Record<number, string> = {
  1: 'Spotting',
  2: 'Light flow',
  3: 'Medium flow',
  4: 'Heavy flow',
};

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

  const onStart = () => void (async () => (await startPeriod(today)) && haptics.success())();
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
            backgroundColor: 'rgba(110,168,254,0.08)',
            borderWidth: 1,
            borderColor: 'rgba(110,168,254,0.25)',
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
              fontFamily: 'Inter_500Medium',
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
                  fontFamily: 'Inter_500Medium',
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
              </View>
            ) : onPeriod ? (
              // ON PERIOD
              <View style={{ flexDirection: 'row', gap: 16, alignItems: 'flex-start' }}>
                <View style={{ flex: 1, gap: 6 }}>
                  <Txt variant="label" className="text-period">
                    On your period
                  </Txt>
                  <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 56, color: colors.moon }}>
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
                    style={{ fontFamily: 'Manrope_700Bold', fontSize: 64, color: colors.moon, lineHeight: 68 }}
                  >
                    {Math.max(0, daysAway)}
                  </Text>
                  <Txt variant="muted">{daysAway === 1 ? 'day away' : 'days away'}</Txt>
                  <Text
                    style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 20, color: colors.text, marginTop: 4 }}
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
                  <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 32, color: colors.fertile, lineHeight: 36 }}>
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
                  <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 32, color: colors.ovulation, lineHeight: 36 }}>
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

/* ------------------------------------------------------------------ */

function CycleRing({ day, total, size = 84, color = colors.primary }: { day: number; total: number; size?: number; color?: string }) {
  const strokeWidth = 10;
  const cx = size / 2;
  const cy = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * radius;
  const progress = total > 0 ? Math.max(0, Math.min(1, day / total)) : 0;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circ} ${circ}`}
          strokeDashoffset={circ * (1 - progress)}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </Svg>
    </View>
  );
}

const PILL_SPRING = { damping: 18, stiffness: 380, mass: 0.45 } as const;

function PillButton({
  label,
  icon,
  onPress,
  large,
}: {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  large?: boolean;
}) {
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={[anim, { alignSelf: 'flex-start', borderRadius: 99 }]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.94, PILL_SPRING);
        }}
        onPressOut={() => {
          scale.value = withSpring(1, PILL_SPRING);
        }}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          paddingHorizontal: large ? 20 : 14,
          paddingVertical: large ? 12 : 8,
          borderRadius: 99,
          backgroundColor: colors.primary,
        }}
      >
        {icon && <Ionicons name={icon} size={18} color={colors.ink} />}
        <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: colors.ink }}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

function OutlookChip({
  icon,
  iconColor,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  value: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        borderRadius: 20,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 14,
        gap: 8,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Ionicons name={icon} size={14} color={iconColor} />
        <Txt variant="label">{label}</Txt>
      </View>
      <Txt variant="body">{value}</Txt>
    </View>
  );
}

function TodayEntryCard({ log, onEdit }: { log: DayLog; onEdit: () => void }) {
  const moodMeta = log.mood != null ? MOOD_META[log.mood] : null;
  const shownSyms = log.symptoms.slice(0, 4);
  const extra = log.symptoms.length - shownSyms.length;

  return (
    <View
      style={{
        borderRadius: 24,
        backgroundColor: colors.surface,
        padding: 20,
        borderWidth: 1,
        borderColor: colors.border,
        gap: 10,
        ...CARD_SHADOW,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Txt variant="label">Today's log</Txt>
        {moodMeta && (
          <MaterialCommunityIcons name={moodMeta.icon} size={30} color={moodMeta.color} />
        )}
      </View>

      {log.flow != null && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ flexDirection: 'row', gap: 3 }}>
            {[1, 2, 3, 4].map((level) => (
              <Ionicons
                key={level}
                name="water"
                size={18}
                color={level <= log.flow! ? colors.period : colors.period + '28'}
              />
            ))}
          </View>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.textMuted }}>
            {FLOW_LABELS[log.flow]}
          </Text>
        </View>
      )}

      {shownSyms.length > 0 && (
        <View style={{ gap: 6 }}>
          <Text
            style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: colors.textFaint, letterSpacing: 0.4 }}
          >
            Symptoms
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {shownSyms.map((s) => (
              <View
                key={s}
                style={{
                  borderRadius: 99,
                  backgroundColor: colors.surfaceMuted,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                }}
              >
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color: colors.textMuted }}>
                  {s}
                </Text>
              </View>
            ))}
            {extra > 0 && (
              <View
                style={{
                  borderRadius: 99,
                  backgroundColor: colors.surfaceMuted,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                }}
              >
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color: colors.textFaint }}>
                  +{extra} more
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {log.note && (
        <View style={{ gap: 4 }}>
          <Text
            style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: colors.textFaint, letterSpacing: 0.4 }}
          >
            Notes
          </Text>
          <Text
            numberOfLines={2}
            style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.textMuted, fontStyle: 'italic' }}
          >
            {log.note}
          </Text>
        </View>
      )}

      <Pressable
        onPress={onEdit}
        accessibilityRole="button"
        accessibilityLabel="Edit today's log"
        style={{
          alignSelf: 'flex-start',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          marginTop: 2,
          borderRadius: 99,
          backgroundColor: colors.surfaceMuted,
          paddingHorizontal: 14,
          paddingVertical: 8,
        }}
      >
        <Ionicons name="pencil-outline" size={16} color={colors.primarySoft} />
        <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: colors.primarySoft }}>
          Edit today's log
        </Text>
      </Pressable>
    </View>
  );
}

function PregnancyCard({ preg }: { preg: ReturnType<typeof pregnancyProgress> | null }) {
  const cardStyle: ViewStyle = {
    borderRadius: 24,
    backgroundColor: colors.surface,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
    ...CARD_SHADOW,
  };
  if (!preg) {
    return (
      <View style={cardStyle}>
        <Txt variant="label" className="text-primary-soft">
          Pregnancy
        </Txt>
        <Txt variant="muted">Set how many weeks along you are in Settings.</Txt>
      </View>
    );
  }
  return (
    <View style={cardStyle}>
      <Txt variant="label" className="text-primary-soft">
        Pregnancy
      </Txt>
      <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 48, color: colors.moon }}>
        Week {preg.week}
        {preg.dayOfWeek > 0 ? ` +${preg.dayOfWeek}d` : ''}
      </Text>
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
  );
}

const MOOD_LABEL: Record<number, string> = { 1: 'Awful', 2: 'Low', 3: 'Okay', 4: 'Good', 5: 'Great' };

function computeStats(logs: DayLog[]): { topMood: number | null; topSymptoms: string[] } {
  const moodCounts: Record<number, number> = {};
  logs.forEach((l) => {
    if (l.mood != null) moodCounts[l.mood] = (moodCounts[l.mood] ?? 0) + 1;
  });
  const topMood =
    Object.keys(moodCounts).length >= 3
      ? Number(Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]![0])
      : null;

  const symCounts: Record<string, number> = {};
  logs.forEach((l) => l.symptoms.forEach((s) => { symCounts[s] = (symCounts[s] ?? 0) + 1; }));
  const topSymptoms = Object.entries(symCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([s]) => s.charAt(0).toUpperCase() + s.slice(1));

  return { topMood, topSymptoms };
}

function phaseForLog(
  day: EpochDay,
  cycles: Cycle[],
  avgLen: number,
  avgPeriodLen: number,
): string | null {
  let cycleStart: number | null = null;
  for (let i = cycles.length - 1; i >= 0; i--) {
    if (day >= cycles[i].startDay) {
      cycleStart = cycles[i].startDay;
      break;
    }
  }
  if (cycleStart === null) return null;
  const cd = day - cycleStart + 1;
  const fertStart = avgLen - 19; // ovulation - 5
  const ovDay = avgLen - 14;
  if (cd <= avgPeriodLen) return 'Menstrual';
  if (cd < fertStart) return 'Follicular';
  if (cd <= ovDay + 1) return 'Ovulatory';
  return 'Luteal';
}

function StatsRow({
  logs,
  cycles,
  currentPhase,
  avgLen,
  avgPeriodLen,
}: {
  logs: DayLog[];
  cycles: Cycle[];
  currentPhase: { label: string; color: string } | null;
  avgLen: number;
  avgPeriodLen: number;
}) {
  const { topMood, topSymptoms } = computeStats(logs);

  // Phase-specific symptom trend
  const phaseSymptoms = useMemo(() => {
    if (!currentPhase || cycles.length === 0) return [];
    const symCounts: Record<string, number> = {};
    logs.forEach((log) => {
      const phase = phaseForLog(log.day, cycles, avgLen, avgPeriodLen);
      if (phase === currentPhase.label) {
        log.symptoms.forEach((s) => { symCounts[s] = (symCounts[s] ?? 0) + 1; });
      }
    });
    return Object.entries(symCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([s]) => s.charAt(0).toUpperCase() + s.slice(1));
  }, [logs, cycles, currentPhase, avgLen, avgPeriodLen]);

  const shownSymptoms =
    phaseSymptoms.length > 0 && currentPhase ? phaseSymptoms : topSymptoms;

  if (topMood === null && shownSymptoms.length === 0) return null;

  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {topMood !== null && (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            gap: 6,
            backgroundColor: colors.surface,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: 12,
            paddingVertical: 14,
          }}
        >
          <MaterialCommunityIcons
            name={MOOD_META[topMood]!.icon}
            size={32}
            color={MOOD_META[topMood]!.color}
          />
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 12,
              color: colors.textMuted,
              textAlign: 'center',
            }}
          >
            Usually {MOOD_LABEL[topMood]}
          </Text>
        </View>
      )}
      {shownSymptoms.length > 0 && (
        <View
          style={{
            flex: 1,
            gap: 8,
            backgroundColor: colors.surface,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: 12,
            paddingVertical: 10,
          }}
        >
          <Text
            style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: colors.textFaint, letterSpacing: 0.4 }}
          >
            Frequent symptoms
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
            {shownSymptoms.map((s) => (
              <View
                key={s}
                style={{
                  borderRadius: 99,
                  backgroundColor: colors.surfaceMuted,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                }}
              >
                <Text
                  style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.textMuted }}
                >
                  {s}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

function computePhase(
  onPeriod: boolean,
  cycleDay: number,
  next: CyclePrediction | undefined,
  today: EpochDay,
  fertility: boolean,
): { label: string; color: string } | null {
  if (!cycleDay) return null;
  if (onPeriod) return { label: 'Menstrual', color: colors.danger };
  if (!fertility || !next) return null;
  if (today >= next.fertileWindow.start && today <= next.fertileWindow.end)
    return { label: 'Ovulatory', color: colors.ovulation };
  if (today < next.fertileWindow.start) return { label: 'Follicular', color: '#86EFAC' };
  return { label: 'Luteal', color: '#C084FC' };
}

function TomorrowCard({
  tomorrow,
  cycles,
  prediction,
  recentLogs,
  fertility,
  avgLen,
  avgPeriodLen,
}: {
  tomorrow: EpochDay;
  cycles: Cycle[];
  prediction: Prediction;
  recentLogs: DayLog[];
  fertility: boolean;
  avgLen: number;
  avgPeriodLen: number;
}) {
  const last = cycles[cycles.length - 1];
  if (!last) return null;

  const tomorrowCycleDay = tomorrow - last.startDay + 1;
  if (tomorrowCycleDay <= 0) return null;

  // Is tomorrow still within an ongoing period?
  // Is tomorrow still within an ongoing period?
  const ongoingPeriodEnd = last.endDay === null
    ? last.startDay + Math.max(1, Math.round(avgPeriodLen)) - 1
    : null;
  const ongoingPeriodTomorrow = ongoingPeriodEnd !== null && tomorrow <= ongoingPeriodEnd;
  const isLastOngoingDay = ongoingPeriodEnd !== null && tomorrow === ongoingPeriodEnd;

  // Is tomorrow a predicted future period?
  const predictedUpcoming = prediction.upcoming.find(
    (u) => tomorrow >= u.periodStart && tomorrow <= u.periodEnd,
  );
  const isLastPredictedDay = predictedUpcoming != null && tomorrow === predictedUpcoming.periodEnd;

  const isPeriod = ongoingPeriodTomorrow || predictedUpcoming != null;
  const isPeriodEnding = isPeriod && (isLastOngoingDay || isLastPredictedDay);

  const isOvulation =
    fertility && prediction.upcoming.some((u) => u.ovulationDay === tomorrow);
  const isFertile =
    fertility &&
    !isOvulation &&
    prediction.upcoming.some(
      (u) => tomorrow >= u.fertileWindow.start && tomorrow <= u.fertileWindow.end,
    );

  const next = prediction.upcoming[0];
  const tomorrowPhase = computePhase(isPeriod, tomorrowCycleDay, next, tomorrow, fertility);

  // Historical flow and mood for tomorrow's cycle day across past cycles
  const { expectedFlow, expectedMood } = useMemo(() => {
    const flowValues: number[] = [];
    const moodCounts: Record<number, number> = {};
    recentLogs.forEach((log) => {
      for (let i = cycles.length - 1; i >= 0; i--) {
        if (log.day >= cycles[i]!.startDay) {
          if (log.day - cycles[i]!.startDay + 1 === tomorrowCycleDay) {
            if (log.flow != null) flowValues.push(log.flow);
            if (log.mood != null) moodCounts[log.mood] = (moodCounts[log.mood] ?? 0) + 1;
          }
          break;
        }
      }
    });
    const flow =
      flowValues.length > 0 && isPeriod
        ? Math.round(flowValues.reduce((a, b) => a + b, 0) / flowValues.length)
        : null;
    const moodEntries = Object.entries(moodCounts);
    const mood =
      moodEntries.length > 0
        ? Number(moodEntries.sort((a, b) => b[1] - a[1])[0]![0])
        : null;
    return { expectedFlow: flow, expectedMood: mood };
  }, [isPeriod, recentLogs, cycles, tomorrowCycleDay]);

  const phaseSymptoms = useMemo(() => {
    if (!tomorrowPhase) return [];
    const counts: Record<string, number> = {};
    recentLogs.forEach((log) => {
      if (phaseForLog(log.day, cycles, avgLen, avgPeriodLen) === tomorrowPhase.label) {
        log.symptoms.forEach((s) => { counts[s] = (counts[s] ?? 0) + 1; });
      }
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([s]) => s.charAt(0).toUpperCase() + s.slice(1));
  }, [recentLogs, cycles, tomorrowPhase, avgLen, avgPeriodLen]);

  let statusIcon: keyof typeof Ionicons.glyphMap = 'ellipse-outline';
  let statusColor: string = colors.textMuted;
  let statusText = `Day ${tomorrowCycleDay} of your cycle`;

  if (isPeriod) {
    statusIcon = isPeriodEnding ? 'checkmark-circle-outline' : 'ellipse';
    statusColor = colors.period;
    if (isPeriodEnding) {
      statusText = 'Period likely ending';
    } else {
      statusText = ongoingPeriodTomorrow ? 'Period continues' : 'Period expected';
    }
  } else if (isOvulation) {
    statusIcon = 'leaf-outline';
    statusColor = colors.ovulation;
    statusText = 'Estimated ovulation';
  } else if (isFertile) {
    statusIcon = 'star-outline';
    statusColor = colors.fertile;
    statusText = 'In your fertile window';
  }

  return (
    <View
      style={{
        borderRadius: 20,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 16,
        gap: 10,
        ...CARD_SHADOW,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Txt variant="label">Tomorrow</Txt>
        <Txt variant="faint">
          {formatDay(tomorrow, { weekday: 'short', month: 'short', day: 'numeric' })}
        </Txt>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Ionicons name={statusIcon} size={14} color={statusColor} />
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: statusColor }}>
          {statusText}
        </Text>
      </View>

      {/* Expected flow - only shown during period days */}
      {isPeriod && expectedFlow != null && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ flexDirection: 'row', gap: 3 }}>
            {[1, 2, 3, 4].map((level) => (
              <Ionicons
                key={level}
                name="water"
                size={15}
                color={level <= expectedFlow ? colors.period : colors.period + '28'}
              />
            ))}
          </View>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.textMuted }}>
            {FLOW_LABELS[expectedFlow]} expected
          </Text>
        </View>
      )}

      {/* Expected mood */}
      {expectedMood != null && MOOD_META[expectedMood] != null && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <MaterialCommunityIcons
            name={MOOD_META[expectedMood]!.icon}
            size={18}
            color={MOOD_META[expectedMood]!.color}
          />
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.textMuted }}>
            Usually feeling {MOOD_LABEL[expectedMood]} on days like this
          </Text>
        </View>
      )}

      {phaseSymptoms.length > 0 && (
        <View style={{ gap: 6 }}>
          <Text
            style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: colors.textFaint, letterSpacing: 0.4 }}
          >
            Often logged on days like this
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
            {phaseSymptoms.map((s) => (
              <View
                key={s}
                style={{
                  borderRadius: 99,
                  backgroundColor: colors.surfaceMuted,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                }}
              >
                <Text
                  style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.textMuted }}
                >
                  {s}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

function TryingCard({
  next,
  today,
  cycleProgressDay,
  totalCycle,
  cycleDay,
  onStart,
}: {
  next: CyclePrediction;
  today: EpochDay;
  cycleProgressDay: number;
  totalCycle: number;
  cycleDay: number;
  onStart: () => void;
}) {
  const inWindow = today >= next.fertileWindow.start && today <= next.fertileWindow.end;
  const isOvulationDay = today === next.ovulationDay;
  const afterOvulation = today > next.ovulationDay;

  let label: string;
  let accentColor: string;
  let bigNumber: number;
  let sublabel: string;
  let detail: string;
  let detail2: string | null = null;

  if (isOvulationDay) {
    label = 'Ovulation day';
    accentColor = colors.ovulation;
    bigNumber = 0;
    sublabel = 'Your estimated peak fertility';
    detail = `Fertile window: ${formatRange(next.fertileWindow.start, next.fertileWindow.end)}`;
  } else if (inWindow) {
    const daysToOv = next.ovulationDay - today;
    label = 'In your fertile window';
    accentColor = colors.fertile;
    bigNumber = daysToOv;
    sublabel = `day${daysToOv === 1 ? '' : 's'} until ovulation`;
    detail = `Ovulation: ${formatDay(next.ovulationDay)}`;
  } else if (!afterOvulation) {
    const daysToWindow = next.fertileWindow.start - today;
    label = 'Fertile window';
    accentColor = colors.fertile;
    bigNumber = daysToWindow;
    sublabel = `day${daysToWindow === 1 ? '' : 's'} away`;
    detail = formatRange(next.fertileWindow.start, next.fertileWindow.end);
    detail2 = `Ovulation: ${formatDay(next.ovulationDay)}`;
  } else {
    // Luteal phase - show period countdown so they know the next cycle is coming
    const daysToP = next.periodStart - today;
    label = 'Next fertile window';
    accentColor = colors.primarySoft;
    bigNumber = daysToP;
    sublabel = `day${daysToP === 1 ? '' : 's'} until next period`;
    detail = `New cycle starts ${formatDay(next.periodStart)}`;
  }

  return (
    <View style={{ flexDirection: 'row', gap: 16, alignItems: 'flex-start' }}>
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 12, color: accentColor, letterSpacing: 0.5, textTransform: 'uppercase' }}>
          {label}
        </Text>
        <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 64, color: accentColor, lineHeight: 68 }}>
          {Math.max(0, bigNumber)}
        </Text>
        <Txt variant="muted">{sublabel}</Txt>
        <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 18, color: colors.text, marginTop: 4 }}>
          {detail}
        </Text>
        {detail2 && <Txt variant="faint">{detail2}</Txt>}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
          <Txt variant="faint" className="flex-1">
            {cycleDay > 0 ? `Day ${cycleProgressDay} of ${totalCycle}` : ' '}
          </Txt>
          <PillButton label="Start period" icon="add" onPress={onStart} />
        </View>
      </View>
      <CycleRing day={cycleProgressDay} total={totalCycle} size={84} color={accentColor} />
    </View>
  );
}

function CycleChartCard({ cycles }: { cycles: Cycle[] }) {
  const { width } = useWindowDimensions();

  const lengths: number[] = [];
  for (let i = 1; i < cycles.length; i++) {
    lengths.push(cycles[i].startDay - cycles[i - 1].startDay);
  }
  const recent = lengths.slice(-12);
  if (recent.length < 2) return null;

  const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const THRESHOLD = 0.15;
  const minLen = Math.max(14, Math.min(...recent) - 2);
  const maxLen = Math.min(60, Math.max(...recent) + 2);
  const range = Math.max(1, maxLen - minLen);

  const cardPad = 20;
  const screenPad = 32;
  const availW = width - screenPad - cardPad * 2;
  const chartH = 72;
  const gap = 4;
  const barW = (availW - gap * (recent.length - 1)) / recent.length;

  const barH = (len: number) =>
    Math.max(4, ((len - minLen) / range) * (chartH - 12) + 4);
  const avgBarH = barH(avg);
  const avgY = chartH - avgBarH;

  const hasIrregular = recent.some((l) => Math.abs(l - avg) / avg > THRESHOLD);

  return (
    <View
      style={{
        borderRadius: 20,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: cardPad,
        gap: 10,
        ...CARD_SHADOW,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Txt variant="label">Cycle lengths</Txt>
        <Txt variant="faint">avg {Math.round(avg)} days</Txt>
      </View>
      <Svg width={availW} height={chartH}>
        <Line
          x1={0}
          y1={avgY}
          x2={availW}
          y2={avgY}
          stroke="rgba(110,168,254,0.35)"
          strokeWidth={1}
          strokeDasharray="4 4"
        />
        {recent.map((len, i) => {
          const irregular = Math.abs(len - avg) / avg > THRESHOLD;
          const bH = barH(len);
          const x = i * (barW + gap);
          const y = chartH - bH;
          return (
            <Rect
              key={i}
              x={x}
              y={y}
              width={barW}
              height={bH}
              rx={3}
              fill={irregular ? colors.danger : colors.primary}
              opacity={0.85}
            />
          );
        })}
      </Svg>
      {hasIrregular && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View
            style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger }}
          />
          <Txt variant="faint">outside usual range (±15%)</Txt>
        </View>
      )}
    </View>
  );
}

function InsightCard({
  cycles,
  prediction,
  settings,
  today,
}: {
  cycles: Cycle[];
  prediction: Prediction;
  settings: Settings;
  today: EpochDay;
}) {
  const insight = computeInsight(cycles, prediction, settings, today);
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        borderRadius: 16,
        backgroundColor: 'rgba(110,168,254,0.06)',
        borderWidth: 1,
        borderColor: 'rgba(110,168,254,0.15)',
        paddingHorizontal: 14,
        paddingVertical: 10,
      }}
    >
      <View style={{ paddingTop: 2 }}>
        <Ionicons name="moon-outline" size={14} color={colors.primarySoft} />
      </View>
      <Txt variant="faint" className="flex-1">
        {insight}
      </Txt>
    </View>
  );
}

function computeInsight(
  cycles: Cycle[],
  prediction: Prediction,
  _settings: Settings,
  today: EpochDay,
): string {
  if (cycles.length === 0) return 'Log your first period to begin tracking.';
  if (prediction.usingDefaults) return 'Confidence increases as you log more cycles.';

  const next = prediction.upcoming[0];
  if (next) {
    const toPeriod = next.periodStart - today;
    if (toPeriod >= 0 && toPeriod <= 2) return 'Your period is expected very soon.';
    if (prediction.fertilityApplicable) {
      if (today >= next.fertileWindow.start && today <= next.fertileWindow.end) {
        return "You're in your estimated fertile window.";
      }
      const toFertile = next.fertileWindow.start - today;
      if (toFertile > 0 && toFertile <= 5) {
        return `Your fertile window begins in ${toFertile} day${toFertile === 1 ? '' : 's'}.`;
      }
    }
  }

  // Irregular cycle alert - check last completed cycle
  if (cycles.length >= 3 && !prediction.usingDefaults) {
    const lastLen = cycles[cycles.length - 1].startDay - cycles[cycles.length - 2].startDay;
    const avg = prediction.averageCycleLength;
    if (lastLen > avg * 1.15 || lastLen < avg * 0.85) {
      return `Your last cycle was ${lastLen} days - outside your usual ${Math.round(avg)}-day average.`;
    }
  }

  if (prediction.cyclesAnalyzed < 3) {
    return 'Logging a few more cycles will improve your predictions.';
  }
  return `Your ${Math.round(prediction.averageCycleLength)}-day cycle is well established.`;
}

const LOG_SPRING = { damping: 18, stiffness: 380, mass: 0.45 } as const;

function LogTodayButton({ onPress }: { onPress: () => void }) {
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={[anim, { borderRadius: 20 }]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.96, LOG_SPRING);
        }}
        onPressOut={() => {
          scale.value = withSpring(1, LOG_SPRING);
        }}
        accessibilityRole="button"
        accessibilityLabel="Log symptoms for today"
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          paddingVertical: 18,
          paddingHorizontal: 24,
          borderRadius: 20,
          backgroundColor: colors.primary,
          shadowColor: colors.primary,
          shadowOpacity: 0.45,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 6 },
          elevation: 8,
        }}
      >
        <Ionicons name="pencil-outline" size={20} color={colors.ink} />
        <Txt className="text-ink text-base font-semibold">Log symptoms for today</Txt>
      </Pressable>
    </Animated.View>
  );
}
