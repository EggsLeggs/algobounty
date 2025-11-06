import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Raleway', 'sans-serif'],
      },
    },
  },
  daisyui: {
    themes: ['lofi'],
    logs: false,
  },
  plugins: [daisyui],
}

