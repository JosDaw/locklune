import { StyleSheet, View, type DimensionValue } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';

/** Concentric soft circles fake a radial moon-glow (RN gradients are linear only). */
const GLOW = [
  { size: 380, opacity: 0.05 },
  { size: 280, opacity: 0.06 },
  { size: 180, opacity: 0.08 },
];

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
      <View style={styles.glowWrap} pointerEvents="none">
        {GLOW.map((g) => (
          <View
            key={g.size}
            style={{
              position: 'absolute',
              width: g.size,
              height: g.size,
              borderRadius: g.size / 2,
              backgroundColor: colors.primary,
              opacity: g.opacity,
            }}
          />
        ))}
      </View>
      {STARS.map((s, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            borderRadius: s.size / 2,
            backgroundColor: colors.star,
            opacity: s.opacity,
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  glowWrap: {
    position: 'absolute',
    top: -140,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    height: 380,
  },
});
