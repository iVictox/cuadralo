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

  const handleUserClick = (username) => {
      onClose(); // Cerramos el modal
      router.push(`/u/${username}`); // Navegamos al perfil
  };

  return (
    <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed inset-0 z-[150] bg-cuadralo-bgLight dark:bg-cuadralo-bgDark flex flex-col transition-colors duration-300"
    >
        {/* HEADER DEL BUSCADOR */}
        <div className="p-4 pt-8 md:pt-10 border-b border-black/5 dark:border-white/10 flex gap-3 items-center bg-cuadralo-cardLight dark:bg-cuadralo-cardDark shadow-sm">
            <div className="flex-1 relative">
                <Search className="absolute left-4 top-3.5 text-cuadralo-textMutedLight dark:text-gray-500" size={20} />
                <input
                    autoFocus
                    type="text"
                    placeholder="Buscar personas o usuarios..."
                    className="w-full bg-black/5 dark:bg-white/5 border-none rounded-2xl py-3 pl-12 pr-10 text-sm text-cuadralo-textLight dark:text-white outline-none focus:ring-2 focus:ring-cuadralo-pink/50 transition-all placeholder:text-gray-400"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                {query && (
                    <button onClick={() => setQuery("")} className="absolute right-3 top-3.5 text-gray-400 hover:text-cuadralo-textLight dark:hover:text-white">
                        <X size={16} strokeWidth={3} />
                    </button>
                )}
            </div>
            <button onClick={onClose} className="text-sm font-bold text-cuadralo-pink px-2 active:scale-95 transition-transform">
                Cancelar
            </button>
        </div>

        {/* ÁREA DE RESULTADOS */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4">
            {loading ? (
                <div className="flex flex-col items-center justify-center mt-20 text-cuadralo-pink">
                    <Loader2 className="animate-spin mb-4" size={32} />
                    <span className="text-sm font-bold uppercase tracking-widest text-cuadralo-textMutedLight dark:text-gray-500">Buscando...</span>
                </div>
            ) : results.length > 0 ? (
                <div className="space-y-2">
                    {results.map((user) => (
                        <div
                            key={user.id}
                            onClick={() => handleUserClick(user.username)}
                            className="flex items-center gap-4 p-3 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
                        >
                            <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 overflow-hidden flex-shrink-0">
                                {user.photo ? (
                                    <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon className="w-full h-full p-2 opacity-50" />
                                )}
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-bold text-cuadralo-textLight dark:text-white">{user.name}</h4>
                                <p className="text-xs text-cuadralo-textMutedLight dark:text-gray-400 font-medium">@{user.username}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : query.length > 0 ? (
                <div className="text-center mt-20 text-cuadralo-textMutedLight dark:text-gray-500">
                    <div className="bg-black/5 dark:bg-white/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search size={24} className="opacity-50" />
                    </div>
                    <p className="font-bold">No encontramos a "{query}"</p>
                    <p className="text-xs mt-1">Revisa si lo escribiste correctamente.</p>
                </div>
            ) : (
                <div className="text-center mt-20 text-cuadralo-textMutedLight dark:text-gray-500/50">
                    <Search size={40} className="mx-auto mb-4 opacity-20" />
                    <p className="text-sm font-medium">Busca a tus amigos por nombre o @usuario</p>
                </div>
            )}
        </div>
    </motion.div>
  );
}