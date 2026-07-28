import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { cycleForDay, Flow, Mood, pregnancyProgress, todayEpochDay, type EpochDay } from '@locklune/core';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  UIManager,
  View,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Switch } from '../components/gs/switch';
import { Textarea, TextareaInput } from '../components/gs/textarea';
import { Button } from '../components/ui/Button';
import { Screen } from '../components/ui/Screen';
import { Txt } from '../components/ui/Text';
import { formatDay } from '../lib/format';
import * as haptics from '../lib/haptics';
import { useDataStore } from '../stores/dataStore';
import { colors } from '../theme/colors';

const MOOD_OPTIONS: { icon: keyof typeof MaterialCommunityIcons.glyphMap; value: Mood }[] = [
  { icon: 'emoticon-cry-outline', value: Mood.Awful },
  { icon: 'emoticon-sad-outline', value: Mood.Low },
  { icon: 'emoticon-neutral-outline', value: Mood.Okay },
  { icon: 'emoticon-happy-outline', value: Mood.Good },
  { icon: 'emoticon-excited-outline', value: Mood.Great },
];

const MOOD_COLOR_MAP: Record<number, string> = {
  1: '#94A3B8',
  2: '#7DD3FC',
  3: '#86EFAC',
  4: '#FDE68A',
  5: '#FCA5A5',
};

const FLOW_OPTIONS: { label: string; value: Flow; drops: number }[] = [
  { label: 'Spotting', value: Flow.Spotting, drops: 1 },
  { label: 'Light', value: Flow.Light, drops: 2 },
  { label: 'Medium', value: Flow.Medium, drops: 3 },
  { label: 'Heavy', value: Flow.Heavy, drops: 4 },
];

const SYMPTOM_CATEGORIES: { name: string; icon: keyof typeof Ionicons.glyphMap; items: string[] }[] = [
  { name: 'Common',  icon: 'star-outline',        items: ['cramps', 'headache', 'fatigue', 'bloating', 'nausea'] },
  { name: 'Pain',     icon: 'bandage-outline',      items: ['back pain', 'tender breasts', 'hot flashes', 'dizziness', 'swelling'] },
  { name: 'Sleep',    icon: 'moon-outline',         items: ['insomnia', 'night sweats', 'low energy'] },
  { name: 'Mind',     icon: 'bulb-outline',         items: ['mood swings', 'anxiety', 'irritability', 'brain fog'] },
  { name: 'Gut',      icon: 'nutrition-outline',    items: ['heartburn', 'constipation', 'diarrhea', 'nausea', 'bloating'] },
  { name: 'Skin',     icon: 'sparkles-outline',     items: ['acne', 'spotting', 'discharge', 'skin changes', 'hair changes'] },
];

type OrigLog = { flow: Flow | null; mood: Mood | null; syms: string[]; note: string; ov: boolean; temp: string };

