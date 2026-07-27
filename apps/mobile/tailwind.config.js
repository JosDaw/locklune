const gluestackPlugin = require('@gluestack-ui/nativewind-utils/tailwind-plugin');

// gluestack token scale mapped to the CSS variables the provider injects.
const scale = (name) =>
  Object.fromEntries(
    [0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((n) => [
      n,
      `rgb(var(--color-${name}-${n})/<alpha-value>)`,
    ]),
  );

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'media',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // --- gluestack-ui token scales (driven by provider CSS vars) ---
        primary: {
          ...scale('primary'),
          // Locklune brand accents (used by app classNames like bg-primary).
          DEFAULT: '#6EA8FE',
          dark: '#4C86E8',
          soft: '#AFC8FF',
        },
        secondary: scale('secondary'),
        tertiary: {
          50: 'rgb(var(--color-tertiary-50)/<alpha-value>)',
          100: 'rgb(var(--color-tertiary-100)/<alpha-value>)',
          200: 'rgb(var(--color-tertiary-200)/<alpha-value>)',
          300: 'rgb(var(--color-tertiary-300)/<alpha-value>)',
          400: 'rgb(var(--color-tertiary-400)/<alpha-value>)',
          500: 'rgb(var(--color-tertiary-500)/<alpha-value>)',
          600: 'rgb(var(--color-tertiary-600)/<alpha-value>)',
          700: 'rgb(var(--color-tertiary-700)/<alpha-value>)',
          800: 'rgb(var(--color-tertiary-800)/<alpha-value>)',
          900: 'rgb(var(--color-tertiary-900)/<alpha-value>)',
          950: 'rgb(var(--color-tertiary-950)/<alpha-value>)',
        },
        error: scale('error'),
        success: scale('success'),
        warning: scale('warning'),
        info: scale('info'),
        typography: {
          ...scale('typography'),
          white: '#FFFFFF',
          gray: '#D4D4D4',
          black: '#181718',
        },
        outline: scale('outline'),
        background: {
          ...scale('background'),
          error: 'rgb(var(--color-background-error)/<alpha-value>)',
          warning: 'rgb(var(--color-background-warning)/<alpha-value>)',
          muted: 'rgb(var(--color-background-muted)/<alpha-value>)',
          success: 'rgb(var(--color-background-success)/<alpha-value>)',
          info: 'rgb(var(--color-background-info)/<alpha-value>)',
          light: '#FBFBFB',
          dark: '#181719',
        },
        indicator: {
          primary: 'rgb(var(--color-indicator-primary)/<alpha-value>)',
          info: 'rgb(var(--color-indicator-info)/<alpha-value>)',
          error: 'rgb(var(--color-indicator-error)/<alpha-value>)',
        },

        // --- Locklune custom palette (slate / moonlight) ---
        ink: '#0F172A',
        ink2: '#111827',
        surface: '#162032',
        surfaceMuted: '#273449',
        border: 'rgba(255,255,255,0.08)',
        accent: '#AFC8FF',
        moon: '#E2E8F0',
        star: '#FFD166',
        text: { DEFAULT: '#F8FAFC', muted: '#CBD5E1', faint: '#94A3B8' },
        period: '#6EA8FE',
        fertile: '#AFC8FF',
        ovulation: '#6EE7B7',
        danger: '#F87171',
      },
      fontFamily: {
        roboto: ['Roboto', 'sans-serif'],
        // Locklune premium type: Manrope for headings, Inter for body.
        display: ['Manrope_700Bold'],
        heading: ['Manrope_600SemiBold'],
        body: ['Inter_400Regular'],
        'body-medium': ['Inter_500Medium'],
        'body-semibold': ['Inter_600SemiBold'],
      },
      fontWeight: {
        extrablack: '950',
      },
      fontSize: {
        '2xs': '10px',
      },
      borderRadius: {
        xl: '16px',
        '2xl': '22px',
        '3xl': '28px',
      },
      boxShadow: {
        'hard-1': '-2px 2px 8px 0px rgba(38, 38, 38, 0.20)',
        'hard-2': '0px 3px 10px 0px rgba(38, 38, 38, 0.20)',
        'hard-3': '2px 2px 8px 0px rgba(38, 38, 38, 0.20)',
        'hard-4': '0px -3px 10px 0px rgba(38, 38, 38, 0.20)',
        'hard-5': '0px 2px 10px 0px rgba(38, 38, 38, 0.10)',
        'soft-1': '0px 0px 10px rgba(38, 38, 38, 0.1)',
        'soft-2': '0px 0px 20px rgba(38, 38, 38, 0.2)',
        'soft-3': '0px 0px 30px rgba(38, 38, 38, 0.1)',
        'soft-4': '0px 0px 40px rgba(38, 38, 38, 0.1)',
      },
    },
  },
  plugins: [gluestackPlugin],
};
