"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Crown, Check, Sparkles } from "lucide-react";
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-colors duration-300">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative w-full max-w-md bg-cuadralo-cardLight dark:bg-cuadralo-cardDark rounded-[2.5rem] overflow-hidden border border-yellow-500/20 dark:border-yellow-500/30 shadow-[0_20px_60px_-12px_rgba(234,179,8,0.2)] dark:shadow-[0_0_50px_-12px_rgba(234,179,8,0.3)] transition-colors duration-300"
      >
        {/* Fondo Decorativo */}
        <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-yellow-500/10 dark:from-yellow-600/20 to-transparent pointer-events-none" />
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-400/20 dark:bg-yellow-500/20 blur-[50px] rounded-full" />
        
        {/* Botón Cerrar */}
        <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-black/5 dark:bg-white/5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors z-10">
            <X size={20} />
        </button>

        <div className="p-8 flex flex-col items-center text-center relative z-0 pt-10">
            {/* Icono Principal */}
            <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-tr from-yellow-300 to-yellow-500 dark:from-yellow-400 dark:to-yellow-600 flex items-center justify-center shadow-xl shadow-yellow-500/30 dark:shadow-yellow-500/20 mb-6 border-2 border-white dark:border-transparent">
                <Crown size={36} className="text-yellow-900 dark:text-black" strokeWidth={2.5} />
            </div>

            <h2 className="text-3xl font-black text-cuadralo-textLight dark:text-white mb-2 tracking-tight flex items-center gap-2">
                Cuadralo <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-600 dark:from-yellow-200 dark:to-yellow-500">Prime</span>
            </h2>
            <p className="text-cuadralo-textMutedLight dark:text-white/60 text-sm mb-8 font-medium">
                Desbloquea el máximo potencial y destaca sobre los demás.
            </p>

            {/* Lista de Beneficios */}
            <div className="w-full space-y-3 mb-8 text-left">
                <BenefitItem text="Insignia Dorada exclusiva en tu perfil" />
                <BenefitItem text="Visibilidad prioritaria en búsquedas" />
                <BenefitItem text="Descubre a quién le gustas" />
                <BenefitItem text="Sin límites de swipes diarios" />
            </div>

            {/* Precio */}
            <div className="mb-6">
                <span className="text-4xl font-black tracking-tighter text-cuadralo-textLight dark:text-white">$4.99</span>
                <span className="text-cuadralo-textMutedLight dark:text-white/50 text-sm font-bold uppercase tracking-widest ml-1">/ mes</span>
            </div>

            {/* Botón de Acción */}
            <button 
                onClick={handleSubscribe}
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-yellow-400 to-yellow-500 dark:from-yellow-400 dark:to-yellow-600 text-yellow-900 dark:text-black font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-yellow-500/20 flex items-center justify-center gap-2"
            >
                {loading ? "Procesando..." : (
                    <>
                        <Sparkles size={18} />
                        Obtener Prime
                    </>
                )}
            </button>
            
            <p className="mt-5 text-[10px] uppercase font-bold tracking-widest text-gray-400 dark:text-white/30">
                Cancelación flexible. Aplican T&C.
            </p>
        </div>
      </motion.div>
    </div>
  );
}

function BenefitItem({ text }) {
    return (
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
            <div className="p-1 rounded-full bg-yellow-500/20 text-yellow-600 dark:text-yellow-400">
                <Check size={16} strokeWidth={3} />
            </div>
            <span className="text-cuadralo-textLight dark:text-white/90 text-sm font-bold">{text}</span>
        </div>
    );
}