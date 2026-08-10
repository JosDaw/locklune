import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Mood } from '@locklune/core';
import { Platform, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { MOOD_META } from '../lib/logging';
import { colors } from '../theme/colors';

const MOOD_SPRING = { damping: 15, stiffness: 320, mass: 0.5 } as const;

export function MoodButton({
  option,
  selected,
  onPress,
  expanded,
}: {
  option: { icon: keyof typeof MaterialCommunityIcons.glyphMap; value: Mood };
  selected: boolean;
  onPress: () => void;
  expanded: boolean;
}) {
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const reduceMotion = useReducedMotion();
  const size = expanded ? 52 : 60;
  const color = MOOD_META[option.value]!.color;

  return (
    <Animated.View style={anim}>
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          if (!reduceMotion) scale.value = withSpring(0.9, MOOD_SPRING);
        }}
        onPressOut={() => {
          scale.value = withSpring(1, MOOD_SPRING);
        }}
        accessibilityRole="button"
        accessibilityLabel={`Mood: ${option.value}`}
        accessibilityState={{ selected }}
        style={{
          width: size,
          height: size,
          borderRadius: 999,
          alignItems: 'center',
          justifyContent: 'center',
          ...(selected
            ? {
                backgroundColor: colors.primarySelected,
                borderWidth: 1.5,
                borderColor: colors.primary,
                // elevation on circular Android views creates a hexagonal shadow
                ...(Platform.OS !== 'android' && {
                  shadowColor: color,
                  shadowOpacity: 0.4,
                  shadowRadius: 10,
                  shadowOffset: { width: 0, height: 0 },
                }),
              }
            : { backgroundColor: colors.surfaceMuted }),
        }}
      >
        <MaterialCommunityIcons
          name={option.icon}
          size={expanded ? 26 : 32}
          color={selected ? color : colors.textMuted}
        />
      </Pressable>
    </Animated.View>
  );
}
