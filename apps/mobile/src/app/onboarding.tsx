import { Ionicons } from '@expo/vector-icons';
import { BRAND, type CycleMode, type Settings, type TemperatureUnit } from '@locklune/core';
import { useState } from 'react';
import { Image, Linking, Pressable, Text as RNText, View } from 'react-native';
import { CheckboxRow } from '../components/CheckboxRow';
import { NotifRow } from '../components/NotifRow';
import { Button } from '../components/ui/Button';
import { MoonLoader } from '../components/ui/MoonLoader';
import { PinPad } from '../components/ui/PinPad';
import { Screen } from '../components/ui/Screen';
import { Txt } from '../components/ui/Text';
import { t, useLocale } from '../i18n';
import * as haptics from '../lib/haptics';
import { CYCLE_MODES } from '../lib/modes';
import { requestNotificationPermission } from '../lib/notifications';
import * as toast from '../lib/toast';
import { useAuthStore } from '../stores/authStore';
import { useDataStore } from '../stores/dataStore';
import { colors } from '../theme/colors';

const PIN_LENGTH = 6;

// Modes for which fertility notifications are relevant.
const FERTILITY_MODES: CycleMode[] = ['tracking', 'trying'];

type Phase = 'consent' | 'create' | 'confirm' | 'mode' | 'units' | 'notifications';

