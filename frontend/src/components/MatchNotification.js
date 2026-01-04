"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X, MessageCircle } from "lucide-react";

export default function MatchNotification() {
  const [match, setMatch] = useState(null);

  useEffect(() => {
    // 1. Obtener el ID del usuario actual del localStorage
    const userStr = localStorage.getItem("user");
    if (!userStr) return;
    
    const user = JSON.parse(userStr);
    const userId = user.id;

    // 2. Conectar al socket enviando el userId como query param
    const socket = io("http://localhost:8000", {
      query: { userId: userId },
      transports: ["websocket", "polling"],
      withCredentials: true
    });

    // 3. Escuchar el evento de Match
    socket.on("new_match", (data) => {
      console.log("¡Match recibido!", data);
      setMatch(data);

      // Reproducir un sonido sutil si lo deseas
      // const audio = new Audio('/sounds/match_notification.mp3');
      // audio.play().catch(e => console.log("Audio block:", e));

      // Auto-cerrar después de 7 segundos
      setTimeout(() => setMatch(null), 7000);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <AnimatePresence>
      {match && (
        <motion.div
          initial={{ y: -100, x: "-50%", opacity: 0 }}
          animate={{ y: 30, x: "-50%", opacity: 1 }}
          exit={{ y: -100, x: "-50%", opacity: 0 }}
          className="fixed top-0 left-1/2 z-[9999] w-[90%] max-w-md"
        >
          <div className="bg-gradient-to-r from-cuadralo-pink to-purple-600 p-[1.5px] rounded-3xl shadow-[0_0_40px_rgba(236,72,153,0.4)]">
            <div className="bg-[#1a0b2e] rounded-[calc(1.5rem-1px)] p-4 flex items-center gap-4 relative overflow-hidden">
              
              {/* Decoración de fondo */}
              <div className="absolute -right-4 -top-4 opacity-10 text-cuadralo-pink">
                <Heart size={80} fill="currentColor" />
              </div>

              {/* Foto del Match */}
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-cuadralo-pink">
                  <img 
                    src={match.photo || "https://via.placeholder.com/150"} 
                    alt={match.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-cuadralo-pink rounded-full p-1 border-2 border-[#1a0b2e]">
                  <Heart size={12} fill="white" className="text-white" />
                </div>
              </div>

              {/* Texto y Acciones */}
              <div className="flex-1 z-10">
                <h4 className="text-white font-bold text-base leading-tight">
                  ¡Nuevo Match con <span className="text-cuadralo-pink">{match.name}</span>!
                </h4>
                <p className="text-gray-400 text-xs mt-1">
                  Parece que ambos tienen química... ⚡
                </p>
                
                <div className="flex gap-2 mt-3">
                    <button 
                        onClick={() => window.location.href = '/chat'}
                        className="flex items-center gap-1.5 bg-cuadralo-pink/20 hover:bg-cuadralo-pink text-cuadralo-pink hover:text-white px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all border border-cuadralo-pink/30"
                    >
                        <MessageCircle size={14} /> ENVIAR MENSAJE
                    </button>
                </div>
              </div>

              {/* Botón Cerrar */}
              <button 
                onClick={() => setMatch(null)}
                className="self-start p-1 text-gray-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}