"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, X, Loader2, User as UserIcon } from "lucide-react";
import { api } from "@/utils/api";
import { useRouter } from "next/navigation";
import SquareLoader from "./SquareLoader";

export default function SearchModal({ onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 🚀 TÉCNICA DE DEBOUNCE: Espera a que el usuario termine de escribir para buscar
  useEffect(() => {
      if (!query.trim()) {
          setResults([]);
          return;
      }

      const timer = setTimeout(async () => {
          setLoading(true);
          try {
              const data = await api.get(`/search?q=${encodeURIComponent(query)}`);
              setResults(Array.isArray(data) ? data : []);
          } catch (error) {
              console.error("Error buscando usuarios", error);
          } finally {
              setLoading(false);
          }
      }, 400); // Espera 400ms tras la última tecla

      return () => clearTimeout(timer);
  }, [query]);

  // Manejar cierre con ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleUserClick = (username) => {
      onClose(); // Cerramos el modal
      router.push(`/u/${username}`); // Navegamos al perfil
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-0 md:p-6 bg-black/60 backdrop-blur-md">
        {/* Backdrop */}
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="absolute inset-0 cursor-pointer"
        />

        {/* Modal content */}
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-5xl h-full md:h-[85vh] bg-cuadralo-cardLight dark:bg-cuadralo-cardDark rounded-none md:rounded-[2.5rem] border border-black/5 dark:border-white/10 shadow-2xl flex flex-col overflow-hidden"
        >
            {/* Header / Input */}
            <div className="p-4 md:p-6 border-b border-black/5 dark:border-white/10 flex items-center justify-between gap-3 md:gap-4 bg-cuadralo-bgLight/50 dark:bg-black/20 backdrop-blur-md z-10 relative">
                <div className="flex-1 relative flex items-center bg-white dark:bg-black/40 rounded-2xl p-2 px-4 shadow-[0_2px_10px_rgb(0,0,0,0.02)] dark:shadow-none border border-black/5 dark:border-white/5 transition-all focus-within:ring-2 focus-within:ring-cuadralo-pink/50">
                    <Search className="text-cuadralo-pink flex-shrink-0" size={24} />
                    <input
                        autoFocus
                        type="text"
                        placeholder="Descubre nuevas personas..."
                        className="w-full bg-transparent border-none py-2 md:py-3 pl-4 pr-10 text-base md:text-xl font-bold text-cuadralo-textLight dark:text-white outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    {query && (
                        <button onClick={() => setQuery("")} className="absolute right-3 p-1.5 bg-black/5 dark:bg-white/10 rounded-full text-gray-500 hover:text-black dark:hover:text-white transition-colors">
                            <X size={16} strokeWidth={3} />
                        </button>
                    )}
                </div>
                <button 
                    onClick={onClose}
                    className="p-3 md:p-4 bg-white dark:bg-black/40 hover:bg-cuadralo-pink hover:text-white rounded-2xl text-gray-500 dark:text-gray-400 transition-all shadow-sm border border-black/5 dark:border-white/5 active:scale-95"
                >
                    <X size={24} strokeWidth={2.5} />
                </button>
            </div>

            {/* Results Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar bg-cuadralo-bgLight dark:bg-cuadralo-bgDark">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <SquareLoader size="large" />
                        <span className="mt-6 text-sm font-black uppercase tracking-widest text-cuadralo-pink opacity-80">Rastreando Usuarios</span>
                    </div>
                ) : results.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 pb-20">
                        {results.map((user, idx) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                key={user.id}
                                onClick={() => handleUserClick(user.username)}
                                className="group relative flex flex-col items-center p-5 rounded-[2rem] 
                                    bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/50 dark:border-white/10 
                                    shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] 
                                    hover:-translate-y-2 hover:shadow-[0_12px_40px_rgb(255,42,109,0.15)] 
                                    dark:hover:shadow-[0_12px_40px_rgb(255,42,109,0.2)] 
                                    transition-all duration-300 cursor-pointer overflow-hidden"
                            >
                                {/* Glow de fondo en hover */}
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-cuadralo-pink/5 dark:to-cuadralo-pink/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                                <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-cuadralo-bgLight dark:bg-black/40 overflow-hidden flex-shrink-0 mb-4 border-[3px] border-white dark:border-white/10 shadow-lg group-hover:border-cuadralo-pink transition-colors duration-300">
                                    {user.photo ? (
                                        <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <UserIcon className="w-full h-full p-5 text-gray-400 dark:text-gray-500" />
                                    )}
                                </div>
                                
                                <h4 className="text-sm md:text-base font-black text-cuadralo-textLight dark:text-white text-center line-clamp-1 w-full relative z-10">{user.name}</h4>
                                <p className="text-xs font-bold text-cuadralo-pink mt-1 text-center truncate w-full relative z-10">@{user.username}</p>
                            </motion.div>
                        ))}
                    </div>
                ) : query.length > 0 ? (
                    <div className="text-center py-32 text-cuadralo-textMutedLight dark:text-gray-500">
                        <div className="w-24 h-24 bg-white dark:bg-black/20 shadow-xl rounded-[2rem] flex items-center justify-center mx-auto mb-6 transform rotate-12 border border-black/5 dark:border-white/5">
                            <Search size={40} className="text-gray-400" />
                        </div>
                        <p className="text-xl font-black text-cuadralo-textLight dark:text-white">Nadie a la vista</p>
                        <p className="text-sm mt-2 font-medium">No encontramos a "{query}" en el radar.</p>
                    </div>
                ) : (
                    <div className="text-center py-32 flex flex-col items-center">
                        <div className="relative">
                            <div className="absolute inset-0 bg-cuadralo-pink/20 dark:bg-cuadralo-pink/10 blur-3xl rounded-full" />
                            <Search size={64} className="mb-8 opacity-20 text-cuadralo-textLight dark:text-white relative z-10 transform -rotate-12" />
                        </div>
                        <p className="text-2xl font-black text-cuadralo-textLight dark:text-white tracking-tight">Explora el Universo</p>
                        <p className="text-sm font-medium mt-3 text-cuadralo-textMutedLight dark:text-gray-400">Busca amigos o descubre gente nueva y asombrosa</p>
                    </div>
                )}
            </div>
            
            {/* Footer hint para cerrar en escritorio */}
            <div className="hidden md:flex items-center justify-center py-3 bg-cuadralo-bgLight/80 dark:bg-black/40 backdrop-blur-md border-t border-black/5 dark:border-white/10 absolute bottom-0 w-full z-10">
                <span className="text-xs font-bold uppercase tracking-widest text-cuadralo-textMutedLight dark:text-gray-500 flex items-center gap-2">
                    Presiona <kbd className="px-2 py-1 bg-white dark:bg-white/10 rounded-lg shadow-sm border border-black/5 dark:border-white/10">ESC</kbd> para cerrar
                </span>
            </div>
        </motion.div>
    </div>
  );
}