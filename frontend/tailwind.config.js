/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FDF8EC',
          100: '#FAF0D5',
          200: '#F5DEAB',
          300: '#F2C46D',
          400: '#ECB355',
          500: '#E6A23C', // Primary Gold
          600: '#C98522',
          700: '#A46513',
          800: '#7E4910',
          900: '#5C330B',
        },
        dark: {
          50: '#F6F6F6',
          100: '#E7E7E7',
          200: '#D1D1D1',
          300: '#B0B0B0',
          400: '#888888',
          500: '#4A4A4A', // Dark Gray Brand
          600: '#3D3D3D',
          700: '#303030',
          800: '#242424',
          900: '#171717',
        },
        surface: {
          bg: '#F7F8FA',
          card: '#FFFFFF',
          border: '#DADADA',
          muted: '#6B7280',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
      borderRadius: {
        'sm': '8px',
        'md': '14px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '28px',
        '3xl': '32px',
      },
      boxShadow: {
        'soft-sm': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'soft-md': '0 8px 24px rgba(0, 0, 0, 0.08)',
        'soft-lg': '0 16px 48px rgba(0, 0, 0, 0.12)',
        'gold-glow': '0 0 25px rgba(230, 162, 60, 0.35)',
        'gold-glow-lg': '0 0 45px rgba(230, 162, 60, 0.45)',
        'gold-subtle': '0 4px 20px rgba(242, 196, 109, 0.25)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 9s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
