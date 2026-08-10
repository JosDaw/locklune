import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Txt } from './ui/Text';
import { t, useLocale } from '../i18n';
import { colors } from '../theme/colors';

const LOG_SPRING = { damping: 18, stiffness: 380, mass: 0.45 } as const;

export function LogTodayButton({ onPress }: { onPress: () => void }) {
  useLocale();
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const reduceMotion = useReducedMotion();
  return (
    <Animated.View style={[anim, { borderRadius: 20 }]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          if (!reduceMotion) scale.value = withSpring(0.96, LOG_SPRING);
        }}
        onPressOut={() => {
          scale.value = withSpring(1, LOG_SPRING);
        }}
        accessibilityRole="button"
        accessibilityLabel={t('misc.logToday')}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          paddingVertical: 18,
          paddingHorizontal: 24,
          borderRadius: 20,
          backgroundColor: colors.primary,
          shadowColor: colors.primary,
          shadowOpacity: 0.45,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 6 },
          elevation: 8,
        }}
      >
        <Ionicons name="pencil-outline" size={20} color={colors.ink} />
        <Txt className="text-ink text-base font-semibold">{t('misc.logToday')}</Txt>
      </Pressable>
    </Animated.View>
  );
}
