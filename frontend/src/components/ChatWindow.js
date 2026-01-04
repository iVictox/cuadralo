"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, Phone, Video, MoreVertical } from "lucide-react";
import VideoCallModal from "@/components/VideoCallModal"; // <--- Importamos el modal

export default function ChatWindow({ chat, onBack }) {
  const [message, setMessage] = useState("");
  const [inCall, setInCall] = useState(false); // <--- Estado para saber si estamos en llamada

  const [messages, setMessages] = useState([
    { id: 1, text: "Hola! 👋", sender: "them", time: "10:00 AM" },
    { id: 2, text: "Hola, ¿cómo estás?", sender: "me", time: "10:05 AM" },
    { id: 3, text: chat.message || "Todo bien, ¿y tú?", sender: "them", time: "10:10 AM" },
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (message.trim() === "") return;
    
    const newMessage = {
      id: Date.now(),
      text: message,
      sender: "me",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages((prev) => [...prev, newMessage]);
    setMessage("");

    setTimeout(() => {
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        text: "¡Jajaja qué cool! 😎",
        sender: "them",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 2000);
  };

  return (
    <>
      {/* 1. MODAL DE VIDEOLLAMADA (Si inCall es true) */}
      {inCall && (
        <VideoCallModal user={chat} onClose={() => setInCall(false)} />
      )}

      {/* 2. VENTANA DE CHAT NORMAL */}
      <div className="flex flex-col flex-1 h-full bg-black/40 backdrop-blur-xl w-full max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/60 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <ArrowLeft size={24} className="text-white" />
            </button>
            
            <div className="relative">
              <img src={chat.img} alt={chat.name} className="w-10 h-10 rounded-full object-cover" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full"></div>
            </div>
            
            <div>
              <h3 className="font-bold text-white text-lg leading-tight">{chat.name}</h3>
              <span className="text-xs text-cuadralo-pink font-medium">En línea</span>
            </div>
          </div>

          <div className="flex gap-4 text-gray-400">
            {/* BOTONES ACTIVOS: Al hacer clic, activan la llamada */}
            <button onClick={() => setInCall(true)} className="hover:text-green-400 transition-colors">
                <Phone size={24} />
            </button>
            <button onClick={() => setInCall(true)} className="hover:text-cuadralo-pink transition-colors">
                <Video size={24} />
            </button>
            <button className="hover:text-white transition-colors">
                <MoreVertical size={24} />
            </button>
          </div>
        </div>

        {/* Área de Mensajes */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="text-center text-xs text-gray-500 my-4">Hoy</div>
          
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex flex-col ${msg.sender === "me" ? "items-end" : "items-start"}`}
            >
              <div 
                className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm shadow-md ${
                  msg.sender === "me" 
                    ? "bg-cuadralo-pink text-white rounded-br-none" 
                    : "bg-gray-800 text-gray-200 rounded-bl-none"
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[10px] text-gray-500 mt-1 px-1">
                {msg.time}
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-black/80 border-t border-white/10 shrink-0">
          <div className="flex items-center gap-2 bg-gray-900/80 rounded-full px-4 py-2 border border-gray-700 focus-within:border-cuadralo-purple transition-colors">
            <input
              type="text"
              placeholder="Escribe un mensaje..."
              className="flex-1 bg-transparent text-white outline-none placeholder-gray-500 py-2"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button 
              onClick={handleSend}
              disabled={message.trim() === ""}
              className={`p-2 rounded-full transition-all ${
                  message.trim() !== "" 
                  ? "bg-cuadralo-pink text-white shadow-[0_0_10px_#F2138E]" 
                  : "bg-gray-800 text-gray-500"
              }`}
            >
              <Send size={20} />
            </button>
          </div>
        </div>

      </div>
    </>
  );
}