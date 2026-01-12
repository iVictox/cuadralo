"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Heart, Loader2, Zap, Crown, Sparkles, ArrowUpCircle } from "lucide-react";
import { api } from "@/utils/api";
import PrimeModal from "@/components/PrimeModal"; // ✅ NUEVO
import BoostModal from "@/components/BoostModal"; // ✅ NUEVO

export default function MyLikes() {
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // ✅ ESTADOS PARA MODALES
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
      className="w-full h-full text-white pt-20 pb-28 px-4 overflow-y-auto max-w-5xl mx-auto scrollbar-hide [&::-webkit-scrollbar]:hidden"
    >
      {/* --- SI HAY LIKES --- */}
      {likes.length > 0 ? (
        <>
            <div className="text-center mb-8 animate-fade-in">
                <h2 className="text-2xl font-bold mb-1">Te quieren conocer 💖</h2>
                <p className="text-gray-400 text-sm">
                    A <span className="text-cuadralo-pink font-bold">{likes.length} personas</span> les gustas
                </p>
            </div>

            {/* Banner Gold/Prime si hay bloqueados */}
            {likes.some(l => l.locked) && (
                <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-800/20 border border-yellow-500/30 p-4 rounded-2xl mb-8 flex items-center justify-between shadow-[0_0_20px_rgba(234,179,8,0.1)] backdrop-blur-md">
                    <div className="flex gap-3 items-center">
                        <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-400">
                            <Crown size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-yellow-400 text-sm">Descubre quiénes son</h3>
                            <p className="text-[10px] text-yellow-200/70">Hazte Prime para ver las fotos ocultas.</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setShowPrime(true)}
                        className="px-5 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs rounded-full shadow-lg transition-all hover:scale-105 active:scale-95"
                    >
                        Ver con Prime
                    </button>
                </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 animate-fade-in-up">
                {likes.map((user) => (
                <div 
                    key={user.id} 
                    className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-gray-900 group cursor-pointer border border-white/5 hover:border-cuadralo-pink/50 transition-all hover:shadow-[0_10px_30px_-10px_rgba(236,72,153,0.3)]"
                    onClick={() => {
                        if (user.locked) {
                            setShowPrime(true); // 👑 Trigger Prime
                        } else {
                            // Lógica para ver perfil desbloqueado
                        }
                    }}
                >
                    <img 
                        src={user.img || "https://via.placeholder.com/300"} 
                        alt="User" 
                        className={`w-full h-full object-cover transition-all duration-700 ${user.locked ? "blur-xl scale-110 opacity-60" : "group-hover:scale-105"}`} 
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />

                    {user.locked ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-4 text-center">
                            <motion.div 
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-black shadow-lg mb-3"
                            >
                                <Lock size={20} />
                            </motion.div>
                            <span className="text-xs font-bold text-yellow-500 uppercase tracking-widest mb-1">Prime</span>
                            <p className="text-[10px] text-gray-300 leading-tight">Toca para desbloquear</p>
                        </div>
                    ) : (
                        <div className="absolute bottom-4 left-4 z-10">
                            <h3 className="text-lg font-bold flex items-center gap-1 leading-none mb-1">
                                {user.name}, {user.age}
                                <div className="w-2 h-2 bg-green-500 rounded-full inline-block ml-1" />
                            </h3>
                            <div className="flex items-center gap-1 text-xs text-cuadralo-pink font-medium">
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
                    className="absolute inset-0 rounded-full bg-cuadralo-pink"
                />
                <motion.div 
                    animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                    className="absolute inset-4 rounded-full bg-cuadralo-pink"
                />
                <div className="relative z-10 w-20 h-20 bg-gradient-to-tr from-cuadralo-pink to-purple-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(236,72,153,0.5)]">
                    <Heart size={32} className="text-white fill-white animate-pulse" />
                </div>
            </div>

            <h2 className="text-2xl font-bold mb-2">Buscando tu media naranja...</h2>
            <p className="text-gray-400 text-sm max-w-xs mb-8">
                Aún no hay likes nuevos, pero tu perfil está activo. ¡No te desanimes!
            </p>

            <div className="w-full max-w-sm bg-gradient-to-b from-[#2a1b3d] to-[#1a0b2e] border border-white/10 rounded-3xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none" />
                
                <div className="relative z-10 text-left">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Sparkles size={16} className="text-yellow-400" />
                                <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider">Consejo Pro</span>
                            </div>
                            <h3 className="text-lg font-bold text-white">Consigue 3x más Likes</h3>
                        </div>
                        <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-400">
                            <ArrowUpCircle size={24} />
                        </div>
                    </div>
                    
                    <p className="text-sm text-gray-300 mb-6 leading-relaxed">
                        Activa un <span className="text-yellow-400 font-bold">Destello</span> para que tu perfil salga al principio. ¡Haz que todos te vean!
                    </p>

                    <button 
                        onClick={() => setShowBoost(true)} // 🔥 Trigger Boost
                        className="w-full py-3.5 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-xl text-black font-extrabold text-sm shadow-lg shadow-yellow-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <Zap size={18} fill="currentColor" />
                        ACTIVAR DESTELLO
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* --- MODALES --- */}
      <AnimatePresence>
        {showPrime && <PrimeModal onClose={() => setShowPrime(false)} />}
        {showBoost && <BoostModal onClose={() => setShowBoost(false)} />}
      </AnimatePresence>
    </motion.div>
  );
}