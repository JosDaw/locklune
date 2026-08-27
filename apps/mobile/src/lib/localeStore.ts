/**
 * Persists the user's chosen app language in the OS keystore so it survives
 * restarts and is available before the vault is unlocked (the lock screen honours
 * it too). The locale is not sensitive; secure-store is simply the key/value
 * store already available on device.
 */
import * as SecureStore from 'expo-secure-store';
import { SUPPORTED_LOCALES, type SupportedLocale } from '../i18n';

const LOCALE_KEY = 'locklune.locale.v1';

function isSupported(value: string): value is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

/** The saved locale, or null if the user has never chosen one (use device default). */
export async function getStoredLocale(): Promise<SupportedLocale | null> {
  try {
    const raw = await SecureStore.getItemAsync(LOCALE_KEY);
    return raw && isSupported(raw) ? raw : null;
  } catch {
    return null;
  }
}

export async function setStoredLocale(locale: SupportedLocale): Promise<void> {
  try {
    await SecureStore.setItemAsync(LOCALE_KEY, locale);
  } catch {
    // Best-effort: a failed write just means the choice won't persist.
  }
}
