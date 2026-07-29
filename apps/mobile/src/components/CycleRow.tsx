import { Ionicons } from '@expo/vector-icons';
import type { Cycle } from '@locklune/core';
import { Pressable, View } from 'react-native';
import { Txt } from './ui/Text';
import { formatDay } from '../lib/format';
import { colors } from '../theme/colors';

export function CycleRow({ cycle, onDelete }: { cycle: Cycle; onDelete: () => void }) {
  const end = cycle.endDay;
  const length = end != null ? end - cycle.startDay + 1 : null;
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-1 pr-3">
        <Txt variant="body">
          {formatDay(cycle.startDay, opts)}
          {end != null ? ` – ${formatDay(end, opts)}` : ''}
        </Txt>
        <Txt variant="faint">{length != null ? `${length}-day period` : 'Ongoing'}</Txt>
      </View>
      <Pressable
        onPress={onDelete}
        accessibilityRole="button"
        accessibilityLabel={`Delete period starting ${formatDay(cycle.startDay)}`}
        hitSlop={8}
        className="h-9 w-9 items-center justify-center rounded-full active:bg-surfaceMuted"
      >
        <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
      </Pressable>
    </View>
  );
}
