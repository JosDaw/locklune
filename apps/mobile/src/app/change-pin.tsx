import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PinPad } from '../components/ui/PinPad';
import { Screen } from '../components/ui/Screen';
import { Txt } from '../components/ui/Text';
import { colors } from '../theme/colors';
import { useAuthStore } from '../stores/authStore';

const PIN_LENGTH = 6;
type Phase = 'current' | 'new' | 'confirm';

const PROMPTS: Record<Phase, string> = {
  current: 'Enter your current PIN',
  new: 'Choose a new 6-digit PIN',
  confirm: 'Re-enter your new PIN',
};

export default function ChangePin() {
  const router = useRouter();
  const changePin = useAuthStore((s) => s.changePin);

  const [phase, setPhase] = useState<Phase>('current');
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setPhase('current');
    setCurrentPin('');
    setNewPin('');
  };

  const handleComplete = async (pin: string) => {
    if (busy) return;
    setError(null);
    if (phase === 'current') {
      setCurrentPin(pin);
      setPhase('new');
    } else if (phase === 'new') {
      setNewPin(pin);
      setPhase('confirm');
    } else {
      if (pin !== newPin) {
        setError('New PINs didn’t match. Start again.');
        reset();
        return;
      }
      setBusy(true);
      const ok = await changePin(currentPin, pin);
      setBusy(false);
      if (!ok) {
        setError('Your current PIN was incorrect. Start again.');
        reset();
        return;
      }
      Alert.alert('PIN updated', 'Your new PIN is now active.');
      router.back();
    }
  };

  return (
    <Screen scroll={false} contentClassName="justify-between">
      <View className="flex-row items-center justify-between pt-2">
        <Txt variant="title">Change PIN</Txt>
        <Pressable onPress={() => router.back()} className="h-9 w-9 items-center justify-center rounded-full bg-surfaceMuted">
          <Ionicons name="close" size={20} color={colors.text} />
        </Pressable>
      </View>

      <View className="items-center">
        <Txt variant="muted">{PROMPTS[phase]}</Txt>
      </View>

      <View className="gap-3">
        {error ? <Txt className="text-center text-danger">{error}</Txt> : <View className="h-5" />}
        <PinPad length={PIN_LENGTH} disabled={busy} onComplete={handleComplete} />
      </View>

      <View className="h-10" />
    </Screen>
  );
}
