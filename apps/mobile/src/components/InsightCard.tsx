import { Ionicons } from '@expo/vector-icons';
import type { Cycle, EpochDay, Prediction, Settings } from '@locklune/core';
import { View } from 'react-native';
import { Txt } from './ui/Text';
import { colors } from '../theme/colors';

function computeInsight(
  cycles: Cycle[],
  prediction: Prediction,
  _settings: Settings,
  today: EpochDay,
): string {
  if (cycles.length === 0) return 'Log your first period to begin tracking.';
  if (prediction.usingDefaults) return 'Accuracy increases as you log more cycles.';

  const next = prediction.upcoming[0];
  if (next) {
    const toPeriod = next.periodStart - today;
    if (toPeriod >= 0 && toPeriod <= 2) return 'Your period is expected very soon.';
    if (prediction.fertilityApplicable) {
      if (today >= next.fertileWindow.start && today <= next.fertileWindow.end) {
        return "You're in your estimated fertile window.";
      }
      const toFertile = next.fertileWindow.start - today;
      if (toFertile > 0 && toFertile <= 5) {
        return `Your fertile window begins in ${toFertile} day${toFertile === 1 ? '' : 's'}.`;
      }
    }
  }

  // Irregular cycle alert - check last completed cycle
  if (cycles.length >= 3 && !prediction.usingDefaults) {
    const lastLen = cycles[cycles.length - 1].startDay - cycles[cycles.length - 2].startDay;
    const avg = prediction.averageCycleLength;
    if (lastLen > avg * 1.15 || lastLen < avg * 0.85) {
      return `Your last cycle was ${lastLen} days - outside your usual ${Math.round(avg)}-day average.`;
    }
  }

  if (prediction.cyclesAnalyzed < 3) {
    return 'Logging a few more cycles will improve your predictions.';
  }
  return `Your ${Math.round(prediction.averageCycleLength)}-day cycle is well established.`;
}

export function InsightCard({
  cycles,
  prediction,
  settings,
  today,
}: {
  cycles: Cycle[];
  prediction: Prediction;
  settings: Settings;
  today: EpochDay;
}) {
  const insight = computeInsight(cycles, prediction, settings, today);
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        borderRadius: 16,
        backgroundColor: colors.primaryTint,
        borderWidth: 1,
        borderColor: colors.primaryHairline,
        paddingHorizontal: 14,
        paddingVertical: 10,
      }}
    >
      <View style={{ paddingTop: 2 }}>
        <Ionicons name="moon-outline" size={14} color={colors.primarySoft} />
      </View>
      <Txt variant="faint" className="flex-1">
        {insight}
      </Txt>
    </View>
  );
}
