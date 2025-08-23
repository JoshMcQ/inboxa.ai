const { fontFamily } = require("tailwindcss/defaultTheme");

module.exports = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@tremor/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neutral-light': '#F9FAFB',
        'neutral-base': '#4A4A4A',
        'neutral-dark': '#1F1F1F',
        'primary':      '#1A1F71',
        'secondary':    '#F5A623',
        'success-accent': '#28A745',
        'warning-accent': '#E63946',
        'gradient-start': '#1A1F71',
        'gradient-end': '#3A2A6A',
      },
      fontFamily: {
        sans: ['Inter', ...fontFamily.sans],
        mono: ['JetBrains Mono', ...fontFamily.mono],
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("tailwindcss-animate"),
    require("@headlessui/tailwindcss"),
    require("@tailwindcss/typography"),
  ],
};
