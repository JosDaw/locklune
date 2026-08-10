import 'server-only';
import { defaultLocale, isLocale, type Locale } from './config';
import type { Dictionary } from './dictionaries/en';

/** Lazily load a locale's dictionary on the server (never bundled to the client). */
const loaders: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import('./dictionaries/en').then((module) => module.default),
  es: () => import('./dictionaries/es').then((module) => module.default),
  de: () => import('./dictionaries/de').then((module) => module.default),
  ko: () => import('./dictionaries/ko').then((module) => module.default),
};

/** Accepts the raw route param (a string) and falls back to English if unknown. */
export function getDictionary(locale: string): Promise<Dictionary> {
  return loaders[isLocale(locale) ? locale : defaultLocale]();
}

export type { Dictionary };
