import { View } from 'react-native';
import { PressScale } from './ui/PressScale';
import { Txt } from './ui/Text';

export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (selectedValue: T) => void;
}) {
  return (
    <View className="flex-row gap-2">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <PressScale
            key={String(option.value)}
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
