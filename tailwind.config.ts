import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          400: '#FFD700',
          500: '#FFC700',
          600: '#FFB700',
        },
        ipl: {
          dark: '#1E2340',
          darker: '#2D3255',
          purple: '#4F46E5',
          'purple-light': '#8B5CF6',
          gold: '#FFD700',
          'gold-dark': '#B8860B',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 215, 0, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 215, 0, 0.8)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
export default config
