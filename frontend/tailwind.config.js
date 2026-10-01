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
        dark: {
          950: '#07090e',
          900: '#0b0f19',
          850: '#111726',
          800: '#161f33',
          750: '#1c2842',
          700: '#233252',
          600: '#33446b',
        },
        brand: {
          50: '#ecfeff',
          100: '#cffafe',
          500: '#06b6d4',
          600: '#0891b2',
          DEFAULT: '#00d2ff',
        },
        trade: {
          green: '#10b981',
          'green-dark': '#059669',
          'green-bg': 'rgba(16, 185, 129, 0.12)',
          red: '#ef4444',
          'red-dark': '#dc2626',
          'red-bg': 'rgba(239, 68, 68, 0.12)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
