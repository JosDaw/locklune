import { StyleSheet, View, type DimensionValue } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';

/** Scattered, barely-there stars. Percent positions keep them spread on any screen. */
const STARS: { top: DimensionValue; left: DimensionValue; size: number; opacity: number }[] = [
  { top: '6%', left: '16%', size: 2, opacity: 0.5 },
  { top: '10%', left: '78%', size: 1.5, opacity: 0.4 },
  { top: '18%', left: '40%', size: 1, opacity: 0.35 },
  { top: '24%', left: '88%', size: 2, opacity: 0.45 },
  { top: '32%', left: '10%', size: 1.5, opacity: 0.4 },
  { top: '46%', left: '66%', size: 1, opacity: 0.3 },
  { top: '58%', left: '22%', size: 1.5, opacity: 0.35 },
  { top: '64%', left: '84%', size: 2, opacity: 0.4 },
  { top: '74%', left: '46%', size: 1, opacity: 0.3 },
  { top: '82%', left: '14%', size: 1.5, opacity: 0.35 },
  { top: '88%', left: '72%', size: 1, opacity: 0.3 },
];

/**
 * The app's "moonlight at night" backdrop: a dark navy vertical gradient, a soft
 * moon glow near the top, and a few faint stars. Purely decorative, non-interactive.
 */
export function Background() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={[colors.ink, colors.ink2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {STARS.map((star, index) => (
        <View
          key={index}
          style={{
            position: 'absolute',
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            borderRadius: star.size / 2,
            backgroundColor: colors.star,
            opacity: star.opacity,
          }}
        />
      ))}
    </View>
  );
}
