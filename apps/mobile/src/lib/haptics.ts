/**
 * Tasteful, device-local haptic feedback. Every call is best-effort and swallows
 * errors so unsupported devices (or the web build) never crash. This is the single
 * place to tune or disable feedback. Like everything in Locklune, it uses no network.
 */
import * as Haptics from 'expo-haptics';

/** Light tick, e.g. a PIN key press. */
export function tap(): void {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
}

/** Positive confirmation, e.g. a log saved or a period marked. */
export function success(): void {
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
}

/** Negative feedback, e.g. a wrong PIN. */
export function error(): void {
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => undefined);
}

/** Caution, e.g. opening a destructive confirmation. */
export function warn(): void {
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => undefined);
}
