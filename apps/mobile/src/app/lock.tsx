import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { BRAND } from '@locklune/core';
import { PinPad } from '../components/ui/PinPad';
import { Screen } from '../components/ui/Screen';
import { Txt } from '../components/ui/Text';
import { useAuthStore } from '../stores/authStore';
import { currentLockSeconds } from '../lib/vault';

const PIN_LENGTH = 6;

export default function Lock() {
  const [remaining, setRemaining] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unlockPin = useAuthStore((s) => s.unlockPin);

  // Restore any active lockout (e.g. after the app was killed mid-timeout).
  useEffect(() => {
    void currentLockSeconds().then(setRemaining);
  }, []);

  // Countdown timer while locked out.
  useEffect(() => {
    if (remaining <= 0) return;
    const t = setInterval(() => setRemaining((r) => (r <= 1 ? 0 : r - 1)), 1000);
    return () => clearInterval(t);
  }, [remaining > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleComplete = async (pin: string) => {
    if (remaining > 0 || busy) return;
    setBusy(true);
    setError(null);
    const ok = await unlockPin(pin);
    setBusy(false);
    if (!ok) {
      const s = useAuthStore.getState();
      if (s.lockedForSeconds > 0) {
        setRemaining(s.lockedForSeconds);
        setError('Too many attempts. Please wait before trying again.');
      } else {
        setError(
          `Incorrect PIN. ${s.attemptsRemaining} attempt${s.attemptsRemaining === 1 ? '' : 's'} left before all data is erased.`,
        );
      }
    }
  };

  return (
    <Screen scroll={false} contentClassName="justify-between">
      <View className="items-center gap-2 pt-6">
        <Txt variant="display">{BRAND.name}</Txt>
        <Txt variant="muted">Enter your PIN to unlock</Txt>
      </View>

      <View className="gap-3">
        {remaining > 0 ? (
          <Txt className="text-center text-danger">Locked. Try again in {remaining}s</Txt>
        ) : error ? (
          <Txt className="text-center text-danger">{error}</Txt>
        ) : (
          <View className="h-5" />
        )}
        <PinPad length={PIN_LENGTH} disabled={busy || remaining > 0} onComplete={handleComplete} />
      </View>

      <View className="h-10" />
    </Screen>
  );
}
