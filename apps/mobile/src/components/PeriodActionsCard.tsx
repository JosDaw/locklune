import { View } from 'react-native';
import { Button } from './ui/Button';
import { t, useLocale } from '../i18n';
import { colors } from '../theme/colors';
import { CARD_SHADOW } from '../theme/shadows';

/**
 * Top-of-screen quick actions: start/end the current period alongside logging
 * (or editing) today's symptoms. The period button flips to "End period" while a
 * period is open; the log button flips to "Edit symptoms" once today has symptoms.
 */
export function PeriodActionsCard({
  onPeriod,
  hasSymptoms,
  onPeriodAction,
  onLogSymptoms,
}: {
  onPeriod: boolean;
  hasSymptoms: boolean;
  onPeriodAction: () => void;
  onLogSymptoms: () => void;
}) {
  useLocale();
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 12,
        borderRadius: 24,
        backgroundColor: colors.surface,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
        ...CARD_SHADOW,
      }}
    >
      <Button
        title={onPeriod ? t('home.endPeriod') : t('home.startPeriod')}
        variant="primary"
        onPress={onPeriodAction}
        containerStyle={{ flex: 1 }}
      />
      <Button
        title={hasSymptoms ? t('home.editSymptoms') : t('home.logSymptoms')}
        variant="secondary"
        onPress={onLogSymptoms}
        containerStyle={{ flex: 1 }}
      />
    </View>
  );
}
