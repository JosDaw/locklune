import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { PressScale } from './ui/PressScale';
import { Txt } from './ui/Text';
import { colors } from '../theme/colors';

export function Stepper({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <View className="flex-row items-center gap-3">
      <PressScale
        onPress={() => onChange(Math.max(min, value - 1))}
        accessibilityRole="button"
        accessibilityLabel="Decrease"
        className="h-10 w-10 items-center justify-center rounded-full bg-surfaceMuted"
      >
        <Ionicons name="remove" size={20} color={colors.text} />
      </PressScale>
      <Txt variant="title" className="w-6 text-center">
        {value}
      </Txt>
      <PressScale
        onPress={() => onChange(Math.min(max, value + 1))}
        accessibilityRole="button"
        accessibilityLabel="Increase"
        className="h-10 w-10 items-center justify-center rounded-full bg-surfaceMuted"
      >
        <Ionicons name="add" size={20} color={colors.text} />
      </PressScale>
    </View>
  );
}
