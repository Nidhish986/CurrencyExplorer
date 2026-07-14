/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#10211b",
        leaf: "#163f2e",
        mint: "#9ff3c8",
        lime: "#d9ff64",
        paper: "#f4f7ef",
        night: "#0a1411",
        coral: "#ff6b5f",
        sky: "#82d7ff"
      },
      boxShadow: {
        soft: "0 24px 80px -36px rgb(16 33 27 / 0.35)"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};
