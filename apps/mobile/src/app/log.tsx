import { Ionicons } from '@expo/vector-icons';
import {
  CYCLE_MODE,
  cycleForDay,
  Flow,
  Mood,
  pregnancyProgress,
  todayEpochDay,
  type EpochDay,
} from '@locklune/core';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  LayoutAnimation,
  Platform,
  Pressable,
  Text,
  TextInput,
  UIManager,
  View,
} from 'react-native';
import { FlowPicker } from '../components/FlowPicker';
import { Switch } from '../components/gs/switch';
import { Textarea, TextareaInput } from '../components/gs/textarea';
import { MoodButton } from '../components/MoodButton';
import { SymptomPicker } from '../components/SymptomPicker';
import { Button } from '../components/ui/Button';
import { Screen } from '../components/ui/Screen';
import { Txt } from '../components/ui/Text';
import { formatDay } from '../lib/format';
import * as haptics from '../lib/haptics';
import { MOOD_OPTIONS } from '../lib/logging';
import { useDataStore } from '../stores/dataStore';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

type OrigLog = {
  flow: Flow | null;
  mood: Mood | null;
  syms: string[];
  note: string;
  ov: boolean;
  temp: string;
};

export default function LogModal() {
  const router = useRouter();
  const params = useLocalSearchParams<{ day?: string }>();
  const today = todayEpochDay();
  const day: EpochDay = params.day ? Number(params.day) : today;

  const getDayLog = useDataStore((store) => store.getDayLog);
  const logDay = useDataStore((store) => store.logDay);
  const cycles = useDataStore((store) => store.cycles);
  const startPeriod = useDataStore((store) => store.startPeriod);
  const endCycle = useDataStore((store) => store.endCycle);
  const deleteCycle = useDataStore((store) => store.deleteCycle);
  const settings = useDataStore((store) => store.settings);

  const pregnant = settings.cycleMode === CYCLE_MODE.Pregnant;
  const fertilityTracking =
    settings.cycleMode !== CYCLE_MODE.Pregnant && settings.cycleMode !== CYCLE_MODE.PeriodOnly;
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

  const toggleSymptom = (symptom: string) =>
    setSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((existing) => existing !== symptom) : [...prev, symptom],
    );

  const handleMoodSelect = (selectedMood: Mood) => {
    setMood((prev) => (prev === selectedMood ? null : selectedMood));
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
  const cycle = status.cycle;
  const isOngoing = cycle != null && cycle.endDay === null;
  const isEndDay = cycle != null && cycle.endDay === day;
  const canSetEnd =
    cycle != null &&
    day >= cycle.startDay &&
    day !== cycle.endDay &&
    (cycle.endDay === null || day <= cycle.endDay);

  const markStart = async () => {
    if (await startPeriod(day)) haptics.success();
  };

  const setEnd = async () => {
    if (cycle && (await endCycle(cycle.id, day))) haptics.success();
  };

  const clearEnd = async () => {
    if (cycle && (await endCycle(cycle.id, null))) haptics.success();
  };

  const removeStart = () => {
    if (!cycle) return;
    haptics.warn();
    Alert.alert(
      'Remove period start?',
      'This deletes this period and all logs (symptoms, flow, notes) for those days.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => void (async () => (await deleteCycle(cycle.id)) && haptics.success())(),
        },
      ],
    );
  };

  const save = async () => {
    const parsedTemp = temp.trim() ? parseFloat(temp.trim()) : null;
    const temperature = parsedTemp !== null && isFinite(parsedTemp) ? parsedTemp : null;
    if (
      await logDay({ day, flow, mood, symptoms, note: note.trim() || null, ovulation, temperature })
    ) {
      haptics.success();
      setOrigLog({
        flow,
        mood,
        syms: symptoms,
        note: note.trim(),
        ov: ovulation,
        temp: temp.trim(),
      });
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
            <Text style={{ fontFamily: fonts.display, fontSize: 32, color: colors.moon }}>
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
          <Text style={{ fontFamily: fonts.displaySemibold, fontSize: 22, color: colors.text }}>
            {day === today
              ? 'How are you feeling today?'
              : `How did you feel on ${formatDay(day, { weekday: 'long', month: 'long', day: 'numeric' })}?`}
          </Text>
        )}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {MOOD_OPTIONS.map((option) => (
            <MoodButton
              key={option.value}
              option={option}
              selected={mood === option.value}
              expanded={expanded}
              onPress={() => handleMoodSelect(option.value)}
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
                    {!status.isStart && cycle && (
                      <Txt variant="faint">Started {formatDay(cycle.startDay)}</Txt>
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
                        title="Remove start"
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
              <FlowPicker
                value={flow}
                onChange={(selectedFlow) =>
                  setFlow((prev) => (prev === selectedFlow ? null : selectedFlow))
                }
              />
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
                    fontFamily: fonts.regular,
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
