import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { t, useLocale } from '../i18n';
import { SYMPTOM_CATEGORIES, symptomLabel } from '../lib/logging';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

export function SymptomPicker({
  symptoms,
  onToggle,
  customSymptoms = [],
}: {
  symptoms: string[];
  onToggle: (symptom: string) => void;
  customSymptoms?: string[];
}) {
  useLocale();
  const allCategories = useMemo(() => {
    if (customSymptoms.length === 0) return SYMPTOM_CATEGORIES;
    return [
      ...SYMPTOM_CATEGORIES,
      {
        nameKey: 'data.symptomCategory.custom',
        icon: 'pricetag-outline' as keyof typeof Ionicons.glyphMap,
        items: customSymptoms,
      },
    ];
  }, [customSymptoms]);

  const [cat, setCat] = useState<number>(0);
  const safecat = cat < allCategories.length ? cat : 0;
  const items = allCategories[safecat]!.items;

  return (
    <View style={{ gap: 12 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {allCategories.map((category, index) => {
          const active = safecat === index;
          return (
            <Pressable
              key={category.nameKey}
              onPress={() => setCat(index)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={t(category.nameKey)}
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
                  {t(category.nameKey)}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {items.map((symptom) => {
          const active = symptoms.includes(symptom);
          return (
            <Pressable
              key={symptom}
              onPress={() => onToggle(symptom)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={symptomLabel(symptom)}
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
                {symptomLabel(symptom)}
              </Text>
            </Pressable>
          );
        })}
        {items.length === 0 && (
          <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: colors.textFaint }}>
            {t('symptomPicker.noCustom')}
          </Text>
        )}
      </View>

      {symptoms.length > 0 && (
        <Text style={{ fontFamily: fonts.regular, fontSize: 11, color: colors.textFaint }}>
          {t('symptomPicker.selected', { list: symptoms.map(symptomLabel).join(', ') })}
        </Text>
      )}
    </View>
  );
}
