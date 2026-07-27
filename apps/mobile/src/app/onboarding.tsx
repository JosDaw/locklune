import { type ReactNode, useState } from 'react';
import { Linking, Pressable, Text as RNText, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BRAND } from '@locklune/core';
import { Button } from '../components/ui/Button';
import { PinPad } from '../components/ui/PinPad';
import { Screen } from '../components/ui/Screen';
import { Txt } from '../components/ui/Text';
import { colors } from '../theme/colors';
import * as haptics from '../lib/haptics';
import { useAuthStore } from '../stores/authStore';

const PIN_LENGTH = 6;

export default function Onboarding() {
  const [phase, setPhase] = useState<'consent' | 'create' | 'confirm'>('consent');
  const [firstPin, setFirstPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [agreedLegal, setAgreedLegal] = useState(false);
  const [agreedMedical, setAgreedMedical] = useState(false);

  const createPin = useAuthStore((s) => s.createPin);

  const handleComplete = async (pin: string) => {
    if (busy) return;
    if (phase === 'create') {
      setFirstPin(pin);
      setError(null);
      setPhase('confirm');
      return;
    }
    if (pin !== firstPin) {
      haptics.error();
      setError('Those PINs didn’t match. Let’s try again.');
      setFirstPin('');
      setPhase('create');
      return;
    }
    setBusy(true);
    try {
      await createPin(pin);
      haptics.success();
    } catch {
      haptics.error();
      setError('Something went wrong creating your PIN. Please try again.');
      setFirstPin('');
      setPhase('create');
      setBusy(false);
    }
  };

  if (phase === 'consent') {
    return (
      <Screen scroll={false} contentClassName="justify-between">
        <View className="items-center gap-2 pt-6">
          <Txt variant="display">{BRAND.name}</Txt>
          <Txt variant="muted" className="text-center">
            Before you begin
          </Txt>
        </View>

        <View className="gap-5">
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
              I understand {BRAND.name} is for informational purposes only and is not medical or
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
        <PinPad length={PIN_LENGTH} disabled={busy} onComplete={handleComplete} />
      </View>

      <View className="rounded-2xl border border-border bg-surface p-4">
        <Txt variant="faint" className="text-center leading-5">
          Your PIN encrypts everything on this device and is never stored or sent anywhere. If you
          forget it, your data can’t be recovered, and after 5 incorrect attempts, all data is
          erased.
        </Txt>
      </View>
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
        className={`mt-0.5 h-6 w-6 items-center justify-center rounded-md border ${checked ? 'border-primary bg-primary' : 'border-border'}`}
      >
        {checked && <Ionicons name="checkmark" size={16} color={colors.ink} />}
      </Pressable>
      <View className="flex-1">{children}</View>
    </View>
  );
}
