/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Tu paleta personalizada "Cuadralo"
        cuadralo: {
          pink: "#F2138E",      // Color Principal (Botones, Corazones)
          pinkDark: "#BF0F90",  // Hover de botones
          dark: "#130119",      // Fondo de la app
          purple: "#551CA6",    // Detalles / Gradientes
          light: "#F2F2F2",     // Textos
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'cuadralo-gradient': 'linear-gradient(to right, #551CA6, #F2138E)', // Gradiente morado a rosa
      },
    },
  },
  plugins: [],
};

export default config;