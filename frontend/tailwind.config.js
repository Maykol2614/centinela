/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        char: {
          950: "#08090B",
          900: "#0C0D10",
          800: "#121317",
          700: "#191B20",
          600: "#23262D",
        },
        parchment: {
          400: "#8B92A0",
          200: "#C4C9D2",
          100: "#E8EAED",
        },
        moss: {
          500: "#4C82E0",
          400: "#5B8DEF",
        },
        dust: {
          500: "#B99552",
          400: "#C9A45C",
        },
        ember: {
          600: "#A83A38",
          500: "#C4433D",
          400: "#E5726B",
        },
      },
      fontFamily: {
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
        display: ["Space Grotesk", "sans-serif"],
      },
    },
  },
  plugins: [],
};
