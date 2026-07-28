import { Ionicons } from '@expo/vector-icons';
import {
  BRAND,
  dueDayFromWeeksAlong,
  estimateDueDay,
  isHormonalContraception,
  pregnancyProgress,
  todayEpochDay,
  type CycleMode,
} from '@locklune/core';
import Constants from 'expo-constants';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, Text as RNText, TextInput, View } from 'react-native';
import { Switch } from '../../components/gs/switch';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PressScale } from '../../components/ui/PressScale';
import { Screen } from '../../components/ui/Screen';
import { Txt } from '../../components/ui/Text';
import { formatDay } from '../../lib/format';
import * as haptics from '../../lib/haptics';
import { FEEDBACK_URL, KOFI_URL, openLink, RATE_URL, shareApp } from '../../lib/links';
import { CONTRACEPTION_METHODS, CYCLE_MODES } from '../../lib/modes';
import { requestNotificationPermission } from '../../lib/notifications';
import { clearDestructPin, hasDestructPin } from '../../lib/vault';
import { useAuthStore } from '../../stores/authStore';
import { useDataStore } from '../../stores/dataStore';
import { colors } from '../../theme/colors';

const AUTO_LOCK_OPTIONS = [
  { label: 'Instant', value: 0 },
  { label: '1 min', value: 1 },
  { label: '2 min', value: 2 },
  { label: '5 min', value: 5 },
  { label: '15 min', value: 15 },
];

