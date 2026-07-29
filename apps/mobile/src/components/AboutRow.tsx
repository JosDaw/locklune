import { Ionicons } from '@expo/vector-icons';
import { PressScale } from './ui/PressScale';
import { Txt } from './ui/Text';
import { colors } from '../theme/colors';

export function AboutRow({
  icon,
  label,
  onPress,
  last,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <PressScale
      onPress={onPress}
      accessibilityRole="button"
      className={`flex-row items-center gap-3 py-3 ${last ? '' : 'border-b border-border'}`}
    >
      <Ionicons name={icon} size={18} color={colors.primarySoft} />
      <Txt variant="body" className="flex-1">
        {label}
      </Txt>
      <Ionicons name="open-outline" size={16} color={colors.textMuted} />
    </PressScale>
  );
}
