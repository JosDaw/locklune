/**
 * JS mirror of the Tailwind palette (see tailwind.config.js) for places that
 * can't take a className: navigation theme, StatusBar, calendar markers, etc.
 *
 * Slate / moonlight theme (matches the marketing site).
 */
export const colors = {
  ink: '#0F172A', // app background (night)
  ink2: '#111827', // secondary background (gradient toward this)
  surface: '#162032', // cards
  surfaceMuted: '#273449', // inputs / chips / pressed
  border: 'rgba(255,255,255,0.08)', // hairline
  primary: '#6EA8FE', // moon-blue accent
  primaryDark: '#4C86E8',
  primarySoft: '#AFC8FF', // soft highlight
  accent: '#AFC8FF',
  moon: '#E2E8F0',
  star: '#FFD166', // celestial accent (scattered stars)
  text: '#F8FAFC',
  textMuted: '#CBD5E1',
  textFaint: '#94A3B8',
  period: '#6EA8FE',
  fertile: '#AFC8FF',
  ovulation: '#6EE7B7', // muted sage-leaning green
  danger: '#F87171',
  success: '#34D399',
} as const;

export type ColorName = keyof typeof colors;
