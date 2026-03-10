"use client";

import { motion } from "framer-motion";
import { MessageCircle, Heart, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MatchModal({ myPhoto, matchedUser, onClose }) {
  const router = useRouter();

  if (!matchedUser) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      // ✅ z-[100] y fixed inset-0 garantiza que NADA tape a este modal
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/70 backdrop-blur-2xl px-4"
    >
      {/* Botón Cerrar Superior */}
      <button 
        onClick={onClose}
        className="absolute top-8 right-8 md:top-12 md:right-12 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-colors z-50"
      >
        <X size={24} />
      </button>

      {/* Texto de Match (Estilo Neón Premium) */}
      <motion.div 
        initial={{ y: -50, opacity: 0, scale: 0.8 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="text-center mb-12 mt-10"
      >
        <h2 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cuadralo-pink to-purple-500 mb-3 drop-shadow-[0_0_15px_rgba(242,19,142,0.5)]">
          ¡Es un Match!
        </h2>
        <p className="text-gray-200 text-lg md:text-xl font-medium tracking-wide">
          Tú y {matchedUser.name} se han gustado mutuamente
        </p>
      </motion.div>

      {/* Fotos de los Usuarios Uniéndose */}
      <div className="flex items-center justify-center gap-2 md:gap-8 mb-16 relative w-full max-w-md">
        
        {/* Mi Foto (Entra desde la Izquierda) */}
        <motion.div
          initial={{ x: -100, opacity: 0, rotate: -15 }}
          animate={{ x: 0, opacity: 1, rotate: -5 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
          className="relative z-10"
        >
          <div className="p-1.5 bg-gradient-to-tr from-cuadralo-pink to-purple-600 rounded-full shadow-[0_10px_40px_rgba(242,19,142,0.4)]">
              <img 
                src={myPhoto || "https://via.placeholder.com/150"} 
                alt="Mi foto" 
                className="w-32 h-32 md:w-44 md:h-44 rounded-full object-cover border-4 border-black"
              />
          </div>
        </motion.div>

        {/* Icono de Corazón Flotante en el Medio */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [1, 1.2, 1], opacity: 1 }}
          transition={{ delay: 0.6, duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute z-30"
        >
          <div className="bg-white p-3.5 md:p-4 rounded-full shadow-[0_0_30px_rgba(242,19,142,0.8)] border border-gray-100">
             <Heart size={32} className="text-cuadralo-pink fill-cuadralo-pink" />
          </div>
        </motion.div>

        {/* Foto del Match (Entra desde la Derecha) */}
        <motion.div
          initial={{ x: 100, opacity: 0, rotate: 15 }}
          animate={{ x: 0, opacity: 1, rotate: 5 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
          className="relative z-20"
        >
          <div className="p-1.5 bg-gradient-to-tr from-purple-600 to-cuadralo-pink rounded-full shadow-[0_10px_40px_rgba(85,28,166,0.4)]">
              <img 
                src={matchedUser.img || "https://via.placeholder.com/150"} 
                alt={`Foto de ${matchedUser.name}`} 
                className="w-32 h-32 md:w-44 md:h-44 rounded-full object-cover border-4 border-black"
              />
          </div>
        </motion.div>
      </div>

      {/* Botones de Acción (Estilo Cristal) */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, type: "spring" }}
        className="flex flex-col gap-4 w-full max-w-sm"
      >
        <button 
          onClick={() => {
              onClose(); 
              // Aquí en el futuro puedes redirigir directamente al ID del chat si tu API te lo devuelve
              router.push(`/chats`); 
          }}
          className="w-full py-4 px-6 bg-gradient-to-r from-cuadralo-pink to-purple-600 text-white rounded-full font-bold text-lg flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(242,19,142,0.4)] hover:shadow-[0_10px_40px_rgba(242,19,142,0.6)] hover:scale-105 active:scale-95 transition-all"
        >
          <MessageCircle size={24} />
          Escríbele ahora
        </button>

        <button 
          onClick={onClose}
          className="w-full py-4 px-6 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full font-semibold text-lg backdrop-blur-md transition-all hover:scale-105 active:scale-95"
        >
          Seguir deslizando
        </button>
      </motion.div>
    </motion.div>
  );
}