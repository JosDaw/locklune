import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SYMPTOM_CATEGORIES } from '../lib/logging';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

export function SymptomPicker({
  symptoms,
  onToggle,
  customSymptoms = [],
}: {
  symptoms: string[];
  onToggle: (s: string) => void;
  customSymptoms?: string[];
}) {
  const allCategories = useMemo(() => {
    if (customSymptoms.length === 0) return SYMPTOM_CATEGORIES;
    return [
      ...SYMPTOM_CATEGORIES,
      {
        name: 'Custom',
        icon: 'pricetag-outline' as keyof typeof Ionicons.glyphMap,
        items: customSymptoms,
      },
    ];
  }, [customSymptoms]);

  const [cat, setCat] = useState(0);
  const safecat = cat < allCategories.length ? cat : 0;
  const items = allCategories[safecat]!.items;

  return (
    <View style={{ gap: 12 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {allCategories.map((category, i) => {
          const active = safecat === i;
          return (
            <Pressable
              key={category.name}
              onPress={() => setCat(i)}
              style={{
                borderRadius: 99,
                paddingHorizontal: 12,
                paddingVertical: 6,
                backgroundColor: active ? colors.primary : colors.surfaceMuted,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <Ionicons
                  name={category.icon}
                  size={12}
                  color={active ? colors.ink : colors.textMuted}
                />
                <Text
                  style={{
                    fontFamily: fonts.medium,
                    fontSize: 12,
                    color: active ? colors.ink : colors.textMuted,
                  }}
                >
                  {category.name}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {items.map((s) => {
          const active = symptoms.includes(s);
          return (
            <Pressable
              key={s}
              onPress={() => onToggle(s)}
              style={{
                borderRadius: 99,
                paddingHorizontal: 14,
                paddingVertical: 8,
                backgroundColor: active ? colors.primary : colors.surfaceMuted,
              }}
            >
              <Text
                style={{
                  fontFamily: fonts.medium,
                  fontSize: 13,
                  color: active ? colors.ink : colors.textMuted,
                }}
              >
                {s}
              </Text>
            </Pressable>
          );
        })}
        {items.length === 0 && (
          <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: colors.textFaint }}>
            No custom symptoms yet. Add them in Settings.
          </Text>
        )}
      </View>

      {symptoms.length > 0 && (
        <Text style={{ fontFamily: fonts.regular, fontSize: 11, color: colors.textFaint }}>
          Selected: {symptoms.join(', ')}
        </Text>
      )}
    </View>
  );
}
