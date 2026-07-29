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

const AUTO_LOCK_OPTIONS = [
  { label: 'Instant', value: 0 },
  { label: '1 min', value: 1 },
  { label: '2 min', value: 2 },
  { label: '5 min', value: 5 },
  { label: '15 min', value: 15 },
];

export default function Settings() {
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
        Alert.alert('Notifications off', 'Enable notifications for Locklune in system settings.');
        return;
      }
    }
    void updateSettings({ [key]: value });
  };

  const confirmWipe = () => {
    haptics.warn();
    Alert.alert(
      'Erase everything?',
      'This permanently deletes your PIN and all cycle data on this device. It cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Erase', style: 'destructive', onPress: () => void wipe() },
      ],
    );
  };

  const luteal = settings.lutealPhaseDays;

  return (
    <Screen>
      <View className="flex-row items-center gap-2 pb-1 pt-2">
        <Ionicons name="settings" size={14} color={colors.primarySoft} />
        <Txt variant="faint">Preferences</Txt>
      </View>

      {/* Cycle mode */}
      <Card>
        <SectionLabel icon="moon-outline" label="I am currently" />
        <View>
          {CYCLE_MODES.map((mode) => (
            <ModeRow
              key={mode.value}
              label={mode.label}
              hint={mode.hint}
              active={settings.cycleMode === mode.value}
              onPress={() => selectMode(mode.value)}
            />
          ))}
        </View>

        {settings.cycleMode === CYCLE_MODE.Contraception && (
          <View className="mt-4 gap-3 border-t border-border pt-4">
            <Txt variant="faint">Method</Txt>
            <View className="flex-row flex-wrap gap-2">
              {CONTRACEPTION_METHODS.map((method) => (
                <Chip
                  key={method.value}
                  label={method.label}
                  active={settings.contraceptionMethod === method.value}
                  onPress={() => void updateSettings({ contraceptionMethod: method.value })}
                />
              ))}
            </View>
            {isHormonalContraception(settings.contraceptionMethod) && (
              <Txt variant="faint">
                Fertility estimates are hidden on hormonal methods, since ovulation is suppressed.
              </Txt>
            )}
          </View>
        )}

        {settings.cycleMode === CYCLE_MODE.Pregnant && (
          <View className="mt-4 gap-4 border-t border-border pt-4">
            <View className="flex-row items-center justify-between">
              <Txt variant="body">Weeks along</Txt>
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
                  <Txt variant="body">Due date</Txt>
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
                    accessibilityLabel="Move due date earlier by one day"
                    className="h-10 w-10 items-center justify-center rounded-full bg-surfaceMuted"
                  >
                    <Ionicons name="remove" size={20} color={colors.text} />
                  </PressScale>
                  <PressScale
                    onPress={() =>
                      void updateSettings({ pregnancyDueDay: settings.pregnancyDueDay! + 1 })
                    }
                    accessibilityRole="button"
                    accessibilityLabel="Move due date later by one day"
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
          <SectionLabel icon="sync-outline" label="Cycle" />
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-4">
              <Txt variant="body">Luteal phase length</Txt>
              <Txt variant="faint">Used to estimate ovulation ({luteal} days)</Txt>
            </View>
            <Stepper
              value={luteal}
              min={10}
              max={16}
              onChange={(days) => void updateSettings({ lutealPhaseDays: days })}
            />
          </View>
          <Txt variant="faint" className="mt-3">
            The luteal phase is the time from ovulation to your next period - usually 12–14 days and
            fairly steady between cycles. Locklune uses it to estimate ovulation and your fertile
            window. If you confirm ovulation when logging a day, your own luteal length is learned
            and used instead.
          </Txt>
        </Card>
      )}

      {/* Reminders */}
      <Card>
        <SectionLabel icon="notifications-outline" label="Reminders" />
        <SwitchRow
          label="Period starting tomorrow"
          hint="Morning of the day before your predicted period"
          value={settings.notifyPeriodTomorrow}
          onValueChange={(enabled) => void toggleNotification('notifyPeriodTomorrow', enabled)}
        />
        <SwitchRow
          label="Period starting today"
          hint="Morning of your predicted period start"
          value={settings.notifyPeriodToday}
          onValueChange={(enabled) => void toggleNotification('notifyPeriodToday', enabled)}
        />
        {prediction.fertilityApplicable && (
          <>
            <SwitchRow
              label="Fertile window tomorrow"
              hint="Morning before your fertile window opens"
              value={settings.notifyFertileTomorrow}
              onValueChange={(enabled) => void toggleNotification('notifyFertileTomorrow', enabled)}
            />
            <SwitchRow
              label="Fertile window opens"
              hint="Morning your fertile window begins"
              value={settings.notifyFertileStart}
              onValueChange={(enabled) => void toggleNotification('notifyFertileStart', enabled)}
            />
          </>
        )}
      </Card>

      {/* Custom symptoms */}
      <Card>
        <SectionLabel icon="pricetag-outline" label="Custom symptoms" />
        <Txt variant="faint" className="mb-3">
          Add your own symptom tags - they appear in the log screen under “custom”.
        </Txt>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          <TextInput
            value={newSymptom}
            onChangeText={setNewSymptom}
            placeholder="e.g. joint pain"
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
            accessibilityLabel="Add symptom"
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
                accessibilityLabel={`Remove ${symptom}`}
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
        <SectionLabel icon="shield-checkmark-outline" label="Security" />
        <PressScale
          onPress={() => router.push(ROUTES.changePin)}
          className="flex-row items-center justify-between py-3"
        >
          <Txt variant="body">Change PIN</Txt>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </PressScale>

        <Txt variant="faint" className="mb-2 mt-4">
          Auto-lock after inactivity
        </Txt>
        <Segmented
          options={AUTO_LOCK_OPTIONS}
          value={settings.autoLockMinutes}
          onChange={(minutes) => void updateSettings({ autoLockMinutes: minutes })}
        />
      </Card>

      {/* About */}
      <Card>
        <SectionLabel icon="information-circle-outline" label="About" />
        <RNText className="text-base leading-5 text-text-muted">
          Locklune is designed for record keeping purposes only. It is not a replacement for
          professional medical advice. If you have any health concerns, please consult a qualified
          healthcare provider.
        </RNText>
        <View className="mt-4">
          <AboutRow icon="star-outline" label="Rate Locklune" onPress={() => openLink(RATE_URL)} />
          <AboutRow
            icon="heart-outline"
            label="Support the developer"
            onPress={() => openLink(KOFI_URL)}
          />
          <AboutRow
            icon="bug-outline"
            label="Report a bug or request a feature"
            onPress={() => openLink(FEEDBACK_URL)}
          />
          <AboutRow icon="share-social-outline" label="Tell a friend" onPress={shareApp} last />
        </View>
      </Card>

      {/* Danger zone */}
      <Card
        style={{
          borderColor: 'rgba(248,113,113,0.3)',
        }}
      >
        <SectionLabel icon="alert-circle-outline" label="Danger zone" labelClass="text-danger" />
        <View className="gap-3">
          <Button title="Lock now" variant="secondary" onPress={() => void lock()} />
          <Button title="Erase all data" variant="danger" onPress={confirmWipe} />
        </View>
      </Card>

      <View className="items-center gap-1 pb-4">
        <Txt variant="faint">
          {BRAND.name} v{Constants.expoConfig?.version ?? '0.1.0'}
        </Txt>
        <Txt variant="faint" className="text-center">
          100% on-device · encrypted · no tracking
        </Txt>
      </View>
    </Screen>
  );
}
