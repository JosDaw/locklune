import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Manrope_600SemiBold, Manrope_700Bold } from '@expo-google-fonts/manrope';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { GluestackUIProvider } from '../components/gs/gluestack-ui-provider';
import { ToastProvider } from '../components/ui/Toast';
import '../global.css';
import { AUTH_STATUS, useAuthStore } from '../stores/authStore';
import { useDataStore } from '../stores/dataStore';
import { colors } from '../theme/colors';

// Keep the native splash visible until we're ready - prevents the black frame
// between the native splash hiding and the first meaningful React render.
void SplashScreen.preventAutoHideAsync();

function useAuthRouting() {
  const status = useAuthStore((store) => store.status);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (status === AUTH_STATUS.Loading) return;
    const root = segments[0];
    if (status === AUTH_STATUS.Onboarding && root !== 'onboarding') {
      router.replace('/onboarding');
    } else if (status === AUTH_STATUS.Locked && root !== 'lock' && root !== 'reset') {
      // Allow the lock screen's "reset & start over" route while locked.
      router.replace('/lock');
    } else if (
      status === AUTH_STATUS.Unlocked &&
      (root === 'lock' || root === 'onboarding' || root === undefined)
    ) {
      router.replace('/(tabs)');
    }
  }, [status, segments, router]);
}

/** react-native AppState values the auto-lock handler branches on. */
const APP_STATE = {
  Background: 'background',
  Inactive: 'inactive',
  Active: 'active',
} as const;

/** Auto-lock after the app has been backgrounded longer than the user's timeout. */
function useAutoLock() {
  const autoLockMinutes = useDataStore((store) => store.settings.autoLockMinutes);
  const backgroundedAt = useRef<number | null>(null);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next === APP_STATE.Background || next === APP_STATE.Inactive) {
        if (useAuthStore.getState().status === AUTH_STATUS.Unlocked)
          backgroundedAt.current = Date.now();
      } else if (next === APP_STATE.Active) {
        const since = backgroundedAt.current;
        backgroundedAt.current = null;
        if (since && useAuthStore.getState().status === AUTH_STATUS.Unlocked) {
          const minutes = (Date.now() - since) / 60000;
          if (minutes >= autoLockMinutes) void useAuthStore.getState().lock();
        }
      }
    });
    return () => sub.remove();
  }, [autoLockMinutes]);
}

export default function RootLayout() {
  const init = useAuthStore((store) => store.init);
  const authStatus = useAuthStore((store) => store.status);
  const [fontsLoaded] = useFonts({
    Manrope_600SemiBold,
    Manrope_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    // Preload the icon glyph fonts too, so the very first screens (loading /
    // "Unlocking…") render their Ionicons moon instead of a blank glyph before the
    // icon font has finished loading on its own.
    ...Ionicons.font,
    ...MaterialCommunityIcons.font,
  });

  useEffect(() => {
    void init();
  }, [init]);

  useAuthRouting();
  useAutoLock();

  const ready = fontsLoaded && authStatus !== AUTH_STATUS.Loading;

  // Keep the native splash up (by rendering null) until fonts + vault init are
  // done, then dismiss it only after the first real frame has laid out. Hiding it
  // in a bare effect can reveal a blank frame before content paints; onLayout
  // guarantees the first screen is on-screen first, so there is no black gap.
  const onLayoutRootView = useCallback(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView
      style={{ flex: 1, backgroundColor: colors.ink }}
      onLayout={onLayoutRootView}
    >
      <GluestackUIProvider mode="dark">
        <SafeAreaProvider>
          <StatusBar style="light" />
          <ToastProvider>
            <ErrorBoundary>
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
            </ErrorBoundary>
          </ToastProvider>
        </SafeAreaProvider>
      </GluestackUIProvider>
    </GestureHandlerRootView>
  );
}
