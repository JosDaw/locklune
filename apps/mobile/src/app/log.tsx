import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Flow, Mood, todayEpochDay, type EpochDay } from '@locklune/core';
import { Textarea, TextareaInput } from '../components/gs/textarea';
import { Button } from '../components/ui/Button';
import { Screen } from '../components/ui/Screen';
import { Txt } from '../components/ui/Text';
import { formatDay } from '../lib/format';
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
  'cramps', 'headache', 'bloating', 'fatigue', 'tender breasts',
  'acne', 'nausea', 'back pain', 'cravings', 'insomnia', 'mood swings',
];

export default function LogModal() {
  const router = useRouter();
  const params = useLocalSearchParams<{ day?: string }>();
  const day: EpochDay = params.day ? Number(params.day) : todayEpochDay();

  const getDayLog = useDataStore((s) => s.getDayLog);
  const logDay = useDataStore((s) => s.logDay);

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

  const save = async () => {
    await logDay({ day, flow, mood, symptoms, note: note.trim() || null });
    router.back();
  };

  return (
    <Screen>
      <View className="flex-row items-center justify-between pt-2">
        <Txt variant="title">{formatDay(day, { weekday: 'long', month: 'long', day: 'numeric' })}</Txt>
        <Pressable onPress={() => router.back()} className="h-9 w-9 items-center justify-center rounded-full bg-surfaceMuted">
          <Ionicons name="close" size={20} color={colors.text} />
        </Pressable>
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
            <Chip key={s} label={s} active={symptoms.includes(s)} onPress={() => toggleSymptom(s)} />
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
            placeholderTextColor="#6F6A87"
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
