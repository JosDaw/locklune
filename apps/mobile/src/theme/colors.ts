/**
 * JS mirror of the Tailwind palette (see tailwind.config.js) for places that
 * can't take a className: navigation theme, StatusBar, calendar markers, etc.
 *
 * Slate / moonlight theme (matches the webpage).
 */
export const colors = {
  ink: '#000022', // app background (night)
  ink2: '#000030', // secondary background (gradient toward this)
  surface: '#162032', // cards
  surfaceMuted: '#273449', // inputs / chips / pressed
  border: 'rgba(255,255,255,0.08)', // hairline
  primary: '#8AA2FF', // moonlit periwinkle accent
  primaryDark: '#6B82E6',
  primarySoft: '#AFC8FF', // soft highlight
  accent: '#AFC8FF',
  moon: '#E2E8F0',
  star: '#FFD166', // celestial accent (scattered stars)
  text: '#F8FAFC',
  textMuted: '#CBD5E1',
  textFaint: '#94A3B8',
  period: '#8AA2FF',
  fertile: '#AFC8FF',
  ovulation: '#6EE7B7', // muted sage-leaning green
  danger: '#F87171',
  success: '#34D399',

  // Repeated periwinkle (primary #8AA2FF) tints used across screens.
  primaryTint: 'rgba(138,162,255,0.06)', // faint card wash
  primaryTintBorder: 'rgba(138,162,255,0.18)', // border on tinted cards
  primaryHairline: 'rgba(138,162,255,0.15)', // hairline on tinted cards
  primaryGlow: 'rgba(138,162,255,0.08)', // hero circle fill
  primaryGlowBorder: 'rgba(138,162,255,0.25)', // hero circle border
  primarySelected: 'rgba(138,162,255,0.12)', // selected pill / mood / flow fill
  predictedFill: 'rgba(138,162,255,0.20)', // predicted day background
  predictedDim: 'rgba(138,162,255,0.3)', // predicted legend dot
  predictedRing: 'rgba(138,162,255,0.6)', // dashed predicted-day ring
  avgLine: 'rgba(138,162,255,0.35)', // cycle-chart average line
  ringTrack: 'rgba(255,255,255,0.07)', // unfilled progress-ring track
} as const;
