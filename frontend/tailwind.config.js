/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        bee: {
          yellow:  "#FFC700",
          amber:   "#F59E0B",
          dark:    "#0A0A0F",
          card:    "#111118",
          border:  "#1E1E2E",
          muted:   "#4A4A6A",
          text:    "#CDD6F4",
        },
      },
      fontFamily: {
        mono: ["'Fira Code'", "monospace"],
      },
      animation: {
        "fade-up": "fadeUp 0.25s ease",
        "pulse-bee": "pulseBee 2s cubic-bezier(0.4,0,0.6,1) infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseBee: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
      },
    },
  },
  plugins: [],
};
