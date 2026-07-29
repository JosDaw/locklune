import { View } from 'react-native';
import { PressScale } from './ui/PressScale';
import { Txt } from './ui/Text';

export function Segmented({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: number }[];
  value: number;
  onChange: (selectedValue: number) => void;
}) {
  return (
    <View className="flex-row gap-2">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <PressScale
            key={option.value}
            containerStyle={{ flex: 1 }}
            onPress={() => onChange(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={option.label}
            className={`items-center rounded-xl py-2 ${active ? 'bg-primary' : 'bg-surfaceMuted'}`}
          >
            <Txt className={active ? 'text-ink' : 'text-text-muted'}>{option.label}</Txt>
          </PressScale>
        );
      })}
    </View>
  );
}
