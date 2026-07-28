import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { colors } from '../../theme/colors';

/**
 * A calm, breathing moon used while the app is busy (unlocking, loading). Purely
 * decorative and device-local - a gentle pulse rather than a spinner, to match
 * Locklune's quiet tone.
 */
export function MoonLoader({ size = 48 }: { size?: number }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [pulse]);

  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] });
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.1] });

  return (
    <Animated.View style={{ opacity, transform: [{ scale }] }}>
      <Ionicons name="moon" size={size} color={colors.primarySoft} />
    </Animated.View>
  );
}
