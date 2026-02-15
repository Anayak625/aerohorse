/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,html}'],
  theme: {
    extend: {
      colors: {
        aerohorse: {
          dark: '#13131F',
          surface: '#1a1a2e',
          accent: '#E0359C',
          magenta: '#E0359C',
          purple: '#6A0DAD',
          'purple-deep': '#4B0082',
          // Light theme
          light: '#FAF9FC',
          'light-surface': '#FFFFFF',
          'text-dark': '#1a1a2e',
          'text-muted': '#5c5c7a',
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #E0359C 0%, #6A0DAD 100%)',
      },
      fontFamily: {
        display: ['Orbitron', 'system-ui', 'sans-serif'],
        sans: ['Rajdhani', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '0.8' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
