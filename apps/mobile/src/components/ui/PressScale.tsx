import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

const SPRING = { damping: 18, stiffness: 350, mass: 0.5 } as const;

type Props = PressableProps & { containerStyle?: StyleProp<ViewStyle> };

/** Wraps any Pressable with a gentle spring-scale on press. */
export function PressScale({ children, containerStyle, onPressIn, onPressOut, ...rest }: Props) {
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[containerStyle, anim]}>
      <Pressable
        onPressIn={(e) => {
          scale.value = withSpring(0.95, SPRING);
          onPressIn?.(e);
        }}
        onPressOut={(e) => {
          scale.value = withSpring(1, SPRING);
          onPressOut?.(e);
        }}
        {...rest}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
