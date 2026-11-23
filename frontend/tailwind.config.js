/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0F1E36',
          800: '#172B4D',
          700: '#203A64',
          600: '#2C4D80',
        },
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
        },
        surface: '#FFFFFF',
        canvas: '#F5F7FB',
        border: '#E2E8F0',
        txt: {
          primary: '#172033',
          secondary: '#64748B',
          muted: '#94A3B8',
        },
        gmp: {
          success: '#16A34A',
          warning: '#D97706',
          critical: '#DC2626',
          ai: '#7C3AED',
          aiLight: '#F3E8FF',
          hypothesis: '#E0E7FF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      }
    },
  },
  plugins: [],
}
