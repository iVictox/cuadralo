"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Eye } from "lucide-react";
import { api } from "@/utils/api";
import { useConfirm } from "@/context/ConfirmContext";
import { useToast } from "@/context/ToastContext";

export default function StoryViewer({ stories, initialStoryIndex = 0, onClose, isOwner }) {
  const { confirm } = useConfirm();
  const { showToast } = useToast();
  
  const [currentIndex, setCurrentIndex] = useState(initialStoryIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const [showViewers, setShowViewers] = useState(false);
  const [viewersList, setViewersList] = useState([]);
  const [loadingViewers, setLoadingViewers] = useState(false);
  const [liveViewsCount, setLiveViewsCount] = useState(0);

  // Si la historia desaparece mientras la vemos (eliminada por socket), ajustamos el índice
  useEffect(() => {
      if (stories && stories.length > 0) {
          if (currentIndex >= stories.length) {
              setCurrentIndex(stories.length - 1);
          }
      }
  }, [stories, currentIndex]);

  const currentStory = stories[currentIndex];

  useEffect(() => {
      if (currentStory) {
          setLiveViewsCount(currentStory.views_count || 0);
      }
  }, [currentStory]);

  // ==========================================
  // 🚀 VISTAS EN TIEMPO REAL (WEBSOCKETS)
  // ==========================================
  useEffect(() => {
      const handleSocket = (e) => {
          const { type, payload } = e.detail;
          
          if (type === "story_seen_by" && currentStory && String(payload.story_id) === String(currentStory.id)) {
              if (showViewers) {
                  api.get(`/social/stories/${currentStory.id}/viewers`)
                     .then(data => {
                         setViewersList(data || []);
                         setLiveViewsCount(data ? data.length : 0);
                     })
                     .catch(console.error);
              } else {
                  setLiveViewsCount(prev => prev + 1);
              }
          }
      };

      window.addEventListener("socket_event", handleSocket);
      return () => window.removeEventListener("socket_event", handleSocket);
  }, [currentStory, showViewers]);

  useEffect(() => {
    if (!currentStory || isOwner) return;
    const markAsRead = async () => {
        try { await api.post(`/social/stories/${currentStory.id}/view`); } 
        catch (e) { console.error(e); }
    };
    markAsRead();
  }, [currentStory, isOwner]);

  const handleNext = useCallback(() => {
      if (currentIndex < stories.length - 1) setCurrentIndex(prev => prev + 1);
      else onClose(true); 
  }, [currentIndex, stories.length, onClose]);

  const handlePrev = useCallback(() => {
      if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  }, [currentIndex]);

  useEffect(() => {
    if (!currentStory || isPaused || showViewers) return;
    setProgress(0); 
    const duration = 5000; 
    const intervalTime = 50;
    const increment = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
        setProgress((prev) => {
            if (prev >= 100) return 100;
            return prev + increment;
        });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [currentIndex, isPaused, currentStory, showViewers]);

  useEffect(() => {
      if (progress >= 100 && !showViewers) handleNext();
  }, [progress, handleNext, showViewers]);

  const handleDelete = async () => {
      setIsPaused(true); 
      const ok = await confirm({ title: "¿Eliminar historia?", message: "Desaparecerá permanentemente.", confirmText: "Eliminar", variant: "danger" });

      if (ok) {
          try {
              // El backend se encarga de emitir el evento socket que limpiará la lista automáticamente
              await api.delete(`/social/stories/${currentStory.id}`);
              showToast("Historia eliminada", "success");
          } catch (error) { 
              showToast("Error al eliminar", "error"); 
              setIsPaused(false); 
          }
      } else { 
          setIsPaused(false); 
      }
  };

  const handleOpenViewers = async (e) => {
      e.stopPropagation();
      setIsPaused(true);
      setShowViewers(true);
      setLoadingViewers(true);
      try {
          const data = await api.get(`/social/stories/${currentStory.id}/viewers`);
          setViewersList(data || []);
          setLiveViewsCount(data ? data.length : 0);
      } catch (error) { console.error(error); } 
      finally { setLoadingViewers(false); }
  };

  if (!currentStory) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-black flex items-center justify-center">
        
        {/* BARRAS DE PROGRESO */}
        <div className="absolute top-4 left-0 w-full px-2 flex gap-1 z-20">
            {stories.map((story, idx) => (
                <div key={story.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: idx < currentIndex ? "100%" : "0%" }}
                        animate={{ width: idx === currentIndex ? `${progress}%` : idx < currentIndex ? "100%" : "0%" }}
                        transition={{ ease: "linear", duration: idx === currentIndex ? 0.05 : 0 }}
                        className="h-full bg-white"
                    />
                </div>
            ))}
        </div>

        {/* HEADER */}
        <div className="absolute top-8 left-0 w-full px-4 flex justify-between items-center z-20 pt-2">
            <div className="flex items-center gap-3">
                <img src={currentStory.user?.photo || "https://via.placeholder.com/40"} className="w-8 h-8 rounded-full border border-white/50 object-cover" />
                <span className="text-white font-bold text-sm shadow-black drop-shadow-md">{currentStory.user?.name}</span>
                <span className="text-white/70 text-xs shadow-black drop-shadow-md">
                    {new Date(currentStory.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
            </div>
            <div className="flex items-center gap-4">
                {isOwner && (
                    <button onClick={handleDelete} className="text-white/80 hover:text-red-500 transition-colors p-2"><Trash2 size={20} /></button>
                )}
                <button onClick={() => onClose(true)} className="text-white p-2"><X size={28} /></button>
            </div>
        </div>

        {/* IMAGEN HISTORIA */}
        <div 
            className="w-full h-full relative"
            onMouseDown={() => setIsPaused(true)} onMouseUp={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)} onTouchEnd={() => setIsPaused(false)}
        >
            <AnimatePresence mode="wait">
                <motion.img 
                    key={currentStory.id}
                    initial={{ opacity: 0.8, scale: 1.02 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0.8 }} transition={{ duration: 0.2 }}
                    src={currentStory.image_url} className="absolute inset-0 w-full h-full object-contain bg-black" alt="Story"
                />
            </AnimatePresence>
            <div className="absolute inset-y-0 left-0 w-1/3 z-10" onClick={(e) => { e.stopPropagation(); handlePrev(); }} />
            <div className="absolute inset-y-0 right-0 w-1/3 z-10" onClick={(e) => { e.stopPropagation(); handleNext(); }} />
        </div>

        {/* CONTADOR DE VISTAS (EN VIVO) */}
        {isOwner && (
            <div className="absolute bottom-6 left-4 z-30">
                <button onClick={handleOpenViewers} className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full text-white border border-white/20 hover:bg-white/20 transition-colors">
                    <Eye size={18} />
                    <span className="font-bold text-sm">{liveViewsCount}</span>
                    <span className="text-xs text-white/80 ml-1">vistas</span>
                </button>
            </div>
        )}

        {/* MODAL DE LISTA DE USUARIOS */}
        <AnimatePresence>
            {showViewers && (
                <motion.div 
                    initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="absolute bottom-0 left-0 w-full h-[60%] bg-[#1a0b2e] rounded-t-3xl z-40 shadow-2xl border-t border-white/10 flex flex-col"
                    onClick={(e) => e.stopPropagation()} 
                >
                    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#0f0518]/50 rounded-t-3xl">
                        <div className="flex items-center gap-2 text-white">
                            <Eye size={20} className="text-cuadralo-pink" />
                            <h3 className="font-bold">Visto por {viewersList.length} personas</h3>
                        </div>
                        <button onClick={() => { setShowViewers(false); setIsPaused(false); }} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20"><X size={18} /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {loadingViewers ? <div className="text-white/50 text-center py-10">Cargando...</div>
                        : viewersList.length === 0 ? <div className="text-white/50 text-center py-10">Aún nadie ha visto esto 👀</div>
                        : (
                            viewersList.map((view) => (
                                <div key={view.user_id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl transition-colors">
                                    <img src={view.user?.photo || "https://via.placeholder.com/40"} alt={view.user?.name} className="w-10 h-10 rounded-full object-cover border border-white/20" />
                                    <div className="flex-1">
                                        <h4 className="text-white font-medium text-sm">{view.user?.name}</h4>
                                        <p className="text-white/40 text-xs">{new Date(view.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

    </div>
  );
}