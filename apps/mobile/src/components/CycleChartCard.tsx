import type { Cycle } from '@locklune/core';
import { useWindowDimensions, View } from 'react-native';
import Svg, { Line, Rect } from 'react-native-svg';
import { Txt } from './ui/Text';
import { colors } from '../theme/colors';
import { CARD_SHADOW } from '../theme/shadows';

export function CycleChartCard({ cycles }: { cycles: Cycle[] }) {
  const { width } = useWindowDimensions();

  const lengths: number[] = [];
  for (let index = 1; index < cycles.length; index++) {
    lengths.push(cycles[index].startDay - cycles[index - 1].startDay);
  }
  const recent = lengths.slice(-12);
  if (recent.length < 2) return null;

  const avg = recent.reduce((sum, length) => sum + length, 0) / recent.length;
  const THRESHOLD = 0.15;
  const minLen = Math.max(14, Math.min(...recent) - 2);
  const maxLen = Math.min(60, Math.max(...recent) + 2);
  const range = Math.max(1, maxLen - minLen);

  const cardPad = 20;
  const screenPad = 32;
  const availW = width - screenPad - cardPad * 2;
  const chartH = 72;
  const gap = 4;
  const barW = (availW - gap * (recent.length - 1)) / recent.length;

  const barH = (len: number) => Math.max(4, ((len - minLen) / range) * (chartH - 12) + 4);
  const avgBarH = barH(avg);
  const avgY = chartH - avgBarH;

  const hasIrregular = recent.some((length) => Math.abs(length - avg) / avg > THRESHOLD);

  return (
    <View
      style={{
        borderRadius: 20,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: cardPad,
        gap: 10,
        ...CARD_SHADOW,
      }}
    >
      <View
        style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}
      >
        <Txt variant="label">Cycle lengths</Txt>
        <Txt variant="faint">avg {Math.round(avg)} days</Txt>
      </View>
      <Svg width={availW} height={chartH}>
        <Line
          x1={0}
          y1={avgY}
          x2={availW}
          y2={avgY}
          stroke={colors.avgLine}
          strokeWidth={1}
          strokeDasharray="4 4"
        />
        {recent.map((length, index) => {
          const irregular = Math.abs(length - avg) / avg > THRESHOLD;
          const barHeight = barH(length);
          const barX = index * (barW + gap);
          const barY = chartH - barHeight;
          return (
            <Rect
              key={index}
              x={barX}
              y={barY}
              width={barW}
              height={barHeight}
              rx={3}
              fill={irregular ? colors.danger : colors.primary}
              opacity={0.85}
            />
          );
        })}
      </Svg>
      {hasIrregular && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger }} />
          <Txt variant="faint">outside usual range (±15%)</Txt>
        </View>
      )}
    </View>
  );
}
