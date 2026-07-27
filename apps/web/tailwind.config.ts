import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#12101B',
        surface: '#1E1B2E',
        surfaceMuted: '#2A2640',
        border: '#332F4A',
        primary: { DEFAULT: '#7C6FF0', dark: '#5B4FD1', soft: '#A79CF6' },
        accent: '#E9B8D6',
        moon: '#F4F1FF',
        text: { DEFAULT: '#ECE9F7', muted: '#A39FB8', faint: '#6F6A87' },
      },
      fontFamily: {
        // System font stack — no web-font downloads, so zero external requests.
        sans: [
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};

export default config;
