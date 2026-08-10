import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PinPad } from '../components/ui/PinPad';
import { Screen } from '../components/ui/Screen';
import { Txt } from '../components/ui/Text';
import { t, useLocale } from '../i18n';
import { colors } from '../theme/colors';
import * as haptics from '../lib/haptics';
import * as toast from '../lib/toast';
import { useAuthStore } from '../stores/authStore';

const PIN_LENGTH = 6;
type Phase = 'current' | 'new' | 'confirm';

const PROMPT_KEYS: Record<Phase, string> = {
  current: 'changePin.promptCurrent',
  new: 'changePin.promptNew',
  confirm: 'changePin.promptConfirm',
};

export default function ChangePin() {
  useLocale();
  const router = useRouter();
  const changePin = useAuthStore((store) => store.changePin);

  const [phase, setPhase] = useState<Phase>('current');
  const [currentPin, setCurrentPin] = useState<string>('');
  const [newPin, setNewPin] = useState<string>('');
  const [busy, setBusy] = useState<boolean>(false);

  const reset = () => {
    setPhase('current');
    setCurrentPin('');
    setNewPin('');
  };

  const handleComplete = async (pin: string) => {
    if (busy) return;
    if (phase === 'current') {
      setCurrentPin(pin);
      setPhase('new');
    } else if (phase === 'new') {
      setNewPin(pin);
      setPhase('confirm');
    } else {
      if (pin !== newPin) {
        toast.error(t('changePin.mismatch'));
        reset();
        return;
      }
      setBusy(true);
      let ok = false;
      try {
        ok = await changePin(currentPin, pin);
      } catch {
        setBusy(false);
        toast.error(t('changePin.changeError'));
        reset();
        return;
      }
      setBusy(false);
      if (!ok) {
        toast.error(t('changePin.currentIncorrect'));
        reset();
        return;
      }
      haptics.success();
      Alert.alert(t('changePin.updatedTitle'), t('changePin.updatedBody'));
      router.back();
    }
  };

  return (
    <Screen scroll={false} contentClassName="justify-between">
      <View className="flex-row items-center justify-between pt-2">
        <Txt variant="title">{t('changePin.title')}</Txt>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
          className="h-9 w-9 items-center justify-center rounded-full bg-surfaceMuted"
        >
          <Ionicons name="close" size={20} color={colors.text} />
        </Pressable>
      </View>

      <View className="items-center">
        <Txt variant="muted">{t(PROMPT_KEYS[phase])}</Txt>
      </View>

      <View className="gap-3">
        <View className="h-5" />
        <PinPad length={PIN_LENGTH} disabled={busy} onComplete={handleComplete} />
      </View>

      <View className="h-10" />
    </Screen>
  );
}
