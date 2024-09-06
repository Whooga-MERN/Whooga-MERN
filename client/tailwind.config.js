/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [{
      light: {
        ...require("daisyui/src/theming/themes")["light"],
        primary: "#FDD50F",
        secondary: "#FFEA82",
      },
      dark: {
        ...require("daisyui/src/theming/themes")["dark"],
        primary: "#FDD50F",
        secondary: "#FFEA82",
      }
    },],
  },
  darkMode: ['class', '[data-theme="dark"]'],
}

