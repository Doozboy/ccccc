/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        bosenAlt: ['Bebas Neue', 'sans-serif'],
        syne: ['Bebas Neue', 'Bebas Neue Regular', 'sans-serif'],
        ibm: ['"IBM Plex Sans"', 'sans-serif'],
      },
      colors: {
        gold: '#c9a84c',
        ink: '#0e0e0e',
        cream: '#f5f2ec',
      },
      keyframes: {
        'fade-in-delayed': {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-delayed': 'fade-in-delayed 1.2s ease-out',
      },
    },
  },
  plugins: [],
};