export default function LogModal() {
  const router = useRouter();
  const params = useLocalSearchParams<{ day?: string }>();
  const today = todayEpochDay();
  const day: EpochDay = params.day ? Number(params.day) : today;

  const getDayLog = useDataStore((s) => s.getDayLog);
  const logDay = useDataStore((s) => s.logDay);
  const cycles = useDataStore((s) => s.cycles);
  const startPeriod = useDataStore((s) => s.startPeriod);
  const endCycle = useDataStore((s) => s.endCycle);
  const deleteCycle = useDataStore((s) => s.deleteCycle);
  const settings = useDataStore((s) => s.settings);

  const pregnant = settings.cycleMode === 'pregnant';
  const fertilityTracking = settings.cycleMode !== 'pregnant' && settings.cycleMode !== 'period_only';
  const preg =
    pregnant && settings.pregnancyDueDay != null
      ? pregnancyProgress(settings.pregnancyDueDay, day)
      : null;

  const lastCycle = cycles[cycles.length - 1];
  const cycleDay = lastCycle && day >= lastCycle.startDay ? day - lastCycle.startDay + 1 : 0;

  const [flow, setFlow] = useState<Flow | null>(null);
  const [mood, setMood] = useState<Mood | null>(null);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [ovulation, setOvulation] = useState(false);
  const [temp, setTemp] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [origLog, setOrigLog] = useState<OrigLog | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental?.(true);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    void getDayLog(day).then((log) => {
      if (!alive) return;
      if (log) {
        setFlow(log.flow);
        setMood(log.mood);
        setSymptoms(log.symptoms);
        setNote(log.note ?? '');
        setOvulation(log.ovulation);
        const tempStr = log.temperature != null ? String(log.temperature) : '';
        setTemp(tempStr);
        setOrigLog({
          flow: log.flow,
          mood: log.mood,
          syms: log.symptoms,
          note: log.note ?? '',
          ov: log.ovulation,
          temp: tempStr,
        });
        const hasData =
          log.flow != null ||
          log.mood != null ||
          log.symptoms.length > 0 ||
          (log.note ?? '') !== '' ||
          log.ovulation;
        if (hasData) setExpanded(true);
      } else {
        setOrigLog({ flow: null, mood: null, syms: [], note: '', ov: false, temp: '' });
      }
      setLoaded(true);
    });
    return () => {
      alive = false;
    };
  }, [day, getDayLog]);

  const isDirty = useMemo(() => {
    if (!loaded) return false;
    const base = origLog ?? { flow: null, mood: null, syms: [], note: '', ov: false, temp: '' };
    return (
      flow !== base.flow ||
      mood !== base.mood ||
      note.trim() !== base.note ||
      ovulation !== base.ov ||
      temp.trim() !== base.temp ||
      [...symptoms].sort().join('|') !== [...base.syms].sort().join('|')
    );
  }, [loaded, origLog, flow, mood, note, ovulation, symptoms, temp]);

  const toggleSymptom = (s: string) =>
    setSymptoms((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const handleMoodSelect = (m: Mood) => {
    setMood((prev) => (prev === m ? null : m));
    if (!expanded) {
      LayoutAnimation.configureNext({
        duration: 380,
        create: { type: 'easeInEaseOut', property: 'opacity' },
        update: { type: 'spring', springDamping: 0.8 },
      });
      setExpanded(true);
    }
  };

  // Where this day sits relative to recorded cycles, so we can offer the right action.
  const status = cycleForDay(cycles, day, today);
  const c = status.cycle;
  const isOngoing = c != null && c.endDay === null;
  const isEndDay = c != null && c.endDay === day;
  const canSetEnd =
    c != null && day >= c.startDay && day !== c.endDay && (c.endDay === null || day <= c.endDay);

  const markStart = async () => {
    if (await startPeriod(day)) haptics.success();
  };

  const setEnd = async () => {
    if (c && (await endCycle(c.id, day))) haptics.success();
  };

  const clearEnd = async () => {
    if (c && (await endCycle(c.id, null))) haptics.success();
  };

  const removeStart = () => {
    if (!c) return;
    haptics.warn();
    Alert.alert(
      'Remove period start?',
      'This deletes this period and all logs (symptoms, flow, notes) for those days.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => void (async () => (await deleteCycle(c.id)) && haptics.success())(),
        },
      ],
    );
  };

  const save = async () => {
    const parsedTemp = temp.trim() ? parseFloat(temp.trim()) : null;
    const temperature = parsedTemp !== null && isFinite(parsedTemp) ? parsedTemp : null;
    if (await logDay({ day, flow, mood, symptoms, note: note.trim() || null, ovulation, temperature })) {
      haptics.success();
      setOrigLog({ flow, mood, syms: symptoms, note: note.trim(), ov: ovulation, temp: temp.trim() });
      setJustSaved(true);
      setTimeout(() => router.back(), 700);
    }
  };

  const saveLabel = justSaved ? '✓ Saved' : isDirty ? 'Save changes' : 'Save';

  return (
    <Screen>
      {/* Header */}
      <View style={{ paddingTop: 8, paddingBottom: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 32, color: colors.moon }}>
              {formatDay(day, { weekday: 'long' })}
            </Text>
            <Txt variant="heading">{formatDay(day, { month: 'long', day: 'numeric' })}</Txt>
            {!pregnant && cycleDay > 0 && cycleDay <= 60 && (
              <Txt variant="faint">Day {cycleDay} of your cycle</Txt>
            )}
            {pregnant && preg && <Txt variant="faint">Week {preg.week} of pregnancy</Txt>}
          </View>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Close"
            className="h-9 w-9 items-center justify-center rounded-full bg-surfaceMuted"
          >
            <Ionicons name="close" size={20} color={colors.text} />
          </Pressable>
        </View>
      </View>

      {/* Pregnancy info */}
      {pregnant && (
        <View className="rounded-2xl border border-border bg-surface p-4 gap-2">
          {preg ? (
            <>
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
                Due {formatDay(preg.dueDay, { weekday: 'short', month: 'long', day: 'numeric' })}
              </Txt>
            </>
          ) : (
            <>
              <Txt variant="label" className="text-primary-soft">
                Pregnancy
              </Txt>
              <Txt variant="muted">
                Set how many weeks along you are in Settings to track your pregnancy.
              </Txt>
            </>
          )}
        </View>
      )}

      {/* Mood */}
      <View style={{ gap: 14 }}>
        {expanded ? (
          <Txt variant="label">Mood</Txt>
        ) : (
          <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 22, color: colors.text }}>
            How are you feeling today?
          </Text>
        )}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {MOOD_OPTIONS.map((o) => (
            <MoodButton
              key={o.value}
              option={o}
              selected={mood === o.value}
              expanded={expanded}
              onPress={() => handleMoodSelect(o.value)}
            />
          ))}
        </View>
      </View>

      {/* Expanded content */}
      {expanded && (
        <>
          {!pregnant && (
            <View style={{ gap: 12 }}>
              <Txt variant="label">Period</Txt>
              {day > today ? (
                <Txt variant="faint">You can mark a period once the day has arrived.</Txt>
              ) : !status.isBleedDay ? (
                <Button
                  title="Mark period started this day"
                  variant="secondary"
                  onPress={() => void markStart()}
                />
              ) : (
                <View className="gap-2">
                  <View className="rounded-2xl border border-period/40 bg-surface p-3">
                    <Txt variant="body">
                      {status.isStart ? 'Period started this day' : 'Period day'}
                    </Txt>
                    {!status.isStart && c && (
                      <Txt variant="faint">Started {formatDay(c.startDay)}</Txt>
                    )}
                    {isEndDay && <Txt variant="faint">Marked as the last day</Txt>}
                    {isOngoing && !status.isStart && <Txt variant="faint">Period ongoing</Txt>}
                  </View>
                  <View className="flex-row gap-2">
                    {canSetEnd && (
                      <Button
                        title="Mark as last day"
                        variant="ghost"
                        onPress={() => void setEnd()}
                        containerStyle={{ flex: 1 }}
                      />
                    )}
                    {isEndDay && (
                      <Button
                        title="Clear end date"
                        variant="ghost"
                        onPress={() => void clearEnd()}
                        containerStyle={{ flex: 1 }}
                      />
                    )}
                    {status.isStart && (
                      <Button
                        title="Remove period start"
                        variant="danger"
                        onPress={removeStart}
                        containerStyle={{ flex: 1 }}
                      />
                    )}
                  </View>
                </View>
              )}
            </View>
          )}

          {!pregnant && (
            <View style={{ gap: 12 }}>
              <Txt variant="label">Flow</Txt>
              <FlowPicker value={flow} onChange={(f) => setFlow((prev) => (prev === f ? null : f))} />
            </View>
          )}

          <View style={{ gap: 12 }}>
            <Txt variant="label">Symptoms</Txt>
            <SymptomPicker
              symptoms={symptoms}
              onToggle={toggleSymptom}
              customSymptoms={settings.customSymptoms}
            />
          </View>

          <View style={{ gap: 12 }}>
            <Txt variant="label">Notes</Txt>
            <Textarea className="rounded-2xl border-border bg-surface" style={{ minHeight: 100 }}>
              <TextareaInput
                value={note}
                onChangeText={setNote}
                placeholder="Anything you'd like to remember about today?"
                placeholderTextColor={colors.textFaint}
                multiline
                textAlignVertical="top"
                className="text-text"
                style={{ paddingHorizontal: 14, paddingVertical: 12, minHeight: 100 }}
              />
            </Textarea>
          </View>

          {fertilityTracking && (
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-4">
                <Txt variant="label">Ovulation</Txt>
                <Txt variant="faint" className="mt-1">
                  Confirmed today, e.g. a positive test. Improves your predictions.
                </Txt>
              </View>
              <Switch
                value={ovulation}
                onValueChange={setOvulation}
                trackColor={{ false: colors.surfaceMuted, true: colors.primary }}
                thumbColor={colors.moon}
              />
            </View>
          )}

          {fertilityTracking && (
            <View style={{ gap: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                <Txt variant="label">Temperature</Txt>
                <Txt variant="faint">BBT · °C</Txt>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <TextInput
                  value={temp}
                  onChangeText={setTemp}
                  keyboardType="decimal-pad"
                  placeholder="36.70"
                  placeholderTextColor={colors.textFaint}
                  style={{
                    flex: 1,
                    backgroundColor: colors.surfaceMuted,
                    borderRadius: 14,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    color: colors.text,
                    fontFamily: 'Inter_400Regular',
                    fontSize: 15,
                  }}
                />
                {temp.trim() !== '' && (
                  <Pressable onPress={() => setTemp('')} accessibilityLabel="Clear temperature">
                    <Ionicons name="close-circle" size={20} color={colors.textFaint} />
                  </Pressable>
                )}
              </View>
            </View>
          )}
        </>
      )}

      <Button title={saveLabel} loading={!loaded} onPress={() => void save()} />
    </Screen>
  );
}

