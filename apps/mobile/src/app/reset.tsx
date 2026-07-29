import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { MoonLoader } from '../components/ui/MoonLoader';
import { PinPad } from '../components/ui/PinPad';
import { Screen } from '../components/ui/Screen';
import { Txt } from '../components/ui/Text';
import * as haptics from '../lib/haptics';
import * as toast from '../lib/toast';
import { useAuthStore } from '../stores/authStore';
import { colors } from '../theme/colors';

const PIN_LENGTH = 6;

/**
 * Full reset / start-over. For when the vault is unrecoverable (forgotten PIN,
 * corrupted data). This is a confirmation gate, not an unlock: the user picks any
 * 6-digit code and re-enters it to prove intent, then everything is erased. The
 * app returns to onboarding, where they set up fresh.
 */
export default function Reset() {
  const router = useRouter();
  const wipe = useAuthStore((store) => store.wipe);

  const [phase, setPhase] = useState<'enter' | 'confirm'>('enter');
  const [firstCode, setFirstCode] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<boolean>(false);

  const handleComplete = async (code: string) => {
    if (busy) return;
    setError(null);
    if (phase === 'enter') {
      setFirstCode(code);
      setPhase('confirm');
      return;
    }
    if (code !== firstCode) {
      haptics.error();
      setError('Codes didn’t match. Start again.');
      setFirstCode('');
      setPhase('enter');
      return;
    }
    // Matched - erase everything. wipe() flips auth status to onboarding, which
    // the root layout picks up and navigates away from this screen.
    setBusy(true);
    haptics.warn();
    try {
      await wipe();
      toast.success('Everything was reset. Set up a new PIN to start again.');
    } catch {
      haptics.error();
      toast.error('Could not fully reset. Please try again.');
      setFirstCode('');
      setPhase('enter');
      setBusy(false);
    }
  };

  return (
    <Screen scroll={false} contentClassName="justify-between">
      <View className="flex-row items-center justify-between pt-2">
        <Txt variant="title">Reset & start over</Txt>
        <Pressable
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center rounded-full bg-surfaceMuted"
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <Ionicons name="close" size={20} color={colors.text} />
        </Pressable>
      </View>

      {busy ? (
        <View className="items-center gap-5 py-8">
          <MoonLoader />
          <Txt variant="muted">Erasing…</Txt>
        </View>
      ) : (
        <>
          <View className="items-center gap-3">
            <Txt variant="muted" className="text-center">
              {phase === 'enter'
                ? 'Choose a 6-digit code to confirm'
                : 'Re-enter the code to confirm'}
            </Txt>
            <Txt variant="faint" className="text-center">
              This permanently erases your PIN and all data on this device so you can start fresh.
              It cannot be undone. Use this only if you’re locked out or your data won’t load.
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
        </>
      )}

      <View className="h-10" />
    </Screen>
  );
}
