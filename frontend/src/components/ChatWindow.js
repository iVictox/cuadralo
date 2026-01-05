"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    ArrowLeft, Send, Phone, Video, MoreVertical, Image as ImageIcon, Smile, 
    Trash2, Ban, Flag, Wallpaper, X 
} from "lucide-react";
import { api } from "@/utils/api";
import { useToast } from "@/context/ToastContext"; // Asegúrate de tener este contexto o usa alert

export default function ChatWindow({ chat, onBack }) {
  const { showToast } = useToast(); // Si no tienes toast, cambia por alerts
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [myId, setMyId] = useState(null);
  
  // Estados para el Menú y Personalización
  const [showMenu, setShowMenu] = useState(false);
  const [bgStyle, setBgStyle] = useState(0); // 0: Estrellas, 1: Degradado, 2: Oscuro

  const messagesEndRef = useRef(null);

  // Fondos disponibles
  const backgrounds = [
      "bg-[url('/bg-stars.svg')]", // Tu fondo original
      "bg-gradient-to-br from-[#1a0b2e] to-[#4a1d6e]", // Degradado morado
      "bg-[#0a0a0a]" // Negro puro OLED
  ];

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) setMyId(JSON.parse(userStr).id);
  }, []);

  const fetchMessages = async () => {
    try {
        const data = await api.get(`/messages/${chat.id}`);
        setMessages(data);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [chat.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const tempMsg = newMessage;
    setNewMessage(""); 

    try {
        await api.post("/messages", { receiver_id: chat.id, content: tempMsg });
        fetchMessages();
    } catch (error) {
        setNewMessage(tempMsg);
    }
  };

  // --- FUNCIONES DEL MENÚ ---
  
  const handleBlockUser = async () => {
      if(!confirm("¿Estás seguro de bloquear a este usuario? Desaparecerá de tus matches.")) return;
      try {
          await api.delete(`/matches/${chat.id}`);
          showToast("Usuario bloqueado y match eliminado");
          onBack(); // Volver a la lista
      } catch (error) {
          showToast("Error al bloquear", "error");
      }
  };

  const handleReportUser = () => {
      // Aquí iría lógica real de reporte
      showToast("Usuario reportado. Gracias por avisarnos.");
      setShowMenu(false);
  };

  const handleClearChat = () => {
      if(!confirm("¿Borrar historial local?")) return;
      setMessages([]); // Solo visual por ahora
      showToast("Chat vaciado");
      setShowMenu(false);
  };

  const toggleBackground = () => {
      setBgStyle((prev) => (prev + 1) % backgrounds.length);
  };

  return (
    <div className="flex flex-col h-screen bg-[#0f0518] relative z-50 w-full max-w-2xl mx-auto border-x border-white/5">
      
      {/* HEADER */}
      <div className="px-4 py-3 flex items-center justify-between bg-[#0f0518]/90 backdrop-blur-md border-b border-white/5 sticky top-0 z-20">
        <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 -ml-2 hover:bg-white/5 rounded-full transition-colors text-gray-300 hover:text-white">
                <ArrowLeft size={22} />
            </button>
            <div className="relative cursor-pointer">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10">
                    <img src={chat.photo || "https://via.placeholder.com/150"} alt={chat.name} className="w-full h-full object-cover" />
                </div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#0f0518] rounded-full animate-pulse"></div>
            </div>
            <div>
                <h3 className="font-bold text-white text-sm leading-tight">{chat.name}</h3>
                <span className="text-[10px] text-green-400 font-medium">En línea</span>
            </div>
        </div>
        
        {/* BOTONES DERECHA */}
        <div className="flex items-center gap-1 text-cuadralo-pink relative">
            <button className="p-2.5 hover:bg-white/5 rounded-full transition-colors hidden sm:block"><Phone size={20} /></button>
            <button className="p-2.5 hover:bg-white/5 rounded-full transition-colors hidden sm:block"><Video size={22} /></button>
            
            {/* BOTÓN 3 PUNTOS */}
            <button 
                onClick={() => setShowMenu(!showMenu)} 
                className={`p-2.5 rounded-full transition-colors ${showMenu ? 'bg-white/10 text-white' : 'hover:bg-white/5'}`}
            >
                <MoreVertical size={20} />
            </button>

            {/* MENÚ DESPLEGABLE */}
            <AnimatePresence>
                {showMenu && (
                    <>
                        {/* Overlay para cerrar al hacer click fuera */}
                        <div className="fixed inset-0 z-30" onClick={() => setShowMenu(false)} />
                        
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -10 }}
                            className="absolute right-0 top-12 w-56 bg-[#1a0b2e] border border-white/10 rounded-2xl shadow-2xl z-40 overflow-hidden"
                        >
                            <div className="p-2 space-y-1">
                                <button onClick={toggleBackground} className="w-full flex items-center gap-3 px-3 py-3 hover:bg-white/5 rounded-xl text-left transition-colors text-sm text-gray-200">
                                    <Wallpaper size={16} className="text-purple-400" />
                                    Cambiar Fondo
                                </button>
                                <button onClick={handleClearChat} className="w-full flex items-center gap-3 px-3 py-3 hover:bg-white/5 rounded-xl text-left transition-colors text-sm text-gray-200">
                                    <Trash2 size={16} className="text-yellow-400" />
                                    Vaciar Chat
                                </button>
                                <div className="h-px bg-white/10 my-1 mx-2" />
                                <button onClick={handleReportUser} className="w-full flex items-center gap-3 px-3 py-3 hover:bg-white/5 rounded-xl text-left transition-colors text-sm text-gray-200">
                                    <Flag size={16} className="text-orange-400" />
                                    Reportar
                                </button>
                                <button onClick={handleBlockUser} className="w-full flex items-center gap-3 px-3 py-3 hover:bg-red-500/10 rounded-xl text-left transition-colors text-sm text-red-400 font-bold">
                                    <Ban size={16} />
                                    Bloquear Usuario
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
      </div>

      {/* ÁREA DE MENSAJES */}
      <div className={`flex-1 overflow-y-auto p-4 space-y-3 ${backgrounds[bgStyle]} bg-fixed bg-cover transition-all duration-500`}>
        {loading ? (
            <div className="flex justify-center mt-10"><div className="animate-spin rounded-full h-6 w-6 border-2 border-cuadralo-pink border-t-transparent"></div></div>
        ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-60 mt-10">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4 backdrop-blur-md">
                    <span className="text-4xl">👋</span>
                </div>
                <p className="text-sm text-gray-200 font-medium">Es un match nuevo</p>
                <p className="text-xs text-gray-400">Rompe el hielo con un "Hola"</p>
            </div>
        ) : (
            messages.map((msg) => {
                const isMe = msg.sender_id === myId;
                return (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        key={msg.id} 
                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                        <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed shadow-sm relative group ${
                            isMe 
                            ? "bg-gradient-to-br from-cuadralo-pink to-purple-600 text-white rounded-br-none" 
                            : "bg-[#2a2a2a]/90 backdrop-blur-sm text-gray-100 border border-white/5 rounded-bl-none"
                        }`}>
                            {msg.content}
                            <div className={`text-[9px] mt-1 text-right opacity-70 ${isMe ? "text-white" : "text-gray-400"}`}>
                                {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                        </div>
                    </motion.div>
                );
            })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <form onSubmit={handleSend} className="p-3 bg-[#0f0518] border-t border-white/5 flex items-end gap-2 pb-6 sm:pb-3">
        <button type="button" className="p-3 text-gray-400 hover:text-cuadralo-pink transition-colors bg-white/5 rounded-full"><ImageIcon size={20} /></button>
        
        <div className="flex-1 relative bg-white/5 border border-white/10 rounded-3xl overflow-hidden focus-within:border-cuadralo-pink/50 transition-colors">
            <input 
                type="text" 
                placeholder="Escribe un mensaje..." 
                className="w-full bg-transparent py-3 pl-4 pr-10 text-white text-sm focus:outline-none placeholder:text-gray-600"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
            />
            <button type="button" className="absolute right-3 top-3 text-gray-500 hover:text-yellow-400 transition-colors"><Smile size={20} /></button>
        </div>

        <button 
            type="submit" 
            disabled={!newMessage.trim()}
            className="p-3 bg-cuadralo-pink rounded-full text-white shadow-lg hover:bg-purple-600 transition-all disabled:opacity-50 disabled:hover:bg-cuadralo-pink transform active:scale-95"
        >
            <Send size={20} fill="currentColor" className="-ml-0.5 mt-0.5" />
        </button>
      </form>
    </div>
  );
}