/* ------------------------------------------------------------------ */

const MOOD_SPRING = { damping: 15, stiffness: 320, mass: 0.5 } as const;

function MoodButton({
  option,
  selected,
  onPress,
  expanded,
}: {
  option: { icon: keyof typeof MaterialCommunityIcons.glyphMap; value: Mood };
  selected: boolean;
  onPress: () => void;
  expanded: boolean;
}) {
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const size = expanded ? 52 : 60;
  const color = MOOD_COLOR_MAP[option.value];

  return (
    <Animated.View style={anim}>
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.9, MOOD_SPRING);
        }}
        onPressOut={() => {
          scale.value = withSpring(1, MOOD_SPRING);
        }}
        accessibilityRole="button"
        style={{
          width: size,
          height: size,
          borderRadius: 999,
          alignItems: 'center',
          justifyContent: 'center',
          ...(selected
            ? {
                backgroundColor: 'rgba(110,168,254,0.12)',
                borderWidth: 1.5,
                borderColor: colors.primary,
                // elevation on circular Android views creates a hexagonal shadow
                ...(Platform.OS !== 'android' && {
                  shadowColor: color,
                  shadowOpacity: 0.4,
                  shadowRadius: 10,
                  shadowOffset: { width: 0, height: 0 },
                }),
              }
            : { backgroundColor: colors.surfaceMuted }),
        }}
      >
        <MaterialCommunityIcons
          name={option.icon}
          size={expanded ? 26 : 32}
          color={selected ? color : colors.textMuted}
        />
      </Pressable>
    </Animated.View>
  );
}

