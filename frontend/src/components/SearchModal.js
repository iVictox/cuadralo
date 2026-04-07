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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleUserClick = (username) => {
      onClose(); // Cerramos el modal
      router.push(`/u/${username}`); // Navegamos al perfil
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-start justify-center md:items-center md:p-4">
        {/* Backdrop */}
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
        />

        {/* Modal Content */}
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full h-full md:h-auto md:max-h-[80vh] md:max-w-xl flex flex-col bg-cuadralo-bgLight dark:bg-cuadralo-bgDark md:rounded-3xl shadow-glass-dark md:shadow-glass-light overflow-hidden transition-colors duration-300"
        >
            {/* HEADER DEL BUSCADOR */}
            <div className="p-4 pt-12 md:pt-4 border-b border-black/5 dark:border-white/10 flex gap-3 items-center bg-cuadralo-cardLight dark:bg-cuadralo-cardDark shadow-sm shrink-0">
                <div className="flex-1 relative group">
                    <Search className="absolute left-4 top-3.5 text-cuadralo-textMutedLight dark:text-gray-500 group-focus-within:text-cuadralo-pink transition-colors" size={20} />
                    <input
                        autoFocus
                        type="text"
                        placeholder="Buscar personas o usuarios..."
                        className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-cuadralo-pink/20 rounded-2xl py-3 pl-12 pr-10 text-sm text-cuadralo-textLight dark:text-white outline-none focus:ring-4 focus:ring-cuadralo-pink/10 transition-all placeholder:text-gray-400"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    {query && (
                        <button onClick={() => setQuery("")} className="absolute right-3 top-3.5 p-1 rounded-full text-gray-400 hover:text-cuadralo-textLight dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                            <X size={16} strokeWidth={2.5} />
                        </button>
                    )}
                </div>
                <button onClick={onClose} className="md:hidden text-sm font-semibold text-cuadralo-pink px-2 active:scale-95 transition-transform">
                    Cancelar
                </button>
            </div>

            {/* ÁREA DE RESULTADOS */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-2">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-cuadralo-pink">
                        <Loader2 className="animate-spin mb-4" size={28} />
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-cuadralo-textMutedLight dark:text-gray-500">Buscando...</span>
                    </div>
                ) : results.length > 0 ? (
                    <div className="space-y-1 p-2">
                        {results.map((user) => (
                            <div
                                key={user.id}
                                onClick={() => handleUserClick(user.username)}
                                className="flex items-center gap-4 p-3 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-all active:scale-[0.98] group"
                            >
                                <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 overflow-hidden flex-shrink-0 relative group-hover:shadow-md transition-shadow">
                                    {user.photo ? (
                                        <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <UserIcon className="w-full h-full p-2.5 text-gray-400" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-cuadralo-textLight dark:text-white group-hover:text-cuadralo-pink transition-colors">{user.name}</h4>
                                    <p className="text-xs text-cuadralo-textMutedLight dark:text-gray-400 font-medium">@{user.username}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : query.length > 0 ? (
                    <div className="text-center py-24 text-cuadralo-textMutedLight dark:text-gray-500">
                        <div className="bg-black/5 dark:bg-white/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-black/5 dark:border-white/5">
                            <Search size={24} className="opacity-50" />
                        </div>
                        <p className="font-bold text-cuadralo-textLight dark:text-white mb-1">No encontramos a &quot;{query}&quot;</p>
                        <p className="text-sm">Revisa si lo escribiste correctamente.</p>
                    </div>
                ) : (
                    <div className="text-center py-24 text-cuadralo-textMutedLight dark:text-gray-500/50">
                        <div className="bg-black/5 dark:bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search size={32} className="opacity-40" />
                        </div>
                        <p className="text-sm font-medium text-cuadralo-textMutedLight dark:text-gray-400">Busca a tus amigos por nombre o @usuario</p>
                    </div>
                )}
            </div>

            {/* FOOTER DESKTOP */}
            <div className="hidden md:flex p-3 border-t border-black/5 dark:border-white/10 bg-cuadralo-cardLight dark:bg-cuadralo-cardDark items-center justify-between text-xs text-gray-500">
                <span>Presiona <kbd className="bg-black/5 dark:bg-white/10 px-2 py-1 rounded-md font-mono">ESC</kbd> para cerrar</span>
            </div>
        </motion.div>
    </div>
  );
}