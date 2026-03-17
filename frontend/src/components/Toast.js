"use client";

import { motion } from "framer-motion";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

export default function Toast({ message, type = "success", onClose }) {
  // Iconos más elegantes y unificados
  const icons = {
    success: <CheckCircle className="text-emerald-500" size={22} strokeWidth={2.5} />,
    error: <AlertCircle className="text-rose-500" size={22} strokeWidth={2.5} />,
    info: <Info className="text-blue-500" size={22} strokeWidth={2.5} />,
  };

  // Diseño premium: Fondo neutro translúcido, bordes sutiles y sombra con resplandor
  const typeStyles = {
    success: "shadow-[0_10px_40px_-10px_rgba(16,185,129,0.3)] border-emerald-500/30",
    error: "shadow-[0_10px_40px_-10px_rgba(244,63,94,0.3)] border-rose-500/30",
    info: "shadow-[0_10px_40px_-10px_rgba(59,130,246,0.3)] border-blue-500/30",
  };

  return (
    // Contenedor principal para mantener el centrado perfecto sin bloquear clics de fondo
    <div className="fixed top-12 left-0 w-full px-4 flex justify-center z-[3000] pointer-events-none">
      <motion.div
        initial={{ opacity: 0, y: -40, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.9, transition: { duration: 0.2 } }}
        className={`pointer-events-auto flex items-center gap-3.5 px-5 py-3.5 min-w-[280px] max-w-[420px] bg-white/90 dark:bg-[#130720]/90 backdrop-blur-xl border rounded-2xl ${typeStyles[type]}`}
      >
        <div className="flex-shrink-0 drop-shadow-md">
          {icons[type]}
        </div>
        
        <p className="flex-1 text-[15px] font-semibold text-gray-800 dark:text-white/95 leading-tight">
          {message}
        </p>

        <button 
          onClick={onClose} 
          className="flex-shrink-0 p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 active:scale-90 transition-all ml-1"
        >
          <X size={18} className="text-gray-500 dark:text-gray-400" />
        </button>
      </motion.div>
    </div>
  );
}