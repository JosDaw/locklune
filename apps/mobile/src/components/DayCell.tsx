import { Ionicons } from '@expo/vector-icons';
import { fromEpochDay, type EpochDay } from '@locklune/core';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle as SvgCircle } from 'react-native-svg';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

// Trimester day boundaries from LMP (= dueDay − 280).
const PREGNANCY_DAYS = 280;
const T1_END_DAY = 83;   // weeks 1–12
const T2_END_DAY = 188;  // weeks 13–26, T3 is 189–279

const T1_COLOR = 'rgba(52, 211, 153, 0.18)';
const T2_COLOR = 'rgba(251, 191, 36, 0.18)';
const T3_COLOR = 'rgba(167, 139, 250, 0.18)';
export const DUE_COLOR = 'rgba(139, 92, 246, 0.6)';
export { T1_COLOR, T2_COLOR, T3_COLOR };

export function DayCell({
  day,
  isToday,
  isPeriod,
  isPredicted,
  isFertile,
  isOvulation,
  hasLog,
  pregnantDueDay,
  onPress,
}: {
  day: EpochDay | null;
  isToday: boolean;
  isPeriod: boolean;
  isPredicted: boolean;
  isFertile: boolean;
  isOvulation: boolean;
  hasLog: boolean;
  pregnantDueDay: EpochDay | null;
  onPress: () => void;
}) {
  if (day === null) return <View style={{ flex: 1, padding: 6, aspectRatio: 1 }} />;

  // Pregnancy trimester coloring takes precedence over cycle coloring.
  let trimesterBg: string | null = null;
  let isDueDay = false;
  if (pregnantDueDay !== null) {
    const lmp = pregnantDueDay - PREGNANCY_DAYS;
    const daysPreg = day - lmp;
    if (day === pregnantDueDay) {
      isDueDay = true;
      trimesterBg = DUE_COLOR;
    } else if (daysPreg >= 0 && daysPreg < PREGNANCY_DAYS) {
      if (daysPreg <= T1_END_DAY) trimesterBg = T1_COLOR;
      else if (daysPreg <= T2_END_DAY) trimesterBg = T2_COLOR;
      else trimesterBg = T3_COLOR;
    }
  }

  let textColor: string = colors.text;
  let bgColor: string | undefined;
  // Solid border rendered via CSS (works reliably for solid styles + borderRadius)
  let solidBorder: { borderWidth: number; borderColor: string } | undefined;
  // Whether to draw a dashed SVG circle overlay (CSS dashed+borderRadius is broken on Android)
  let dashedSvgColor: string | undefined;

  if (trimesterBg !== null) {
    bgColor = trimesterBg;
    if (isDueDay) { textColor = '#FFFFFF'; }
  } else {
    if (isPeriod) {
      bgColor = colors.period;
      textColor = colors.ink;
    } else if (isPredicted) {
      bgColor = colors.predictedFill;
    }

    if (!isPeriod && !isToday) {
      if (isPredicted) {
        // Use SVG dashed circle - CSS borderStyle:'dashed'+borderRadius is broken on Android
        dashedSvgColor = colors.predictedRing;
      }
    }
  }

  if (isToday && !isPeriod) {
    solidBorder = { borderWidth: 1.5, borderColor: colors.primarySoft };
  }

  const states = [
    isToday && 'today',
    isPeriod && 'period',
    isDueDay && 'due date',
    trimesterBg && !isDueDay && 'pregnancy',
    !isPeriod && isPredicted && 'predicted period',
    isOvulation ? 'estimated ovulation' : isFertile && 'fertile window',
    hasLog && 'has a log',
  ].filter(Boolean);
  const label = [
    fromEpochDay(day).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }),
    ...states,
  ].join(', ');

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{ flex: 1, padding: 6, aspectRatio: 1 }}
    >
      {/*
        overflow:'hidden' + borderRadius guarantees the background is clipped to a
        circle on Android - no style-array merging, no elevation interference.
        Solid borders sit on this same view; they render correctly with borderRadius.
      */}
      <View
        style={{
          flex: 1,
          borderRadius: 9999,
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: bgColor,
          ...solidBorder,
        }}
      >
        <Text style={{ fontFamily: fonts.medium, fontSize: 14, color: textColor }}>
          {fromEpochDay(day).getDate()}
        </Text>
        {(hasLog || isOvulation || isFertile) && (
          <View style={styles.indicators}>
            {isOvulation && (
              <Ionicons name="leaf" size={8} color={colors.ovulation} />
            )}
            {isFertile && !isOvulation && (
              <Ionicons name="star" size={7} color={colors.fertile} />
            )}
            {hasLog && (
              <Ionicons
                name="moon"
                size={7}
                color={isPeriod || isDueDay ? 'rgba(255,255,255,0.55)' : colors.primarySoft}
              />
            )}
          </View>
        )}
      </View>
      {/*
        SVG dashed circle - absolutely covers the cell, drawn on top of the content
        view. SVG strokes handle dashes + curvature correctly on every platform.
      */}
      {dashedSvgColor !== undefined && (
        <Svg
          style={{ position: 'absolute', top: 6, left: 6, right: 6, bottom: 6 }}
          viewBox="0 0 100 100"
        >
          <SvgCircle
            cx={50}
            cy={50}
            r={47}
            fill="none"
            stroke={dashedSvgColor}
            strokeWidth={3}
            strokeDasharray="10 7"
          />
        </Svg>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  indicators: {
    position: 'absolute',
    bottom: 4,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
  },
});
