"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Crown, Sparkles, Eye, Infinity as InfinityIcon, RotateCcw, Gift, Zap, MessageCircle } from "lucide-react";
import { api } from "@/utils/api";
import { useToast } from "@/context/ToastContext";

export default function PrimeModal({ onClose, onSuccess }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      // Mantenemos la ruta del backend intacta
      await api.post("/premium/buy");
      showToast("¡Bienvenido a la élite! Ahora eres VIP 👑", "success");
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all duration-300">
      <motion.div 
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
        className="relative w-full max-w-sm bg-gradient-to-br from-[#1c1c1c] via-[#0f0f0f] to-black rounded-[2.5rem] overflow-hidden border border-yellow-500/30 shadow-[0_0_80px_-15px_rgba(234,179,8,0.4)] text-white"
      >
        {/* Efecto de luces y reflejos de tarjeta de crédito */}
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-overlay pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-yellow-500/20 blur-[60px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-600/20 blur-[60px] rounded-full pointer-events-none" />
        
        {/* Marca de agua VIP Gigante de fondo */}
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[140px] font-black text-white/[0.02] tracking-tighter select-none pointer-events-none z-0">
            VIP
        </div>

        {/* Botón Cerrar */}
        <button onClick={onClose} className="absolute top-5 right-5 p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-all z-20 backdrop-blur-sm border border-white/5">
            <X size={20} />
        </button>

        <div className="p-8 flex flex-col items-center relative z-10 pt-10">
            {/* Icono VIP Flotante */}
            <motion.div 
                animate={{ rotateY: [0, 360] }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                className="w-20 h-20 rounded-full bg-gradient-to-tr from-yellow-300 via-yellow-500 to-amber-700 flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.3)] mb-5 p-[2px]"
            >
                <div className="w-full h-full bg-[#111] rounded-full flex items-center justify-center">
                    <Crown size={32} className="text-yellow-400 drop-shadow-[0_2px_10px_rgba(234,179,8,0.8)]" strokeWidth={2.5} />
                </div>
            </motion.div>

            <h2 className="text-3xl font-black mb-1 tracking-tight flex items-center justify-center gap-2 drop-shadow-lg text-center w-full">
                Cuadralo <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-amber-500 uppercase tracking-widest text-4xl">VIP</span>
            </h2>
            <p className="text-white/60 text-sm mb-7 font-medium text-center px-2">
                El pase de acceso total. Conecta más rápido, sin límites y sin perder el tiempo.
            </p>

            {/* Lista de Beneficios del Nuevo Modelo Freemium */}
            <div className="w-full space-y-2.5 mb-8 text-left">
                <BenefitItem icon={Eye} title="El Radar" desc="Mira a quién le gustas antes de deslizar." />
                <BenefitItem icon={InfinityIcon} title="Likes Ilimitados" desc="Desliza sin muros de pago diarios." />
                <BenefitItem icon={RotateCcw} title="Rebobinar" desc="Deshaz Swipes que diste por accidente." />
                
                {/* Caja Especial para el Bono Mensual */}
                <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-500/20 blur-xl rounded-full" />
                    <div className="flex items-center gap-2 mb-2 relative z-10">
                        <Gift size={16} className="text-yellow-400" />
                        <span className="text-yellow-400 text-xs font-black uppercase tracking-widest">Bono Mensual Incluido</span>
                    </div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="flex items-center gap-1.5 text-white/90 text-sm font-bold">
                            <Zap size={14} className="text-purple-400 fill-current" /> 1 Destello
                        </div>
                        <div className="flex items-center gap-1.5 text-white/90 text-sm font-bold">
                            <MessageCircle size={14} className="text-blue-400" /> 3 Rompehielos
                        </div>
                    </div>
                </div>
            </div>

            {/* Precio */}
            <div className="mb-6 flex flex-col items-center">
                <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70">$4.99</span>
                    <span className="text-white/50 text-sm font-bold uppercase tracking-widest">/ mes</span>
                </div>
            </div>

            {/* Botón de Acción */}
            <button 
                onClick={handleSubscribe}
                disabled={loading}
                className="relative w-full py-4 rounded-2xl bg-gradient-to-r from-yellow-300 via-yellow-500 to-amber-600 text-black font-black uppercase tracking-widest text-sm hover:scale-[1.03] active:scale-95 transition-all shadow-[0_10px_30px_-10px_rgba(234,179,8,0.6)] flex items-center justify-center gap-2 overflow-hidden group"
            >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                
                {loading ? "Procesando..." : (
                    <>
                        <Sparkles size={18} className="animate-pulse" />
                        Obtener Pase VIP
                    </>
                )}
            </button>
            
            <p className="mt-5 text-[10px] uppercase font-bold tracking-widest text-white/30 text-center">
                Suscripción recurrente. Cancela cuando quieras.
            </p>
        </div>
      </motion.div>
    </div>
  );
}

// Subcomponente de Beneficios
function BenefitItem({ icon: Icon, title, desc }) {
    return (
        <div className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors">
            <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-400/20 to-amber-600/20 text-yellow-400 border border-yellow-500/20 shadow-inner mt-0.5">
                <Icon size={16} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
                <span className="text-white text-sm font-black tracking-tight">{title}</span>
                <span className="text-white/60 text-xs font-medium leading-tight mt-0.5">{desc}</span>
            </div>
        </div>
    );
}