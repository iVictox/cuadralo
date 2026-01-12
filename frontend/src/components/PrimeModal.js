"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Crown, Check, Star, Sparkles } from "lucide-react";
import { api } from "@/utils/api";
import { useToast } from "@/context/ToastContext";

export default function PrimeModal({ onClose, onSuccess }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      // Simulamos la llamada de compra
      const res = await api.post("/premium/buy");
      showToast("¡Bienvenido a la élite! Eres Prime 👑", "success");
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      showToast("Error al procesar la compra", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative w-full max-w-md bg-[#0f0518] rounded-3xl overflow-hidden border border-yellow-500/30 shadow-[0_0_50px_-12px_rgba(234,179,8,0.3)]"
      >
        {/* Fondo Decorativo */}
        <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-yellow-600/20 to-transparent pointer-events-none" />
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-500/20 blur-[50px] rounded-full" />
        
        {/* Botón Cerrar */}
        <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors z-10">
            <X size={24} />
        </button>

        <div className="p-8 flex flex-col items-center text-center relative z-0">
            {/* Icono Principal */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-yellow-300 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/20 mb-6">
                <Crown size={40} className="text-black" strokeWidth={2.5} />
            </div>

            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
                Cuadralo <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500">Prime</span>
            </h2>
            <p className="text-white/60 text-sm mb-8">
                Desbloquea el máximo potencial y destaca sobre los demás.
            </p>

            {/* Lista de Beneficios */}
            <div className="w-full space-y-4 mb-8 text-left">
                <BenefitItem text="Insignia Dorada exclusiva en tu perfil" />
                <BenefitItem text="Visibilidad prioritaria en búsquedas" />
                <BenefitItem text="Carga de historias en alta calidad (4K)" />
                <BenefitItem text="Sin límites de swipes diarios" />
            </div>

            {/* Precio */}
            <div className="mb-6">
                <span className="text-4xl font-bold text-white">$4.99</span>
                <span className="text-white/50 text-sm"> / mes</span>
            </div>

            {/* Botón de Acción */}
            <button 
                onClick={handleSubscribe}
                disabled={loading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2"
            >
                {loading ? "Procesando..." : (
                    <>
                        <Sparkles size={20} />
                        Obtener Prime
                    </>
                )}
            </button>
            
            <p className="mt-4 text-[10px] text-white/30">
                Cancelación flexible en cualquier momento. Términos y condiciones aplican.
            </p>
        </div>
      </motion.div>
    </div>
  );
}

function BenefitItem({ text }) {
    return (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
            <div className="p-1 rounded-full bg-yellow-500/20 text-yellow-400">
                <Check size={14} strokeWidth={3} />
            </div>
            <span className="text-white/90 text-sm font-medium">{text}</span>
        </div>
    );
}