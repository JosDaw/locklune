import { View } from 'react-native';
import { Switch } from './gs/switch';
import { Txt } from './ui/Text';

export function NotifRow({
  label,
  hint,
  value,
  onValueChange,
}: {
  label: string;
  hint: string;
  value: boolean;
  onValueChange: (enabled: boolean) => void;
}) {
  return (
    <View className="flex-row items-center justify-between gap-4 rounded-2xl border border-border bg-surface px-4 py-3">
      <View className="flex-1">
        <Txt variant="body">{label}</Txt>
        <Txt variant="faint">{hint}</Txt>
      </View>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );
}
