import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { PressScale } from './ui/PressScale';
import { Txt } from './ui/Text';
import { colors } from '../theme/colors';

export function ModeRow({
  label,
  hint,
  active,
  onPress,
}: {
  label: string;
  hint: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <PressScale
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: active }}
      accessibilityLabel={label}
      accessibilityHint={hint}
      className="flex-row items-center gap-3 py-2.5"
    >
      <View
        className={`h-5 w-5 items-center justify-center rounded-full border ${active ? 'border-primary bg-primary' : 'border-border'}`}
        style={
          active
            ? {
                shadowColor: colors.primary,
                shadowOpacity: 0.4,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 0 },
              }
            : undefined
        }
      >
        {active && <Ionicons name="checkmark" size={13} color={colors.ink} />}
      </View>
      <View className="flex-1">
        <Txt variant="body">{label}</Txt>
        <Txt variant="faint">{hint}</Txt>
      </View>
    </PressScale>
  );
}
