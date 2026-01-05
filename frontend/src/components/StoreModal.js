"use client";

import { useState } from "react";
import { X, Check, Zap, Crown, Star } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image"; // <--- Importamos Image
import { api } from "@/utils/api";
import { useToast } from "@/context/ToastContext";

const PLANS = [
  {
    id: "silver",
    name: "Silver",
    price: "4.99",
    color: "from-slate-300 to-slate-500",
    features: ["Swipes Ilimitados", "Rewind (Deshacer)", "Sin Anuncios"]
  },
  {
    id: "gold",
    name: "Gold",
    price: "9.99",
    color: "from-yellow-400 to-yellow-600",
    popular: true,
    features: ["Todo lo de Silver", "Ver quién te dio Like", "1 Destello Gratis/mes"]
  },
  {
    id: "platinum",
    name: "Platinum",
    price: "19.99",
    color: "from-gray-900 to-black border-white/30",
    textColor: "text-white",
    features: ["Todo lo de Gold", "Prioridad en el Feed", "Mensaje antes de Match", "3 Destellos Gratis/mes"]
  }
];

export default function StoreModal({ onClose }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handlePurchase = async (item) => {
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 800)); // Simulamos espera
      await api.post("/purchase", { item });
      showToast(`¡Plan ${item.toUpperCase()} activado! 🚀`);
      window.location.reload();
    } catch (error) {
      console.error(error);
      showToast("Error en la compra", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/90 backdrop-blur-md p-4 overflow-y-auto">
      <motion.div 
        initial={{ y: "100%", opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        exit={{ y: "100%", opacity: 0 }}
        className="w-full max-w-4xl bg-[#140520] rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header con Logo */}
        <div className="p-6 text-center relative z-10 bg-[#1a0b2e]">
            <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/5 rounded-full hover:bg-white/10 text-gray-400 transition-colors"><X size={20}/></button>
            
            {/* LOGO DE LA EMPRESA */}
            <div className="relative h-16 w-48 mx-auto mb-3">
                <Image 
                  src="/logo.svg" 
                  alt="Cuadralo" 
                  fill
                  className="object-contain"
                  priority
                />
            </div>

            <p className="text-gray-400 text-xs font-medium uppercase tracking-widest flex items-center justify-center gap-2">
               <Crown size={14} className="text-yellow-500" fill="currentColor" /> 
               Elige el poder que necesitas
            </p>
        </div>

        <div className="overflow-y-auto flex-1 p-6 scrollbar-hide">
            
            {/* --- SECCIÓN DESTELLO (BOOST) --- */}
            <div className="mb-10 p-[1px] bg-gradient-to-r from-cuadralo-pink to-purple-600 rounded-2xl shadow-[0_0_20px_rgba(236,72,153,0.3)]">
                <div className="bg-[#1a0b2e] rounded-[15px] p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="relative">
                            <div className="absolute inset-0 bg-purple-500 blur-xl opacity-50 animate-pulse" />
                            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                                <Zap fill="white" className="text-white" size={32} />
                            </div>
                        </div>
                        <div className="text-center sm:text-left">
                            <h3 className="font-bold text-white text-xl flex items-center gap-2 justify-center sm:justify-start">
                                Destello <span className="text-[10px] bg-white text-black px-2 py-0.5 rounded-full font-extrabold tracking-wider">POPULAR</span>
                            </h3>
                            <p className="text-gray-300 text-sm mt-1">
                                Sé el perfil <span className="text-cuadralo-pink font-bold">#1 en tu zona</span> por 30 minutos.
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={() => handlePurchase("destello")}
                        disabled={loading}
                        className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-gray-200 text-black font-extrabold rounded-xl text-sm transition-all transform hover:scale-105 active:scale-95 flex flex-col items-center leading-tight"
                    >
                        <span>ACTIVAR AHORA</span>
                        <span className="text-[10px] opacity-70">1.99 USDT</span>
                    </button>
                </div>
            </div>

            {/* --- SECCIÓN PLANES --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {PLANS.map((plan) => (
                    <div key={plan.id} className={`relative rounded-2xl p-6 flex flex-col h-full border transition-all hover:scale-[1.02] ${plan.popular ? 'border-yellow-500/50 bg-gradient-to-b from-[#2a1b05]/50 to-[#1a0b2e]' : 'border-white/5 bg-white/5 hover:bg-white/10'}`}>
                        
                        {plan.popular && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-[10px] font-extrabold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                                <Star size={10} fill="black" /> RECOMENDADO
                            </div>
                        )}
                        
                        <div className="mb-4">
                            <h3 className={`text-lg font-bold ${plan.id === 'platinum' ? 'text-gray-200' : 'text-white'}`}>{plan.name}</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-extrabold text-white">{plan.price}</span>
                                <span className="text-xs font-medium text-gray-500">USDT / mes</span>
                            </div>
                        </div>
                        
                        <div className="flex-1 space-y-4 mb-8">
                            {plan.features.map((feat, i) => (
                                <div key={i} className="flex items-start gap-3 text-xs text-gray-300">
                                    <div className={`mt-0.5 p-0.5 rounded-full ${plan.id === 'platinum' ? 'bg-gray-700' : (plan.id === 'gold' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-gray-700 text-gray-400')}`}>
                                        <Check size={10} strokeWidth={4} />
                                    </div>
                                    <span className="leading-tight">{feat}</span>
                                </div>
                            ))}
                        </div>

                        <button 
                            onClick={() => handlePurchase(plan.id)}
                            disabled={loading}
                            className={`w-full py-4 rounded-xl font-bold text-sm shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 bg-gradient-to-r ${plan.color} ${plan.id === 'silver' ? 'text-gray-900' : 'text-white'}`}
                        >
                            {loading ? <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"/> : "Elegir Plan"}
                        </button>
                    </div>
                ))}
            </div>
        </div>
        
      </motion.div>
    </div>
  );
}