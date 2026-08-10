import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { colors } from '../theme/colors';

const ARROW_SPRING = { damping: 18, stiffness: 350, mass: 0.5 } as const;

export function ArrowButton({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const reduceMotion = useReducedMotion();
  return (
    <Animated.View style={[styles.arrow, anim]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          if (!reduceMotion) scale.value = withSpring(0.9, ARROW_SPRING);
        }}
        onPressOut={() => {
          scale.value = withSpring(1, ARROW_SPRING);
        }}
        accessibilityRole="button"
        accessibilityLabel={label}
        className="h-11 w-11 items-center justify-center rounded-full border border-border bg-surface"
      >
        <Ionicons name={icon} size={20} color={colors.text} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  arrow: {
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
});
