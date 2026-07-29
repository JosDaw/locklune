import { Ionicons } from '@expo/vector-icons';
import { Flow } from '@locklune/core';
import { Pressable, View } from 'react-native';
import { Txt } from './ui/Text';
import { FLOW_OPTIONS } from '../lib/logging';
import { colors } from '../theme/colors';

export function FlowPicker({
  value,
  onChange,
}: {
  value: Flow | null;
  onChange: (f: Flow) => void;
}) {
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {FLOW_OPTIONS.map((o) => {
        const selected = value === o.value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="button"
            accessibilityLabel={o.label}
            style={{
              flex: 1,
              borderRadius: 16,
              paddingVertical: 12,
              gap: 8,
              alignItems: 'center',
              ...(selected
                ? {
                    borderWidth: 1,
                    borderColor: colors.primary,
                    backgroundColor: colors.primarySelected,
                  }
                : { backgroundColor: colors.surfaceMuted }),
            }}
          >
            <View style={{ flexDirection: 'row', gap: 1 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Ionicons
                  key={i}
                  name={i < o.drops ? 'water' : 'water-outline'}
                  size={13}
                  color={
                    i < o.drops
                      ? selected
                        ? colors.primary
                        : colors.textMuted
                      : 'rgba(255,255,255,0.12)'
                  }
                />
              ))}
            </View>
            <Txt className={selected ? 'text-primary-soft' : 'text-text-muted'} variant="faint">
              {o.label}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}
