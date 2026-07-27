import { useRouter } from 'expo-router';
import { Alert, Pressable, Text as RNText, View } from 'react-native';
import Constants from 'expo-constants';
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
import { Switch } from '../../components/gs/switch';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Screen } from '../../components/ui/Screen';
import { Txt } from '../../components/ui/Text';
import { colors } from '../../theme/colors';
import { formatDay } from '../../lib/format';
import * as haptics from '../../lib/haptics';
import { KOFI_URL, MAKER_URL, openLink, RATE_URL, shareApp } from '../../lib/links';
import { CONTRACEPTION_METHODS, CYCLE_MODES } from '../../lib/modes';
import { requestNotificationPermission } from '../../lib/notifications';
import { useAuthStore } from '../../stores/authStore';
import { useDataStore } from '../../stores/dataStore';

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
  const cycles = useDataStore((s) => s.cycles);

  const lock = useAuthStore((s) => s.lock);
  const wipe = useAuthStore((s) => s.wipe);

  const remindersOn = settings.reminderDaysBefore.length > 0;

  const today = todayEpochDay();
  const pregWeeks =
    settings.pregnancyDueDay != null ? pregnancyProgress(settings.pregnancyDueDay, today).week : 0;

  const selectMode = (mode: CycleMode) => {
    if (mode === 'pregnant' && settings.pregnancyDueDay == null) {
      const lastStart = cycles[cycles.length - 1]?.startDay;
      const dueDay = lastStart != null ? estimateDueDay(lastStart) : dueDayFromWeeksAlong(6, today);
      void updateSettings({ cycleMode: mode, pregnancyDueDay: dueDay });
    } else {
      void updateSettings({ cycleMode: mode });
    }
  };

  const toggleReminders = async (value: boolean) => {
    if (value) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        Alert.alert('Notifications off', 'Enable notifications for Locklune in system settings.');
        return;
      }
      await updateSettings({ reminderDaysBefore: [2] });
    } else {
      await updateSettings({ reminderDaysBefore: [] });
    }
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
      <Txt variant="display" className="pt-2">
        Settings
      </Txt>

      {/* Cycle mode */}
      <Card>
        <Txt variant="label" className="mb-3">
          I am currently
        </Txt>
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
          <View className="mt-4 flex-row items-center justify-between border-t border-border pt-4">
            <View className="flex-1 pr-4">
              <Txt variant="body">Weeks along</Txt>
              {settings.pregnancyDueDay != null && (
                <Txt variant="faint">
                  Due {formatDay(settings.pregnancyDueDay, { month: 'long', day: 'numeric' })}
                </Txt>
              )}
            </View>
            <Stepper
              value={pregWeeks}
              min={0}
              max={42}
              onChange={(w) =>
                void updateSettings({ pregnancyDueDay: dueDayFromWeeksAlong(w, today) })
              }
            />
          </View>
        )}
      </Card>

      {/* Security */}
      <Card>
        <Txt variant="label" className="mb-3">
          Security
        </Txt>
        <Pressable
          onPress={() => router.push('/change-pin')}
          className="flex-row items-center justify-between py-3"
        >
          <Txt variant="body">Change PIN</Txt>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>

        <Txt variant="faint" className="mb-2 mt-2">
          Auto-lock after inactivity
        </Txt>
        <Segmented
          options={AUTO_LOCK_OPTIONS}
          value={settings.autoLockMinutes}
          onChange={(v) => void updateSettings({ autoLockMinutes: v })}
        />
      </Card>

      {/* Cycle */}
      <Card>
        <Txt variant="label" className="mb-3">
          Cycle
        </Txt>
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
      </Card>

      {/* Reminders */}
      <Card>
        <Txt variant="label" className="mb-3">
          Reminders
        </Txt>
        <SwitchRow
          label="Period reminder"
          hint="A local notification 2 days before"
          value={remindersOn}
          onValueChange={(v) => void toggleReminders(v)}
        />
      </Card>

      {/* About */}
      <Card>
        <Txt variant="label" className="mb-3">
          About
        </Txt>
        <RNText className="text-base leading-5 text-text-muted">
          Locklune is made by one person,{' '}
          <RNText className="font-medium text-primary-soft" onPress={() => openLink(MAKER_URL)}>
            Josie Daw
          </RNText>
          . It is intentionally private, with no ads and no tracking.
        </RNText>
        <View className="mt-4">
          <AboutRow icon="star-outline" label="Rate Locklune" onPress={() => openLink(RATE_URL)} />
          <AboutRow
            icon="heart-outline"
            label="Support the developer"
            onPress={() => openLink(KOFI_URL)}
          />
          <AboutRow icon="share-social-outline" label="Tell a friend" onPress={shareApp} last />
        </View>
      </Card>

      {/* Danger zone */}
      <Card className="border-danger/40">
        <Txt variant="label" className="mb-3 text-danger">
          Danger zone
        </Txt>
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
          100% on-device · encrypted · no accounts, no tracking, no network
        </Txt>
        <Txt variant="faint" className="text-center">
          For organisation only. Not medical or health advice.
        </Txt>
      </View>
    </Screen>
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
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={o.label}
            className={`flex-1 items-center rounded-xl py-2 ${active ? 'bg-primary' : 'bg-surfaceMuted'}`}
          >
            <Txt className={active ? 'text-ink' : 'text-text-muted'}>{o.label}</Txt>
          </Pressable>
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
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: active }}
      accessibilityLabel={label}
      accessibilityHint={hint}
      className="flex-row items-center gap-3 py-2.5"
    >
      <View
        className={`h-5 w-5 items-center justify-center rounded-full border ${active ? 'border-primary bg-primary' : 'border-border'}`}
      >
        {active && <Ionicons name="checkmark" size={13} color={colors.ink} />}
      </View>
      <View className="flex-1">
        <Txt variant="body">{label}</Txt>
        <Txt variant="faint">{hint}</Txt>
      </View>
    </Pressable>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      className={`rounded-full px-3.5 py-2 ${active ? 'bg-primary' : 'bg-surfaceMuted'}`}
    >
      <Txt className={active ? 'text-ink' : 'text-text-muted'}>{label}</Txt>
    </Pressable>
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
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className={`flex-row items-center gap-3 py-3 ${last ? '' : 'border-b border-border'}`}
    >
      <Ionicons name={icon} size={18} color={colors.primarySoft} />
      <Txt variant="body" className="flex-1">
        {label}
      </Txt>
      <Ionicons name="open-outline" size={16} color={colors.textMuted} />
    </Pressable>
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
      <Pressable
        onPress={() => onChange(Math.max(min, value - 1))}
        accessibilityRole="button"
        accessibilityLabel="Decrease"
        className="h-10 w-10 items-center justify-center rounded-full bg-surfaceMuted"
      >
        <Ionicons name="remove" size={20} color={colors.text} />
      </Pressable>
      <Txt variant="title" className="w-6 text-center">
        {value}
      </Txt>
      <Pressable
        onPress={() => onChange(Math.min(max, value + 1))}
        accessibilityRole="button"
        accessibilityLabel="Increase"
        className="h-10 w-10 items-center justify-center rounded-full bg-surfaceMuted"
      >
        <Ionicons name="add" size={20} color={colors.text} />
      </Pressable>
    </View>
  );
}
