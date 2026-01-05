"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";

const DEFAULT_IMG = "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=600";

export default function MatchModal({ matchedUser, onClose, onChat }) {
  const [myPhoto, setMyPhoto] = useState(DEFAULT_IMG);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.photo && user.photo.trim() !== "") {
          setMyPhoto(user.photo);
        }
      }
    } catch (e) {
      console.error("Error leyendo usuario local", e);
    }
  }, []);

  const matchedUserPhoto = matchedUser.img || DEFAULT_IMG;

  return (
    // CAMBIO: z-[500] para estar por encima de todos los otros modales
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4">
      
      {/* Fondo de Confeti */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-cuadralo-pink/30 rounded-full blur-[80px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-purple-600/30 rounded-full blur-[80px] animate-pulse" />
      </div>

      <motion.div 
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        className="relative w-full max-w-sm flex flex-col items-center text-center"
      >
        {/* Título */}
        <motion.h1 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="text-6xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cuadralo-pink via-purple-400 to-indigo-500 mb-10 drop-shadow-[0_0_15px_rgba(236,72,153,0.5)] rotate-[-5deg]"
        >
            IT'S A<br/>MATCH!
        </motion.h1>

        {/* Fotos Chocando */}
        <div className="flex justify-center items-center gap-4 mb-12 relative h-40 w-full">
            <motion.div 
                initial={{ x: -100, rotate: -20, opacity: 0 }}
                animate={{ x: 20, rotate: -10, opacity: 1 }}
                transition={{ type: "spring", bounce: 0.5, delay: 0.4 }}
                className="w-32 h-32 rounded-full border-4 border-white shadow-[0_0_30px_rgba(255,255,255,0.3)] overflow-hidden absolute left-4 z-10 bg-gray-800"
            >
                <img src={myPhoto} alt="Yo" className="w-full h-full object-cover" />
            </motion.div>

            <motion.div 
                initial={{ x: 100, rotate: 20, opacity: 0 }}
                animate={{ x: -20, rotate: 10, opacity: 1 }}
                transition={{ type: "spring", bounce: 0.5, delay: 0.4 }}
                className="w-32 h-32 rounded-full border-4 border-cuadralo-pink shadow-[0_0_30px_rgba(236,72,153,0.5)] overflow-hidden absolute right-4 z-20 bg-gray-800"
            >
                <img src={matchedUserPhoto} alt={matchedUser.name} className="w-full h-full object-cover" />
            </motion.div>
            
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.5, 1] }}
                transition={{ delay: 0.8 }}
                className="absolute z-30 bg-white text-cuadralo-pink p-3 rounded-full shadow-xl"
            >
                 <Heart fill="currentColor" size={24} />
            </motion.div>
        </div>

        <p className="text-white/80 text-lg mb-8 font-medium">
            A <strong>{matchedUser.name}</strong> también le gustas.
        </p>

        {/* Botones */}
        <div className="flex flex-col gap-3 w-full">
            <button 
                onClick={onChat}
                className="w-full bg-gradient-to-r from-cuadralo-pink to-purple-600 py-4 rounded-xl font-bold text-white shadow-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
            >
                <MessageCircle size={20} />
                Enviar Mensaje
            </button>
            
            <button 
                onClick={onClose}
                className="w-full bg-white/10 border border-white/10 py-4 rounded-xl font-bold text-white hover:bg-white/20 transition-colors"
            >
                Seguir Buscando
            </button>
        </div>

      </motion.div>
    </div>
  );
}