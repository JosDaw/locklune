import { Ionicons } from '@expo/vector-icons';
import {
  BRAND,
  CYCLE_MODE,
  dueDayFromWeeksAlong,
  estimateDueDay,
  isHormonalContraception,
  pregnancyProgress,
  todayEpochDay,
  type CycleMode,
} from '@locklune/core';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, Text as RNText, TextInput, View } from 'react-native';
import { AboutRow } from '../../components/AboutRow';
import { Chip } from '../../components/Chip';
import { ModeRow } from '../../components/ModeRow';
import { SectionLabel } from '../../components/SectionLabel';
import { Segmented } from '../../components/Segmented';
import { Stepper } from '../../components/Stepper';
import { SwitchRow } from '../../components/SwitchRow';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PressScale } from '../../components/ui/PressScale';
import { Screen } from '../../components/ui/Screen';
import { Txt } from '../../components/ui/Text';
import { t, useLocale } from '../../i18n';
import { formatDay } from '../../lib/format';
import * as haptics from '../../lib/haptics';
import { FEEDBACK_URL, KOFI_URL, openLink, RATE_URL, shareApp } from '../../lib/links';
import { CONTRACEPTION_METHODS, CYCLE_MODES } from '../../lib/modes';
import { requestNotificationPermission } from '../../lib/notifications';
import { ROUTES } from '../../lib/routes';
import { useAuthStore } from '../../stores/authStore';
import { useDataStore } from '../../stores/dataStore';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

const AUTO_LOCK_VALUES = [0, 1, 2, 5, 15];

