/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: "#183D32",
          light: "#254D3D",
          dark: "#10271F",
          deep: "#091712",
        },
        emerald: {
          DEFAULT: "#254D3D",
          dark: "#1C3E31",
          light: "#356B55",
        },
        sage: {
          DEFAULT: "#8BA895",
          light: "#DCE8DD",
          soft: "#EAF1EB",
          dark: "#6C8E77",
        },
        mint: {
          DEFAULT: "#E9F1EB",
          light: "#F4F8F5",
          dark: "#D2E3D7",
        },
        ivory: {
          DEFAULT: "#FAF9F4",
          warm: "#F5F3EC",
        },
        cream: {
          DEFAULT: "#F1EEE4",
          soft: "#F8F6F0",
        },
        gold: {
          DEFAULT: "#B9A477",
          light: "#D4C39B",
          dark: "#978358",
        },
        charcoal: {
          DEFAULT: "#202622",
          light: "#2D3630",
          dark: "#151A17",
        },
      },
      fontFamily: {
        display: ["'Cormorant Garamond'", "Georgia", "serif"],
        heading: ["'Playfair Display'", "Georgia", "serif"],
        sans: ["'Manrope'", "'Inter'", "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};
