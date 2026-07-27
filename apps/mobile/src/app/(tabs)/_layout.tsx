import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import type { ColorValue } from 'react-native';
import { colors } from '../../theme/colors';

type IoniconName = keyof typeof Ionicons.glyphMap;

/** Tab icon that swaps to a filled glyph and gains a soft blue glow when active. */
const icon =
  (outline: IoniconName, filled: IoniconName) =>
  ({ color, size, focused }: { color: ColorValue; size: number; focused: boolean }) => (
    <View
      style={{
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: focused ? 'rgba(110,168,254,0.14)' : 'transparent',
      }}
    >
      <Ionicons name={focused ? filled : outline} color={color as string} size={size} />
    </View>
  );

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.ink },
        tabBarActiveTintColor: colors.primarySoft,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarLabelStyle: { fontFamily: 'Inter_500Medium', fontSize: 11, marginTop: 2 },
        tabBarBackground: () => (
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
        ),
        tabBarStyle: {
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: 14,
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
        options={{ title: 'Today', tabBarIcon: icon('moon-outline', 'moon') }}
      />
      <Tabs.Screen
        name="calendar"
        options={{ title: 'Calendar', tabBarIcon: icon('calendar-outline', 'calendar') }}
      />
      <Tabs.Screen
        name="insights"
        options={{ title: 'Insights', tabBarIcon: icon('stats-chart-outline', 'stats-chart') }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: 'Settings', tabBarIcon: icon('settings-outline', 'settings') }}
      />
    </Tabs>
  );
}
