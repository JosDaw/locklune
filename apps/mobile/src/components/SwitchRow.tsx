import { View } from 'react-native';
import { Switch } from './gs/switch';
import { Txt } from './ui/Text';
import { colors } from '../theme/colors';

export function SwitchRow({
  label,
  hint,
  value,
  onValueChange,
}: {
  label: string;
  hint?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <View className="flex-row items-center justify-between py-2">
      <View className="flex-1 pr-4">
        <Txt variant="body">{label}</Txt>
        {hint && <Txt variant="faint">{hint}</Txt>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.surfaceMuted, true: colors.primary }}
        thumbColor={colors.moon}
      />
    </View>
  );
}
