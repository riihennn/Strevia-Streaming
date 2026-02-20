/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'streamvibe-red': '#E50914',
        'streamvibe-black': '#141414',
      },
    },
  },
  plugins: [],
}