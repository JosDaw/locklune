/**
 * App-wide localisation. Built on i18n-js (tiny, offline, no network) with the
 * device locale detected via expo-localization. English is the source of truth
 * and the fallback; other catalogues are structurally checked against it.
 *
 * Runtime locale changes (a future settings toggle) re-render subscribed
 * components via `useLocale()`, which is backed by useSyncExternalStore.
 */
import { getLocales } from 'expo-localization';
import { I18n, type TranslateOptions } from 'i18n-js';
import { useSyncExternalStore } from 'react';
import { applyLocaleFonts } from '../theme/fonts';
import de from './locales/de';
import { en } from './locales/en';
import es from './locales/es';
import ko from './locales/ko';

export const SUPPORTED_LOCALES = ['en', 'es', 'de', 'ko'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const i18n = new I18n({ en, es, de, ko }, { defaultLocale: 'en', enableFallback: true });

/** First supported device language, else English. */
function detectLocale(): SupportedLocale {
  const code = getLocales()[0]?.languageCode ?? 'en';
  return (SUPPORTED_LOCALES as readonly string[]).includes(code) ? (code as SupportedLocale) : 'en';
}

i18n.locale = detectLocale();
applyLocaleFonts(i18n.locale);

// --- runtime switching -------------------------------------------------------
const listeners = new Set<() => void>();

export function getLocale(): SupportedLocale {
  return i18n.locale as SupportedLocale;
}

export function setLocale(locale: SupportedLocale): void {
  if (i18n.locale === locale) return;
  i18n.locale = locale;
  applyLocaleFonts(locale);
  listeners.forEach((notify) => notify());
}

/** Translate a key. Thin wrapper so call sites never import the instance. */
export function t(key: string, options?: TranslateOptions): string {
  return i18n.t(key, options);
}

/**
 * Subscribe a component to the active locale so it re-renders on change.
 * Returns the current locale; use alongside `t()` in the same render.
 */
export function useLocale(): SupportedLocale {
  return useSyncExternalStore(
    (onChange) => {
      listeners.add(onChange);
      return () => listeners.delete(onChange);
    },
    getLocale,
    getLocale,
  );
}
