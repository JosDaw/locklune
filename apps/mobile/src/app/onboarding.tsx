import { Ionicons } from '@expo/vector-icons';
import { BRAND, type CycleMode, type Settings } from '@locklune/core';
import { type ReactNode, useState } from 'react';
import { Image, Linking, Pressable, Text as RNText, View } from 'react-native';
import { Switch } from '../components/gs/switch';
import { Button } from '../components/ui/Button';
import { PinPad } from '../components/ui/PinPad';
import { Screen } from '../components/ui/Screen';
import { Txt } from '../components/ui/Text';
import * as haptics from '../lib/haptics';
import { CYCLE_MODES } from '../lib/modes';
import { requestNotificationPermission } from '../lib/notifications';
import { useAuthStore } from '../stores/authStore';
import { useDataStore } from '../stores/dataStore';
import { colors } from '../theme/colors';

const PIN_LENGTH = 6;

// Modes for which fertility notifications are relevant.
const FERTILITY_MODES: CycleMode[] = ['tracking', 'trying'];

type Phase = 'consent' | 'create' | 'confirm' | 'mode' | 'notifications';

export default function Onboarding() {
  const [phase, setPhase] = useState<Phase>('consent');
  const [firstPin, setFirstPin] = useState('');
  const [confirmedPin, setConfirmedPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [agreedLegal, setAgreedLegal] = useState(false);
  const [agreedMedical, setAgreedMedical] = useState(false);

  // Preferences collected during onboarding - applied after createPin succeeds.
  const [selectedMode, setSelectedMode] = useState<CycleMode>('tracking');
  const [notifyPeriodTomorrow, setNotifyPeriodTomorrow] = useState(false);
  const [notifyPeriodToday, setNotifyPeriodToday] = useState(false);
  const [notifyFertileTomorrow, setNotifyFertileTomorrow] = useState(false);
  const [notifyFertileStart, setNotifyFertileStart] = useState(false);

  const createPin = useAuthStore((s) => s.createPin);
  const updateSettings = useDataStore((s) => s.updateSettings);

  const handlePinEntry = async (pin: string) => {
    if (busy) return;
    if (phase === 'create') {
      setFirstPin(pin);
      setError(null);
      setPhase('confirm');
      return;
    }
    if (pin !== firstPin) {
      haptics.error();
      setError("Those PINs didn’t match. Let’s try again.");
      setFirstPin('');
      setPhase('create');
      return;
    }
    setConfirmedPin(pin);
    setError(null);
    setPhase('mode');
  };

  const handleFinish = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await createPin(confirmedPin);
      // DB is now open - persist the onboarding choices before navigation fires.
      const patch: Partial<Settings> = {
        cycleMode: selectedMode,
        notifyPeriodTomorrow,
        notifyPeriodToday,
        notifyFertileTomorrow,
        notifyFertileStart,
      };
      await updateSettings(patch);
      haptics.success();
    } catch {
      haptics.error();
      setError('Something went wrong creating your PIN. Please try again.');
      setConfirmedPin('');
      setFirstPin('');
      setPhase('create');
      setBusy(false);
    }
  };

  const toggleNotify = async (
    setter: (v: boolean) => void,
    value: boolean,
  ) => {
    if (value) {
      const granted = await requestNotificationPermission();
      if (!granted) return;
    }
    setter(value);
  };

  const fertilityApplicable = FERTILITY_MODES.includes(selectedMode);

  // ── Consent ──────────────────────────────────────────────────────────────────
  if (phase === 'consent') {
    return (
      <Screen scroll={false} >
        <Image
          source={require('../../assets/images/locklune_logo.png')}
          style={{ width: '100%', height: 500 }}
          resizeMode="contain"
        />

        <View className="gap-5">
          <Txt variant="muted">Before you begin</Txt>
          <CheckboxRow checked={agreedLegal} onToggle={() => setAgreedLegal((v) => !v)}>
            <RNText className="text-base leading-6 text-text">
              I agree to the{' '}
              <RNText
                className="text-primary-soft underline"
                onPress={() => void Linking.openURL(`${BRAND.websiteUrl}/privacy`)}
              >
                Privacy Policy
              </RNText>{' '}
              and{' '}
              <RNText
                className="text-primary-soft underline"
                onPress={() => void Linking.openURL(`${BRAND.websiteUrl}/terms`)}
              >
                Terms &amp; Conditions
              </RNText>
              .
            </RNText>
          </CheckboxRow>

          <CheckboxRow checked={agreedMedical} onToggle={() => setAgreedMedical((v) => !v)}>
            <RNText className="text-base leading-6 text-text">
              I understand {BRAND.name} is for record keeping purposes only and is not intended to be used for medical or
              health advice.
            </RNText>
          </CheckboxRow>
        </View>

        <Button
          title="Continue"
          disabled={!(agreedLegal && agreedMedical)}
          onPress={() => setPhase('create')}
        />
      </Screen>
    );
  }

  // ── PIN create / confirm ──────────────────────────────────────────────────────
  if (phase === 'create' || phase === 'confirm') {
    return (
      <Screen scroll={false} contentClassName="justify-between">
        <View className="items-center gap-2 pt-6">
          <Txt variant="display">{BRAND.name}</Txt>
          <Txt variant="muted" className="text-center">
            {phase === 'create'
              ? 'Choose a 6-digit PIN to protect your data'
              : 'Re-enter your PIN to confirm'}
          </Txt>
        </View>

        <View className="gap-3">
          {error ? <Txt className="text-center text-danger">{error}</Txt> : <View className="h-5" />}
          <PinPad length={PIN_LENGTH} disabled={busy} onComplete={handlePinEntry} />
        </View>

        <View className="rounded-2xl border border-border bg-surface p-4">
          <Txt variant="faint" className="text-center leading-5">
            Your PIN encrypts everything on this device and is never stored or sent anywhere. If you
            forget it, your data can't be recovered, and after 5 incorrect attempts, all data is
            erased.
          </Txt>
        </View>
      </Screen>
    );
  }

  // ── Mode selection ────────────────────────────────────────────────────────────
  if (phase === 'mode') {
    return (
      <Screen contentClassName="justify-between">
        <View className="gap-2 pt-6">
          <Txt variant="display">How you'll use {BRAND.name}</Txt>
          <Txt variant="muted">You can change this any time in settings.</Txt>
        </View>

        <View className="gap-2">
          {CYCLE_MODES.map((m) => {
            const selected = selectedMode === m.value;
            return (
              <Pressable
                key={m.value}
                onPress={() => setSelectedMode(m.value)}
                className={`flex-row items-center gap-4 rounded-2xl border p-4 ${
                  selected ? 'border-primary bg-primary/10' : 'border-border bg-surface'
                }`}
              >
                <View
                  className={`h-6 w-6 items-center justify-center rounded-md border-2 ${
                    selected ? 'border-primary bg-primary' : 'border-surfaceMuted'
                  }`}
                >
                  {selected && <Ionicons name="checkmark" size={16} color={colors.ink} />}
                </View>
                <View className="flex-1">
                  <Txt variant="body">{m.label}</Txt>
                  <Txt variant="faint">{m.hint}</Txt>
                </View>
              </Pressable>
            );
          })}
        </View>

        <Button title="Continue" onPress={() => setPhase('notifications')} />
      </Screen>
    );
  }

  // ── Notifications ─────────────────────────────────────────────────────────────
  return (
    <Screen scroll={false} contentClassName="justify-between">
      <View className="gap-6 pt-6">
        {/* Icon + heading */}
        <View className="items-center gap-4">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-surface border border-border">
            <Ionicons name="notifications-outline" size={36} color={colors.primarySoft} />
          </View>
          <View className="items-center gap-2">
            <Txt variant="display" className="text-center">Allow reminders</Txt>
            <Txt variant="muted" className="text-center">
              Enable any reminder below and {BRAND.name} will ask for notification permission.
              All reminders are local to your device — nothing is sent anywhere.
            </Txt>
          </View>
        </View>

        {/* Individual toggles */}
        <View className="gap-3">
          <NotifRow
            label="Period starting tomorrow"
            hint="Morning before your predicted period start"
            value={notifyPeriodTomorrow}
            onValueChange={(v) => void toggleNotify(setNotifyPeriodTomorrow, v)}
          />
          <NotifRow
            label="Period starting today"
            hint="Morning of your predicted period start"
            value={notifyPeriodToday}
            onValueChange={(v) => void toggleNotify(setNotifyPeriodToday, v)}
          />
          {fertilityApplicable && (
            <>
              <NotifRow
                label="Fertile window tomorrow"
                hint="Morning before your fertile window opens"
                value={notifyFertileTomorrow}
                onValueChange={(v) => void toggleNotify(setNotifyFertileTomorrow, v)}
              />
              <NotifRow
                label="Fertile window opens"
                hint="Morning your fertile window begins"
                value={notifyFertileStart}
                onValueChange={(v) => void toggleNotify(setNotifyFertileStart, v)}
              />
            </>
          )}
        </View>
      </View>

      <Button title="Get started" disabled={busy} onPress={() => void handleFinish()} />
    </Screen>
  );
}

function CheckboxRow({
  checked,
  onToggle,
  children,
}: {
  checked: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <View className="flex-row items-start gap-3">
      <Pressable
        onPress={onToggle}
        hitSlop={8}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        className={`mt-0.5 h-6 w-6 items-center justify-center rounded-md border-2 ${checked ? 'border-primary bg-primary' : 'border-surfaceMuted'}`}
      >
        {checked && <Ionicons name="checkmark" size={16} color={colors.ink} />}
      </Pressable>
      <View className="flex-1">{children}</View>
    </View>
  );
}

function NotifRow({
  label,
  hint,
  value,
  onValueChange,
}: {
  label: string;
  hint: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <View className="flex-row items-center justify-between gap-4 rounded-2xl border border-border bg-surface px-4 py-3">
      <View className="flex-1">
        <Txt variant="body">{label}</Txt>
        <Txt variant="faint">{hint}</Txt>
      </View>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );
}
