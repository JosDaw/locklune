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
  onChange: (v: number) => void;
}) {
  return (
    <View className="flex-row gap-2">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <PressScale
            key={o.value}
            containerStyle={{ flex: 1 }}
            onPress={() => onChange(o.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={o.label}
            className={`items-center rounded-xl py-2 ${active ? 'bg-primary' : 'bg-surfaceMuted'}`}
          >
            <Txt className={active ? 'text-ink' : 'text-text-muted'}>{o.label}</Txt>
          </PressScale>
        );
      })}
    </View>
  );
}
