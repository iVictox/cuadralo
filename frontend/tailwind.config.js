/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // ✅ CLAVE: Permite cambiar entre claro/oscuro usando la clase "dark" en el body
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
          pinkLight: "#ff4da6",
          pinkDark: "#BF0F90",
          purple: "#551CA6",
          purpleLight: "#7c3aed",
          // Paleta minimalista
          bgLight: "#F8FAFC",   // Fondo general claro
          bgDark: "#0f0518",    // Fondo general oscuro
          cardLight: "#FFFFFF", // Fondo de tarjetas claro
          cardDark: "#1a0b2e",  // Fondo de tarjetas oscuro
          textLight: "#0f172a", // Texto principal claro
          textDark: "#f8fafc",  // Texto principal oscuro
          textMutedLight: "#64748b", // Texto secundario claro
          textMutedDark: "#94a3b8",  // Texto secundario oscuro
        },
      },
      backgroundImage: {
        'cuadralo-gradient': 'linear-gradient(to right, #551CA6, #F2138E)',
        'cuadralo-gradient-soft': 'linear-gradient(to top right, rgba(85, 28, 166, 0.1), rgba(242, 19, 142, 0.1))',
      },
      boxShadow: {
        'glass-light': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      }
    },
  },
  plugins: [],
};