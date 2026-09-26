/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        page: "#F1F4F3",
        accent: "#10B981",
        "accent-hover": "#059669",
        gain: "#10B981",
        spend: "#F43F5E",
      },
      fontFamily: {
        sans: [
          "Inter",
          "Helvetica Neue",
          "Arial",
          "Hiragino Kaku Gothic ProN",
          "Hiragino Sans",
          "Meiryo",
          "sans-serif",
        ],
      },
      keyframes: {
        "float-up": {
          "0%": { opacity: "0", transform: "translateY(4px) scale(0.9)" },
          "20%": { opacity: "1", transform: "translateY(-4px) scale(1.05)" },
          "100%": { opacity: "0", transform: "translateY(-36px) scale(1)" },
        },
        "toast-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "float-up": "float-up 1s ease-out forwards",
        "toast-in": "toast-in 0.2s ease-out",
      },
      boxShadow: {
        card: "0 4px 16px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(15, 23, 42, 0.06)",
      },
    },
  },
  plugins: [],
};
