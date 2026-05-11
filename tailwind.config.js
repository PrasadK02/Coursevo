/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Montserrat", "sans-serif"],
      },
      colors: {
        accent:   "#68BA7F",
        "accent-hover": "#7dcc95",
        surface:  "#253D2C",
        base:     "#1a2e20",
        elevated: "#2d4a34",
      },
    },
  },
  plugins: [],
};