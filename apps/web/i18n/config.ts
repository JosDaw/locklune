/**
 * Locale configuration for the marketing site. Languages are exposed as URL
 * segments (/en, /es, /de, /ko) and statically generated. Legal pages
 * (/privacy, /terms) intentionally stay in English regardless of locale.
 */
export const locales = ['en', 'es', 'de', 'ko'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
