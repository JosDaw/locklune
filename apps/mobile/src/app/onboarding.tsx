import { useState } from 'react';
import { Alert, View } from 'react-native';
import { BRAND } from '@locklune/core';
import { PinPad } from '../components/ui/PinPad';
import { Screen } from '../components/ui/Screen';
import { Txt } from '../components/ui/Text';
import { useAuthStore } from '../stores/authStore';

const PIN_LENGTH = 6;

export default function Onboarding() {
  const [phase, setPhase] = useState<'create' | 'confirm'>('create');
  const [firstPin, setFirstPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const createPin = useAuthStore((s) => s.createPin);
  const biometricSupported = useAuthStore((s) => s.biometricSupported);
  const enableBiometric = useAuthStore((s) => s.enableBiometric);

  const handleComplete = async (pin: string) => {
    if (busy) return;
    if (phase === 'create') {
      setFirstPin(pin);
      setError(null);
      setPhase('confirm');
      return;
    }
    if (pin !== firstPin) {
      setError('Those PINs didn’t match. Let’s try again.');
      setFirstPin('');
      setPhase('create');
      return;
    }
    setBusy(true);
    try {
      await createPin(pin);
      if (biometricSupported) {
        Alert.alert(
          'Enable biometric unlock?',
          'Unlock with Face ID / fingerprint, with your PIN as the backup.',
          [
            { text: 'Not now', style: 'cancel' },
            { text: 'Enable', onPress: () => void enableBiometric() },
          ],
        );
      }
    } catch {
      setError('Something went wrong creating your PIN. Please try again.');
      setFirstPin('');
      setPhase('create');
      setBusy(false);
    }
  };

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
        {error ? (
          <Txt className="text-center text-danger">{error}</Txt>
        ) : (
          <View className="h-5" />
        )}
        <PinPad length={PIN_LENGTH} disabled={busy} onComplete={handleComplete} />
      </View>

      <View className="rounded-2xl border border-border bg-surface p-4">
        <Txt variant="faint" className="text-center leading-5">
          Your PIN encrypts everything on this device. It is never stored or sent anywhere — so if
          you forget it, your data can’t be recovered.
        </Txt>
      </View>
    </Screen>
  );
}
