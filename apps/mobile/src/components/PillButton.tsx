import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

const PILL_SPRING = { damping: 18, stiffness: 380, mass: 0.45 } as const;

export function PillButton({
  label,
  icon,
  onPress,
  large,
}: {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  large?: boolean;
}) {
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={[anim, { alignSelf: large ? 'center' : 'flex-start', borderRadius: 99 }]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.94, PILL_SPRING);
        }}
        onPressOut={() => {
          scale.value = withSpring(1, PILL_SPRING);
        }}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          paddingHorizontal: large ? 20 : 14,
          paddingVertical: large ? 12 : 8,
          borderRadius: 99,
          backgroundColor: colors.primary,
        }}
      >
        {icon && <Ionicons name={icon} size={18} color={colors.ink} />}
        <Text style={{ fontFamily: fonts.semibold, fontSize: 13, color: colors.ink }}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
