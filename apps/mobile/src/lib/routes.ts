/**
 * Centralized expo-router routes, so screens never hard-code path strings.
 *
 * `ROUTES` values are typed hrefs passed to `router.push` / `router.replace`
 * (kept literal via `as const` so expo-router's typed-routes checking still
 * applies). `SEGMENT` values are the first path segment (`useSegments()[0]`)
 * compared against in the root layout's auth-routing guards.
 */
export const ROUTES = {
  tabs: '/(tabs)',
  onboarding: '/onboarding',
  lock: '/lock',
  reset: '/reset',
  log: '/log',
  changePin: '/change-pin',
} as const;

export const SEGMENT = {
  onboarding: 'onboarding',
  lock: 'lock',
  reset: 'reset',
} as const;
