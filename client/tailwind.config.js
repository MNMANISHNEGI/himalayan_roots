/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f0f7f0',
          100: '#dceddc',
          200: '#bbdcbc',
          300: '#8dc390',
          400: '#5da462',
          500: '#3a8540',
          600: '#2d6b33',
          700: '#25562a',
          800: '#204524',
          900: '#1b3a1f',
          950: '#0d2011',
        },
        earth: {
          50: '#fdf8f0',
          100: '#faeedd',
          200: '#f4dabc',
          300: '#ebbf8e',
          400: '#e09d5e',
          500: '#d4803a',
          600: '#c4672e',
          700: '#a35027',
          800: '#834025',
          900: '#6a3522',
          950: '#391b0f',
        },
        cream: '#FFF8F0',
        gold: '#C9A84C',
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'mountain-gradient': 'linear-gradient(135deg, #1b3a1f 0%, #25562a 50%, #3a8540 100%)',
        'earth-gradient': 'linear-gradient(135deg, #6a3522 0%, #a35027 50%, #d4803a 100%)',
      },
    },
  },
  plugins: [],
}
