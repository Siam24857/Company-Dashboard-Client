/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './app/**/*.{js,jsx,ts,tsx,mdx}',
    './components/**/*.{js,jsx,ts,tsx,mdx}',
    './src/**/*.{js,jsx,ts,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0B1112',
        teal: {
          DEFAULT: '#3B8E93',
          light: 'rgba(59,142,147,0.08)',
        },
        orange: {
          DEFAULT: '#FF8A3D',
          light: 'rgba(255,138,61,0.15)',
        },
        offwhite: '#F2F7F7',
        muted: 'rgba(242,247,247,0.50)',
        border: 'rgba(242,247,247,0.08)',
        severity: {
          critical: 'var(--red)',
          info: 'var(--blue)',
          success: 'var(--green)',
          warn: 'var(--yellow)',
          ai: 'var(--violet)',
          cyan: 'var(--cyan)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
        display: ['var(--font-display)', 'Space Grotesk', 'Inter', 'sans-serif'],
      },
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
        'spin-slow': {
          to: { transform: 'rotate(360deg)' },
        },
        drift: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(24px, -16px)' },
        },
      },
      animation: {
        'pulse-soft': 'pulse-soft 2.4s ease-in-out infinite',
        'spin-slow': 'spin-slow 1.4s linear infinite',
        drift: 'drift 18s ease-in-out infinite',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      borderRadius: {
        '2xl': '18px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
}