import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { Txt } from './ui/Text';
import { colors } from '../theme/colors';

export function SectionLabel({
  icon,
  label,
  labelClass,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  labelClass?: string;
}) {
  return (
    <View className="mb-3 flex-row items-center gap-2">
      <Ionicons name={icon} size={14} color={colors.textFaint} />
      <Txt variant="label" className={labelClass}>
        {label}
      </Txt>
    </View>
  );
}
