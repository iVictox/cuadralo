"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, X, Loader2, User as UserIcon } from "lucide-react";
import { api } from "@/utils/api";
import { useRouter } from "next/navigation";

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
    <div className="fixed inset-0 z-[150] flex flex-col items-center pt-0 md:pt-[10vh] px-0 md:px-4">
        {/* Backdrop (closes modal on click) */}
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-sm"
        />

        {/* Modal content */}
        <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full h-full md:h-auto md:max-h-[80vh] md:max-w-2xl bg-white dark:bg-[#121212] md:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        >
            {/* Header / Input */}
            <div className="p-2 pt-10 md:pt-2 border-b border-gray-100 dark:border-white/10 flex items-center gap-2 bg-white dark:bg-[#121212]">
                <div className="flex-1 relative flex items-center">
                    <Search className="absolute left-4 text-gray-400" size={20} />
                    <input
                        autoFocus
                        type="text"
                        placeholder="Buscar personas o usuarios..."
                        className="w-full bg-transparent border-none py-4 pl-12 pr-10 text-base md:text-lg text-cuadralo-textLight dark:text-white outline-none placeholder:text-gray-400"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    {query && (
                        <button onClick={() => setQuery("")} className="absolute right-3 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                            <X size={18} strokeWidth={2.5} />
                        </button>
                    )}
                </div>
                <button 
                    onClick={onClose}
                    className="md:hidden text-sm font-semibold text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white px-4 transition-colors"
                >
                    Cancelar
                </button>
            </div>

            {/* Results Area */}
            <div className="flex-1 overflow-y-auto p-2 no-scrollbar bg-gray-50/50 dark:bg-[#121212]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-cuadralo-pink">
                        <Loader2 className="animate-spin mb-3" size={28} />
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Buscando</span>
                    </div>
                ) : results.length > 0 ? (
                    <div className="space-y-1 p-2">
                        {results.map((user) => (
                            <div
                                key={user.id}
                                onClick={() => handleUserClick(user.username)}
                                className="flex items-center gap-4 p-3 rounded-2xl hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer transition-all duration-200"
                            >
                                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden flex-shrink-0">
                                    {user.photo ? (
                                        <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <UserIcon className="w-full h-full p-2.5 text-gray-400 dark:text-gray-300" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">{user.name}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">@{user.username}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : query.length > 0 ? (
                    <div className="text-center py-20 text-gray-500 dark:text-gray-400">
                        <p className="text-sm font-medium">No se encontraron resultados para "{query}"</p>
                    </div>
                ) : (
                    <div className="text-center py-20 text-gray-400 dark:text-gray-500 flex flex-col items-center">
                        <Search size={32} className="mb-4 opacity-30" />
                        <p className="text-sm font-medium">Encuentra amigos por su nombre</p>
                    </div>
                )}
            </div>
            
            {/* Footer hint for desktop */}
            <div className="hidden md:flex items-center justify-between px-6 py-3 border-t border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                    Escribe para buscar
                </span>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        ESC para cerrar
                    </span>
                    <kbd className="px-2 py-1 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded text-[10px] font-mono text-gray-500 dark:text-gray-400 shadow-sm">
                        ESC
                    </kbd>
                </div>
            </div>
        </motion.div>
    </div>
  );
}