/**
 * JS mirror of the Tailwind palette (see tailwind.config.js) for places that
 * can't take a className: navigation theme, StatusBar, calendar markers, etc.
 */
export const colors = {
  ink: '#12101B',
  surface: '#1E1B2E',
  surfaceMuted: '#2A2640',
  border: '#332F4A',
  primary: '#7C6FF0',
  primaryDark: '#5B4FD1',
  primarySoft: '#A79CF6',
  accent: '#E9B8D6',
  moon: '#F4F1FF',
  text: '#ECE9F7',
  textMuted: '#A39FB8',
  textFaint: '#6F6A87',
  period: '#E8688C',
  fertile: '#86C7F2',
  ovulation: '#5AD1B0',
  danger: '#F87171',
  success: '#6EE7B7',
} as const;

export type ColorName = keyof typeof colors;
