import { Tabs } from 'expo-router';
import { Platform, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ColorValue } from 'react-native';
import { t, useLocale } from '../../i18n';
import { colors } from '../../theme/colors';

type IoniconName = keyof typeof Ionicons.glyphMap;

/** Tab icon that swaps to a filled glyph and gains a soft blue glow when active. */
const icon = (outline: IoniconName, filled: IoniconName) => {
  const TabBarIcon = ({
    color,
    size,
    focused,
  }: {
    color: ColorValue;
    size: number;
    focused: boolean;
  }) => (
    <View
      style={{
        width: 52,
        height: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: focused ? 'rgba(138,162,255,0.14)' : 'transparent',
      }}
    >
      <Ionicons name={focused ? filled : outline} color={color as string} size={size || 22} />
    </View>
  );
  TabBarIcon.displayName = 'TabBarIcon';
  return TabBarIcon;
};

export default function TabsLayout() {
  useLocale();
  const insets = useSafeAreaInsets();
  // Android draws the pill behind the system nav bar, so clear the full inset.
  // On iOS we only need a small nudge so the rounded border/shadow isn't
  // clipped near the home indicator — the full inset would raise it too far.
  const bottomInset = Platform.OS === 'android' ? insets.bottom : Math.min(insets.bottom, 8);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.ink },
        tabBarActiveTintColor: colors.primarySoft,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarLabelStyle: { fontFamily: 'Inter_500Medium', fontSize: 11, marginTop: 2 },
        tabBarBackground: () =>
          Platform.OS === 'ios' ? (
            <BlurView
              intensity={30}
              tint="dark"
              style={{
                flex: 1,
                borderRadius: 26,
                overflow: 'hidden',
                backgroundColor: 'rgba(22,32,50,0.72)',
                borderWidth: 1,
                borderColor: colors.border,
              }}
            />
          ) : (
            <View
              style={{
                flex: 1,
                borderRadius: 26,
                backgroundColor: 'rgba(22,32,50,0.94)',
                borderWidth: 1,
                borderColor: colors.border,
              }}
            />
          ),
        tabBarStyle: {
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: 14 + bottomInset,
          height: 66,
          paddingTop: 8,
          paddingBottom: 8,
          borderRadius: 26,
          borderTopWidth: 0,
          backgroundColor: 'transparent',
          elevation: 0,
          shadowColor: '#000000',
          shadowOpacity: 0.35,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 10 },
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: t('tabs.today'), tabBarIcon: icon('moon-outline', 'moon') }}
      />
      <Tabs.Screen
        name="calendar"
        options={{ title: t('tabs.calendar'), tabBarIcon: icon('calendar-outline', 'calendar') }}
      />
      <Tabs.Screen
        name="insights"
        options={{ title: t('tabs.insights'), tabBarIcon: icon('stats-chart-outline', 'stats-chart') }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: t('tabs.preferences'), tabBarIcon: icon('settings-outline', 'settings') }}
      />
    </Tabs>
  );
}
