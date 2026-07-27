import { View } from 'react-native';
import { BRAND } from '@locklune/core';
import { MoonLoader } from '../components/ui/MoonLoader';
import { Txt } from '../components/ui/Text';

/**
 * Splash/loading route. The root layout redirects away from here as soon as the
 * auth status resolves (onboarding / locked / unlocked).
 */
export default function Index() {
  return (
    <View className="flex-1 items-center justify-center gap-6 bg-ink">
      <Txt variant="display">{BRAND.name}</Txt>
      <MoonLoader />
    </View>
  );
}
