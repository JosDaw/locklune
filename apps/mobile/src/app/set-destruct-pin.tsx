import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PinPad } from '../components/ui/PinPad';
import { Screen } from '../components/ui/Screen';
import { Txt } from '../components/ui/Text';
import { colors } from '../theme/colors';
import * as haptics from '../lib/haptics';
import * as toast from '../lib/toast';
import { setDestructPin } from '../lib/vault';

const PIN_LENGTH = 6;

export default function SetDestructPin() {
  const router = useRouter();

  const [phase, setPhase] = useState<'create' | 'confirm'>('create');
  const [firstPin, setFirstPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleComplete = async (pin: string) => {
    if (busy) return;
    setError(null);
    if (phase === 'create') {
      setFirstPin(pin);
      setPhase('confirm');
      return;
    }
    if (pin !== firstPin) {
      haptics.error();
      setError("PINs didn’t match. Start again.");
      setFirstPin('');
      setPhase('create');
      return;
    }
    setBusy(true);
    try {
      await setDestructPin(pin);
      haptics.success();
      toast.success('Self-destruct PIN set.');
      router.back();
    } catch {
      haptics.error();
      toast.error('Could not save self-destruct PIN. Please try again.');
      setFirstPin('');
      setPhase('create');
      setBusy(false);
    }
  };

  return (
    <Screen scroll={false} contentClassName="justify-between">
      <View className="flex-row items-center justify-between pt-2">
        <Txt variant="title">Self-destruct PIN</Txt>
        <Pressable
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center rounded-full bg-surfaceMuted"
        >
          <Ionicons name="close" size={20} color={colors.text} />
        </Pressable>
      </View>

      <View className="items-center gap-3">
        <Txt variant="muted" className="text-center">
          {phase === 'create'
            ? 'Choose a 6-digit self-destruct PIN'
            : 'Re-enter to confirm'}
        </Txt>
        <Txt variant="faint" className="text-center">
          Make sure it is different from your unlock PIN. Entering it at the lock screen will
          immediately erase all data — with no confirmation.
        </Txt>
      </View>

      <View className="gap-3">
        {error ? <Txt className="text-center text-danger">{error}</Txt> : <View className="h-5" />}
        <PinPad length={PIN_LENGTH} disabled={busy} onComplete={handleComplete} />
      </View>

      <View className="h-10" />
    </Screen>
  );
}
