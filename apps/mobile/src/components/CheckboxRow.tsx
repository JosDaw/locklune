import { Ionicons } from '@expo/vector-icons';
import { type ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { colors } from '../theme/colors';

export function CheckboxRow({
  checked,
  onToggle,
  children,
}: {
  checked: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <View className="flex-row items-start gap-3">
      <Pressable
        onPress={onToggle}
        hitSlop={8}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        className={`mt-0.5 h-6 w-6 items-center justify-center rounded-md border-2 ${checked ? 'border-primary bg-primary' : 'border-surfaceMuted'}`}
      >
        {checked && <Ionicons name="checkmark" size={16} color={colors.ink} />}
      </Pressable>
      <View className="flex-1">{children}</View>
    </View>
  );
}
