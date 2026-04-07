"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Heart, Loader2, Zap, Crown, Sparkles, MessageCircle, ArrowRight } from "lucide-react";
import { api } from "@/utils/api";
import { useToast } from "@/context/ToastContext";
import PrimeModal from "@/components/PrimeModal"; 
import BoostModal from "@/components/BoostModal"; 

export default function MyLikes() {
  const { showToast } = useToast();
  const [likes, setLikes] = useState([]);
  const [rompehielos, setRompehielos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [view, setView] = useState("likes");
  
  const [showPrime, setShowPrime] = useState(false);
  const [showBoost, setShowBoost] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [likesData, messagesData] = await Promise.all([
          api.get("/likes-received"),
          api.get("/rompehielos/requests")
      ]);
      setLikes(likesData || []);
      setRompehielos(messagesData || []);
    } catch (error) {
      console.error("Error cargando bandeja:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ NUEVO: Función para responder a un Rompehielo desde el Inbox
  const handleInboxAction = async (targetId, action) => {
      try {
          // action puede ser "right" (Match) o "left" (Descartar)
          await api.post("/swipe", { target_id: targetId, action: action });
          
          // Lo removemos de la bandeja visualmente
          setRompehielos((prev) => prev.filter((r) => r.id !== targetId));
          
          if (action === "right") {
              showToast("¡Es un Match! Ahora pueden chatear gratis.", "success");
          }
      } catch (error) {
          console.error(error);
          showToast("Error procesando la solicitud", "error");
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
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="w-full h-full text-cuadralo-textLight dark:text-white pt-20 pb-28 px-4 overflow-y-auto max-w-5xl mx-auto scrollbar-hide [&::-webkit-scrollbar]:hidden transition-colors duration-300"
    >
      <div className="text-center mb-6 animate-fade-in">
          <h2 className="text-2xl font-black tracking-tighter mb-1">Tu radar de conexiones</h2>
      </div>

      <div className="flex bg-gray-100 dark:bg-[#1a1a1a] p-1 rounded-2xl mb-8 max-w-md mx-auto">
          <button 
              onClick={() => setView("likes")}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${view === 'likes' ? 'bg-white dark:bg-black shadow-md text-cuadralo-pink' : 'text-gray-500'}`}
          >
              Likes ({likes.length})
          </button>
          <button 
              onClick={() => setView("messages")}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${view === 'messages' ? 'bg-white dark:bg-black shadow-md text-blue-500' : 'text-gray-500'}`}
          >
              <MessageCircle size={16} /> Inbox ({rompehielos.length})
          </button>
      </div>

      {view === "likes" && (
          likes.length > 0 ? (
            <>
                {likes.some(l => l.locked) && (
                    <div className="bg-gradient-to-r from-neutral-900 to-black border border-yellow-500/30 p-4 rounded-3xl mb-8 flex items-center justify-between shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 blur-[40px] rounded-full -mr-10 -mt-10 pointer-events-none" />
                        <div className="flex gap-4 items-center z-10 relative">
                            <div className="p-3 bg-gradient-to-br from-yellow-400/20 to-amber-600/20 rounded-2xl text-yellow-400 border border-yellow-500/20 shadow-inner">
                                <Crown size={22} />
                            </div>
                            <div>
                                <h3 className="font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500 text-sm tracking-tight drop-shadow-sm">Descubre a quién le gustas</h3>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mt-0.5">Hazte VIP para desbloquear sus fotos.</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setShowPrime(true)}
                            className="z-10 px-5 py-3 bg-gradient-to-r from-yellow-400 to-amber-600 text-black font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-[0_5px_20px_rgba(234,179,8,0.4)] transition-all hover:scale-[1.03] active:scale-95"
                        >
                            Obtener Pase VIP
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 animate-fade-in-up">
                    {likes.map((user) => (
                    <div 
                        key={user.id} 
                        className="relative aspect-[3/4] rounded-[2rem] overflow-hidden bg-cuadralo-cardLight dark:bg-cuadralo-cardDark group cursor-pointer border border-black/5 dark:border-white/5 hover:border-cuadralo-pink/50 transition-all shadow-glass-light dark:shadow-glass-dark"
                        onClick={() => { if (user.locked) setShowPrime(true); }}
                    >
                        <img 
                            src={user.img || "https://via.placeholder.com/300"} 
                            alt="User" 
                            className={`w-full h-full object-cover transition-all duration-700 ${user.locked ? "blur-xl scale-110 opacity-60" : "group-hover:scale-105"}`} 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                        {user.locked ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-4 text-center">
                                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="w-14 h-14 bg-gradient-to-tr from-yellow-400 via-yellow-200 to-amber-600 rounded-full flex items-center justify-center text-black shadow-[0_0_20px_rgba(234,179,8,0.5)] mb-4 p-0.5">
                                    <div className="w-full h-full bg-[#111] rounded-full flex items-center justify-center">
                                        <Lock size={20} className="text-yellow-400" />
                                    </div>
                                </motion.div>
                                <span className="text-[11px] font-black text-yellow-400 uppercase tracking-widest mb-1 shadow-black drop-shadow-md">VIP</span>
                            </div>
                        ) : (
                            <div className="absolute bottom-5 left-5 z-10">
                                <h3 className="text-lg font-black text-white flex items-center gap-2 leading-none mb-1.5 drop-shadow-md">
                                    {user.name}, {user.age}
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
            <EmptyState title="Buscando tu media naranja..." subtitle="Aún no hay likes nuevos." onBoost={() => setShowBoost(true)} />
          )
      )}

      {/* === BANDEJA DE ROMPEHIELOS === */}
      {view === "messages" && (
          rompehielos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-up">
                  {rompehielos.map((req) => (
                      <div key={req.id} className="bg-white dark:bg-[#150a21] border border-blue-500/20 rounded-3xl p-5 shadow-lg flex gap-4 items-start relative overflow-hidden group">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 blur-2xl rounded-full -mr-10 -mt-10 pointer-events-none" />
                          
                          <img src={req.img} alt={req.name} className="w-16 h-16 rounded-2xl object-cover shadow-md z-10" />
                          <div className="flex-1 z-10">
                              <h3 className="font-black text-lg leading-none mb-1">{req.name}, <span className="text-gray-500 font-medium">{req.age}</span></h3>
                              <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mb-3">Conexión Directa</p>
                              
                              <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl p-3 text-sm text-gray-700 dark:text-gray-300 font-medium italic">
                                  "{req.message}"
                              </div>

                              {/* ✅ BOTONES DE ACCIÓN CONECTADOS */}
                              <div className="mt-4 flex gap-2">
                                  <button 
                                      onClick={() => handleInboxAction(req.id, "right")}
                                      className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-cuadralo-pink to-purple-600 text-white font-bold text-xs py-2.5 rounded-xl shadow-md hover:scale-105 active:scale-95 transition-all"
                                  >
                                      Dar Like <ArrowRight size={14} />
                                  </button>
                                  <button 
                                      onClick={() => handleInboxAction(req.id, "left")}
                                      className="flex-1 bg-gray-100 dark:bg-black/50 text-gray-500 hover:text-red-500 font-bold text-xs py-2.5 rounded-xl hover:scale-105 active:scale-95 transition-all border border-transparent hover:border-red-500/30"
                                  >
                                      Descartar
                                  </button>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          ) : (
              <EmptyState title="Tu bandeja está limpia" subtitle="Los Rompehielos directos aparecerán aquí." onBoost={() => setShowBoost(true)} />
          )
      )}

      <AnimatePresence>
        {showPrime && <PrimeModal onClose={() => setShowPrime(false)} />}
        {showBoost && <BoostModal onClose={() => setShowBoost(false)} />}
      </AnimatePresence>
    </motion.div>
  );
}

function EmptyState({ title, subtitle, onBoost }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-6">
            <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
                <motion.div animate={{ scale: [1, 1.5, 2], opacity: [0.3, 0.1, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 rounded-full bg-cuadralo-pink/50"/>
                <div className="relative z-10 w-16 h-16 bg-gradient-to-tr from-cuadralo-pink to-purple-600 rounded-[2rem] flex items-center justify-center shadow-xl shadow-cuadralo-pink/30">
                    <Heart size={24} className="text-white fill-white animate-pulse" />
                </div>
            </div>

            <h2 className="text-xl font-black tracking-tighter mb-2 text-cuadralo-textLight dark:text-white">{title}</h2>
            <p className="text-gray-500 text-sm max-w-xs mb-10 font-medium">{subtitle}</p>

            <div className="w-full max-w-sm bg-cuadralo-cardLight dark:bg-[#150a21] border border-black/5 dark:border-white/5 rounded-[2rem] p-6 relative overflow-hidden group shadow-glass-light dark:shadow-glass-dark">
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none" />
                <div className="relative z-10 text-left">
                    <div className="flex items-center gap-2 mb-1.5">
                        <Sparkles size={16} className="text-yellow-600 dark:text-yellow-400" />
                        <span className="text-[10px] font-black text-yellow-600 dark:text-yellow-400 uppercase tracking-widest">Consejo VIP</span>
                    </div>
                    <h3 className="text-lg font-black tracking-tight mb-2">Consigue 3x más Likes</h3>
                    <button onClick={onBoost} className="w-full py-3.5 mt-2 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-xl text-black font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
                        <Zap size={16} fill="currentColor" /> Activar Destello
                    </button>
                </div>
            </div>
        </div>
    );
}