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
          DEFAULT: "#263B32",
          light: "#354E43",
          dark: "#1B2A24",
          deep: "#121C18",
        },
        sage: {
          DEFAULT: "#66745C",
          light: "#8F9D85",
          soft: "#DCE3D6",
          dark: "#4E5A45",
        },
        sand: {
          DEFAULT: "#D8D0BD",
          light: "#EAE5D9",
          dark: "#B8AE96",
        },
        ivory: {
          DEFAULT: "#F6F2E9",
          warm: "#ECE6D8",
          dark: "#E3DCcb",
        },
        cream: {
          DEFAULT: "#F6F2E9",
          soft: "#FAF7F0",
        },
        bronze: {
          DEFAULT: "#9B795A",
          light: "#B89676",
          dark: "#7A5E44",
        },
        gold: {
          DEFAULT: "#9B795A",
          light: "#B89676",
          dark: "#7A5E44",
        },
        charcoal: {
          DEFAULT: "#292B27",
          light: "#3D403A",
          dark: "#1A1B19",
        },
        mint: {
          DEFAULT: "#E5ECE0",
          light: "#F0F5ED",
          dark: "#C8D6C0",
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