export default function Settings() {
  useLocale();
  const router = useRouter();
  const settings = useDataStore((store) => store.settings);
  const updateSettings = useDataStore((store) => store.updateSettings);
  const prediction = useDataStore((store) => store.prediction);
  const cycles = useDataStore((store) => store.cycles);

  const lock = useAuthStore((store) => store.lock);
  const wipe = useAuthStore((store) => store.wipe);

  const [newSymptom, setNewSymptom] = useState<string>('');

  const addSymptom = () => {
    const trimmed = newSymptom.trim().toLowerCase();
    if (!trimmed || settings.customSymptoms.includes(trimmed)) {
      setNewSymptom('');
      return;
    }
    void updateSettings({ customSymptoms: [...settings.customSymptoms, trimmed] });
    setNewSymptom('');
  };

  const removeSymptom = (symptom: string) => {
    void updateSettings({
      customSymptoms: settings.customSymptoms.filter((existing) => existing !== symptom),
    });
  };

  const today = todayEpochDay();
  const pregWeeks =
    settings.pregnancyDueDay != null ? pregnancyProgress(settings.pregnancyDueDay, today).week : 0;

  const selectMode = (mode: CycleMode) => {
    if (mode === CYCLE_MODE.Pregnant && settings.pregnancyDueDay == null) {
      const lastStart = cycles[cycles.length - 1]?.startDay;
      const dueDay = lastStart != null ? estimateDueDay(lastStart) : dueDayFromWeeksAlong(6, today);
      void updateSettings({ cycleMode: mode, pregnancyDueDay: dueDay });
    } else if (mode !== CYCLE_MODE.Pregnant && settings.cycleMode === CYCLE_MODE.Pregnant) {
      const dueDay = settings.pregnancyDueDay;
      if (dueDay != null) {
        const gestationalAge = Math.max(0, today - (dueDay - 280));
        // Resumption estimate scales with how far along the pregnancy was:
        // early loss (<12 wk) ~4 weeks, mid-pregnancy ~5 weeks, near/full term ~8 weeks.
        const resumptionDays = gestationalAge < 84 ? 28 : gestationalAge < 196 ? 35 : 56;
        void updateSettings({ cycleMode: mode, postPregnancyAnchorDay: today + resumptionDays });
      } else {
        void updateSettings({ cycleMode: mode });
      }
    } else {
      void updateSettings({ cycleMode: mode });
    }
  };

  const toggleNotification = async (
    key:
      'notifyPeriodTomorrow' | 'notifyPeriodToday' | 'notifyFertileTomorrow' | 'notifyFertileStart',
    value: boolean,
  ) => {
    if (value) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        Alert.alert(t('settings.notifOffTitle'), t('settings.notifOffBody'));
        return;
      }
    }
    void updateSettings({ [key]: value });
  };

  const confirmWipe = () => {
    haptics.warn();
    Alert.alert(t('settings.eraseTitle'), t('settings.eraseBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('settings.erase'), style: 'destructive', onPress: () => void wipe() },
    ]);
  };

  const luteal = settings.lutealPhaseDays;

  return (
    <Screen>
      <View className="flex-row items-center gap-2 pb-1 pt-2">
        <Ionicons name="settings" size={14} color={colors.primarySoft} />
        <Txt variant="faint">{t('tabs.preferences')}</Txt>
      </View>

      {/* Cycle mode */}
      <Card>
        <SectionLabel icon="moon-outline" label={t('settings.iAmCurrently')} />
        <View>
          {CYCLE_MODES.map((mode) => (
            <ModeRow
              key={mode.value}
              label={t(mode.labelKey)}
              hint={t(mode.hintKey)}
              active={settings.cycleMode === mode.value}
              onPress={() => selectMode(mode.value)}
            />
          ))}
        </View>

        {settings.cycleMode === CYCLE_MODE.Contraception && (
          <View className="mt-4 gap-3 border-t border-border pt-4">
            <Txt variant="faint">{t('settings.method')}</Txt>
            <View className="flex-row flex-wrap gap-2">
              {CONTRACEPTION_METHODS.map((method) => (
                <Chip
                  key={method.value}
                  label={t(method.labelKey)}
                  active={settings.contraceptionMethod === method.value}
                  onPress={() => void updateSettings({ contraceptionMethod: method.value })}
                />
              ))}
            </View>
            {isHormonalContraception(settings.contraceptionMethod) && (
              <Txt variant="faint">{t('settings.hormonalNote')}</Txt>
            )}
          </View>
        )}

        {settings.cycleMode === CYCLE_MODE.Pregnant && (
          <View className="mt-4 gap-4 border-t border-border pt-4">
            <View className="flex-row items-center justify-between">
              <Txt variant="body">{t('settings.weeksAlong')}</Txt>
              <Stepper
                value={pregWeeks}
                min={0}
                max={42}
                onChange={(weeks) =>
                  void updateSettings({ pregnancyDueDay: dueDayFromWeeksAlong(weeks, today) })
                }
              />
            </View>
            {settings.pregnancyDueDay != null && (
              <View className="flex-row items-center justify-between">
                <View>
                  <Txt variant="body">{t('settings.dueDate')}</Txt>
                  <Txt variant="faint">
                    {formatDay(settings.pregnancyDueDay, {
                      weekday: 'short',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Txt>
                </View>
                <View className="flex-row gap-2">
                  <PressScale
                    onPress={() =>
                      void updateSettings({ pregnancyDueDay: settings.pregnancyDueDay! - 1 })
                    }
                    accessibilityRole="button"
                    accessibilityLabel={t('settings.dueEarlier')}
                    className="h-10 w-10 items-center justify-center rounded-full bg-surfaceMuted"
                  >
                    <Ionicons name="remove" size={20} color={colors.text} />
                  </PressScale>
                  <PressScale
                    onPress={() =>
                      void updateSettings({ pregnancyDueDay: settings.pregnancyDueDay! + 1 })
                    }
                    accessibilityRole="button"
                    accessibilityLabel={t('settings.dueLater')}
                    className="h-10 w-10 items-center justify-center rounded-full bg-surfaceMuted"
                  >
                    <Ionicons name="add" size={20} color={colors.text} />
                  </PressScale>
                </View>
              </View>
            )}
          </View>
        )}
      </Card>

      {/* Cycle - not relevant when pregnant */}
      {settings.cycleMode !== CYCLE_MODE.Pregnant && (
        <Card>
          <SectionLabel icon="sync-outline" label={t('settings.cycle')} />
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-4">
              <Txt variant="body">{t('settings.lutealLength')}</Txt>
              <Txt variant="faint">{t('settings.lutealUsed', { count: luteal })}</Txt>
            </View>
            <Stepper
              value={luteal}
              min={10}
              max={16}
              onChange={(days) => void updateSettings({ lutealPhaseDays: days })}
            />
          </View>
          <Txt variant="faint" className="mt-3">
            {t('settings.lutealExplain')}
          </Txt>
        </Card>
      )}

      {/* Reminders */}
      <Card>
        <SectionLabel icon="notifications-outline" label={t('settings.reminders')} />
        <SwitchRow
          label={t('notif.periodTomorrowLabel')}
          hint={t('notif.periodTomorrowHint')}
          value={settings.notifyPeriodTomorrow}
          onValueChange={(enabled) => void toggleNotification('notifyPeriodTomorrow', enabled)}
        />
        <SwitchRow
          label={t('notif.periodTodayLabel')}
          hint={t('notif.periodTodayHint')}
          value={settings.notifyPeriodToday}
          onValueChange={(enabled) => void toggleNotification('notifyPeriodToday', enabled)}
        />
        {prediction.fertilityApplicable && (
          <>
            <SwitchRow
              label={t('notif.fertileTomorrowLabel')}
              hint={t('notif.fertileTomorrowHint')}
              value={settings.notifyFertileTomorrow}
              onValueChange={(enabled) => void toggleNotification('notifyFertileTomorrow', enabled)}
            />
            <SwitchRow
              label={t('notif.fertileStartLabel')}
              hint={t('notif.fertileStartHint')}
              value={settings.notifyFertileStart}
              onValueChange={(enabled) => void toggleNotification('notifyFertileStart', enabled)}
            />
          </>
        )}
      </Card>

      {/* Custom symptoms */}
      <Card>
        <SectionLabel icon="pricetag-outline" label={t('settings.customSymptoms')} />
        <Txt variant="faint" className="mb-3">
          {t('settings.customSymptomsHint')}
        </Txt>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          <TextInput
            value={newSymptom}
            onChangeText={setNewSymptom}
            placeholder={t('settings.symptomPlaceholder')}
            placeholderTextColor={colors.textFaint}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={addSymptom}
            style={{
              flex: 1,
              backgroundColor: colors.surfaceMuted,
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 10,
              color: colors.text,
              fontFamily: fonts.regular,
              fontSize: 14,
            }}
          />
          <Pressable
            onPress={addSymptom}
            accessibilityRole="button"
            accessibilityLabel={t('settings.addSymptom')}
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: newSymptom.trim() ? colors.primary : colors.surfaceMuted,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons
              name="add"
              size={22}
              color={newSymptom.trim() ? colors.ink : colors.textFaint}
            />
          </Pressable>
        </View>
        {settings.customSymptoms.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {settings.customSymptoms.map((symptom) => (
              <Pressable
                key={symptom}
                onPress={() => removeSymptom(symptom)}
                accessibilityRole="button"
                accessibilityLabel={t('settings.removeSymptom', { symptom })}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  backgroundColor: colors.surfaceMuted,
                  borderRadius: 99,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                }}
              >
                <RNText
                  style={{
                    fontFamily: fonts.medium,
                    fontSize: 13,
                    color: colors.textMuted,
                  }}
                >
                  {symptom}
                </RNText>
                <Ionicons name="close" size={12} color={colors.textFaint} />
              </Pressable>
            ))}
          </View>
        )}
      </Card>

      {/* Security */}
      <Card>
        <SectionLabel icon="shield-checkmark-outline" label={t('settings.security')} />
        <PressScale
          onPress={() => router.push(ROUTES.changePin)}
          className="flex-row items-center justify-between py-3"
        >
          <Txt variant="body">{t('settings.changePin')}</Txt>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </PressScale>

        <Txt variant="faint" className="mb-2 mt-4">
          {t('settings.autoLock')}
        </Txt>
        <Segmented
          options={AUTO_LOCK_VALUES.map((value) => ({
            label: value === 0 ? t('settings.instant') : t('settings.minutes', { count: value }),
            value,
          }))}
          value={settings.autoLockMinutes}
          onChange={(minutes) => void updateSettings({ autoLockMinutes: minutes })}
        />
      </Card>

      {/* About */}
      <Card>
        <SectionLabel icon="information-circle-outline" label={t('settings.about')} />
        <RNText className="text-base leading-5 text-text-muted">{t('settings.aboutBody')}</RNText>
        <View className="mt-4">
          <AboutRow
            icon="star-outline"
            label={t('settings.rate')}
            onPress={() => openLink(RATE_URL)}
          />
          <AboutRow
            icon="heart-outline"
            label={t('settings.support')}
            onPress={() => openLink(KOFI_URL)}
          />
          <AboutRow
            icon="bug-outline"
            label={t('settings.reportBug')}
            onPress={() => openLink(FEEDBACK_URL)}
          />
          <AboutRow
            icon="share-social-outline"
            label={t('settings.tellFriend')}
            onPress={shareApp}
            last
          />
        </View>
      </Card>

      {/* Danger zone */}
      <Card
        style={{
          borderColor: 'rgba(248,113,113,0.3)',
        }}
      >
        <SectionLabel
          icon="alert-circle-outline"
          label={t('settings.dangerZone')}
          labelClass="text-danger"
        />
        <View className="gap-3">
          <Button title={t('settings.lockNow')} variant="secondary" onPress={() => void lock()} />
          <Button title={t('settings.eraseAll')} variant="danger" onPress={confirmWipe} />
        </View>
      </Card>

      <View className="items-center gap-1 pb-4">
        <Txt variant="faint">
          {BRAND.name} v{Constants.expoConfig?.version ?? '0.1.0'}
        </Txt>
        <Txt variant="faint" className="text-center">
          {t('settings.tagline')}
        </Txt>
      </View>
    </Screen>
  );
}
