import { useRouter } from 'expo-router';
import { Alert, Pressable, View } from 'react-native';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { BRAND } from '@locklune/core';
import { Switch } from '../../components/gs/switch';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Screen } from '../../components/ui/Screen';
import { Txt } from '../../components/ui/Text';
import { colors } from '../../theme/colors';
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

  const biometricSupported = useAuthStore((s) => s.biometricSupported);
  const biometricEnabled = useAuthStore((s) => s.biometricEnabled);
  const enableBiometric = useAuthStore((s) => s.enableBiometric);
  const disableBiometric = useAuthStore((s) => s.disableBiometric);
  const lock = useAuthStore((s) => s.lock);
  const wipe = useAuthStore((s) => s.wipe);

  const remindersOn = settings.reminderDaysBefore.length > 0;

  const toggleBiometric = async (value: boolean) => {
    if (value) {
      const ok = await enableBiometric();
      if (!ok) Alert.alert('Could not enable', 'Biometric unlock is unavailable right now.');
    } else {
      await disableBiometric();
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
      <Txt variant="display" className="pt-2">Settings</Txt>

      {/* Security */}
      <Card>
        <Txt variant="label" className="mb-3">Security</Txt>
        {biometricSupported && (
          <SwitchRow
            label="Biometric unlock"
            hint="Face ID / fingerprint, PIN as backup"
            value={biometricEnabled}
            onValueChange={(v) => void toggleBiometric(v)}
          />
        )}
        <Pressable onPress={() => router.push('/change-pin')} className="flex-row items-center justify-between py-3">
          <Txt variant="body">Change PIN</Txt>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>

        <Txt variant="faint" className="mb-2 mt-2">Auto-lock after inactivity</Txt>
        <Segmented
          options={AUTO_LOCK_OPTIONS}
          value={settings.autoLockMinutes}
          onChange={(v) => void updateSettings({ autoLockMinutes: v })}
        />
      </Card>

      {/* Cycle */}
      <Card>
        <Txt variant="label" className="mb-3">Cycle</Txt>
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
        <Txt variant="label" className="mb-3">Reminders</Txt>
        <SwitchRow
          label="Period reminder"
          hint="A local notification 2 days before"
          value={remindersOn}
          onValueChange={(v) => void toggleReminders(v)}
        />
      </Card>

      {/* Danger zone */}
      <Card className="border-danger/40">
        <Txt variant="label" className="mb-3 text-danger">Danger zone</Txt>
        <View className="gap-3">
          <Button title="Lock now" variant="secondary" onPress={() => void lock()} />
          <Button title="Erase all data" variant="danger" onPress={confirmWipe} />
        </View>
      </Card>

      <View className="items-center gap-1 pb-4">
        <Txt variant="faint">{BRAND.name} v{Constants.expoConfig?.version ?? '0.1.0'}</Txt>
        <Txt variant="faint" className="text-center">
          100% on-device · encrypted · no accounts, no tracking, no network
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
            className={`flex-1 items-center rounded-xl py-2 ${active ? 'bg-primary' : 'bg-surfaceMuted'}`}
          >
            <Txt className={active ? 'text-ink' : 'text-text-muted'}>{o.label}</Txt>
          </Pressable>
        );
      })}
    </View>
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
        className="h-10 w-10 items-center justify-center rounded-full bg-surfaceMuted"
      >
        <Ionicons name="remove" size={20} color={colors.text} />
      </Pressable>
      <Txt variant="title" className="w-6 text-center">{value}</Txt>
      <Pressable
        onPress={() => onChange(Math.min(max, value + 1))}
        className="h-10 w-10 items-center justify-center rounded-full bg-surfaceMuted"
      >
        <Ionicons name="add" size={20} color={colors.text} />
      </Pressable>
    </View>
  );
}
