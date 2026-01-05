"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Search, User } from "lucide-react";

export default function SearchModal({ onClose }) {
  const [query, setQuery] = useState("");

  // CORRECCIÓN 2: z-[200] para superar a las tarjetas (z-100)
  return (
    <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md p-4 flex flex-col pt-24"> 
      {/* pt-24 para que no tape el Navbar si quisieras verlo, o puedes usar inset-0 completo */}
      
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        exit={{ opacity: 0, y: -20 }}
        className="w-full max-w-lg mx-auto"
      >
        <div className="relative flex items-center mb-6">
            <Search className="absolute left-4 text-gray-500" size={20} />
            <input 
                autoFocus
                type="text" 
                placeholder="Buscar personas..." 
                className="w-full bg-[#1a0b2e] border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white placeholder-gray-500 focus:border-cuadralo-pink outline-none shadow-xl"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            <button onClick={onClose} className="absolute right-3 p-2 bg-white/5 rounded-full hover:bg-white/10 text-gray-400">
                <X size={18} />
            </button>
        </div>

        {/* Resultados simulados o reales */}
        <div className="text-center text-gray-500 text-sm mt-10">
            {query ? (
                <p>Buscando "{query}"...</p>
            ) : (
                <div className="flex flex-col items-center opacity-50">
                    <User size={48} className="mb-2" />
                    <p>Escribe un nombre para buscar</p>
                </div>
            )}
        </div>
      </motion.div>
    </div>
  );
}