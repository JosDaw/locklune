import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { fromEpochDay, type DayLog } from '@locklune/core';
import { useRef } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { formatDay } from '../lib/format';
import { MOOD_META } from '../lib/logging';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

export function LogEntry({
  log,
  onPress,
  onDelete,
}: {
  log: DayLog;
  onPress: () => void;
  onDelete: () => void;
}) {
  const moodIcon = log.mood != null ? MOOD_META[log.mood] : null;
  const swipeRef = useRef<Swipeable>(null);

  const renderRightActions = () => (
    <Pressable
      onPress={() => {
        swipeRef.current?.close();
        onDelete();
      }}
      accessibilityRole="button"
      accessibilityLabel="Delete log"
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        width: 72,
        borderRadius: 16,
        backgroundColor: colors.danger,
        marginLeft: 8,
      }}
    >
      <Ionicons name="trash-outline" size={20} color="#fff" />
    </Pressable>
  );

  return (
    <Swipeable ref={swipeRef} renderRightActions={renderRightActions} overshootRight={false}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Log for ${fromEpochDay(log.day).toLocaleDateString()}`}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.surface,
          paddingHorizontal: 14,
          paddingVertical: 10,
        }}
      >
        {/* Date */}
        <Text
          style={{ fontFamily: fonts.medium, fontSize: 13, color: colors.text, flex: 1 }}
          numberOfLines={1}
        >
          {formatDay(log.day, { weekday: 'short', month: 'short', day: 'numeric' })}
        </Text>

        {/* Flow drops */}
        {log.flow != null && (
          <View style={{ flexDirection: 'row', gap: 2 }}>
            {[1, 2, 3, 4].map((level) => (
              <Ionicons
                key={level}
                name="water"
                size={11}
                color={level <= log.flow! ? colors.period : colors.period + '28'}
              />
            ))}
          </View>
        )}

        {/* Mood icon */}
        {moodIcon && (
          <MaterialCommunityIcons name={moodIcon.icon} size={16} color={moodIcon.color} />
        )}

        {/* Symptoms indicator */}
        {log.symptoms.length > 0 && (
          <Ionicons name="pulse-outline" size={14} color={colors.textFaint} />
        )}

        {/* Note indicator */}
        {log.note && <Ionicons name="document-text-outline" size={14} color={colors.textFaint} />}
      </Pressable>
    </Swipeable>
  );
}
