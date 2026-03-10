"use client";

import { motion } from "framer-motion";
import { MessageCircle, Heart, X, Sparkles, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MatchModal({ myPhoto, matchedUser, onClose }) {
  const router = useRouter();
  if (!matchedUser) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-4">
      <div className="absolute inset-0 bg-cuadralo-bgLight/95 dark:bg-cuadralo-bgDark/95 backdrop-blur-xl z-0 transition-colors duration-500" />

      <button onClick={onClose} className="absolute top-8 right-8 p-3 bg-black/5 dark:bg-white/5 rounded-2xl transition-all z-50 border border-black/5 dark:border-white/10"><X size={24} className="opacity-40" /></button>

      <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16 z-10">
        <h2 className="text-5xl md:text-8xl font-black text-cuadralo-textLight dark:text-white tracking-tighter uppercase italic leading-none">
          ¡LO <span className="text-cuadralo-pink">CUADRASTE</span>!
        </h2>
        <p className="text-cuadralo-textMutedLight dark:text-white/60 text-lg font-bold uppercase tracking-[0.3em] mt-4">
            Has conectado con <span className="text-cuadralo-pink">{matchedUser.name}</span>
        </p>
      </motion.div>

      <div className="flex items-center justify-center relative w-full max-w-lg h-72 mb-20 z-10">
        {[1, 1.4, 1.8].map((scale, i) => (
          <motion.div key={i} className="absolute border-4 border-cuadralo-pink/20 rounded-[4rem]" style={{ width: "16rem", height: "16rem" }} initial={{ scale: 0.5, opacity: 0, rotate: 45 }} animate={{ scale: scale, opacity: [0, 0.5, 0], rotate: 45 }} transition={{ delay: 1 + (i * 0.4), duration: 2.5, repeat: Infinity }} />
        ))}

        <motion.div initial={{ x: -200, opacity: 0, rotate: -15 }} animate={{ x: -50, opacity: 1, rotate: -12 }} transition={{ delay: 0.5, type: "spring" }} className="absolute z-20">
          <div className="p-1 bg-white rounded-[3rem] shadow-2xl shadow-cuadralo-pink/20">
              <img src={myPhoto || "https://via.placeholder.com/150"} className="w-40 h-40 md:w-52 md:h-52 rounded-[2.8rem] object-cover" />
          </div>
        </motion.div>

        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.2 }} className="absolute z-40 bg-cuadralo-pink p-5 rounded-[2rem] shadow-2xl border-4 border-cuadralo-bgLight dark:border-cuadralo-bgDark"><Heart size={36} className="text-white fill-white" /></motion.div>

        <motion.div initial={{ x: 200, opacity: 0, rotate: 15 }} animate={{ x: 50, opacity: 1, rotate: 12 }} transition={{ delay: 0.5, type: "spring" }} className="absolute z-30">
          <div className="p-1 bg-white rounded-[3rem] shadow-2xl shadow-cuadralo-pink/20">
              <img src={matchedUser.img || "https://via.placeholder.com/150"} className="w-40 h-40 md:w-52 md:h-52 rounded-[2.8rem] object-cover" />
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.5 }} className="flex flex-col gap-4 w-full max-w-sm z-10 px-6">
        <button onClick={() => { onClose(); router.push("/?tab=chat"); }} className="w-full py-5 bg-cuadralo-pink text-white rounded-3xl font-black text-lg tracking-widest uppercase shadow-2xl shadow-cuadralo-pink/30 hover:scale-[1.03] transition-all flex items-center justify-center gap-3"><MessageCircle size={24} /> Enviar Mensaje</button>
        <button onClick={onClose} className="w-full py-5 font-black text-xs uppercase tracking-[0.4em] opacity-40 hover:opacity-100 transition-all">Seguir Buscando</button>
      </motion.div>
    </motion.div>
  );
}