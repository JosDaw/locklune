import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Flow, Mood } from '@locklune/core';

type MoodIcon = keyof typeof MaterialCommunityIcons.glyphMap;
type IonIcon = keyof typeof Ionicons.glyphMap;

/** Icon + accent colour for each mood level, keyed by {@link Mood}. */
export const MOOD_META: Record<number, { icon: MoodIcon; color: string }> = {
  [Mood.Awful]: { icon: 'emoticon-cry-outline', color: '#94A3B8' },
  [Mood.Low]: { icon: 'emoticon-sad-outline', color: '#7DD3FC' },
  [Mood.Okay]: { icon: 'emoticon-neutral-outline', color: '#86EFAC' },
  [Mood.Good]: { icon: 'emoticon-happy-outline', color: '#FDE68A' },
  [Mood.Great]: { icon: 'emoticon-excited-outline', color: '#FCA5A5' },
};

/** Short human label for each mood level. */
export const MOOD_LABEL: Record<number, string> = {
  [Mood.Awful]: 'Awful',
  [Mood.Low]: 'Low',
  [Mood.Okay]: 'Okay',
  [Mood.Good]: 'Good',
  [Mood.Great]: 'Great',
};

/** Ordered mood options for the mood picker. */
export const MOOD_OPTIONS: { icon: MoodIcon; value: Mood }[] = [
  { icon: MOOD_META[Mood.Awful]!.icon, value: Mood.Awful },
  { icon: MOOD_META[Mood.Low]!.icon, value: Mood.Low },
  { icon: MOOD_META[Mood.Okay]!.icon, value: Mood.Okay },
  { icon: MOOD_META[Mood.Good]!.icon, value: Mood.Good },
  { icon: MOOD_META[Mood.Great]!.icon, value: Mood.Great },
];

/** Descriptive label for each flow level. */
export const FLOW_LABELS: Record<number, string> = {
  [Flow.Spotting]: 'Spotting',
  [Flow.Light]: 'Light flow',
  [Flow.Medium]: 'Medium flow',
  [Flow.Heavy]: 'Heavy flow',
};

/** Ordered flow options for the flow picker (short label + drop count). */
export const FLOW_OPTIONS: { label: string; value: Flow; drops: number }[] = [
  { label: 'Spotting', value: Flow.Spotting, drops: 1 },
  { label: 'Light', value: Flow.Light, drops: 2 },
  { label: 'Medium', value: Flow.Medium, drops: 3 },
  { label: 'Heavy', value: Flow.Heavy, drops: 4 },
];

/** Built-in symptom groups shown in the log screen's symptom picker. */
export const SYMPTOM_CATEGORIES: { name: string; icon: IonIcon; items: string[] }[] = [
  { name: 'Common', icon: 'star-outline', items: ['cramps', 'headache', 'fatigue', 'bloating', 'nausea'] },
  { name: 'Pain', icon: 'bandage-outline', items: ['back pain', 'tender breasts', 'hot flashes', 'dizziness', 'swelling'] },
  { name: 'Sleep', icon: 'moon-outline', items: ['insomnia', 'night sweats', 'low energy'] },
  { name: 'Mind', icon: 'bulb-outline', items: ['mood swings', 'anxiety', 'irritability', 'brain fog'] },
  { name: 'Gut', icon: 'nutrition-outline', items: ['heartburn', 'constipation', 'diarrhea', 'nausea', 'bloating'] },
  { name: 'Skin', icon: 'sparkles-outline', items: ['acne', 'spotting', 'discharge', 'skin changes', 'hair changes'] },
];
