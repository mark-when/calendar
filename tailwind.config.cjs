/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  safelist: ["cusor-pointer", 'border-*'],
  theme: {
    extend: {},
  },
  plugins: [],
  darkMode: "class",
};
