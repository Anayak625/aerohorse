/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // Light surfaces
        void:    '#ffffff',
        ink:     '#f8fafc',
        deep:    '#f1f5f9',
        panel:   '#e8eef5',
        border:  '#dbe4ef',
        muted:   '#94a3b8',

        // Text
        primary:   '#0f172a',
        secondary: '#475569',
        tertiary:  '#64748b',
        dim:       '#94a3b8',

        // Primary brand — logo blue (gold token name kept for compat)
        gold:      '#2563eb',
        goldLight: '#3b82f6',
        goldDim:   '#1d4ed8',
        goldGlow:  '#eff6ff',

        // Secondary — softer blue family
        rose:      '#5b8fd4',
        roseLight: '#93c5fd',
        roseDim:   '#1e40af',

        indigo:     '#5b8fd4',
        indigoLight:'#93c5fd',
        indigoDim:  '#1e40af',

        sage:      '#5b8fd4',
        sageDim:   '#1e40af',

        live:      '#059669',
      },
      backgroundImage: {
        'radial-soft':  'radial-gradient(ellipse at 50% 0%, rgba(37,99,235,0.08) 0%, transparent 60%)',
        'radial-rose':  'radial-gradient(ellipse at 80% 50%, rgba(91,143,212,0.06) 0%, transparent 50%)',
        'radial-indigo':'radial-gradient(ellipse at 20% 80%, rgba(91,143,212,0.06) 0%, transparent 50%)',
        'grid-fine':    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M0 0h40v40H0z' fill='none'/%3E%3Cpath d='M0 40V0M40 0v40' stroke='rgba(203,213,225,0.8)' stroke-width='0.5'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'soft':    '0 1px 2px rgba(15,23,42,0.04), 0 8px 24px rgba(15,23,42,0.05)',
        'soft-lg': '0 2px 4px rgba(15,23,42,0.04), 0 16px 40px rgba(15,23,42,0.07)',
        'gold':    '0 1px 2px rgba(15,23,42,0.04), 0 8px 24px rgba(15,23,42,0.05)',
        'rose':    '0 1px 2px rgba(15,23,42,0.04), 0 8px 24px rgba(15,23,42,0.05)',
        'indigo':  '0 1px 2px rgba(15,23,42,0.04), 0 8px 24px rgba(15,23,42,0.05)',
        'card':    '0 1px 2px rgba(15,23,42,0.04), 0 8px 24px rgba(15,23,42,0.05)',
        'elevated':'0 2px 4px rgba(15,23,42,0.04), 0 16px 40px rgba(15,23,42,0.07)',
      },
      animation: {
        'fade-up':    'fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) forwards',
        'fade-in':    'fadeIn 0.5s ease forwards',
        'float':      'float 6s ease-in-out infinite',
        'shimmer':    'shimmer 2.5s linear infinite',
        'spin-slow':  'spin 8s linear infinite',
        'marquee':    'marquee 30s linear infinite',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
        'glow-gold':  'glowGold 3s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translate3d(0, 32px, 0)' },
          '100%': { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-16px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        glowGold: {
          '0%, 100%': { boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 8px 24px rgba(15,23,42,0.05)' },
          '50%': { boxShadow: '0 2px 4px rgba(15,23,42,0.04), 0 16px 40px rgba(15,23,42,0.07)' },
        },
      },
    },
  },
  plugins: [],
}
