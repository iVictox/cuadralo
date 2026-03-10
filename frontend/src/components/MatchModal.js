"use client";

import { motion } from "framer-motion";
import { MessageCircle, Heart, X, Sparkles, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MatchModal({ myPhoto, matchedUser, onClose }) {
  const router = useRouter();

  if (!matchedUser) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden px-4"
    >
      {/* --- FONDO DINÁMICO CUADRADO --- */}
      <motion.div 
        className="absolute inset-0 bg-black/80 backdrop-blur-3xl z-0"
        animate={{ 
          background: [
            "radial-gradient(rect at center, rgba(85, 28, 166, 0.4) 0%, rgba(10, 2, 20, 1) 100%)",
            "radial-gradient(rect at center, rgba(242, 19, 142, 0.4) 0%, rgba(10, 2, 20, 1) 100%)",
            "radial-gradient(rect at center, rgba(85, 28, 166, 0.4) 0%, rgba(10, 2, 20, 1) 100%)"
          ] 
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Partículas de Cuadrados Flotantes de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute border-2 border-white/20 rounded-xl"
            style={{ 
              width: Math.random() * 100 + 50, 
              height: Math.random() * 100 + 50,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`
            }}
            animate={{ 
              y: [0, -100], 
              rotate: [0, 360],
              opacity: [0, 1, 0]
            }}
            transition={{ 
              duration: Math.random() * 10 + 5, 
              repeat: Infinity, 
              delay: i * 2 
            }}
          />
        ))}
      </div>

      {/* Botón Cerrar */}
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-white/70 backdrop-blur-md transition-all z-50 border border-white/10"
      >
        <X size={24} />
      </button>

      {/* --- TÍTULO PERSONALIZADO "CUADRALO" --- */}
      <motion.div 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
        className="text-center mb-12 z-10"
      >
        <h2 className="text-5xl md:text-7xl font-black text-white mb-2 tracking-tighter uppercase italic">
          ¡LO <span className="text-cuadralo-pink">CUADRASTE</span>!
        </h2>
        <motion.div 
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="h-1.5 w-32 bg-cuadralo-pink mx-auto rounded-full mb-4"
        />
        <p className="text-white/80 text-xl font-light">
          Acabas de cuadrar con <span className="text-white font-bold">{matchedUser.name}</span>
        </p>
      </motion.div>

      {/* --- LA ANIMACIÓN DE LOS CUADRADOS --- */}
      <div className="flex items-center justify-center relative w-full max-w-lg h-64 md:h-80 mb-16 z-10">
        
        {/* ONDAS DE CHOQUE CUADRADAS */}
        {[1, 1.4, 1.8].map((scale, i) => (
          <motion.div 
            key={i}
            className="absolute border-4 border-cuadralo-pink/30 rounded-[3rem]"
            style={{ width: "16rem", height: "16rem" }}
            initial={{ scale: 0.5, opacity: 0, rotate: 45 }}
            animate={{ scale: scale, opacity: [0, 0.5, 0], rotate: 45 }}
            transition={{ 
              delay: 1 + (i * 0.4), 
              duration: 2.5, 
              repeat: Infinity, 
              ease: "easeOut" 
            }}
          />
        ))}

        {/* FOTO IZQUIERDA (TUYA - CUADRADA) */}
        <motion.div
          initial={{ x: -300, opacity: 0, rotate: -25, scale: 0.5 }}
          animate={{ x: -55, opacity: 1, rotate: -12, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8, type: "spring", stiffness: 80 }}
          className="absolute z-20"
        >
          <div className="relative p-1 bg-white rounded-[2.5rem] shadow-2xl transform hover:scale-105 transition-transform">
              <img 
                src={myPhoto || "https://via.placeholder.com/150"} 
                alt="Tú" 
                className="w-36 h-36 md:w-48 md:h-48 rounded-[2.2rem] object-cover"
              />
              <div className="absolute -top-2 -left-2 bg-purple-600 p-2 rounded-xl shadow-lg">
                <Zap size={20} className="text-white fill-white" />
              </div>
          </div>
        </motion.div>

        {/* ICONO CENTRAL (CORAZÓN CUADRADO) */}
        <motion.div
          initial={{ scale: 0, rotate: 45 }}
          animate={{ scale: 1, rotate: [45, 55, 45] }}
          transition={{ 
            scale: { delay: 1.2, type: "spring" },
            rotate: { delay: 2, duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute z-40"
        >
          <div className="bg-cuadralo-pink p-5 rounded-3xl shadow-[0_0_50px_rgba(242,19,142,0.8)] border-4 border-white transform rotate-0">
             <Heart size={40} className="text-white fill-white" />
          </div>
        </motion.div>

        {/* FOTO DERECHA (DE ÉL/ELLA - CUADRADA) */}
        <motion.div
          initial={{ x: 300, opacity: 0, rotate: 25, scale: 0.5 }}
          animate={{ x: 55, opacity: 1, rotate: 12, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8, type: "spring", stiffness: 80 }}
          className="absolute z-30"
        >
          <div className="relative p-1 bg-white rounded-[2.5rem] shadow-2xl transform hover:scale-105 transition-transform">
              <img 
                src={matchedUser.img || "https://via.placeholder.com/150"} 
                alt={matchedUser.name} 
                className="w-36 h-36 md:w-48 md:h-48 rounded-[2.2rem] object-cover"
              />
              <div className="absolute -bottom-2 -right-2 bg-cuadralo-pink p-2 rounded-xl shadow-lg">
                <Sparkles size={20} className="text-white fill-white" />
              </div>
          </div>
        </motion.div>
      </div>

      {/* BOTONES DE ACCIÓN */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.5, type: "spring" }}
        className="flex flex-col gap-4 w-full max-w-sm z-10 px-6"
      >
        <button 
          onClick={() => { 
              onClose(); 
              // ✅ CORRECCIÓN: Apuntar a la pestaña de chat mediante query param
              router.push("/?tab=chat"); 
          }}
          className="w-full py-5 bg-white text-black rounded-2xl font-black text-xl flex items-center justify-center gap-3 shadow-white/10 shadow-2xl hover:bg-cuadralo-pink hover:text-white transition-all active:scale-95 group"
        >
          <MessageCircle size={24} className="group-hover:animate-bounce" />
          ENVIAR MENSAJE
        </button>

        <button 
          onClick={onClose}
          className="w-full py-5 bg-transparent text-white/60 hover:text-white border border-white/20 rounded-2xl font-bold text-lg backdrop-blur-md transition-all active:scale-95"
        >
          SEGUIR BUSCANDO
        </button>
      </motion.div>
    </motion.div>
  );
}