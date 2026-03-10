/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', 
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
          // ✅ PALETA DE ALTO CONTRASTE (Color Theory)
          bgLight: "#F8FAFC",   // Blanco Humo/Pizarra 50: No quema la vista.
          bgDark: "#0B0410",    // Morado espacial ultra oscuro.
          cardLight: "#FFFFFF", // Blanco puro para resaltar sobre bgLight.
          cardDark: "#150A21",  
          textLight: "#0F172A", // Pizarra 900: Casi negro, máxima lectura.
          textDark: "#F8FAFC",  
          textMutedLight: "#334155", // Pizarra 700: Gris oscuro elegante para descripciones.
          textMutedDark: "#94A3B8",  
        },
      },
      backgroundImage: {
        'cuadralo-gradient': 'linear-gradient(to right, #551CA6, #F2138E)',
      },
      boxShadow: {
        'glass-light': '0 10px 40px -10px rgba(15, 23, 42, 0.08)', // Sombra más suave y moderna
        'glass-dark': '0 10px 40px -10px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
};