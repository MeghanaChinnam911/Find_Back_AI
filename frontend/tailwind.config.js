/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#F7F7F4',
        surface: '#FFFFFF',
        'surface-subtle': '#F0F0EC',
        border: '#E4E7EC',
        'border-strong': '#D0D5DD',
        primary: '#17324D',
        'primary-hover': '#0F2338',
        accent: '#2F6B57',
        'accent-hover': '#245343',
        warning: '#B7791F',
        danger: '#B54747',
        'text-main': '#202124',
        'text-muted': '#667085',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(16, 24, 40, 0.08), 0 1px 2px rgba(16, 24, 40, 0.04)',
        'modal': '0 20px 24px -4px rgba(16, 24, 40, 0.1), 0 8px 8px -4px rgba(16, 24, 40, 0.04)',
        'dropdown': '0 12px 16px -4px rgba(16, 24, 40, 0.08), 0 4px 6px -2px rgba(16, 24, 40, 0.03)',
      },
    },
  },
  plugins: [],
}
