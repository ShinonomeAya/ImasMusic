/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Claude Design System — Surfaces ──
        parchment: '#f5f4ed',
        ivory: '#faf9f5',
        'warm-sand': '#e8e6dc',
        'dark-surface': '#30302e',
        'deep-dark': '#141413',

        // ── Claude Design System — Neutrals & Text ──
        'near-black': '#141413',
        'charcoal-warm': '#4d4c48',
        'olive-gray': '#5e5d59',
        'stone-gray': '#87867f',
        'dark-warm': '#3d3d3a',
        'warm-silver': '#b0aea5',

        // ── Claude Design System — Brand & Accents ──
        terracotta: '#c96442',
        coral: '#d97757',
        'error-crimson': '#b53333',
        'focus-blue': '#3898ec',

        // ── Claude Design System — Borders & Rings ──
        'border-cream': '#f0eee6',
        'border-warm': '#e8e6dc',
        'border-dark': '#30302e',
        'ring-warm': '#d1cfc5',
        'ring-subtle': '#dedcd1',
        'ring-deep': '#c2c0b6',

        // ── Series Brand Colors (Official / Fan Consensus) ──
        brand: {
          '765': '#F34F6D',
          cinderella: '#2681C8',
          million: '#FFC30B',
          sidem: '#0FBE94',
          shinycolors: '#8DBBFF',
          gakuen: '#FF7F27',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Arial', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace'],
      },
      fontSize: {
        'display': ['4rem', { lineHeight: '1.10', fontWeight: '500' }],
        'section': ['3.25rem', { lineHeight: '1.20', fontWeight: '500' }],
        'subheading-lg': ['2.3rem', { lineHeight: '1.30', fontWeight: '500' }],
        'subheading': ['2rem', { lineHeight: '1.10', fontWeight: '500' }],
        'subheading-sm': ['1.6rem', { lineHeight: '1.20', fontWeight: '500' }],
        'feature-title': ['1.3rem', { lineHeight: '1.20', fontWeight: '500' }],
        'body-serif': ['1.0625rem', { lineHeight: '1.60', fontWeight: '400' }],
        'body-lg': ['1.25rem', { lineHeight: '1.60', fontWeight: '400' }],
        'body-nav': ['1.0625rem', { lineHeight: '1.60', fontWeight: '400' }],
        'body-sm': ['0.9375rem', { lineHeight: '1.60', fontWeight: '400' }],
        'caption': ['0.875rem', { lineHeight: '1.43', fontWeight: '400' }],
        'label': ['0.75rem', { lineHeight: '1.25', fontWeight: '400', letterSpacing: '0.12px' }],
        'overline': ['0.625rem', { lineHeight: '1.60', fontWeight: '400', letterSpacing: '0.5px' }],
        'micro': ['0.6rem', { lineHeight: '1.60', fontWeight: '400', letterSpacing: '0.096px' }],
        'code': ['0.9375rem', { lineHeight: '1.60', fontWeight: '400', letterSpacing: '-0.32px' }],
      },
      borderRadius: {
        'sharp': '4px',
        'subtle': '6px',
        'comfortable': '8px',
        'generous': '12px',
        'very': '16px',
        'highly': '24px',
        'maximum': '32px',
      },
      boxShadow: {
        'ring-warm': '0px 0px 0px 1px #d1cfc5',
        'ring-subtle': '0px 0px 0px 1px #dedcd1',
        'ring-deep': '0px 0px 0px 1px #c2c0b6',
        'ring-terracotta': '0px 0px 0px 1px #c96442',
        'whisper': 'rgba(0,0,0,0.05) 0px 4px 24px',
        'inset-ring': 'inset 0px 0px 0px 1px rgba(0,0,0,0.15)',
      },
      spacing: {
        '1.5': '0.375rem',
        '2.5': '0.625rem',
        '7.5': '1.875rem',
        'section': '5rem',
        'section-lg': '7.5rem',
      },
      maxWidth: {
        'container': '1200px',
      },
      lineHeight: {
        'relaxed-body': '1.60',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
      },
    },
  },
  plugins: [],
}
