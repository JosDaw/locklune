import { type ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { VStack } from '../gs/vstack';
import { Background } from './Background';

export function Screen({
  children,
  scroll = true,
  edges = ['top', 'bottom'],
  contentClassName = '',
}: {
  children: ReactNode;
  scroll?: boolean;
  edges?: Edge[];
  contentClassName?: string;
}) {
  return (
    <View className="flex-1 bg-ink">
      <Background />
      <SafeAreaView className="flex-1" edges={edges}>
        {scroll ? (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ padding: 24, paddingBottom: 104 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <VStack space="lg" className={contentClassName}>
              {children}
            </VStack>
          </ScrollView>
        ) : (
          <VStack space="lg" className={`flex-1 p-6 ${contentClassName}`}>
            {children}
          </VStack>
        )}
      </SafeAreaView>
    </View>
  );
}
