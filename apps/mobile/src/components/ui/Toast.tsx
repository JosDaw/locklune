import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { setToastHandler, type ToastVariant } from '../../lib/toast';

interface ToastState {
  message: string;
  variant: ToastVariant;
}

const ACCENT: Record<ToastVariant, string> = {
  error: colors.danger,
  success: colors.success,
  info: colors.primary,
};

/**
 * Hosts a single top-anchored toast and wires the imperative `toast.*` API
 * (see `lib/toast.ts`) to it. Built from plain primitives + RN Animated so it
 * has no gluestack dependency and can't itself be a source of crashes.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastState | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-12)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 160, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: -12, duration: 160, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) setToast(null);
    });
  };

  useEffect(() => {
    setToastHandler((message, opts) => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      setToast({ message, variant: opts.variant });
      opacity.setValue(0);
      translateY.setValue(-12);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start();
      hideTimer.current = setTimeout(dismiss, opts.duration);
    });
    return () => {
      setToastHandler(null);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.root}>
      {children}
      {toast && (
        <Animated.View
          pointerEvents="box-none"
          style={[styles.wrap, { top: insets.top + 8, opacity, transform: [{ translateY }] }]}
        >
          <Pressable
            onPress={dismiss}
            accessibilityRole="alert"
            accessibilityLabel={toast.message}
            style={[styles.toast, { borderColor: ACCENT[toast.variant] }]}
          >
            <View style={[styles.dot, { backgroundColor: ACCENT[toast.variant] }]} />
            <Text style={styles.text}>{toast.message}</Text>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    maxWidth: 480,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  text: { flex: 1, color: colors.text, fontSize: 14, lineHeight: 19 },
});
