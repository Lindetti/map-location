/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html", // eller var din HTML-fil ligger
    "./src/**/*.{js,ts,jsx,tsx}", // din källkod
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

