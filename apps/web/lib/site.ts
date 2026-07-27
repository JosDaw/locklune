/**
 * Brand + content constants for the marketing/privacy site. Mirrors the mobile
 * app's brand (see packages/core/src/brand.ts) but kept dependency-free so the
 * site never pulls in app/crypto code.
 */
export const site = {
  name: 'Locklune',
  tagline: 'Your cycle. Locked to your device.',
  description:
    'A period tracker that keeps everything on your phone, encrypted with your PIN. No account, no cloud, no tracking.',
  supportEmail: 'support@locklune.app',
  url: 'https://locklune.app',
  lastUpdated: 'July 27, 2026',
};

export const features = [
  {
    title: 'Encrypted on your device',
    body: 'Everything is stored in an AES-256 encrypted database (SQLCipher), unlocked only by your PIN.',
  },
  {
    title: 'Truly offline',
    body: 'There is no server and no network code. Your data physically cannot leave your phone.',
  },
  {
    title: 'No account, no tracking',
    body: 'We collect nothing — no email, no analytics, no identifiers, no ads. Ever.',
  },
  {
    title: 'Smart predictions',
    body: 'An adaptive model learns your cycle to forecast periods, fertile windows and ovulation — all computed on-device.',
  },
  {
    title: 'Biometric unlock',
    body: 'Optional Face ID / fingerprint unlock, with your PIN always as the backup.',
  },
  {
    title: 'You are in control',
    body: 'Log flow, mood and symptoms, get local reminders, and erase everything instantly whenever you want.',
  },
];
