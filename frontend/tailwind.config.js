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
        cuadralo: {
          pink: "#F2138E",
          pinkDark: "#BF0F90",
          dark: "#130119",
          purple: "#551CA6",
          light: "#F2F2F2",
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'cuadralo-gradient': 'linear-gradient(to right, #551CA6, #F2138E)',
      },
    },
  },
  plugins: [],
};