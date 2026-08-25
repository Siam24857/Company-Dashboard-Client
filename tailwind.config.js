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
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
