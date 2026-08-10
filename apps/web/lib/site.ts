/**
 * Brand + content constants for the basic webpage. Kept dependency-free
 * so the site never pulls in app/crypto code.
 */
export const site = {
  name: 'Locklune',
  supportEmail: 'locklune@constantlearning.org',
  url: 'https://locklune.com',
  github: 'https://github.com/JosDaw/locklune',
  lastUpdated: 'July 30, 2026',
  // Store availability. Both platforms are live.
  playStore: 'https://play.google.com/store/apps/details?id=app.locklune',
  appStore: 'https://apps.apple.com/us/app/locklune/id6795797605' as string | null,
};
