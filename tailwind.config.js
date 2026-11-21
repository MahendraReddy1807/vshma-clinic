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
        bone: {
          DEFAULT: "#E3E4DC",
          light: "#EBECE6",
          dark: "#D4D6CB",
        },
        sage: {
          DEFAULT: "#D4D8BA",
          light: "#E4E7CE",
          soft: "#EEF0DF",
          dark: "#A3AA81",
        },
        forest: {
          DEFAULT: "#121A15",
          light: "#1F2B23",
          dark: "#0A0F0C",
          deep: "#060907",
        },
        cream: {
          DEFAULT: "#EDE6D3",
          soft: "#F6F1E3",
          dark: "#DCD2B9",
        },
        ink: {
          DEFAULT: "#161815",
          light: "#2A2E28",
          muted: "#4F534B",
        },
        brass: {
          DEFAULT: "#B89B5E",
          light: "#D0B57C",
          dark: "#987E45",
        },
        sand: {
          DEFAULT: "#D8D0BD",
          light: "#EAE5D9",
          dark: "#B8AE96",
        },
        ivory: {
          DEFAULT: "#F7F3EC",
          warm: "#EDE6D8",
          dark: "#E3DCcb",
        },
        bronze: {
          DEFAULT: "#B89B5E",
          light: "#D0B57C",
          dark: "#987E45",
        },
        gold: {
          DEFAULT: "#B89B5E",
          light: "#D0B57C",
          dark: "#987E45",
        },
        charcoal: {
          DEFAULT: "#161815",
          light: "#2B2E28",
          dark: "#0E100D",
        },
      },
      borderRadius: {
        card: "18px",
        hero: "28px",
      },
      fontFamily: {
        display: ["var(--font-newsreader)", "'Newsreader'", "'Cormorant Garamond'", "Georgia", "serif"],
        serif: ["var(--font-newsreader)", "'Newsreader'", "Georgia", "serif"],
        sans: ["var(--font-instrument-sans)", "'Instrument Sans'", "'Manrope'", "system-ui", "-apple-system", "sans-serif"],
        heading: ["var(--font-newsreader)", "'Newsreader'", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
