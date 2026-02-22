/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      backdropBlur: {
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
      },
      colors: {
        'white/70': 'rgba(255, 255, 255, 0.7)',
        'gray-800/70': 'rgba(31, 41, 55, 0.7)',
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
