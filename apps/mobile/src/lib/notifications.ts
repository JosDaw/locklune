/**
 * Purely local reminders. Notifications are scheduled on-device from the
 * prediction; nothing is registered with any push service and no network is used.
 */
import * as Notifications from 'expo-notifications';
import { fromEpochDay, BRAND, type Prediction, type Settings } from '@locklune/core';
import { t } from '../i18n';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted) return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

function shortDate(epochDay: number): string {
  return fromEpochDay(epochDay).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

async function scheduleAt(epochDay: number, body: string): Promise<void> {
  const when = fromEpochDay(epochDay);
  when.setHours(9, 0, 0, 0);
  if (when.getTime() <= Date.now()) return;
  await Notifications.scheduleNotificationAsync({
    content: { title: BRAND.name, body },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: when },
  });
}

/**
 * Re-schedule reminders to match the latest prediction. Cancels prior ones so
 * this is safe to call after every data change.
 */
export async function syncReminders(prediction: Prediction, settings: Settings): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  const next = prediction.upcoming[0];
  if (!next) return;

  if (settings.notifyPeriodTomorrow) {
    await scheduleAt(next.periodStart - 1, t('notif.periodTomorrowBody'));
  }
  if (settings.notifyPeriodToday) {
    await scheduleAt(next.periodStart, t('notif.periodTodayBody'));
  }

  if (prediction.fertilityApplicable) {
    if (settings.notifyFertileTomorrow) {
      await scheduleAt(next.fertileWindow.start - 1, t('notif.fertileTomorrowBody'));
    }
    if (settings.notifyFertileStart) {
      await scheduleAt(
        next.fertileWindow.start,
        t('notif.fertileOpenBody', { date: shortDate(next.fertileWindow.end) }),
      );
    }
  }
}

export async function cancelAllReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