function FlowPicker({ value, onChange }: { value: Flow | null; onChange: (f: Flow) => void }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {FLOW_OPTIONS.map((o) => {
        const selected = value === o.value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="button"
            accessibilityLabel={o.label}
            style={{
              flex: 1,
              borderRadius: 16,
              paddingVertical: 12,
              gap: 8,
              alignItems: 'center',
              ...(selected
                ? {
                    borderWidth: 1,
                    borderColor: colors.primary,
                    backgroundColor: 'rgba(110,168,254,0.12)',
                  }
                : { backgroundColor: colors.surfaceMuted }),
            }}
          >
            <View style={{ flexDirection: 'row', gap: 1 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Ionicons
                  key={i}
                  name={i < o.drops ? 'water' : 'water-outline'}
                  size={13}
                  color={
                    i < o.drops
                      ? selected
                        ? colors.primary
                        : colors.textMuted
                      : 'rgba(255,255,255,0.12)'
                  }
                />
              ))}
            </View>
            <Txt
              className={selected ? 'text-primary-soft' : 'text-text-muted'}
              variant="faint"
            >
              {o.label}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

function SymptomPicker({
  symptoms,
  onToggle,
  customSymptoms = [],
}: {
  symptoms: string[];
  onToggle: (s: string) => void;
  customSymptoms?: string[];
}) {
  const allCategories = useMemo(() => {
    if (customSymptoms.length === 0) return SYMPTOM_CATEGORIES;
    return [
      ...SYMPTOM_CATEGORIES,
      { name: 'Custom', icon: 'pricetag-outline' as keyof typeof Ionicons.glyphMap, items: customSymptoms },
    ];
  }, [customSymptoms]);

  const [cat, setCat] = useState(0);
  const safecat = cat < allCategories.length ? cat : 0;
  const items = allCategories[safecat]!.items;

  return (
    <View style={{ gap: 12 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {allCategories.map((category, i) => {
          const active = safecat === i;
          return (
            <Pressable
              key={category.name}
              onPress={() => setCat(i)}
              style={{
                borderRadius: 99,
                paddingHorizontal: 12,
                paddingVertical: 6,
                backgroundColor: active ? colors.primary : colors.surfaceMuted,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <Ionicons
                  name={category.icon}
                  size={12}
                  color={active ? colors.ink : colors.textMuted}
                />
                <Text
                  style={{
                    fontFamily: 'Inter_500Medium',
                    fontSize: 12,
                    color: active ? colors.ink : colors.textMuted,
                  }}
                >
                  {category.name}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {items.map((s) => {
          const active = symptoms.includes(s);
          return (
            <Pressable
              key={s}
              onPress={() => onToggle(s)}
              style={{
                borderRadius: 99,
                paddingHorizontal: 14,
                paddingVertical: 8,
                backgroundColor: active ? colors.primary : colors.surfaceMuted,
              }}
            >
              <Text
                style={{
                  fontFamily: 'Inter_500Medium',
                  fontSize: 13,
                  color: active ? colors.ink : colors.textMuted,
                }}
              >
                {s}
              </Text>
            </Pressable>
          );
        })}
        {items.length === 0 && (
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.textFaint }}>
            No custom symptoms yet. Add them in Settings.
          </Text>
        )}
      </View>

      {symptoms.length > 0 && (
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.textFaint }}>
          Selected: {symptoms.join(', ')}
        </Text>
      )}
    </View>
  );
}
