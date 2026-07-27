import '../global.css';
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GluestackUIProvider } from '../components/gs/gluestack-ui-provider';
import { colors } from '../theme/colors';
import { useAuthStore } from '../stores/authStore';
import { useDataStore } from '../stores/dataStore';

function useAuthRouting() {
  const status = useAuthStore((s) => s.status);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    const root = segments[0];
    if (status === 'onboarding' && root !== 'onboarding') {
      router.replace('/onboarding');
    } else if (status === 'locked' && root !== 'lock') {
      router.replace('/lock');
    } else if (
      status === 'unlocked' &&
      (root === 'lock' || root === 'onboarding' || root === undefined)
    ) {
      router.replace('/(tabs)');
    }
  }, [status, segments, router]);
}

/** Auto-lock after the app has been backgrounded longer than the user's timeout. */
function useAutoLock() {
  const autoLockMinutes = useDataStore((s) => s.settings.autoLockMinutes);
  const backgroundedAt = useRef<number | null>(null);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'background' || next === 'inactive') {
        if (useAuthStore.getState().status === 'unlocked') backgroundedAt.current = Date.now();
      } else if (next === 'active') {
        const since = backgroundedAt.current;
        backgroundedAt.current = null;
        if (since && useAuthStore.getState().status === 'unlocked') {
          const minutes = (Date.now() - since) / 60000;
          if (minutes >= autoLockMinutes) void useAuthStore.getState().lock();
        }
      }
    });
    return () => sub.remove();
  }, [autoLockMinutes]);
}

export default function RootLayout() {
  const init = useAuthStore((s) => s.init);

  useEffect(() => {
    void init();
  }, [init]);

  useAuthRouting();
  useAutoLock();

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.ink }}>
      <GluestackUIProvider mode="dark">
        <SafeAreaProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.ink },
              animation: 'fade',
            }}
          >
            <Stack.Screen
              name="log"
              options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
            />
          </Stack>
        </SafeAreaProvider>
      </GluestackUIProvider>
    </GestureHandlerRootView>
  );
}
