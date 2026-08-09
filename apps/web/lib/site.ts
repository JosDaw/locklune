/**
 * Brand + content constants for the basic webpage. Kept dependency-free
 * so the site never pulls in app/crypto code.
 */
export const site = {
  name: 'Locklune',
  tagline: "Finally, a period tracker that's actually private.",
  description:
    'Locklune keeps your cycle on your device, encrypted with your PIN. No cloud, no account, no tracking.',
  supportEmail: 'locklune@constantlearning.org',
  url: 'https://locklune.com',
  github: 'https://github.com/JosDaw/locklune',
  lastUpdated: 'July 30, 2026',
  // Store availability. Both platforms are live.
  playStore: 'https://play.google.com/store/apps/details?id=app.locklune',
  appStore: 'https://apps.apple.com/us/app/locklune/id6795797605' as string | null,
};

export const comparison: { label: string; locklune: string; others: string }[] = [
  {
    label: 'Where your data lives',
    locklune: 'Local-only, on your device',
    others: 'Synced to the cloud',
  },
  { label: 'Access', locklune: 'PIN protected', others: 'Login required' },
  { label: 'Analytics', locklune: 'None', others: 'Usage tracking' },
  { label: 'Account', locklune: 'No account', others: 'Email required' },
  { label: 'Encryption', locklune: 'On-device AES-256', others: 'Varies, often server-side' },
  {
    label: 'Government or legal requests',
    locklune: 'No data exists to seize',
    others: 'Cloud data can be handed over',
  },
  {
    label: 'Repeated wrong PINs',
    locklune: 'Erases all data after 5 tries',
    others: 'Account lockout',
  },
];

export const security: { title: string; body: string }[] = [
  {
    title: 'End-to-end local encryption',
    body: 'Your data lives in an AES-256 encrypted database (SQLCipher), unlocked only by your PIN.',
  },
  {
    title: 'PIN lock',
    body: 'A PIN you choose derives the encryption key. It is never stored or transmitted.',
  },
  {
    title: 'Offline support',
    body: 'Everything works with no connection. There is nothing to sync.',
  },
  {
    title: 'No servers',
    body: 'There is no backend to breach, subpoena, or sell. We hold nothing.',
  },
  {
    title: 'No third-party analytics',
    body: 'No SDKs, no trackers, no identifiers. Not in the app, not on this site.',
  },
  {
    title: 'Auto-erase',
    body: 'After 5 incorrect PIN attempts, everything on the device is wiped, so a lost or stolen phone reveals nothing.',
  },
];
