"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, MoreVertical, MessageCircle, UserPlus } from "lucide-react";
import { api } from "@/utils/api";

export default function ChatList({ onChatSelect }) {
  const [newMatches, setNewMatches] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(""); // <--- Estado del buscador

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await api.get("/matches");
      if (Array.isArray(data)) {
        const news = data.filter(u => !u.last_message);
        const chats = data.filter(u => u.last_message).sort((a, b) => new Date(b.last_message_time) - new Date(a.last_message_time));
        
        setNewMatches(news);
        setConversations(chats);
      }
    } catch (error) {
      console.error("Error chats:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA DE FILTRADO ---
  const filteredNewMatches = newMatches.filter(match => 
    match.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredConversations = conversations.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#0f0518] text-white">
      {/* Header Fijo */}
      <div className="px-6 pt-16 pb-4 flex justify-between items-center bg-[#0f0518]/95 backdrop-blur-md sticky top-0 z-10 border-b border-white/5">
        <h1 className="text-3xl font-bold tracking-tight">Chats</h1>
        <button className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
            <MoreVertical size={20} className="text-gray-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
        
        {/* BUSCADOR FUNCIONAL */}
        <div className="px-6 py-4">
            <div className="relative">
                <Search className="absolute left-4 top-3.5 text-gray-500" size={18} />
                <input 
                    type="text" 
                    placeholder="Buscar..." 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-cuadralo-pink/50 transition-all placeholder:text-gray-600"
                    value={searchQuery} // <--- Vinculado al estado
                    onChange={(e) => setSearchQuery(e.target.value)} // <--- Actualiza estado
                />
            </div>
        </div>

        {/* SECCIÓN: NUEVOS MATCHES (Filtrados) */}
        {filteredNewMatches.length > 0 && (
            <div className="px-6 mb-6">
                <h2 className="text-xs font-bold text-cuadralo-pink uppercase tracking-widest mb-4 flex items-center gap-2">
                    Nuevos Matches 🔥
                </h2>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {filteredNewMatches.map((match, i) => (
                        <motion.div 
                            key={match.id}
                            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.05 }}
                            className="flex flex-col items-center gap-2 cursor-pointer group min-w-[70px]"
                            onClick={() => onChatSelect(match)}
                        >
                            <div className="relative w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
                                <div className="w-full h-full rounded-full border-2 border-[#0f0518] overflow-hidden bg-gray-800 relative">
                                    <img src={match.photo || "https://via.placeholder.com/150"} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-cuadralo-pink rounded-full border-2 border-[#0f0518] flex items-center justify-center shadow-md">
                                    <UserPlus size={10} className="text-white" />
                                </div>
                            </div>
                            <span className="text-xs font-medium truncate w-full text-center text-gray-300 group-hover:text-white">{match.name.split(" ")[0]}</span>
                        </motion.div>
                    ))}
                </div>
            </div>
        )}

        {/* SECCIÓN: MENSAJES (Filtrados) */}
        <div className="px-2">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-4">Conversaciones</h2>
            
            {loading && <p className="text-center text-xs text-gray-600 py-4">Cargando chats...</p>}
            
            {/* Estado Vacío Inteligente: Si busca y no encuentra vs Si no tiene chats */}
            {!loading && filteredConversations.length === 0 && (
                <div className="text-center py-12 opacity-50 flex flex-col items-center">
                    <MessageCircle size={24} className="text-gray-500 mb-2" />
                    <p className="text-sm text-gray-300">
                        {searchQuery ? "No se encontraron resultados" : "No hay mensajes recientes"}
                    </p>
                    {!searchQuery && <p className="text-xs text-gray-500">Escribe a tus nuevos matches arriba 👆</p>}
                </div>
            )}

            <div className="space-y-1">
                {filteredConversations.map((chat) => {
                    const hasUnread = chat.unread_count > 0;
                    return (
                        <motion.div
                            key={chat.id}
                            layout
                            onClick={() => onChatSelect(chat)}
                            className={`flex items-center gap-3 p-3 mx-2 rounded-2xl cursor-pointer transition-all group ${hasUnread ? 'bg-white/10' : 'hover:bg-white/5'}`}
                        >
                            {/* COLUMNA IZQ: AVATAR */}
                            <div className="relative flex-shrink-0">
                                <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-800 border border-white/5">
                                    <img src={chat.photo || "https://via.placeholder.com/150"} className="w-full h-full object-cover" />
                                </div>
                            </div>

                            {/* COLUMNA CENTRAL: NOMBRE Y MENSAJE */}
                            <div className="flex-1 min-w-0 flex flex-col justify-center h-full">
                                <div className="flex justify-between items-center mb-0.5">
                                    {/* Nombre */}
                                    <h3 className={`text-[15px] truncate pr-2 ${hasUnread ? "font-bold text-white" : "font-medium text-gray-200"}`}>
                                        {chat.name}
                                    </h3>
                                    
                                    {/* Hora */}
                                    <span className={`text-[10px] flex-shrink-0 ${hasUnread ? "text-cuadralo-pink font-bold" : "text-gray-500"}`}>
                                        {new Date(chat.last_message_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center">
                                    {/* Último mensaje */}
                                    <p className={`text-sm truncate pr-4 ${hasUnread ? "text-white font-medium" : "text-gray-400 font-normal"}`}>
                                        {chat.last_message}
                                    </p>

                                    {/* Badge de No Leídos */}
                                    {hasUnread && (
                                        <div className="flex-shrink-0">
                                            <span className="min-w-[20px] h-5 px-1.5 bg-cuadralo-pink rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
                                                {chat.unread_count}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </div>
        </div>
      </div>
    </div>
  );
}