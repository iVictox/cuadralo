"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Zap, Clock, Flame, Rocket } from "lucide-react";
import { api } from "@/utils/api";
import { useToast } from "@/context/ToastContext";

export default function BoostModal({ onClose, onSuccess }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState("1hour"); // Opción por defecto (la del medio)

  const options = [
    {
        id: "30min",
        title: "Flash",
        duration: "30 min",
        price: 0.99,
        color: "from-blue-400 to-cyan-400",
        icon: Zap
    },
    {
        id: "1hour",
        title: "Súper",
        duration: "1 hora",
        price: 1.49,
        color: "from-purple-500 to-pink-500",
        icon: Flame,
        popular: true
    },
    {
        id: "3hours",
        title: "Mega",
        duration: "3 horas",
        price: 3.99,
        color: "from-orange-500 to-red-500",
        icon: Rocket
    }
  ];

  const handleBuyBoost = async () => {
    setLoading(true);
    try {
      await api.post("/premium/boost", { type: selected });
      showToast("¡Destello activado! 🚀", "success");
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      showToast("Error al activar destello", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="relative w-full max-w-lg bg-[#0f0518] rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white z-10">
            <X size={24} />
        </button>

        <div className="p-6 md:p-8">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4 border border-white/10">
                    <Zap size={32} className="text-cuadralo-pink" fill="currentColor" />
                </div>
                <h2 className="text-2xl font-bold text-white">¡Hazte notar ahora!</h2>
                <p className="text-white/60 text-sm mt-2">
                    Activa un Destello y tu perfil aparecerá primero en el feed de todos.
                </p>
            </div>

            {/* Opciones */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {options.map((opt) => (
                    <div 
                        key={opt.id}
                        onClick={() => setSelected(opt.id)}
                        className={`relative cursor-pointer rounded-2xl p-4 border transition-all duration-200 ${
                            selected === opt.id 
                            ? "bg-white/10 border-cuadralo-pink scale-105 shadow-lg shadow-purple-500/20" 
                            : "bg-white/5 border-white/5 hover:bg-white/10"
                        }`}
                    >
                        {opt.popular && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cuadralo-pink to-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                                Popular
                            </div>
                        )}
                        
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${opt.color} flex items-center justify-center mb-3 mx-auto`}>
                            <opt.icon size={20} className="text-white" fill="currentColor" />
                        </div>
                        
                        <h3 className="text-white font-bold text-center">{opt.title}</h3>
                        <p className="text-white/50 text-xs text-center mb-2">{opt.duration}</p>
                        <p className="text-white font-bold text-lg text-center">${opt.price}</p>
                    </div>
                ))}
            </div>

            <button 
                onClick={handleBuyBoost}
                disabled={loading}
                className="w-full py-4 rounded-xl bg-white text-black font-bold text-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
                {loading ? "Activando..." : (
                    <>
                        <Zap size={20} className="text-black" fill="currentColor"/>
                        Activar Destello
                    </>
                )}
            </button>
        </div>
      </motion.div>
    </div>
  );
}