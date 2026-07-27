/**
 * Single source of truth for the app's brand identity. Imported by the mobile
 * app (and mirrored by the web site) so the name lives in exactly one place.
 */
export const BRAND = {
  name: 'Locklune',
  tagline: 'Your cycle. Locked to your device.',
  /** "lock" (privacy/security) + "lune" (moon/cycle). */
  description:
    'A 100% on-device, encrypted period tracker. No account, no cloud, no tracking. Your data never leaves your phone.',
  /** Reverse-DNS id used for the app bundle identifier / package name. */
  appId: 'app.locklune',
  supportEmail: 'support@locklune.app',
  websiteUrl: 'https://locklune.app',
} as const;

export type Brand = typeof BRAND;
