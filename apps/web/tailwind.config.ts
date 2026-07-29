import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        night: '#0F172A', // background
        night2: '#111827', // secondary background
        card: '#1E293B',
        line: 'rgba(255,255,255,0.08)', // hairline borders
        fg: {
          DEFAULT: '#F8FAFC', // primary text
          soft: '#CBD5E1', // secondary text
          muted: '#94A3B8', // muted text
        },
        moon: '#E2E8F0',
        lock: '#8AA2FF', // accent
        highlight: '#AFC8FF',
        star: '#FFD166',
        success: '#34D399',
      },
      fontFamily: {
        sans: [
          'var(--font-inter)',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        display: ['var(--font-manrope)', 'var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      maxWidth: {
        container: '1120px',
      },
      boxShadow: {
        glow: '0 40px 120px -20px rgba(138,162,255,0.35)',
        card: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 20px 40px -24px rgba(0,0,0,0.6)',
      },
      keyframes: {
        floaty: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        twinkle: {
          '0%,100%': { opacity: '0.25' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        floaty: 'floaty 7s ease-in-out infinite',
        twinkle: 'twinkle 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
