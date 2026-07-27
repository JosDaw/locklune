/**
 * JS mirror of the Tailwind palette (see tailwind.config.js) for places that
 * can't take a className: navigation theme, StatusBar, calendar markers, etc.
 *
 * Slate / moonlight theme (matches the marketing site).
 */
export const colors = {
  ink: '#0F172A', // app background (night)
  surface: '#1E293B', // cards
  surfaceMuted: '#273449', // inputs / chips / pressed
  border: '#232A3B', // hairline (~rgba(255,255,255,0.08) over night)
  primary: '#6EA8FE', // lock accent
  primaryDark: '#4C86E8',
  primarySoft: '#AFC8FF', // highlight
  accent: '#AFC8FF',
  moon: '#E2E8F0',
  text: '#F8FAFC',
  textMuted: '#CBD5E1',
  textFaint: '#94A3B8',
  period: '#6EA8FE',
  fertile: '#AFC8FF',
  ovulation: '#34D399',
  danger: '#F87171',
  success: '#34D399',
} as const;

export type ColorName = keyof typeof colors;
