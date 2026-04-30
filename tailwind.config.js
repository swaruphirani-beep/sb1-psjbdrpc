/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        midnight: {
          DEFAULT: '#0f051d',
          100: '#1a0b30',
          200: '#220d3d',
          300: '#2d1050',
        },
        neon: {
          pink: '#ff2d78',
          orange: '#ff7a00',
          cyan: '#00f5ff',
          green: '#39ff14',
          yellow: '#ffe600',
        },
      },
      backgroundImage: {
        'gradient-neon': 'linear-gradient(135deg, #ff2d78, #ff7a00)',
        'gradient-card': 'linear-gradient(145deg, rgba(26,11,48,0.95), rgba(34,13,61,0.8))',
      },
      boxShadow: {
        'neon-pink': '0 0 20px rgba(255,45,120,0.5), 0 0 40px rgba(255,45,120,0.2)',
        'neon-orange': '0 0 20px rgba(255,122,0,0.5), 0 0 40px rgba(255,122,0,0.2)',
        'neon-cyan': '0 0 20px rgba(0,245,255,0.5), 0 0 40px rgba(0,245,255,0.2)',
        'card': '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s linear infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
    },
  },
  plugins: [],
};
