import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Flow, Mood } from '@locklune/core';
import { t } from '../i18n';

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

/** i18n key for each mood level's short label (translate with `t()` at render). */
export const MOOD_LABEL_KEY: Record<number, string> = {
  [Mood.Awful]: 'data.mood.awful',
  [Mood.Low]: 'data.mood.low',
  [Mood.Okay]: 'data.mood.okay',
  [Mood.Good]: 'data.mood.good',
  [Mood.Great]: 'data.mood.great',
};

/** Ordered mood options for the mood picker. */
export const MOOD_OPTIONS: { icon: MoodIcon; value: Mood }[] = [
  { icon: MOOD_META[Mood.Awful]!.icon, value: Mood.Awful },
  { icon: MOOD_META[Mood.Low]!.icon, value: Mood.Low },
  { icon: MOOD_META[Mood.Okay]!.icon, value: Mood.Okay },
  { icon: MOOD_META[Mood.Good]!.icon, value: Mood.Good },
  { icon: MOOD_META[Mood.Great]!.icon, value: Mood.Great },
];

/** i18n key for each flow level's descriptive ("… flow") label. */
export const FLOW_LABEL_KEY: Record<number, string> = {
  [Flow.Spotting]: 'data.flow.spottingLong',
  [Flow.Light]: 'data.flow.lightLong',
  [Flow.Medium]: 'data.flow.mediumLong',
  [Flow.Heavy]: 'data.flow.heavyLong',
};

/** Ordered flow options for the flow picker (short label key + drop count). */
export const FLOW_OPTIONS: { labelKey: string; value: Flow; drops: number }[] = [
  { labelKey: 'data.flow.spotting', value: Flow.Spotting, drops: 1 },
  { labelKey: 'data.flow.light', value: Flow.Light, drops: 2 },
  { labelKey: 'data.flow.medium', value: Flow.Medium, drops: 3 },
  { labelKey: 'data.flow.heavy', value: Flow.Heavy, drops: 4 },
];

/**
 * Built-in symptom groups shown in the log screen's symptom picker. `items` are
 * canonical (English) ids stored verbatim in the DB; `nameKey` is an i18n key.
 */
export const SYMPTOM_CATEGORIES: { nameKey: string; icon: IonIcon; items: string[] }[] = [
  {
    nameKey: 'data.symptomCategory.common',
    icon: 'star-outline',
    items: ['cramps', 'headache', 'fatigue', 'bloating', 'nausea'],
  },
  {
    nameKey: 'data.symptomCategory.pain',
    icon: 'bandage-outline',
    items: ['back pain', 'tender breasts', 'hot flashes', 'dizziness', 'swelling'],
  },
  {
    nameKey: 'data.symptomCategory.sleep',
    icon: 'moon-outline',
    items: ['insomnia', 'night sweats', 'low energy'],
  },
  {
    nameKey: 'data.symptomCategory.mind',
    icon: 'bulb-outline',
    items: ['mood swings', 'anxiety', 'irritability', 'brain fog'],
  },
  {
    nameKey: 'data.symptomCategory.gut',
    icon: 'nutrition-outline',
    items: [
      'heartburn',
      'constipation',
      'diarrhea',
      'nausea',
      'bloating',
      'increased appetite',
      'no appetite',
    ],
  },
  {
    nameKey: 'data.symptomCategory.skin',
    icon: 'sparkles-outline',
    items: ['acne', 'spotting', 'discharge', 'skin changes', 'hair changes'],
  },
];

const BUILTIN_SYMPTOM_IDS = new Set(SYMPTOM_CATEGORIES.flatMap((category) => category.items));

/**
 * Display label for a stored symptom id. Built-in ids are translated; custom
 * user symptoms (no catalogue entry) fall back to a capitalised form of the id.
 */
export function symptomLabel(id: string): string {
  if (BUILTIN_SYMPTOM_IDS.has(id)) return t(`data.symptom.${id}`);
  return id.charAt(0).toUpperCase() + id.slice(1);
}
