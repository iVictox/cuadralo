"use client";

import { motion } from "framer-motion";
import { Search, MoreVertical, Circle } from "lucide-react";

export default function ChatList() {
  // 1. Datos Simulados: Nuevos Matches (Círculos superiores)
  const newMatches = [
    { id: 101, name: "Ana", img: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150" },
    { id: 102, name: "Carla", img: "https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=150" },
    { id: 103, name: "Luisa", img: "https://images.pexels.com/photos/1310522/pexels-photo-1310522.jpeg?auto=compress&cs=tinysrgb&w=150" },
    { id: 104, name: "Fer", img: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150" },
    { id: 105, name: "Dani", img: "https://images.pexels.com/photos/2726111/pexels-photo-2726111.jpeg?auto=compress&cs=tinysrgb&w=150" },
  ];

  // 2. Datos Simulados: Conversaciones (Lista vertical)
  const conversations = [
    { 
      id: 1, 
      name: "Valeria", 
      message: "¡Jajaja totalmente! ¿Y te gusta el sushi? 🍣", 
      time: "2 min", 
      unread: 2, 
      img: "https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=150",
      online: true
    },
    { 
      id: 2, 
      name: "Andrea", 
      message: "Te paso mi playlist de Spotify 🎵", 
      time: "1 h", 
      unread: 0, 
      img: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150",
      online: false
    },
    { 
      id: 3, 
      name: "Carlos", 
      message: "¿Sale partida de LoL hoy? 🎮", 
      time: "Ayer", 
      unread: 0, 
      img: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150",
      online: true
    },
  ];

  return (
<motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      // CAMBIO: max-w-4xl mx-auto para que no sea ETERNAMENTE ancho, pero sí ancho de tablet/PC
      className="w-full h-full text-white pt-24 pb-24 px-4 overflow-y-auto max-w-5xl mx-auto"
    >
      {/* Título */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Mensajes</h2>
        <button className="p-2 bg-white/5 rounded-full hover:bg-white/10">
            <Search size={20} className="text-gray-400" />
        </button>
      </div>

      {/* SECCIÓN 1: Nuevos Matches (Scroll Horizontal) */}
      <div className="mb-8">
        <h3 className="text-xs font-bold text-cuadralo-pink uppercase tracking-wider mb-4">Nuevos Matches 🔥</h3>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {/* Tarjeta especial de "Likes" borrosa */}
            <div className="flex flex-col items-center gap-2 min-w-[70px]">
                <div className="w-[70px] h-[70px] rounded-full border-2 border-dashed border-gray-500 flex items-center justify-center bg-gray-800 relative overflow-hidden">
                    <div className="absolute inset-0 bg-cuadralo-purple opacity-30 blur-sm"></div>
                    <span className="text-xl font-bold relative z-10">+9</span>
                </div>
                <span className="text-xs text-gray-400 font-medium">Likes</span>
            </div>

            {/* Lista de Matches */}
            {newMatches.map((match) => (
                <div key={match.id} className="flex flex-col items-center gap-2 min-w-[70px] cursor-pointer group">
                    <div className="w-[70px] h-[70px] rounded-full p-[2px] bg-gradient-to-tr from-cuadralo-pink to-cuadralo-purple group-hover:scale-105 transition-transform">
                        <img src={match.img} alt={match.name} className="w-full h-full rounded-full object-cover border-2 border-black" />
                    </div>
                    <span className="text-xs text-white font-medium">{match.name}</span>
                </div>
            ))}
        </div>
      </div>

      {/* SECCIÓN 2: Lista de Conversaciones */}
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Recientes</h3>
        <div className="flex flex-col gap-2">
            {conversations.map((chat) => (
                <div key={chat.id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer active:bg-white/10">
                    {/* Avatar con indicador Online */}
                    <div className="relative">
                        <img src={chat.img} alt={chat.name} className="w-14 h-14 rounded-full object-cover" />
                        {chat.online && (
                            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-black rounded-full"></div>
                        )}
                    </div>

                    {/* Info del Chat */}
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                            <h4 className="font-bold text-lg">{chat.name}</h4>
                            <span className="text-xs text-gray-500">{chat.time}</span>
                        </div>
                        <p className={`text-sm truncate ${chat.unread > 0 ? "text-white font-semibold" : "text-gray-400"}`}>
                            {chat.message}
                        </p>
                    </div>

                    {/* Badge de No Leídos */}
                    {chat.unread > 0 && (
                        <div className="w-6 h-6 rounded-full bg-cuadralo-pink flex items-center justify-center text-xs font-bold text-white shadow-[0_0_10px_#F2138E]">
                            {chat.unread}
                        </div>
                    )}
                </div>
            ))}
        </div>
      </div>
    </motion.div>
  );
}