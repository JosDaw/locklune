import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import * as haptics from '../../lib/haptics';
import { Txt } from './Text';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

export function PinDots({ filled, length }: { filled: number; length: number }) {
  return (
    <View className="flex-row justify-center gap-4">
      {Array.from({ length }).map((_, index) => (
        <View
          key={index}
          className={`h-4 w-4 rounded-full ${index < filled ? 'bg-primary' : 'bg-surfaceMuted'}`}
        />
      ))}
    </View>
  );
}

/**
 * Numeric PIN entry. Manages its own buffer and fires `onComplete` when `length`
 * digits are entered, then clears itself so it can be reused (e.g. confirm step).
 */
export function PinPad({
  length = 6,
  disabled = false,
  onComplete,
}: {
  length?: number;
  disabled?: boolean;
  onComplete: (pin: string) => void;
}) {
  const [value, setValue] = useState('');

  useEffect(() => {
    if (value.length === length) {
      const entered = value;
      // Intentional: clear the buffer so the pad can be reused (e.g. confirm step).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setValue('');
      onComplete(entered);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, length]);

  const press = (key: string) => {
    if (disabled) return;
    haptics.tap();
    if (key === '⌫') {
      setValue((prev) => prev.slice(0, -1));
    } else if (key !== '') {
      setValue((prev) => (prev.length < length ? prev + key : prev));
    }
  };

  return (
    <View className="gap-8">
      <PinDots filled={value.length} length={length} />
      <View className="flex-row flex-wrap justify-center" style={{ rowGap: 16 }}>
        {KEYS.map((key, index) => (
          <View key={index} className="w-1/3 items-center">
            {key === '' ? (
              <View className="h-20 w-20" />
            ) : (
              <Pressable
                onPress={() => press(key)}
                disabled={disabled}
                accessibilityRole="button"
                accessibilityLabel={key === '⌫' ? 'Delete' : key}
                className="h-20 w-20 items-center justify-center rounded-full active:bg-surfaceMuted"
              >
                <Txt variant={key === '⌫' ? 'title' : 'display'} className="text-3xl">
                  {key}
                </Txt>
              </Pressable>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}
