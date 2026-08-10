import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

const SPRING = { damping: 18, stiffness: 350, mass: 0.5 } as const;

type Props = PressableProps & { containerStyle?: StyleProp<ViewStyle> };

/** Wraps any Pressable with a gentle spring-scale on press. */
export function PressScale({ children, containerStyle, onPressIn, onPressOut, ...rest }: Props) {
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const reduceMotion = useReducedMotion();

  return (
    <Animated.View style={[containerStyle, anim]}>
      <Pressable
        onPressIn={(event) => {
          if (!reduceMotion) scale.value = withSpring(0.95, SPRING);
          onPressIn?.(event);
        }}
        onPressOut={(event) => {
          scale.value = withSpring(1, SPRING);
          onPressOut?.(event);
        }}
        {...rest}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
