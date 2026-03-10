"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Heart, Loader2, Zap, Crown, Sparkles, ArrowUpCircle } from "lucide-react";
import { api } from "@/utils/api";
import PrimeModal from "@/components/PrimeModal"; 
import BoostModal from "@/components/BoostModal"; 

export default function MyLikes() {
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showPrime, setShowPrime] = useState(false);
  const [showBoost, setShowBoost] = useState(false);

  useEffect(() => {
    fetchLikes();
  }, []);

  const fetchLikes = async () => {
    try {
      const data = await api.get("/likes-received");
      setLikes(data);
    } catch (error) {
      console.error("Error cargando likes:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
        <div className="flex h-full items-center justify-center text-cuadralo-pink">
            <Loader2 className="animate-spin" size={32}/>
        </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-full text-cuadralo-textLight dark:text-white pt-20 pb-28 px-4 overflow-y-auto max-w-5xl mx-auto scrollbar-hide [&::-webkit-scrollbar]:hidden transition-colors duration-300"
    >
      {/* --- SI HAY LIKES --- */}
      {likes.length > 0 ? (
        <>
            <div className="text-center mb-8 animate-fade-in">
                <h2 className="text-2xl font-black tracking-tighter mb-1">Te quieren conocer 💖</h2>
                <p className="text-gray-500 text-sm font-medium">
                    A <span className="text-cuadralo-pink font-bold">{likes.length} personas</span> les gustas
                </p>
            </div>

            {/* Banner Gold/Prime si hay bloqueados */}
            {likes.some(l => l.locked) && (
                <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20 p-4 rounded-3xl mb-8 flex items-center justify-between shadow-sm backdrop-blur-md">
                    <div className="flex gap-4 items-center">
                        <div className="p-3 bg-yellow-500/20 rounded-2xl text-yellow-600 dark:text-yellow-400">
                            <Crown size={22} />
                        </div>
                        <div>
                            <h3 className="font-black text-yellow-700 dark:text-yellow-400 text-sm tracking-tight">Descubre quiénes son</h3>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-yellow-600/70 dark:text-yellow-200/70 mt-0.5">Hazte Prime para ver fotos.</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setShowPrime(true)}
                        className="px-5 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95"
                    >
                        Ver con Prime
                    </button>
                </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 animate-fade-in-up">
                {likes.map((user) => (
                <div 
                    key={user.id} 
                    className="relative aspect-[3/4] rounded-[2rem] overflow-hidden bg-cuadralo-cardLight dark:bg-cuadralo-cardDark group cursor-pointer border border-black/5 dark:border-white/5 hover:border-cuadralo-pink/50 transition-all shadow-glass-light dark:shadow-glass-dark"
                    onClick={() => {
                        if (user.locked) {
                            setShowPrime(true);
                        }
                    }}
                >
                    <img 
                        src={user.img || "https://via.placeholder.com/300"} 
                        alt="User" 
                        className={`w-full h-full object-cover transition-all duration-700 ${user.locked ? "blur-xl scale-110 opacity-60" : "group-hover:scale-105"}`} 
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                    {user.locked ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-4 text-center">
                            <motion.div 
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-black shadow-xl mb-4"
                            >
                                <Lock size={22} />
                            </motion.div>
                            <span className="text-xs font-black text-yellow-500 uppercase tracking-widest mb-1 shadow-black drop-shadow-md">Prime</span>
                            <p className="text-[10px] text-white font-bold tracking-widest uppercase drop-shadow-md">Toca para desbloquear</p>
                        </div>
                    ) : (
                        <div className="absolute bottom-5 left-5 z-10">
                            <h3 className="text-lg font-black text-white flex items-center gap-2 leading-none mb-1.5 drop-shadow-md">
                                {user.name}, {user.age}
                                <div className="w-2.5 h-2.5 bg-green-500 rounded-full inline-block shadow-[0_0_8px_#22c55e]" />
                            </h3>
                            <div className="flex items-center gap-1.5 text-[10px] text-cuadralo-pink font-black uppercase tracking-widest drop-shadow-md">
                                <Heart size={12} fill="currentColor" /> Le gustas
                            </div>
                        </div>
                    )}
                </div>
                ))}
            </div>
        </>
      ) : (
        /* --- ESTADO SIN LIKES --- */
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
            
            <div className="relative w-40 h-40 mb-8 flex items-center justify-center">
                <motion.div 
                    animate={{ scale: [1, 1.5, 2], opacity: [0.3, 0.1, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                    className="absolute inset-0 rounded-full bg-cuadralo-pink/50"
                />
                <motion.div 
                    animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                    className="absolute inset-4 rounded-full bg-cuadralo-pink/50"
                />
                <div className="relative z-10 w-20 h-20 bg-gradient-to-tr from-cuadralo-pink to-purple-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-cuadralo-pink/30">
                    <Heart size={32} className="text-white fill-white animate-pulse" />
                </div>
            </div>

            <h2 className="text-2xl font-black tracking-tighter mb-2 text-cuadralo-textLight dark:text-white">Buscando tu media naranja...</h2>
            <p className="text-gray-500 text-sm max-w-xs mb-10 font-medium">
                Aún no hay likes nuevos, pero tu perfil está activo. ¡No te desanimes!
            </p>

            <div className="w-full max-w-sm bg-cuadralo-cardLight dark:bg-[#150a21] border border-black/5 dark:border-white/5 rounded-[2.5rem] p-8 relative overflow-hidden group shadow-glass-light dark:shadow-glass-dark">
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none" />
                
                <div className="relative z-10 text-left">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <div className="flex items-center gap-2 mb-1.5">
                                <Sparkles size={16} className="text-yellow-600 dark:text-yellow-400" />
                                <span className="text-[10px] font-black text-yellow-600 dark:text-yellow-400 uppercase tracking-widest">Consejo Pro</span>
                            </div>
                            <h3 className="text-lg font-black tracking-tight text-cuadralo-textLight dark:text-white">Consigue 3x más Likes</h3>
                        </div>
                        <div className="w-12 h-12 bg-yellow-500/10 rounded-2xl flex items-center justify-center text-yellow-600 dark:text-yellow-400 border border-yellow-500/20">
                            <ArrowUpCircle size={24} />
                        </div>
                    </div>
                    
                    <p className="text-sm text-gray-500 mb-8 leading-relaxed font-medium">
                        Activa un <span className="text-yellow-600 dark:text-yellow-400 font-black">Destello</span> para que tu perfil salga al principio. ¡Haz que todos te vean!
                    </p>

                    <button 
                        onClick={() => setShowBoost(true)}
                        className="w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-2xl text-black font-black uppercase tracking-widest text-[10px] shadow-xl shadow-yellow-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <Zap size={16} fill="currentColor" />
                        Activar Destello
                    </button>
                </div>
            </div>
        </div>
      )}

      <AnimatePresence>
        {showPrime && <PrimeModal onClose={() => setShowPrime(false)} />}
        {showBoost && <BoostModal onClose={() => setShowBoost(false)} />}
      </AnimatePresence>
    </motion.div>
  );
}