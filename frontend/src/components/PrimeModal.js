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
        // ✅ RESPONSIVE: Ancho dinámico, flex-col en móvil, flex-row en desktop
        className="relative w-full max-w-sm md:max-w-4xl bg-gradient-to-br from-[#1c1c1c] via-[#0f0f0f] to-black rounded-[2.5rem] overflow-hidden border border-yellow-500/30 shadow-[0_0_80px_-15px_rgba(234,179,8,0.4)] text-white flex flex-col md:flex-row"
      >
        {/* Botón Cerrar Global */}
        <button onClick={onClose} className="absolute top-5 right-5 p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-all z-50 backdrop-blur-sm border border-white/5">
            <X size={20} />
        </button>

        {/* =========================================
            COLUMNA IZQUIERDA (BRANDING VISUAL)
        ========================================= */}
        <div className="w-full md:w-5/12 relative flex flex-col items-center justify-center p-8 md:p-12 border-b md:border-b-0 md:border-r border-white/10 overflow-hidden min-h-[300px] md:min-h-full">
            {/* Efectos de fondo de la tarjeta */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-overlay pointer-events-none z-0" />
            <div className="absolute -top-20 -left-20 w-48 h-48 bg-yellow-500/20 blur-[60px] rounded-full pointer-events-none z-0" />
            <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-amber-600/20 blur-[60px] rounded-full pointer-events-none z-0" />
            
            {/* Marca de agua VIP Gigante */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[120px] md:text-[180px] font-black text-white/[0.02] tracking-tighter select-none pointer-events-none z-0">
                VIP
            </div>

            <div className="relative z-10 flex flex-col items-center text-center">
                {/* Icono VIP Flotante */}
                <motion.div 
                    animate={{ rotateY: [0, 360] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                    className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-gradient-to-tr from-yellow-300 via-yellow-500 to-amber-700 flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.3)] mb-5 p-[2px] md:p-1"
                >
                    <div className="w-full h-full bg-[#111] rounded-full flex items-center justify-center">
                        <Crown className="w-8 h-8 md:w-12 md:h-12 text-yellow-400 drop-shadow-[0_2px_10px_rgba(234,179,8,0.8)]" strokeWidth={2.5} />
                    </div>
                </motion.div>

                <h2 className="text-3xl md:text-4xl font-black mb-2 tracking-tight flex items-center justify-center gap-2 drop-shadow-lg w-full">
                    Cuadralo <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-amber-500 uppercase tracking-widest text-4xl md:text-5xl">VIP</span>
                </h2>
                <p className="text-white/60 text-sm md:text-base font-medium max-w-[250px] md:max-w-[300px]">
                    El pase de acceso total. Conecta más rápido, sin límites y destacando del resto.
                </p>
            </div>
        </div>

        {/* =========================================
            COLUMNA DERECHA (BENEFICIOS Y COMPRA)
        ========================================= */}
        <div className="w-full md:w-7/12 p-8 md:p-12 flex flex-col justify-center relative z-10 bg-black/40 md:bg-transparent">
            
            {/* Beneficios Core */}
            <div className="w-full space-y-3 mb-6">
                <BenefitItem icon={Eye} title="El Radar" desc="Mira a quién le gustas antes de deslizar." />
                <BenefitItem icon={InfinityIcon} title="Likes Ilimitados" desc="Desliza sin muros de pago diarios." />
                <BenefitItem icon={RotateCcw} title="Rebobinar" desc="Deshaz Swipes que diste por accidente." />
                
                {/* Caja Especial Bono Mensual */}
                <div className="mt-4 p-4 md:p-5 rounded-2xl bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 relative overflow-hidden group hover:border-yellow-500/40 transition-colors">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-500/20 blur-2xl rounded-full pointer-events-none" />
                    
                    <div className="flex items-center gap-2 mb-3 relative z-10">
                        <Gift size={18} className="text-yellow-400" />
                        <span className="text-yellow-400 text-xs md:text-sm font-black uppercase tracking-widest">Bono Mensual Incluido</span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 relative z-10">
                        <div className="flex items-center gap-2 text-white/90 text-sm md:text-base font-bold bg-white/5 py-1.5 px-3 rounded-lg border border-white/10">
                            <Zap size={16} className="text-purple-400 fill-current" /> 1 Destello
                        </div>
                        <div className="flex items-center gap-2 text-white/90 text-sm md:text-base font-bold bg-white/5 py-1.5 px-3 rounded-lg border border-white/10">
                            <MessageCircle size={16} className="text-blue-400" /> 3 Rompehielos
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-auto">
                {/* Precio y Botón en la misma línea en escritorio, apilados en móvil */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    
                    {/* Precio */}
                    <div className="flex flex-col items-center md:items-start">
                        <span className="text-xs text-white/50 font-bold uppercase tracking-widest mb-1">Inversión mensual</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70">$4.99</span>
                            <span className="text-white/50 text-sm font-bold uppercase tracking-widest">/ mes</span>
                        </div>
                    </div>

                    {/* Botón */}
                    <button 
                        onClick={handleSubscribe}
                        disabled={loading}
                        className="relative w-full md:w-auto md:flex-1 py-4 md:py-5 px-6 rounded-2xl bg-gradient-to-r from-yellow-300 via-yellow-500 to-amber-600 text-black font-black uppercase tracking-widest text-sm md:text-base hover:scale-[1.03] active:scale-95 transition-all shadow-[0_10px_30px_-10px_rgba(234,179,8,0.6)] flex items-center justify-center gap-2 overflow-hidden group"
                    >
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                        
                        {loading ? "Procesando..." : (
                            <>
                                <Sparkles size={20} className="animate-pulse" />
                                Obtener Pase VIP
                            </>
                        )}
                    </button>
                </div>

                <p className="mt-4 text-[10px] uppercase font-bold tracking-widest text-white/30 text-center md:text-left">
                    Suscripción recurrente. Cancela cuando quieras en ajustes.
                </p>
            </div>

        </div>
      </motion.div>
    </div>
  );
}

// Subcomponente de Beneficios optimizado para responsive
function BenefitItem({ icon: Icon, title, desc }) {
    return (
        <div className="flex items-start gap-3 md:gap-4 p-2.5 md:p-3 rounded-xl hover:bg-white/5 transition-colors">
            <div className="p-2 md:p-2.5 rounded-lg bg-gradient-to-br from-yellow-400/20 to-amber-600/20 text-yellow-400 border border-yellow-500/20 shadow-inner mt-0.5">
                <Icon className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
                <span className="text-white text-sm md:text-base font-black tracking-tight">{title}</span>
                <span className="text-white/60 text-xs md:text-sm font-medium leading-tight mt-0.5">{desc}</span>
            </div>
        </div>
    );
}