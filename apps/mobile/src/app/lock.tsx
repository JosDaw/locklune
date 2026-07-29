import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { BRAND } from '@locklune/core';
import { MoonLoader } from '../components/ui/MoonLoader';
import { PinPad } from '../components/ui/PinPad';
import { Screen } from '../components/ui/Screen';
import { Txt } from '../components/ui/Text';
import * as haptics from '../lib/haptics';
import * as toast from '../lib/toast';
import { useAuthStore } from '../stores/authStore';
import { currentLockSeconds } from '../lib/vault';

const PIN_LENGTH = 6;

export default function Lock() {
  const router = useRouter();
  const [remaining, setRemaining] = useState<number>(0);
  const [busy, setBusy] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const unlockPin = useAuthStore((store) => store.unlockPin);

  // Restore any active lockout (e.g. after the app was killed mid-timeout).
  useEffect(() => {
    void currentLockSeconds().then(setRemaining);
  }, []);

  // Countdown timer while locked out.
  useEffect(() => {
    if (remaining <= 0) return;
    const timer = setInterval(
      () => setRemaining((seconds) => (seconds <= 1 ? 0 : seconds - 1)),
      1000,
    );
    return () => clearInterval(timer);
  }, [remaining > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleComplete = async (pin: string) => {
    if (remaining > 0 || busy) return;
    setBusy(true);
    setError(null);
    let ok = false;
    try {
      ok = await unlockPin(pin);
    } catch {
      setBusy(false);
      toast.error('Something went wrong unlocking. Please try again.');
      return;
    }
    setBusy(false);
    if (ok) {
      haptics.success();
      return;
    }
    haptics.error();
    const authState = useAuthStore.getState();
    if (authState.lockedForSeconds > 0) {
      setRemaining(authState.lockedForSeconds);
      setError('Too many attempts. Please wait before trying again.');
    } else {
      setError(
        `Incorrect PIN. ${authState.attemptsRemaining} attempt${authState.attemptsRemaining === 1 ? '' : 's'} left before all data is erased.`,
      );
    }
  };

  const confirmReset = () => {
    haptics.warn();
    Alert.alert(
      'Reset & start over?',
      'This permanently erases your PIN and all data on this device. It can’t be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', style: 'destructive', onPress: () => router.push('/reset') },
      ],
    );
  };

  return (
    <Screen scroll={false} contentClassName="justify-between">
      <View className="items-center pt-6">
        <Txt variant="display">{BRAND.name}</Txt>
      </View>

      {busy ? (
        <View className="items-center gap-5 py-8">
          <MoonLoader />
          <Txt variant="muted">Unlocking…</Txt>
        </View>
      ) : (
        <View className="gap-3">
          {remaining > 0 ? (
            <Txt className="text-center text-danger">Locked. Try again in {remaining}s</Txt>
          ) : error ? (
            <Txt className="text-center text-danger">{error}</Txt>
          ) : (
            <View className="h-5" />
          )}
          <PinPad length={PIN_LENGTH} disabled={remaining > 0} onComplete={handleComplete} />
        </View>
      )}

      <View className="items-center pb-4">
        {!busy && (
          <Pressable
            onPress={confirmReset}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Reset and start over"
            style={({ pressed }) => ({
              opacity: pressed ? 0.5 : 1,
              paddingHorizontal: 16,
              paddingVertical: 8,
            })}
          >
            <Txt variant="faint" className="text-center underline">
              Locked out? Erase &amp; start over
            </Txt>
          </Pressable>
        )}
      </View>
    </Screen>
  );
}