export default function Settings() {
  const router = useRouter();
  const settings = useDataStore((s) => s.settings);
  const updateSettings = useDataStore((s) => s.updateSettings);
  const prediction = useDataStore((s) => s.prediction);
  const cycles = useDataStore((s) => s.cycles);

  const lock = useAuthStore((s) => s.lock);
  const wipe = useAuthStore((s) => s.wipe);

  const [hasDestruct, setHasDestruct] = useState(false);
  const [newSymptom, setNewSymptom] = useState('');
  useFocusEffect(
    useCallback(() => {
      void hasDestructPin().then(setHasDestruct);
    }, []),
  );

  const addSymptom = () => {
    const trimmed = newSymptom.trim().toLowerCase();
    if (!trimmed || settings.customSymptoms.includes(trimmed)) { setNewSymptom(''); return; }
    void updateSettings({ customSymptoms: [...settings.customSymptoms, trimmed] });
    setNewSymptom('');
  };

  const removeSymptom = (sym: string) => {
    void updateSettings({ customSymptoms: settings.customSymptoms.filter((s) => s !== sym) });
  };

  const today = todayEpochDay();
  const pregWeeks =
    settings.pregnancyDueDay != null ? pregnancyProgress(settings.pregnancyDueDay, today).week : 0;

  const selectMode = (mode: CycleMode) => {
    if (mode === 'pregnant' && settings.pregnancyDueDay == null) {
      const lastStart = cycles[cycles.length - 1]?.startDay;
      const dueDay = lastStart != null ? estimateDueDay(lastStart) : dueDayFromWeeksAlong(6, today);
      void updateSettings({ cycleMode: mode, pregnancyDueDay: dueDay });
    } else if (mode !== 'pregnant' && settings.cycleMode === 'pregnant') {
      const dueDay = settings.pregnancyDueDay;
      if (dueDay != null) {
        const gestationalAge = Math.max(0, today - (dueDay - 280));
        // Resumption estimate scales with how far along the pregnancy was:
        // early loss (<12 wk) ~4 weeks, mid-pregnancy ~5 weeks, near/full term ~8 weeks.
        const resumptionDays = gestationalAge < 84 ? 28 : gestationalAge < 196 ? 35 : 56;
        void updateSettings({ cycleMode: mode, postPregnancyAnchorDay: today + resumptionDays });
      } else {
        void updateSettings({ cycleMode: mode });
      }
    } else {
      void updateSettings({ cycleMode: mode });
    }
  };

  const toggleNotification = async (key: 'notifyPeriodTomorrow' | 'notifyPeriodToday' | 'notifyFertileTomorrow' | 'notifyFertileStart', value: boolean) => {
    if (value) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        Alert.alert('Notifications off', 'Enable notifications for Locklune in system settings.');
        return;
      }
    }
    void updateSettings({ [key]: value });
  };

  const confirmWipe = () => {
    haptics.warn();
    Alert.alert(
      'Erase everything?',
      'This permanently deletes your PIN and all cycle data on this device. It cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Erase', style: 'destructive', onPress: () => void wipe() },
      ],
    );
  };

  const luteal = settings.lutealPhaseDays;

  return (
    <Screen>
      <View className="flex-row items-center gap-2 pb-1 pt-2">
        <Ionicons name="settings" size={14} color={colors.primarySoft} />
        <Txt variant="faint">Preferences</Txt>
      </View>

      {/* Cycle mode */}
      <Card>
        <SectionLabel icon="moon-outline" label="I am currently" />
        <View>
          {CYCLE_MODES.map((m) => (
            <ModeRow
              key={m.value}
              label={m.label}
              hint={m.hint}
              active={settings.cycleMode === m.value}
              onPress={() => selectMode(m.value)}
            />
          ))}
        </View>

        {settings.cycleMode === 'contraception' && (
          <View className="mt-4 gap-3 border-t border-border pt-4">
            <Txt variant="faint">Method</Txt>
            <View className="flex-row flex-wrap gap-2">
              {CONTRACEPTION_METHODS.map((c) => (
                <Chip
                  key={c.value}
                  label={c.label}
                  active={settings.contraceptionMethod === c.value}
                  onPress={() => void updateSettings({ contraceptionMethod: c.value })}
                />
              ))}
            </View>
            {isHormonalContraception(settings.contraceptionMethod) && (
              <Txt variant="faint">
                Fertility estimates are hidden on hormonal methods, since ovulation is suppressed.
              </Txt>
            )}
          </View>
        )}

        {settings.cycleMode === 'pregnant' && (
          <View className="mt-4 gap-4 border-t border-border pt-4">
            <View className="flex-row items-center justify-between">
              <Txt variant="body">Weeks along</Txt>
              <Stepper
                value={pregWeeks}
                min={0}
                max={42}
                onChange={(w) =>
                  void updateSettings({ pregnancyDueDay: dueDayFromWeeksAlong(w, today) })
                }
              />
            </View>
            {settings.pregnancyDueDay != null && (
              <View className="flex-row items-center justify-between">
                <View>
                  <Txt variant="body">Due date</Txt>
                  <Txt variant="faint">
                    {formatDay(settings.pregnancyDueDay, {
                      weekday: 'short',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Txt>
                </View>
                <View className="flex-row gap-2">
                  <PressScale
                    onPress={() =>
                      void updateSettings({ pregnancyDueDay: settings.pregnancyDueDay! - 1 })
                    }
                    accessibilityRole="button"
                    accessibilityLabel="Move due date earlier by one day"
                    className="h-10 w-10 items-center justify-center rounded-full bg-surfaceMuted"
                  >
                    <Ionicons name="remove" size={20} color={colors.text} />
                  </PressScale>
                  <PressScale
                    onPress={() =>
                      void updateSettings({ pregnancyDueDay: settings.pregnancyDueDay! + 1 })
                    }
                    accessibilityRole="button"
                    accessibilityLabel="Move due date later by one day"
                    className="h-10 w-10 items-center justify-center rounded-full bg-surfaceMuted"
                  >
                    <Ionicons name="add" size={20} color={colors.text} />
                  </PressScale>
                </View>
              </View>
            )}
          </View>
        )}
      </Card>

      {/* Cycle — not relevant when pregnant */}
      {settings.cycleMode !== 'pregnant' && <Card>
        <SectionLabel icon="sync-outline" label="Cycle" />
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-4">
            <Txt variant="body">Luteal phase length</Txt>
            <Txt variant="faint">Used to estimate ovulation ({luteal} days)</Txt>
          </View>
          <Stepper
            value={luteal}
            min={10}
            max={16}
            onChange={(v) => void updateSettings({ lutealPhaseDays: v })}
          />
        </View>
        <Txt variant="faint" className="mt-3">
          The luteal phase is the time from ovulation to your next period - usually 12–14 days and
          fairly steady between cycles. Locklune uses it to estimate ovulation and your fertile
          window. If you confirm ovulation when logging a day, your own luteal length is learned and
          used instead.
        </Txt>
      </Card>}

      {/* Reminders */}
      <Card>
        <SectionLabel icon="notifications-outline" label="Reminders" />
        <SwitchRow
          label="Period starting tomorrow"
          hint="Morning of the day before your predicted period"
          value={settings.notifyPeriodTomorrow}
          onValueChange={(v) => void toggleNotification('notifyPeriodTomorrow', v)}
        />
        <SwitchRow
          label="Period starting today"
          hint="Morning of your predicted period start"
          value={settings.notifyPeriodToday}
          onValueChange={(v) => void toggleNotification('notifyPeriodToday', v)}
        />
        {prediction.fertilityApplicable && <>
          <SwitchRow
            label="Fertile window tomorrow"
            hint="Morning before your fertile window opens"
            value={settings.notifyFertileTomorrow}
            onValueChange={(v) => void toggleNotification('notifyFertileTomorrow', v)}
          />
          <SwitchRow
            label="Fertile window opens"
            hint="Morning your fertile window begins"
            value={settings.notifyFertileStart}
            onValueChange={(v) => void toggleNotification('notifyFertileStart', v)}
          />
        </>}
      </Card>

      {/* Custom symptoms */}
      <Card>
        <SectionLabel icon="pricetag-outline" label="Custom symptoms" />
        <Txt variant="faint" className="mb-3">
          Add your own symptom tags - they appear in the log screen.
        </Txt>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          <TextInput
            value={newSymptom}
            onChangeText={setNewSymptom}
            placeholder="e.g. joint pain"
            placeholderTextColor={colors.textFaint}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={addSymptom}
            style={{
              flex: 1,
              backgroundColor: colors.surfaceMuted,
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 10,
              color: colors.text,
              fontFamily: 'Inter_400Regular',
              fontSize: 14,
            }}
          />
          <Pressable
            onPress={addSymptom}
            accessibilityRole="button"
            accessibilityLabel="Add symptom"
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: newSymptom.trim() ? colors.primary : colors.surfaceMuted,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons
              name="add"
              size={22}
              color={newSymptom.trim() ? colors.ink : colors.textFaint}
            />
          </Pressable>
        </View>
        {settings.customSymptoms.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {settings.customSymptoms.map((sym) => (
              <Pressable
                key={sym}
                onPress={() => removeSymptom(sym)}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${sym}`}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  backgroundColor: colors.surfaceMuted,
                  borderRadius: 99,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                }}
              >
                <RNText
                  style={{
                    fontFamily: 'Inter_500Medium',
                    fontSize: 13,
                    color: colors.textMuted,
                  }}
                >
                  {sym}
                </RNText>
                <Ionicons name="close" size={12} color={colors.textFaint} />
              </Pressable>
            ))}
          </View>
        )}
      </Card>

      {/* Security */}
      <Card>
        <SectionLabel icon="shield-checkmark-outline" label="Security" />
        <PressScale
          onPress={() => router.push('/change-pin')}
          className="flex-row items-center justify-between py-3"
        >
          <Txt variant="body">Change PIN</Txt>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </PressScale>

        <SwitchRow
          label="Self-destruct PIN"
          hint={
            hasDestruct
              ? 'Entering it at the lock screen wipes all data instantly'
              : 'Set a separate PIN that triggers an instant, silent data wipe'
          }
          value={hasDestruct}
          onValueChange={(v) => {
            if (v) {
              router.push('/set-destruct-pin');
            } else {
              haptics.warn();
              Alert.alert(
                'Remove self-destruct PIN?',
                'The PIN will be cleared and the feature will be disabled.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => void clearDestructPin().then(() => setHasDestruct(false)),
                  },
                ],
              );
            }
          }}
        />
        {hasDestruct && (
          <PressScale
            onPress={() => router.push('/set-destruct-pin')}
            className="flex-row items-center justify-between py-2"
          >
            <Txt variant="faint">Change self-destruct PIN</Txt>
            <Ionicons name="chevron-forward" size={16} color={colors.textFaint} />
          </PressScale>
        )}

        <Txt variant="faint" className="mb-2 mt-4">
          Auto-lock after inactivity
        </Txt>
        <Segmented
          options={AUTO_LOCK_OPTIONS}
          value={settings.autoLockMinutes}
          onChange={(v) => void updateSettings({ autoLockMinutes: v })}
        />
      </Card>

      {/* About */}
      <Card>
        <SectionLabel icon="information-circle-outline" label="About" />
        <RNText className="text-base leading-5 text-text-muted">
          Locklune is designed for record keeping purposes only. It is not a replacement for professional medical advice. If you have any health concerns, please consult a qualified healthcare provider.
        </RNText>
        <View className="mt-4">
          <AboutRow icon="star-outline" label="Rate Locklune" onPress={() => openLink(RATE_URL)} />
          <AboutRow
            icon="heart-outline"
            label="Support the developer"
            onPress={() => openLink(KOFI_URL)}
          />
          <AboutRow
            icon="bug-outline"
            label="Report a bug or request a feature"
            onPress={() => openLink(FEEDBACK_URL)}
          />
          <AboutRow icon="share-social-outline" label="Tell a friend" onPress={shareApp} last />
        </View>
      </Card>

      {/* Danger zone */}
      <Card
        style={{
          borderColor: 'rgba(248,113,113,0.3)',
        }}
      >
        <SectionLabel icon="alert-circle-outline" label="Danger zone" labelClass="text-danger" />
        <View className="gap-3">
          <Button title="Lock now" variant="secondary" onPress={() => void lock()} />
          <Button title="Erase all data" variant="danger" onPress={confirmWipe} />
        </View>
      </Card>

      <View className="items-center gap-1 pb-4">
        <Txt variant="faint">
          {BRAND.name} v{Constants.expoConfig?.version ?? '0.1.0'}
        </Txt>
        <Txt variant="faint" className="text-center">
          100% on-device · encrypted · no tracking
        </Txt>
      </View>
    </Screen>
  );
}

function SectionLabel({
  icon,
  label,
  labelClass,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  labelClass?: string;
}) {
  return (
    <View className="mb-3 flex-row items-center gap-2">
      <Ionicons name={icon} size={14} color={colors.textFaint} />
      <Txt variant="label" className={labelClass}>
        {label}
      </Txt>
    </View>
  );
}

function SwitchRow({
  label,
  hint,
  value,
  onValueChange,
}: {
  label: string;
  hint?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <View className="flex-row items-center justify-between py-2">
      <View className="flex-1 pr-4">
        <Txt variant="body">{label}</Txt>
        {hint && <Txt variant="faint">{hint}</Txt>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.surfaceMuted, true: colors.primary }}
        thumbColor={colors.moon}
      />
    </View>
  );
}

function Segmented({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: number }[];
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <View className="flex-row gap-2">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <PressScale
            key={o.value}
            containerStyle={{ flex: 1 }}
            onPress={() => onChange(o.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={o.label}
            className={`items-center rounded-xl py-2 ${active ? 'bg-primary' : 'bg-surfaceMuted'}`}
          >
            <Txt className={active ? 'text-ink' : 'text-text-muted'}>{o.label}</Txt>
          </PressScale>
        );
      })}
    </View>
  );
}

function ModeRow({
  label,
  hint,
  active,
  onPress,
}: {
  label: string;
  hint: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <PressScale
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: active }}
      accessibilityLabel={label}
      accessibilityHint={hint}
      className="flex-row items-center gap-3 py-2.5"
    >
      <View
        className={`h-5 w-5 items-center justify-center rounded-full border ${active ? 'border-primary bg-primary' : 'border-border'}`}
        style={
          active
            ? {
                shadowColor: colors.primary,
                shadowOpacity: 0.4,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 0 },
              }
            : undefined
        }
      >
        {active && <Ionicons name="checkmark" size={13} color={colors.ink} />}
      </View>
      <View className="flex-1">
        <Txt variant="body">{label}</Txt>
        <Txt variant="faint">{hint}</Txt>
      </View>
    </PressScale>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <PressScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      className={`rounded-full px-3.5 py-2 ${active ? 'bg-primary' : 'bg-surfaceMuted'}`}
    >
      <Txt className={active ? 'text-ink' : 'text-text-muted'}>{label}</Txt>
    </PressScale>
  );
}

function AboutRow({
  icon,
  label,
  onPress,
  last,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <PressScale
      onPress={onPress}
      accessibilityRole="button"
      className={`flex-row items-center gap-3 py-3 ${last ? '' : 'border-b border-border'}`}
    >
      <Ionicons name={icon} size={18} color={colors.primarySoft} />
      <Txt variant="body" className="flex-1">
        {label}
      </Txt>
      <Ionicons name="open-outline" size={16} color={colors.textMuted} />
    </PressScale>
  );
}

function Stepper({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <View className="flex-row items-center gap-3">
      <PressScale
        onPress={() => onChange(Math.max(min, value - 1))}
        accessibilityRole="button"
        accessibilityLabel="Decrease"
        className="h-10 w-10 items-center justify-center rounded-full bg-surfaceMuted"
      >
        <Ionicons name="remove" size={20} color={colors.text} />
      </PressScale>
      <Txt variant="title" className="w-6 text-center">
        {value}
      </Txt>
      <PressScale
        onPress={() => onChange(Math.min(max, value + 1))}
        accessibilityRole="button"
        accessibilityLabel="Increase"
        className="h-10 w-10 items-center justify-center rounded-full bg-surfaceMuted"
      >
        <Ionicons name="add" size={20} color={colors.text} />
      </PressScale>
    </View>
  );
}
