import { useEffect, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { cycleForDay, Flow, Mood, todayEpochDay, type EpochDay } from '@locklune/core';
import { Textarea, TextareaInput } from '../components/gs/textarea';
import { Button } from '../components/ui/Button';
import { Screen } from '../components/ui/Screen';
import { Txt } from '../components/ui/Text';
import { formatDay } from '../lib/format';
import * as haptics from '../lib/haptics';
import { colors } from '../theme/colors';
import { useDataStore } from '../stores/dataStore';

const FLOW_OPTIONS: { label: string; value: Flow }[] = [
  { label: 'Spotting', value: Flow.Spotting },
  { label: 'Light', value: Flow.Light },
  { label: 'Medium', value: Flow.Medium },
  { label: 'Heavy', value: Flow.Heavy },
];

const MOOD_OPTIONS: { icon: keyof typeof MaterialCommunityIcons.glyphMap; value: Mood }[] = [
  { icon: 'emoticon-cry-outline', value: Mood.Awful },
  { icon: 'emoticon-sad-outline', value: Mood.Low },
  { icon: 'emoticon-neutral-outline', value: Mood.Okay },
  { icon: 'emoticon-happy-outline', value: Mood.Good },
  { icon: 'emoticon-excited-outline', value: Mood.Great },
];

const SYMPTOMS = [
  'cramps',
  'headache',
  'bloating',
  'fatigue',
  'tender breasts',
  'acne',
  'nausea',
  'back pain',
  'cravings',
  'insomnia',
  'mood swings',
];

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

  const [flow, setFlow] = useState<Flow | null>(null);
  const [mood, setMood] = useState<Mood | null>(null);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    void getDayLog(day).then((log) => {
      if (!alive) return;
      if (log) {
        setFlow(log.flow);
        setMood(log.mood);
        setSymptoms(log.symptoms);
        setNote(log.note ?? '');
      }
      setLoaded(true);
    });
    return () => {
      alive = false;
    };
  }, [day, getDayLog]);

  const toggleSymptom = (s: string) =>
    setSymptoms((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

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
      'This deletes this period from your history. Symptom logs for these days are kept.',
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
    if (await logDay({ day, flow, mood, symptoms, note: note.trim() || null })) {
      haptics.success();
      router.back();
    }
  };

  return (
    <Screen>
      <View className="flex-row items-center justify-between pt-2">
        <Txt variant="title">
          {formatDay(day, { weekday: 'long', month: 'long', day: 'numeric' })}
        </Txt>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Close"
          className="h-9 w-9 items-center justify-center rounded-full bg-surfaceMuted"
        >
          <Ionicons name="close" size={20} color={colors.text} />
        </Pressable>
      </View>

      <View className="gap-3">
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
              <Txt variant="body">{status.isStart ? 'Period started this day' : 'Period day'}</Txt>
              {!status.isStart && c && <Txt variant="faint">Started {formatDay(c.startDay)}</Txt>}
              {isEndDay && <Txt variant="faint">Marked as the last day</Txt>}
              {isOngoing && !status.isStart && <Txt variant="faint">Period ongoing</Txt>}
            </View>
            {canSetEnd && (
              <Button title="Mark as my last day" variant="ghost" onPress={() => void setEnd()} />
            )}
            {isEndDay && (
              <Button title="Clear end date" variant="ghost" onPress={() => void clearEnd()} />
            )}
            {status.isStart && (
              <Button title="Remove period start" variant="danger" onPress={removeStart} />
            )}
          </View>
        )}
      </View>

      <View className="gap-3">
        <Txt variant="label">Flow</Txt>
        <View className="flex-row gap-2">
          {FLOW_OPTIONS.map((o) => (
            <Chip
              key={o.value}
              label={o.label}
              active={flow === o.value}
              onPress={() => setFlow((f) => (f === o.value ? null : o.value))}
              activeClass="bg-period"
            />
          ))}
        </View>
      </View>

      <View className="gap-3">
        <Txt variant="label">Mood</Txt>
        <View className="flex-row justify-between">
          {MOOD_OPTIONS.map((o) => (
            <Pressable
              key={o.value}
              onPress={() => setMood((m) => (m === o.value ? null : o.value))}
              className={`h-14 w-14 items-center justify-center rounded-full ${mood === o.value ? 'bg-primary' : 'bg-surfaceMuted'}`}
            >
              <MaterialCommunityIcons
                name={o.icon}
                size={28}
                color={mood === o.value ? colors.ink : colors.textMuted}
              />
            </Pressable>
          ))}
        </View>
      </View>

      <View className="gap-3">
        <Txt variant="label">Symptoms</Txt>
        <View className="flex-row flex-wrap gap-2">
          {SYMPTOMS.map((s) => (
            <Chip
              key={s}
              label={s}
              active={symptoms.includes(s)}
              onPress={() => toggleSymptom(s)}
            />
          ))}
        </View>
      </View>

      <View className="gap-3">
        <Txt variant="label">Note</Txt>
        <Textarea className="min-h-24 rounded-2xl border-border bg-surface">
          <TextareaInput
            value={note}
            onChangeText={setNote}
            placeholder="Anything you want to remember…"
            placeholderTextColor="#94A3B8"
            className="text-text"
          />
        </Textarea>
      </View>

      <Button title="Save" loading={!loaded} onPress={() => void save()} />
    </Screen>
  );
}

function Chip({
  label,
  active,
  onPress,
  activeClass = 'bg-primary',
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  activeClass?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-full px-4 py-2 ${active ? activeClass : 'bg-surfaceMuted'}`}
    >
      <Txt className={active ? 'text-ink' : 'text-text-muted'}>{label}</Txt>
    </Pressable>
  );
}
