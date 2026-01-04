"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PhoneOff, Mic, MicOff, Video, VideoOff, MessageSquare } from "lucide-react";

export default function VideoCallModal({ user, onClose }) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [status, setStatus] = useState("Conectando...");
  const [callDuration, setCallDuration] = useState(0);

  // Simulación de estados de la llamada
  useEffect(() => {
    // 1. Cambiar estado a "Llamando..."
    const t1 = setTimeout(() => setStatus("Llamando..."), 1000);
    // 2. Cambiar a "Conectado" y empezar cronómetro
    const t2 = setTimeout(() => setStatus("En línea"), 3000);
    
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Cronómetro de la llamada
  useEffect(() => {
    let interval;
    if (status === "En línea") {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  // Formato de tiempo mm:ss
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${mins}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-between overflow-hidden">
      
      {/* 1. Fondo / Cámara Remota (Simulada con la foto del usuario) */}
      <div className="absolute inset-0 w-full h-full">
        <img 
          src={user.image || user.img} 
          alt="Remote User" 
          className="w-full h-full object-cover opacity-60 blur-sm scale-110" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
      </div>

      {/* 2. Cámara Propia (Pequeña) */}
      {!isVideoOff && (
        <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            className="absolute top-4 right-4 w-28 h-40 bg-gray-800 rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl z-20 cursor-grab active:cursor-grabbing"
        >
            {/* Aquí iría tu webcam real <video />, por ahora simulamos un fondo gris oscuro */}
            <div className="w-full h-full bg-gray-700 flex items-center justify-center text-xs text-gray-400">
                Tú
            </div>
        </motion.div>
      )}

      {/* 3. Información Superior */}
      <div className="relative z-10 pt-16 flex flex-col items-center animate-fade-in">
        <div className="w-24 h-24 rounded-full p-[3px] bg-gradient-to-r from-cuadralo-pink to-cuadralo-purple mb-4 shadow-[0_0_20px_rgba(242,19,142,0.4)]">
             <img src={user.image || user.img} className="w-full h-full rounded-full object-cover border-4 border-black" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-1">{user.name}</h2>
        <p className="text-cuadralo-pink font-medium text-lg animate-pulse">
            {status === "En línea" ? formatTime(callDuration) : status}
        </p>
      </div>

      {/* 4. Botonera Inferior */}
      <div className="relative z-10 w-full max-w-md pb-12 px-8 flex justify-between items-center">
        
        {/* Botón Silenciar */}
        <button 
            onClick={() => setIsMuted(!isMuted)}
            className={`p-4 rounded-full transition-all ${isMuted ? "bg-white text-black" : "bg-white/10 text-white hover:bg-white/20"}`}
        >
            {isMuted ? <MicOff size={28} /> : <Mic size={28} />}
        </button>

        {/* Botón Colgar (Rojo y Grande) */}
        <button 
            onClick={onClose}
            className="p-6 rounded-full bg-red-600 text-white shadow-[0_0_30px_rgba(220,38,38,0.5)] hover:bg-red-500 hover:scale-110 transition-transform"
        >
            <PhoneOff size={40} fill="currentColor" />
        </button>

        {/* Botón Video */}
        <button 
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`p-4 rounded-full transition-all ${isVideoOff ? "bg-white text-black" : "bg-white/10 text-white hover:bg-white/20"}`}
        >
            {isVideoOff ? <VideoOff size={28} /> : <Video size={28} />}
        </button>

      </div>
    </div>
  );
}