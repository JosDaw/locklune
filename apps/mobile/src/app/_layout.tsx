import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Manrope_600SemiBold, Manrope_700Bold } from '@expo-google-fonts/manrope';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { AppState, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { GluestackUIProvider } from '../components/gs/gluestack-ui-provider';
import { MoonLoader } from '../components/ui/MoonLoader';
import { ToastProvider } from '../components/ui/Toast';
import '../global.css';
import { useAuthStore } from '../stores/authStore';
import { useDataStore } from '../stores/dataStore';
import { colors } from '../theme/colors';

// Keep the native splash visible until we're ready - prevents the black frame
// between the native splash hiding and the first meaningful React render.
void SplashScreen.preventAutoHideAsync();

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
  const authStatus = useAuthStore((s) => s.status);
  const [fontsLoaded] = useFonts({
    Manrope_600SemiBold,
    Manrope_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  useEffect(() => {
    void init();
  }, [init]);

  // Dismiss the native splash only once both fonts and vault init are done.
  // While loading we return null - the native splash stays on top (no black frame).
  useEffect(() => {
    if (fontsLoaded && authStatus !== 'loading') {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, authStatus]);

  useAuthRouting();
  useAutoLock();

  if (!fontsLoaded || authStatus === 'loading') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' }}>
        <MoonLoader size={64} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.ink }}>
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
