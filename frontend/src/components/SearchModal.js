"use client";

import { useState, useEffect } from "react";
import { X, Search, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/utils/api";
import { useRouter } from "next/navigation";

export default function SearchModal({ onClose }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
      const delayDebounceFn = setTimeout(() => {
          if (query.trim()) {
              performSearch();
          } else {
              setResults([]);
          }
      }, 500); 

      return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const performSearch = async () => {
      setLoading(true);
      try {
          const data = await api.get(`/search?q=${query}`);
          setResults(Array.isArray(data) ? data : []);
      } catch (error) {
          console.error("Search error", error);
      } finally {
          setLoading(false);
      }
  };

  const handleGoToProfile = (username) => {
      router.push(`/u/${username}`);
      onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center p-4 pt-20 bg-black/60 backdrop-blur-sm" onClick={onClose}>
        
        <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-[#1a0b2e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
            <div className="p-4 border-b border-white/10 flex gap-3 items-center bg-[#0f0518]">
                <Search className="text-gray-400" size={20} />
                <input 
                    autoFocus
                    type="text" 
                    placeholder="Buscar personas..." 
                    className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-lg"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full text-gray-400">
                    <X size={20} />
                </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
                {loading ? (
                    <div className="py-8 flex justify-center text-cuadralo-pink"><Loader2 className="animate-spin" /></div>
                ) : results.length > 0 ? (
                    <div className="space-y-1">
                        {results.map((user) => (
                            <div 
                                key={user.id} 
                                onClick={() => handleGoToProfile(user.username)}
                                className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl cursor-pointer transition-colors group"
                            >
                                <img src={user.photo || "https://via.placeholder.com/150"} className="w-10 h-10 rounded-full object-cover border border-white/10" alt={user.name} />
                                <div className="flex-1">
                                    <h4 className="text-white font-bold text-sm group-hover:text-cuadralo-pink transition-colors">{user.name}</h4>
                                    <p className="text-gray-500 text-xs">@{user.username}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : query ? (
                    <div className="py-8 text-center text-gray-500 text-sm">No se encontraron usuarios.</div>
                ) : (
                    <div className="py-12 text-center text-gray-600 text-sm">Escribe para buscar...</div>
                )}
            </div>
        </motion.div>
    </div>
  );
}