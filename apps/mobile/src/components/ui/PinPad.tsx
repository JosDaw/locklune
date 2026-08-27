import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as haptics from '../../lib/haptics';
import { colors } from '../../theme/colors';
import { Txt } from './Text';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

/** A single keypad key that plays a tiny radial "splash" from its centre on each
 * press - a circle that expands and fades behind the digit. */
function PinKey({
  label,
  disabled,
  onPress,
}: {
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  const reduceMotion = useReducedMotion();
  // Idle at 0. A press restarts it 0 -> 1: the circle grows from a zero-radius
  // point while fading out. Because scale is 0 at rest (and at the end), the
  // splash is invisible except mid-press - no resting circle behind the digit.
  const splash = useSharedValue(0);

  const handlePress = () => {
    if (!reduceMotion) {
      splash.value = 0;
      splash.value = withTiming(1, { duration: 650 });
    }
    onPress();
  };

  const splashStyle = useAnimatedStyle(() => ({
    transform: [{ scale: splash.value * 1.15 }],
    opacity: (1 - splash.value) * 0.35,
  }));

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label === '⌫' ? 'Delete' : label}
      className="h-20 w-20 items-center justify-center overflow-hidden rounded-full active:bg-surfaceMuted"
    >
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            height: 80,
            width: 80,
            borderRadius: 9999,
            backgroundColor: colors.primary,
          },
          splashStyle,
        ]}
      />
      <Txt variant={label === '⌫' ? 'title' : 'display'} className="text-3xl">
        {label}
      </Txt>
    </Pressable>
  );
}

// A touch of overshoot gives each entered digit a small "pop" as it fills in.
const DOT_SPRING = { damping: 12, stiffness: 260, mass: 0.5 } as const;

/** A single PIN dot: the primary fill springs in when the digit is entered and
 * eases back out on delete. The muted base dot is always visible underneath. */
function PinDot({ filled }: { filled: boolean }) {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(filled ? 1 : 0);

  useEffect(() => {
    const target = filled ? 1 : 0;
    if (reduceMotion) {
      progress.value = target;
    } else {
      progress.value = filled ? withSpring(1, DOT_SPRING) : withTiming(0, { duration: 120 });
    }
  }, [filled, reduceMotion, progress]);

  const fillStyle = useAnimatedStyle(() => ({
    transform: [{ scale: progress.value }],
    opacity: progress.value,
  }));

  return (
    <View className="h-4 w-4 rounded-full bg-surfaceMuted">
      <Animated.View className="h-4 w-4 rounded-full bg-primary" style={fillStyle} />
    </View>
  );
}

export function PinDots({ filled, length }: { filled: number; length: number }) {
  return (
    <View className="flex-row justify-center gap-4">
      {Array.from({ length }).map((_, index) => (
        <PinDot key={index} filled={index < filled} />
      ))}
    </View>
  );
}

/**
 * Numeric PIN entry. Manages its own buffer and fires `onComplete` when `length`
 * digits are entered, then clears itself so it can be reused (e.g. confirm step).
 */
export function PinPad({
  length = 6,
  disabled = false,
  onComplete,
}: {
  length?: number;
  disabled?: boolean;
  onComplete: (pin: string) => void;
}) {
  const [value, setValue] = useState<string>('');

  useEffect(() => {
    if (value.length === length) {
      const entered = value;
      // Intentional: clear the buffer so the pad can be reused (e.g. confirm step).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setValue('');
      onComplete(entered);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, length]);

  const press = (key: string) => {
    if (disabled) return;
    haptics.tap();
    if (key === '⌫') {
      setValue((prev) => prev.slice(0, -1));
    } else if (key !== '') {
      setValue((prev) => (prev.length < length ? prev + key : prev));
    }
  };

  return (
    <View className="gap-8">
      <PinDots filled={value.length} length={length} />
      <View className="flex-row flex-wrap justify-center" style={{ rowGap: 16 }}>
        {KEYS.map((key, index) => (
          <View key={index} className="w-1/3 items-center">
            {key === '' ? (
              <View className="h-20 w-20" />
            ) : (
              <PinKey label={key} disabled={disabled} onPress={() => press(key)} />
            )}
          </View>
        ))}
      </View>
    </View>
  );
}
