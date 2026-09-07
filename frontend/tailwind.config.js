/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        char: {
          950: "#12100C",
          900: "#171310",
          800: "#1F1B15",
          700: "#2A251C",
          600: "#35301F",
        },
        parchment: {
          400: "#A79C82",
          200: "#D9CFB8",
          100: "#EFE8D8",
        },
        moss: {
          500: "#4A7C59",
          400: "#5C8358",
        },
        dust: {
          500: "#B98A2A",
          400: "#C99A3A",
        },
        ember: {
          600: "#C23B14",
          500: "#D9491F",
          400: "#E86B3E",
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
