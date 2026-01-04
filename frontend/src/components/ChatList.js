"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, MoreVertical, MessageCircle } from "lucide-react";
import { api } from "@/utils/api";

export default function ChatList({ onChatSelect }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar Matches Reales
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const data = await api.get("/matches");
        // Aseguramos que data sea un array
        setMatches(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error cargando matches:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#0f0518] text-white">
      {/* Header */}
      <div className="px-6 pt-16 pb-4 flex justify-between items-center bg-[#0f0518]/95 backdrop-blur-md sticky top-0 z-10 border-b border-white/5">
        <h1 className="text-3xl font-bold tracking-tight">Chats</h1>
        <button className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
            <MoreVertical size={20} className="text-gray-400" />
        </button>
      </div>

      {/* Barra de Búsqueda */}
      <div className="px-6 mb-6">
        <div className="relative">
            <Search className="absolute left-4 top-3.5 text-gray-500" size={18} />
            <input 
                type="text" 
                placeholder="Buscar match..." 
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-cuadralo-pink/50 transition-all placeholder:text-gray-600"
            />
        </div>
      </div>

      {/* LISTA DE CHATS */}
      <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-2">
        
        {loading && (
            <div className="text-center py-10 text-gray-500 text-sm animate-pulse">
                Cargando conversaciones...
            </div>
        )}

        {!loading && matches.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-center px-6 opacity-60">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                    <MessageCircle size={32} className="text-gray-500" />
                </div>
                <p className="text-white font-bold mb-1">Sin Matches aún</p>
                <p className="text-xs text-gray-500">¡Ve al inicio y empieza a dar Likes para conectar!</p>
            </div>
        )}

        {matches.map((match) => (
          <motion.div
            key={match.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
            onClick={() => onChatSelect(match)}
            className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer border border-transparent hover:border-white/5 transition-all"
          >
            {/* Avatar */}
            <div className="relative">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/10">
                    <img src={match.photo || "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600"} alt={match.name} className="w-full h-full object-cover" />
                </div>
                {/* Indicador Online (Simulado) */}
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-[#0f0518] rounded-full"></div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-lg truncate">{match.name}</h3>
                    <span className="text-[10px] text-gray-500 font-medium">Ahora</span>
                </div>
                <p className="text-sm text-gray-400 truncate pr-4">
                    ¡Toca para empezar a chatear! 👋
                </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}