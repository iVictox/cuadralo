"use client";

import { useState, useEffect } from "react";
import { X, Search, Loader2, Filter, ChevronRight, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/utils/api";
import { useRouter } from "next/navigation";

export default function SearchModal({ onClose }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Estado para Intereses
  const [availableInterests, setAvailableInterests] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [loadingInterests, setLoadingInterests] = useState(false);

  // Cargar lista de intereses al montar o al abrir filtros
  useEffect(() => {
    if (showFilters && availableInterests.length === 0) {
        setLoadingInterests(true);
        api.get("/interests")
            .then(data => setAvailableInterests(data || []))
            .catch(err => console.error("Error cargando intereses", err))
            .finally(() => setLoadingInterests(false));
    }
  }, [showFilters]);

  // Ejecutar búsqueda con Debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
        if (query.trim() || selectedInterests.length > 0) {
            performSearch();
        } else {
            setResults([]);
        }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query, selectedInterests]);

  const performSearch = async () => {
      setLoading(true);
      try {
          const params = new URLSearchParams({ q: query });
          
          if (selectedInterests.length > 0) {
              params.append('interests', selectedInterests.join(','));
          }

          const data = await api.get(`/search?${params.toString()}`);
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

  const toggleInterest = (slug) => {
      setSelectedInterests(prev => 
          prev.includes(slug) 
            ? prev.filter(i => i !== slug) 
            : [...prev, slug]
      );
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center p-4 pt-16 bg-black/80 backdrop-blur-md transition-all duration-300" onClick={onClose}>
        
        <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-[#130725] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
            {/* Header / Search Bar */}
            <div className="p-4 border-b border-white/5 bg-[#1a0b2e] flex flex-col gap-3 z-10">
                <div className="flex gap-3 items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cuadralo-pink" size={18} />
                        <input 
                            autoFocus
                            type="text" 
                            placeholder="Buscar personas..." 
                            className="w-full pl-10 pr-4 py-3 bg-white/5 rounded-xl text-white placeholder-gray-400 outline-none focus:ring-1 focus:ring-cuadralo-pink/50 transition-all text-sm"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                    
                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className={`p-3 rounded-xl transition-all flex items-center gap-2 ${showFilters || selectedInterests.length > 0 ? 'bg-cuadralo-pink text-white' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}
                    >
                        <Filter size={18} />
                        {selectedInterests.length > 0 && (
                            <span className="bg-white text-cuadralo-pink text-[10px] font-bold px-1.5 rounded-full h-4 flex items-center justify-center">
                                {selectedInterests.length}
                            </span>
                        )}
                    </button>
                    
                    <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Panel de Intereses */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="pt-2 pb-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <Tag size={14} className="text-gray-400"/>
                                    <span className="text-xs text-gray-400 font-medium">Filtrar por gustos</span>
                                </div>
                                
                                {loadingInterests ? (
                                    <div className="flex justify-center py-4"><Loader2 className="animate-spin text-cuadralo-pink" size={20}/></div>
                                ) : (
                                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
                                        {availableInterests.map(interest => (
                                            <button
                                                key={interest.id}
                                                onClick={() => toggleInterest(interest.slug)}
                                                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                                                    selectedInterests.includes(interest.slug)
                                                    ? "bg-cuadralo-pink border-cuadralo-pink text-white shadow-[0_0_10px_rgba(236,72,153,0.4)]"
                                                    : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                                                }`}
                                            >
                                                {interest.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Results Area */}
            <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {loading ? (
                    <div className="py-12 flex flex-col items-center gap-3 text-cuadralo-pink/50">
                        <Loader2 className="animate-spin" size={32} />
                        <span className="text-xs font-medium tracking-wide">BUSCANDO...</span>
                    </div>
                ) : results.length > 0 ? (
                    <div className="grid grid-cols-1 gap-1">
                        {results.map((user) => (
                            <div 
                                key={user.id} 
                                onClick={() => handleGoToProfile(user.username)}
                                className="group flex items-center gap-4 p-3 hover:bg-white/5 rounded-2xl cursor-pointer transition-all border border-transparent hover:border-white/5"
                            >
                                <div className="relative">
                                    <img 
                                        src={user.photo || "https://via.placeholder.com/150"} 
                                        className="w-12 h-12 rounded-full object-cover border-2 border-transparent group-hover:border-cuadralo-pink transition-colors bg-[#2a1b3d]" 
                                        alt={user.name} 
                                    />
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-white font-bold text-sm truncate group-hover:text-cuadralo-pink transition-colors">
                                            {user.name}
                                        </h4>
                                        <span className="text-gray-500 text-xs">@{user.username}</span>
                                    </div>
                                    
                                    {/* Mostrar coincidencias de intereses si existen */}
                                    {user.interests && user.interests.length > 0 ? (
                                        <div className="flex gap-1 mt-1 overflow-hidden">
                                            {user.interests.slice(0, 3).map((tag, idx) => (
                                                <span key={idx} className={`text-[10px] px-1.5 rounded-md ${selectedInterests.includes(tag) ? 'bg-cuadralo-pink/20 text-cuadralo-pink border border-cuadralo-pink/30' : 'bg-white/5 text-gray-400'}`}>
                                                    {tag}
                                                </span>
                                            ))}
                                            {user.interests.length > 3 && (
                                                <span className="text-[10px] text-gray-500 self-center">+{user.interests.length - 3}</span>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-gray-600 text-[11px] truncate mt-0.5">
                                            {user.bio || "Sin biografía"}
                                        </p>
                                    )}
                                </div>

                                <ChevronRight size={16} className="text-gray-600 group-hover:text-white transition-colors mr-2" />
                            </div>
                        ))}
                    </div>
                ) : (query || selectedInterests.length > 0) ? (
                    <div className="py-16 text-center flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-gray-600 mb-2">
                             <Tag size={30} />
                        </div>
                        <p className="text-gray-400 font-medium">No hay coincidencias.</p>
                        <p className="text-gray-600 text-xs max-w-[200px]">Intenta seleccionar otros intereses o cambiar tu búsqueda.</p>
                    </div>
                ) : (
                    <div className="py-20 text-center flex flex-col items-center gap-4 opacity-50">
                        <Search size={40} className="text-gray-600" />
                        <p className="text-gray-500 text-sm font-medium">Busca por nombre o filtra por gustos...</p>
                    </div>
                )}
            </div>
        </motion.div>
    </div>
  );
}