"use client";

import { motion } from "framer-motion";

export default function SquareLoader({ fullScreen = false, size = "large" }) {
  // Dimensiones según la propiedad `size`
  const dimensions = {
    small: "h-6 w-6 border-2",
    medium: "h-10 w-10 border-[3px]",
    large: "h-14 w-14 border-4",
  };

  const loaderSizeClass = dimensions[size] || dimensions.large;

  const loaderContent = (
    <div className="relative flex items-center justify-center">
      {/* Resplandor del fondo (Glow) */}
      <motion.div
        animate={{ rotate: 360, scale: [1, 1.1, 1] }}
        transition={{ 
            rotate: { repeat: Infinity, duration: 2, ease: "linear" },
            scale: { repeat: Infinity, duration: 1, ease: "easeInOut" }
        }}
        className={`absolute ${loaderSizeClass} bg-cuadralo-pink/30 rounded-2xl blur-xl`}
      />
      
      {/* Cuadrado principal animado */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        className={`${loaderSizeClass} border-cuadralo-pink border-t-transparent border-r-purple-500 rounded-2xl shadow-[0_0_15px_rgba(236,72,153,0.5)] z-10`}
      />

      {/* Cuadrado interior en dirección contraria */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        className={`absolute ${size === "small" ? "h-3 w-3 border-2" : size === "medium" ? "h-5 w-5 border-2" : "h-6 w-6 border-[3px]"} border-purple-400 border-b-transparent rounded-lg opacity-80 z-20`}
      />
    </div>
  );

  if (fullScreen) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-cuadralo-bgLight/80 dark:bg-[#0f0518]/80 backdrop-blur-md"
      >
        {loaderContent}
        <motion.p 
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="mt-6 text-sm font-bold tracking-widest uppercase text-cuadralo-pink"
        >
          Cargando
        </motion.p>
      </motion.div>
    );
  }

  // Version Inline o Container
  return (
    <div className="flex w-full h-full min-h-[100px] items-center justify-center">
      {loaderContent}
    </div>
  );
}
