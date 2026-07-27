/**
 * Purely local reminders. Notifications are scheduled on-device from the
 * prediction; nothing is registered with any push service and no network is used.
 */
import * as Notifications from 'expo-notifications';
import { fromEpochDay, type Prediction } from '@locklune/core';

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

function reminderBody(daysBefore: number): string {
  if (daysBefore <= 0) return 'Your period may start today.';
  if (daysBefore === 1) return 'Your period may start tomorrow.';
  return `Your period may start in ${daysBefore} days.`;
}

/**
 * Re-schedule reminders to match the latest prediction. Cancels prior ones so
 * this is safe to call after every data change.
 */
export async function syncReminders(
  prediction: Prediction,
  reminderDaysBefore: number[],
): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  const next = prediction.upcoming[0];
  if (!next) return;

  for (const daysBefore of reminderDaysBefore) {
    const when = fromEpochDay(next.periodStart - daysBefore);
    when.setHours(9, 0, 0, 0); // 9am local
    if (when.getTime() <= Date.now()) continue;
    await Notifications.scheduleNotificationAsync({
      content: { title: 'Locklune', body: reminderBody(daysBefore) },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: when },
    });
  }
}

export async function cancelAllReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
