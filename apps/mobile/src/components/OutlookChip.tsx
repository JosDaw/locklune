import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { Txt } from './ui/Text';
import { colors } from '../theme/colors';

export function OutlookChip({
  icon,
  iconColor,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  value: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        borderRadius: 20,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 14,
        gap: 8,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Ionicons name={icon} size={14} color={iconColor} />
        <Txt variant="label">{label}</Txt>
      </View>
      <Txt variant="body">{value}</Txt>
    </View>
  );
}
