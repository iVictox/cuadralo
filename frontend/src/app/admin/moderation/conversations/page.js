"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { api } from "@/utils/api";
import { MessageCircle, Trash2, ShieldAlert, Search, Eye, X, User } from "lucide-react";
import { useDebounce } from 'use-debounce';
import { motion, AnimatePresence } from "framer-motion";

export default function AdminConversations() {
  const [conversations, setConversations] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [loading, setLoading] = useState(true);

  // Estados para el Modal de Chat
  const [selectedConv, setSelectedConv] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [loadingChat, setLoadingChat] = useState(false);
  const chatEndRef = useRef(null);

  const fetchConvs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get(`/admin/moderation/conversations?search=${debouncedSearch}`);
      setConversations(data.conversations || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => { fetchConvs(); }, [fetchConvs]);

  const handleDelete = async (u1, u2) => {
    if (!confirm("⚠️ ¿Estás seguro de eliminar TODOS los mensajes entre estos dos usuarios de forma permanente?")) return;
    try {
      await api.delete(`/admin/moderation/conversations?u1=${u1}&u2=${u2}`);
      fetchConvs();
    } catch (error) {
      alert("Error al eliminar la conversación.");
    }
  };

  // Abrir el historial completo
  const handleOpenChat = async (conv) => {
      setSelectedConv(conv);
      setLoadingChat(true);
      try {
          const data = await api.get(`/admin/moderation/conversations/history?u1=${conv.user1_id}&u2=${conv.user2_id}`);
          setChatHistory(data.messages || []);
      } catch (error) {
          alert("No se pudo cargar el historial.");
      } finally {
          setLoadingChat(false);
      }
  };

  // Auto-scroll al final del chat cuando carga
  useEffect(() => {
      if (chatEndRef.current && chatHistory.length > 0) {
          chatEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
  }, [chatHistory]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
              <MessageCircle className="text-purple-500" /> Conversaciones Activas
          </h1>
          <p className="text-gray-400 mt-1">Busca un usuario y audita todos sus chats privados.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
             type="text" 
             placeholder="Filtrar por @usuario..." 
             value={search} 
             onChange={(e) => setSearch(e.target.value)} 
             className="w-full pl-11 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-sm text-white focus:border-purple-500 outline-none shadow-inner" 
          />
        </div>
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-950 text-gray-400 font-bold border-b border-gray-800 uppercase text-xs">
                <tr>
                <th className="px-6 py-4">Involucrados</th>
                <th className="px-6 py-4 w-1/2">Última Actividad</th>
                <th className="px-6 py-4 text-right">Moderación</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
                {loading ? <tr><td colSpan="3" className="text-center py-10 font-medium animate-pulse text-purple-400">Escaneando chats...</td></tr> : conversations.length === 0 ? <tr><td colSpan="3" className="text-center py-10 text-gray-500">No hay conversaciones.</td></tr> : conversations.map((conv, idx) => (
                <tr key={idx} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                            {/* User 1 */}
                            <div className="flex flex-col items-center">
                                <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden border border-gray-600 mb-1">
                                    {conv.user1_photo ? <img src={conv.user1_photo} className="w-full h-full object-cover" alt="u1"/> : <User size={16} className="m-auto h-full text-gray-500"/>}
                                </div>
                                <span className="text-xs font-bold text-purple-400">@{conv.user1_name}</span>
                            </div>
                            <span className="text-gray-600 font-black px-2">VS</span>
                            {/* User 2 */}
                            <div className="flex flex-col items-center">
                                <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden border border-gray-600 mb-1">
                                    {conv.user2_photo ? <img src={conv.user2_photo} className="w-full h-full object-cover" alt="u2"/> : <User size={16} className="m-auto h-full text-gray-500"/>}
                                </div>
                                <span className="text-xs font-bold text-pink-400">@{conv.user2_name}</span>
                            </div>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <span className="text-gray-300 font-medium line-clamp-2">"{conv.last_message || "Mensaje Multimedia"}"</span>
                        <div className="text-[10px] text-gray-500 mt-2 font-mono bg-gray-950 inline-block px-2 py-1 rounded border border-gray-800">{new Date(conv.date).toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                            <button 
                                onClick={() => handleOpenChat(conv)} 
                                className="bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 border border-purple-500/30 px-3 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2"
                            >
                                <Eye size={14}/> Ver Chat
                            </button>
                            <button 
                                onClick={() => handleDelete(conv.user1_id, conv.user2_id)} 
                                className="bg-gray-800 hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-transparent hover:border-red-500/50 px-3 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2"
                            >
                                <Trash2 size={14}/>
                            </button>
                        </div>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      </div>

      {/* MODAL DEL HISTORIAL DE CHAT */}
      <AnimatePresence>
        {selectedConv && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-[#0b0f19] rounded-2xl max-w-3xl w-full border border-gray-700 shadow-2xl flex flex-col h-[85vh]"
            >
              {/* Header del Chat */}
              <div className="bg-gray-900 px-6 py-4 border-b border-gray-800 flex justify-between items-center rounded-t-2xl shrink-0">
                 <div className="flex items-center gap-4">
                     <div className="flex -space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gray-800 border-2 border-gray-900 overflow-hidden z-10"><img src={selectedConv.user1_photo} className="w-full h-full object-cover"/></div>
                        <div className="w-10 h-10 rounded-full bg-gray-800 border-2 border-gray-900 overflow-hidden"><img src={selectedConv.user2_photo} className="w-full h-full object-cover"/></div>
                     </div>
                     <div>
                         <h3 className="font-black text-white text-sm">Auditoría de Conversación</h3>
                         <p className="text-xs text-gray-400">@{selectedConv.user1_name} & @{selectedConv.user2_name}</p>
                     </div>
                 </div>
                 <button onClick={() => setSelectedConv(null)} className="text-gray-400 hover:text-white bg-gray-800 p-2 rounded-full transition-colors">
                     <X size={20} />
                 </button>
              </div>

              {/* Área de Mensajes */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-4 bg-gradient-to-b from-[#0b0f19] to-[#05070a]">
                  {loadingChat ? (
                      <div className="flex justify-center items-center h-full text-purple-500 animate-pulse">Desencriptando historial...</div>
                  ) : chatHistory.length === 0 ? (
                      <div className="flex justify-center items-center h-full text-gray-600">No hay mensajes registrados.</div>
                  ) : (
                      chatHistory.map((msg) => {
                          // Determinar visualmente quién es quién
                          const isUser1 = msg.sender_id === selectedConv.user1_id;
                          
                          return (
                              <div key={msg.id} className={`flex flex-col ${isUser1 ? 'items-start' : 'items-end'}`}>
                                  <span className={`text-[10px] font-bold mb-1 px-1 ${isUser1 ? 'text-purple-400' : 'text-pink-400'}`}>
                                      @{isUser1 ? selectedConv.user1_name : selectedConv.user2_name}
                                  </span>
                                  <div className={`max-w-[75%] px-4 py-3 rounded-2xl ${isUser1 ? 'bg-gray-800 text-gray-200 rounded-tl-sm' : 'bg-purple-600 text-white rounded-tr-sm shadow-[0_4px_15px_rgba(147,51,234,0.3)]'}`}>
                                      {/* Si hay imagen en el mensaje (Depende de tu modelo, asumo msg.image o image_url) */}
                                      {(msg.image || msg.image_url) && (
                                          <img src={msg.image || msg.image_url} alt="Adjunto" className="w-full rounded-xl mb-2 max-h-60 object-cover" />
                                      )}
                                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                  </div>
                                  <span className="text-[9px] text-gray-600 font-mono mt-1 px-1">
                                      {new Date(msg.created_at).toLocaleString()}
                                  </span>
                              </div>
                          );
                      })
                  )}
                  <div ref={chatEndRef} />
              </div>
              
              <div className="p-4 border-t border-gray-800 bg-gray-900 rounded-b-2xl shrink-0 text-center">
                  <p className="text-xs text-gray-500 font-medium">Modo solo lectura. Los moderadores no pueden intervenir en el chat, solo purgarlo.</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}