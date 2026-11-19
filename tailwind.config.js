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
          light: "#235445",
          dark: "#112B23",
        },
        sage: {
          DEFAULT: "#8BA895",
          light: "#AEC5B6",
          dark: "#6C8E77",
        },
        mint: {
          DEFAULT: "#E9F1EB",
          light: "#F4F8F5",
          dark: "#D2E3D7",
        },
        ivory: {
          DEFAULT: "#FAF9F4",
          warm: "#F4F1E8",
        },
        gold: {
          DEFAULT: "#B9A477",
          light: "#D4C39B",
          dark: "#978358",
        },
      },
      fontFamily: {
        heading: ["Playfair Display", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
