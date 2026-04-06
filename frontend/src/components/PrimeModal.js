"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Crown, Eye, Infinity as InfinityIcon, RotateCcw, Zap, MessageCircle, Check } from "lucide-react";
import CheckoutModal from "@/components/CheckoutModal"; 

export default function PrimeModal({ onClose }) {
  const [showCheckout, setShowCheckout] = useState(false);

  const vipProduct = {
      id: "vip",
      name: "Cuadralo VIP",
      desc: "Suscripción mensual (Pase de Acceso Total)",
      price: 4.99,
      type: "subscription"
  };

  return (
    <>
      {/* ✅ CORRECCIÓN: El modal VIP ya NO se oculta violentamente. 
          Permanece de fondo para evitar que Framer Motion se congele. */}
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
        <motion.div 
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
          className="relative w-full max-w-sm bg-[#121212] rounded-[2rem] overflow-hidden border border-yellow-500/20 shadow-2xl flex flex-col"
        >
          
          <button 
              onClick={onClose} 
              className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white/60 hover:text-white transition-colors z-20 backdrop-blur-md"
          >
              <X size={20} />
          </button>

          <div className="relative pt-10 pb-8 flex flex-col items-center bg-gradient-to-b from-yellow-500/10 to-transparent">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent" />
              
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-300 to-amber-600 p-[2px] mb-4 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                  <div className="w-full h-full bg-[#121212] rounded-full flex items-center justify-center">
                      <Crown className="w-8 h-8 text-yellow-400" strokeWidth={2.5} />
                  </div>
              </div>

              <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
                  Cuádralo <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500">VIP</span>
              </h2>
              <p className="text-gray-400 text-sm font-medium mt-2 px-6 text-center">
                  Desbloquea todo el potencial. Conecta sin límites.
              </p>
          </div>

          <div className="px-8 pb-6 space-y-5">
              <BenefitItem icon={Eye} text="Mira a quién le gustas" />
              <BenefitItem icon={InfinityIcon} text="Likes Ilimitados" />
              <BenefitItem icon={RotateCcw} text="Rebobinar sin límites" />
              
              <div className="mt-6 p-4 rounded-2xl bg-[#1a1a1a] border border-white/5 flex flex-col gap-2 relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-16 h-16 bg-yellow-500/10 blur-xl rounded-full" />
                  <span className="text-[10px] text-yellow-500 font-black uppercase tracking-widest">Incluye cada mes:</span>
                  <div className="flex justify-between items-center text-sm font-bold text-gray-300">
                      <span className="flex items-center gap-1.5"><Zap size={14} className="text-purple-400 fill-current"/> 1 Destello</span>
                      <span className="text-white/10">|</span>
                      <span className="flex items-center gap-1.5"><MessageCircle size={14} className="text-blue-400"/> 3 Rompehielos</span>
                  </div>
              </div>
          </div>

          <div className="p-6 bg-black/50 border-t border-white/5 mt-auto">
              <div className="flex justify-between items-end mb-5 px-2">
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Total mensual</span>
                  <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-white">${vipProduct.price}</span>
                      <span className="text-gray-500 text-xs font-bold uppercase">/ mes</span>
                  </div>
              </div>

              <button 
                  onClick={() => setShowCheckout(true)}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-[0_5px_20px_-5px_rgba(234,179,8,0.4)]"
              >
                  Continuar al Pago
              </button>
              <p className="text-center text-[10px] text-gray-600 mt-4 font-medium uppercase tracking-wider">
                  Cancela cuando quieras
              </p>
          </div>
        </motion.div>
      </div>

      {/* ✅ CORRECCIÓN: El Checkout ahora maneja onClose (Cancelar/Volver a VIP) y onSuccess (Cerrar TODO) de manera independiente */}
      <AnimatePresence>
          {showCheckout && (
              <CheckoutModal 
                  product={vipProduct} 
                  onClose={() => setShowCheckout(false)} 
                  onSuccess={onClose} 
              />
          )}
      </AnimatePresence>
    </>
  );
}

function BenefitItem({ icon: Icon, text }) {
    return (
        <div className="flex items-center gap-4 group">
            <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-white/5 text-yellow-500 group-hover:bg-yellow-500/10 group-hover:scale-110 transition-all">
                <Icon size={16} strokeWidth={2.5} />
            </div>
            <span className="text-gray-200 text-sm font-semibold tracking-wide">{text}</span>
            <Check size={16} className="ml-auto text-yellow-500/50" />
        </div>
    );
}