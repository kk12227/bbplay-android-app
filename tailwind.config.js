/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        neon: {
          cyan: '#00f5c4',
          blue: '#00c6ff',
          purple: '#b14aff',
        },
        dark: {
          950: '#09090f',
          900: '#0e0e18',
          800: '#14141f',
          700: '#1c1c2e',
          600: '#252540',
        }
      },
      fontFamily: {
        display: ['"Exo 2"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.4s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #00f5c4, 0 0 10px #00f5c4' },
          '100%': { boxShadow: '0 0 10px #00f5c4, 0 0 30px #00f5c4, 0 0 50px #00f5c440' }
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        }
      },
      backgroundImage: {
        'grid-dark': 'linear-gradient(rgba(0,245,196,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,196,0.03) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '40px 40px'
      }
    },
  },
  plugins: [],
}