export default function Onboarding() {
  useLocale();
  const brand = BRAND.name;
  const [phase, setPhase] = useState<Phase>('consent');
  const [firstPin, setFirstPin] = useState<string>('');
  const [confirmedPin, setConfirmedPin] = useState<string>('');
  const [busy, setBusy] = useState<boolean>(false);
  const [agreedLegal, setAgreedLegal] = useState<boolean>(false);
  const [agreedMedical, setAgreedMedical] = useState<boolean>(false);
  const [agreedResponsibility, setAgreedResponsibility] = useState<boolean>(false);

  // Preferences collected during onboarding - applied after createPin succeeds.
  const [selectedMode, setSelectedMode] = useState<CycleMode>('tracking');
  // Required choice: no default, so the user must actively pick a unit.
  const [selectedUnit, setSelectedUnit] = useState<TemperatureUnit | null>(null);
  const [notifyPeriodTomorrow, setNotifyPeriodTomorrow] = useState<boolean>(false);
  const [notifyPeriodToday, setNotifyPeriodToday] = useState<boolean>(false);
  const [notifyFertileTomorrow, setNotifyFertileTomorrow] = useState<boolean>(false);
  const [notifyFertileStart, setNotifyFertileStart] = useState<boolean>(false);

  const createPin = useAuthStore((store) => store.createPin);
  const wipe = useAuthStore((store) => store.wipe);
  const updateSettings = useDataStore((store) => store.updateSettings);

  const handlePinEntry = async (pin: string) => {
    if (busy) return;
    if (phase === 'create') {
      setFirstPin(pin);
      setPhase('confirm');
      return;
    }
    if (pin !== firstPin) {
      toast.error(t('onboarding.pinMismatch'));
      setFirstPin('');
      setPhase('create');
      return;
    }
    setConfirmedPin(pin);
    setPhase('mode');
  };

  const handleFinish = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await createPin(confirmedPin);
      // DB is now open - persist the onboarding choices before navigation fires.
      const patch: Partial<Settings> = {
        cycleMode: selectedMode,
        temperatureUnit: selectedUnit ?? 'c',
        notifyPeriodTomorrow,
        notifyPeriodToday,
        notifyFertileTomorrow,
        notifyFertileStart,
      };
      await updateSettings(patch);
      haptics.success();
    } catch (err) {
      // Wipe any partial vault/DB state so the retry starts clean.
      await wipe().catch(() => undefined);
      const detail = err instanceof Error ? err.message : String(err);
      toast.error(t('onboarding.setupFailed', { detail }));
      setConfirmedPin('');
      setFirstPin('');
      setPhase('create');
      setBusy(false);
    }
  };

  const toggleNotify = async (setter: (enabled: boolean) => void, value: boolean) => {
    if (value) {
      const granted = await requestNotificationPermission();
      if (!granted) return;
    }
    setter(value);
  };

  const fertilityApplicable = FERTILITY_MODES.includes(selectedMode);

  // ── Consent ──────────────────────────────────────────────────────────────────
  if (phase === 'consent') {
    return (
      <Screen>
        <Image
          source={require('../../assets/images/locklune_logo.png')}
          style={{ width: '100%', height: 500 }}
          resizeMode="contain"
          accessible
          accessibilityRole="image"
          accessibilityLabel={t('onboarding.logoA11y', { brand })}
        />

        <View className="gap-5">
          <Txt variant="muted">{t('onboarding.beforeYouBegin')}</Txt>
          <CheckboxRow checked={agreedLegal} onToggle={() => setAgreedLegal((prev) => !prev)}>
            <RNText className="text-base leading-6 text-text">
              {t('onboarding.consentAgree')
                .split(/(%\{privacy\}|%\{terms\})/)
                .map((segment, index) => {
                  if (segment === '%{privacy}') {
                    return (
                      <RNText
                        key="privacy"
                        className="text-primary-soft underline"
                        accessibilityRole="link"
                        onPress={() => void Linking.openURL(`${BRAND.websiteUrl}/privacy`)}
                      >
                        {t('onboarding.privacyPolicy')}
                      </RNText>
                    );
                  }
                  if (segment === '%{terms}') {
                    return (
                      <RNText
                        key="terms"
                        className="text-primary-soft underline"
                        accessibilityRole="link"
                        onPress={() => void Linking.openURL(`${BRAND.websiteUrl}/terms`)}
                      >
                        {t('onboarding.terms')}
                      </RNText>
                    );
                  }
                  return <RNText key={index}>{segment}</RNText>;
                })}
            </RNText>
          </CheckboxRow>

          <CheckboxRow checked={agreedMedical} onToggle={() => setAgreedMedical((prev) => !prev)}>
            <RNText className="text-base leading-6 text-text">
              {t('onboarding.consentMedical', { brand })}
            </RNText>
          </CheckboxRow>

          <CheckboxRow
            checked={agreedResponsibility}
            onToggle={() => setAgreedResponsibility((prev) => !prev)}
          >
            <RNText className="text-base leading-6 text-text">
              {t('onboarding.consentResponsibility', { brand })}
            </RNText>
          </CheckboxRow>
        </View>

        <Button
          title={t('common.continue')}
          disabled={!(agreedLegal && agreedMedical && agreedResponsibility)}
          onPress={() => setPhase('create')}
        />
      </Screen>
    );
  }

  // ── PIN create / confirm ──────────────────────────────────────────────────────
  if (phase === 'create' || phase === 'confirm') {
    return (
      <Screen scroll={false} contentClassName="justify-between">
        <View className="items-center gap-2 pt-6">
          <Txt variant="display">{BRAND.name}</Txt>
          <Txt variant="muted" className="text-center">
            {phase === 'create' ? t('onboarding.pinCreate') : t('onboarding.pinConfirm')}
          </Txt>
        </View>

        <View className="gap-3">
          <View className="h-5" />
          <PinPad length={PIN_LENGTH} disabled={busy} onComplete={handlePinEntry} />
        </View>

        <View className="rounded-2xl border border-border bg-surface p-4">
          <Txt variant="faint" className="text-center leading-5">
            {t('onboarding.pinWarning')}
          </Txt>
        </View>
      </Screen>
    );
  }

  // ── Mode selection ────────────────────────────────────────────────────────────
  if (phase === 'mode') {
    return (
      <Screen contentClassName="justify-between">
        <View className="gap-2 pt-6">
          <Txt variant="display">{t('onboarding.modeTitle', { brand })}</Txt>
          <Txt variant="muted">{t('onboarding.modeSubtitle')}</Txt>
        </View>

        <View className="gap-2">
          {CYCLE_MODES.map((mode) => {
            const selected = selectedMode === mode.value;
            return (
              <Pressable
                key={mode.value}
                onPress={() => setSelectedMode(mode.value)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`${t(mode.labelKey)}. ${t(mode.hintKey)}`}
                className={`flex-row items-center gap-4 rounded-2xl border p-4 ${
                  selected ? 'border-primary bg-primary/10' : 'border-border bg-surface'
                }`}
              >
                <View
                  className={`h-6 w-6 items-center justify-center rounded-md border-2 ${
                    selected ? 'border-primary bg-primary' : 'border-surfaceMuted'
                  }`}
                >
                  {selected && <Ionicons name="checkmark" size={16} color={colors.ink} />}
                </View>
                <View className="flex-1">
                  <Txt variant="body">{t(mode.labelKey)}</Txt>
                  <Txt variant="faint">{t(mode.hintKey)}</Txt>
                </View>
              </Pressable>
            );
          })}
        </View>

        <Button title={t('common.continue')} onPress={() => setPhase('units')} />
      </Screen>
    );
  }

  // ── Temperature unit (required) ───────────────────────────────────────────────
  if (phase === 'units') {
    const UNITS: { value: TemperatureUnit; labelKey: string }[] = [
      { value: 'c', labelKey: 'settings.celsius' },
      { value: 'f', labelKey: 'settings.fahrenheit' },
    ];
    return (
      <Screen contentClassName="justify-between">
        <View className="gap-2 pt-6">
          <Txt variant="display">{t('onboarding.unitsTitle')}</Txt>
          <Txt variant="muted">{t('onboarding.unitsSubtitle')}</Txt>
        </View>

        <View className="gap-2">
          {UNITS.map((option) => {
            const selected = selectedUnit === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => setSelectedUnit(option.value)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={t(option.labelKey)}
                className={`flex-row items-center gap-4 rounded-2xl border p-4 ${
                  selected ? 'border-primary bg-primary/10' : 'border-border bg-surface'
                }`}
              >
                <View
                  className={`h-6 w-6 items-center justify-center rounded-full border-2 ${
                    selected ? 'border-primary bg-primary' : 'border-surfaceMuted'
                  }`}
                >
                  {selected && <Ionicons name="checkmark" size={16} color={colors.ink} />}
                </View>
                <Txt variant="body">{t(option.labelKey)}</Txt>
              </Pressable>
            );
          })}
        </View>

        <Button
          title={t('common.continue')}
          disabled={selectedUnit === null}
          onPress={() => setPhase('notifications')}
        />
      </Screen>
    );
  }

  // ── Finishing (createPin in progress) ────────────────────────────────────────
  if (busy) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.ink,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MoonLoader size={64} />
      </View>
    );
  }

  // ── Notifications ─────────────────────────────────────────────────────────────
  return (
    <Screen scroll={false} contentClassName="justify-between">
      <View className="gap-6 pt-6">
        {/* Icon + heading */}
        <View className="items-center gap-4">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-surface border border-border">
            <Ionicons name="notifications-outline" size={36} color={colors.primarySoft} />
          </View>
          <View className="items-center gap-2">
            <Txt variant="display" className="text-center">
              {t('onboarding.notifTitle')}
            </Txt>
            <Txt variant="muted" className="text-center">
              {t('onboarding.notifSubtitle', { brand })}
            </Txt>
          </View>
        </View>

        {/* Individual toggles */}
        <View className="gap-3">
          <NotifRow
            label={t('notif.periodTomorrowLabel')}
            hint={t('notif.periodTomorrowHint')}
            value={notifyPeriodTomorrow}
            onValueChange={(enabled) => void toggleNotify(setNotifyPeriodTomorrow, enabled)}
          />
          <NotifRow
            label={t('notif.periodTodayLabel')}
            hint={t('notif.periodTodayHint')}
            value={notifyPeriodToday}
            onValueChange={(enabled) => void toggleNotify(setNotifyPeriodToday, enabled)}
          />
          {fertilityApplicable && (
            <>
              <NotifRow
                label={t('notif.fertileTomorrowLabel')}
                hint={t('notif.fertileTomorrowHint')}
                value={notifyFertileTomorrow}
                onValueChange={(enabled) => void toggleNotify(setNotifyFertileTomorrow, enabled)}
              />
              <NotifRow
                label={t('notif.fertileStartLabel')}
                hint={t('notif.fertileStartHint')}
                value={notifyFertileStart}
                onValueChange={(enabled) => void toggleNotify(setNotifyFertileStart, enabled)}
              />
            </>
          )}
        </View>
      </View>

      <Button title={t('common.getStarted')} disabled={busy} onPress={() => void handleFinish()} />
    </Screen>
  );
}
