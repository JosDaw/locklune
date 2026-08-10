import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { BRAND } from '@locklune/core';
import { MoonLoader } from '../components/ui/MoonLoader';
import { PinPad } from '../components/ui/PinPad';
import { Screen } from '../components/ui/Screen';
import { Txt } from '../components/ui/Text';
import { t, useLocale } from '../i18n';
import * as haptics from '../lib/haptics';
import { ROUTES } from '../lib/routes';
import * as toast from '../lib/toast';
import { useAuthStore } from '../stores/authStore';
import { currentLockSeconds } from '../lib/vault';

const PIN_LENGTH = 6;

export default function Lock() {
  useLocale();
  const router = useRouter();
  const [remaining, setRemaining] = useState<number>(0);
  const [busy, setBusy] = useState<boolean>(false);

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
    let ok = false;
    try {
      ok = await unlockPin(pin);
    } catch {
      setBusy(false);
      toast.error(t('lock.unlockError'));
      return;
    }
    setBusy(false);
    if (ok) {
      haptics.success();
      return;
    }
    const authState = useAuthStore.getState();
    if (authState.lockedForSeconds > 0) {
      setRemaining(authState.lockedForSeconds);
      toast.error(t('lock.tooManyAttempts'));
    } else {
      // Security-critical: give the "attempts remaining" warning a longer dwell.
      toast.show(t('lock.attemptsLeft', { count: authState.attemptsRemaining }), {
        variant: 'error',
        duration: 6000,
      });
    }
  };

  const confirmReset = () => {
    haptics.warn();
    Alert.alert(t('lock.resetTitle'), t('lock.resetBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.continue'), style: 'destructive', onPress: () => router.push(ROUTES.reset) },
    ]);
  };

  return (
    <Screen scroll={false} contentClassName="justify-between">
      <View className="items-center pt-6">
        <Txt variant="display">{BRAND.name}</Txt>
      </View>

      {busy ? (
        <View className="items-center gap-5 py-8">
          <MoonLoader />
          <Txt variant="muted">{t('lock.unlocking')}</Txt>
        </View>
      ) : (
        <View className="gap-3">
          {remaining > 0 ? (
            <Txt className="text-center text-danger">
              {t('lock.lockedRetry', { seconds: remaining })}
            </Txt>
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
            accessibilityLabel={t('lock.resetA11y')}
            style={({ pressed }) => ({
              opacity: pressed ? 0.5 : 1,
              paddingHorizontal: 16,
              paddingVertical: 8,
            })}
          >
            <Txt variant="faint" className="text-center underline">
              {t('lock.resetCta')}
            </Txt>
          </Pressable>
        )}
      </View>
    </Screen>
  );
}
