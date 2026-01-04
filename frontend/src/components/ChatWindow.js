"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Phone, Video, MoreVertical, Image as ImageIcon, Smile } from "lucide-react";
import { api } from "@/utils/api";

export default function ChatWindow({ chat, onBack }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [myId, setMyId] = useState(null);
  
  const messagesEndRef = useRef(null); // Para scroll automático abajo

  // 1. Obtener mi ID para saber qué mensajes son míos
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
        const user = JSON.parse(userStr);
        setMyId(user.id);
    }
  }, []);

  // 2. Cargar Historial de Mensajes
  const fetchMessages = async () => {
    try {
        const data = await api.get(`/messages/${chat.id}`);
        setMessages(data);
    } catch (error) {
        console.error("Error cargando mensajes:", error);
    } finally {
        setLoading(false);
    }
  };

  // Cargar al inicio y hacer polling cada 3 segundos (Chat "Casi" en tiempo real)
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Actualiza cada 3s
    return () => clearInterval(interval);
  }, [chat.id]);

  // Scroll al fondo al recibir mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  // 3. Enviar Mensaje
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const tempMsg = newMessage;
    setNewMessage(""); // Limpiar input rápido

    try {
        // Enviar al Backend
        await api.post("/messages", {
            receiver_id: chat.id,
            content: tempMsg
        });
        
        // Recargar mensajes para ver el nuevo
        fetchMessages();

    } catch (error) {
        console.error("Error enviando:", error);
        alert("No se pudo enviar el mensaje");
        setNewMessage(tempMsg); // Restaurar si falló
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0f0518] relative z-50">
      
      {/* Header del Chat */}
      <div className="px-4 py-4 flex items-center justify-between bg-[#1a0b2e] border-b border-white/5 shadow-lg">
        <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 -ml-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white">
                <ArrowLeft size={24} />
            </button>
            
            <div className="relative">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10">
                    <img src={chat.photo || "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600"} alt={chat.name} className="w-full h-full object-cover" />
                </div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#1a0b2e] rounded-full"></div>
            </div>

            <div>
                <h3 className="font-bold text-white text-sm">{chat.name}</h3>
                <span className="text-[10px] text-green-400 font-medium flex items-center gap-1">
                    ● En línea
                </span>
            </div>
        </div>

        <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-white/5 rounded-full text-cuadralo-pink transition-colors"><Phone size={20} /></button>
            <button className="p-2 hover:bg-white/5 rounded-full text-purple-400 transition-colors"><Video size={22} /></button>
        </div>
      </div>

      {/* Área de Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-[#0f0518] to-[#13071e]">
        {loading ? (
            <div className="flex justify-center mt-10"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cuadralo-pink"></div></div>
        ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-50">
                <p className="text-sm">Di "Hola" 👋</p>
            </div>
        ) : (
            messages.map((msg) => {
                const isMe = msg.sender_id === myId;
                return (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={msg.id} 
                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                        <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-md ${
                            isMe 
                            ? "bg-gradient-to-br from-cuadralo-pink to-purple-600 text-white rounded-tr-none" 
                            : "bg-[#25163a] text-gray-200 border border-white/5 rounded-tl-none"
                        }`}>
                            {msg.content}
                            <div className={`text-[9px] mt-1 text-right ${isMe ? "text-white/60" : "text-gray-500"}`}>
                                {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                        </div>
                    </motion.div>
                );
            })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input de Mensaje */}
      <form onSubmit={handleSend} className="p-3 bg-[#1a0b2e] border-t border-white/5 flex items-center gap-2">
        <button type="button" className="p-2 text-gray-400 hover:text-white transition-colors"><ImageIcon size={22} /></button>
        
        <div className="flex-1 relative">
            <input 
                type="text" 
                placeholder="Escribe un mensaje..." 
                className="w-full bg-[#0f0518] border border-white/10 rounded-full py-3 pl-4 pr-10 text-white text-sm focus:outline-none focus:border-cuadralo-pink/50 transition-all"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
            />
            <button type="button" className="absolute right-3 top-3 text-gray-500 hover:text-yellow-400 transition-colors"><Smile size={20} /></button>
        </div>

        <button 
            type="submit" 
            disabled={!newMessage.trim()}
            className="p-3 bg-gradient-to-r from-cuadralo-pink to-purple-600 rounded-full text-white shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
        >
            <Send size={20} fill="currentColor" />
        </button>
      </form>
    </div>
  );
}