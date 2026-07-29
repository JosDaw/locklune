import { View } from 'react-native';
import { Txt } from './ui/Text';
import { colors } from '../theme/colors';

export function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <View
      className="flex-1 items-center gap-2 rounded-2xl py-4"
      style={{
        backgroundColor: colors.primaryTint,
        borderWidth: 1,
        borderColor: colors.primaryTintBorder,
      }}
    >
      <Txt variant="heading" className="text-primary-soft">
        {value}
      </Txt>
      <Txt variant="faint">{label}</Txt>
    </View>
  );
}
