import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { Txt } from './ui/Text';

export function LegendChip({
  icon,
  iconColor,
  dotColor,
  label,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  dotColor?: string;
  label: string;
}) {
  return (
    <View className="flex-row items-center gap-2 rounded-full border border-border bg-surface px-3 py-2">
      {icon && iconColor ? (
        <Ionicons name={icon} size={13} color={iconColor} />
      ) : dotColor ? (
        <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: dotColor }} />
      ) : null}
      <Txt variant="faint" className="text-text-muted">
        {label}
      </Txt>
    </View>
  );
}
