"use client";

import { motion } from "framer-motion";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

export default function Toast({ message, type = "success", onClose }) {
  const icons = {
    success: <CheckCircle className="text-emerald-400" size={18} strokeWidth={2.5} />,
    error: <AlertCircle className="text-rose-400" size={18} strokeWidth={2.5} />,
    info: <Info className="text-blue-400" size={18} strokeWidth={2.5} />,
  };

  return (
    // Contenedor posicionado en la parte inferior (arriba de la barra de navegación)
    <div className="fixed bottom-24 left-0 w-full px-4 flex justify-center md:justify-end md:bottom-10 md:right-10 md:w-auto z-[3000] pointer-events-none">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.2 } }}
        className={`pointer-events-auto flex items-center gap-3 px-4 py-3 bg-[#111] dark:bg-[#18181b] border border-gray-800 rounded-xl shadow-2xl max-w-sm w-auto`}
      >
        <div className="flex-shrink-0">
          {icons[type]}
        </div>
        
        <p className="flex-1 text-sm font-medium text-white tracking-wide">
          {message}
        </p>

        <button 
          onClick={onClose} 
          className="flex-shrink-0 p-1 rounded-full hover:bg-white/10 active:scale-90 transition-all ml-2"
        >
          <X size={16} className="text-gray-400" />
        </button>
      </motion.div>
    </div>
  );
}