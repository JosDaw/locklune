import { type ReactNode } from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { VStack } from '../gs/vstack';

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
    <SafeAreaView className="flex-1 bg-ink" edges={edges}>
      {scroll ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          <VStack space="lg" className={contentClassName}>
            {children}
          </VStack>
        </ScrollView>
      ) : (
        <VStack space="lg" className={`flex-1 p-5 ${contentClassName}`}>
          {children}
        </VStack>
      )}
    </SafeAreaView>
  );
}
