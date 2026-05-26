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
        // Base surfaces — deep navy, not cold black
        void:    '#06090f',
        ink:     '#0c1018',
        deep:    '#111827',
        panel:   '#1a2332',
        border:  '#1e2d3d',
        muted:   '#2d3f52',

        // Text
        primary:   '#f1f5f9',
        secondary: '#94a3b8',
        tertiary:  '#475569',
        dim:       '#334155',

        // Accent — Warm Amber / Gold
        gold:      '#f59e0b',
        goldLight: '#fbbf24',
        goldDim:   '#d97706',
        goldGlow:  '#fef3c7',

        // Accent — Soft Rose / Coral
        rose:      '#fb7185',
        roseLight: '#fda4af',
        roseDim:   '#e11d48',

        // Accent — Soft Indigo / Lavender
        indigo:    '#818cf8',
        indigoLight:'#a5b4fc',
        indigoDim: '#4f46e5',

        // Accent — Sage / Mint (for success/live states)
        sage:      '#34d399',
        sageDim:   '#059669',
      },
      backgroundImage: {
        'radial-soft':  'radial-gradient(ellipse at 50% 0%, rgba(245,158,11,0.08) 0%, transparent 60%)',
        'radial-rose':  'radial-gradient(ellipse at 80% 50%, rgba(251,113,133,0.06) 0%, transparent 50%)',
        'radial-indigo':'radial-gradient(ellipse at 20% 80%, rgba(129,140,248,0.06) 0%, transparent 50%)',
        'grid-fine':    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M0 0h40v40H0z' fill='none'/%3E%3Cpath d='M0 40V0M40 0v40' stroke='rgba(30,45,61,0.6)' stroke-width='0.5'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'gold':    '0 0 24px rgba(245,158,11,0.25), 0 0 48px rgba(245,158,11,0.08)',
        'rose':    '0 0 24px rgba(251,113,133,0.25), 0 0 48px rgba(251,113,133,0.08)',
        'indigo':  '0 0 24px rgba(129,140,248,0.25), 0 0 48px rgba(129,140,248,0.08)',
        'card':    '0 1px 0 rgba(255,255,255,0.04), 0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(30,45,61,0.6)',
        'elevated':'0 1px 0 rgba(255,255,255,0.06), 0 20px 60px rgba(0,0,0,0.4)',
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
          '0%': { opacity: '0', transform: 'translateY(32px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
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
          '0%, 100%': { boxShadow: '0 0 16px rgba(245,158,11,0.2)' },
          '50%': { boxShadow: '0 0 32px rgba(245,158,11,0.5), 0 0 64px rgba(245,158,11,0.15)' },
        },
      },
    },
  },
  plugins: [],
}
