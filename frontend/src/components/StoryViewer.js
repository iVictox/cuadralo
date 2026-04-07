"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Eye } from "lucide-react";
import { api } from "@/utils/api"; 
import { useConfirm } from "@/context/ConfirmContext";
import { useToast } from "@/context/ToastContext";

export default function StoryViewer({ playlist, initialGroupIndex = 0, onClose }) {
  const { confirm } = useConfirm();
  const { showToast } = useToast();
  
  const [currentGroupIdx, setCurrentGroupIdx] = useState(initialGroupIndex);
  
  const [currentStoryIdx, setCurrentStoryIdx] = useState(() => {
      const group = playlist[initialGroupIndex];
      if (group && group.stories) {
          const firstUnseen = group.stories.findIndex(s => !s.seen);
          return firstUnseen !== -1 ? firstUnseen : 0;
      }
      return 0;
  });

  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const [showViewers, setShowViewers] = useState(false);
  const [viewersList, setViewersList] = useState([]);
  const [loadingViewers, setLoadingViewers] = useState(false);
  const [liveViewsCount, setLiveViewsCount] = useState(0);

  const currentGroup = playlist[currentGroupIdx];
  const stories = currentGroup?.stories || [];
  const isOwner = currentGroup?.isOwner || false;
  const currentStory = stories[currentStoryIdx];
  const displayUser = currentGroup?.user;

  useEffect(() => {
      if (currentStory) {
          setLiveViewsCount(currentStory.views_count || 0);
      }
  }, [currentStory]);

  useEffect(() => {
    if (stories && stories.length > 0) {
        if (currentStoryIdx >= stories.length) {
            setCurrentStoryIdx(stories.length - 1);
        }
    } else if (playlist.length === 0) {
        onClose(true);
    }
  }, [stories, currentStoryIdx, playlist, onClose]);

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
      if (currentStoryIdx < stories.length - 1) {
          setCurrentStoryIdx(prev => prev + 1);
      } else if (currentGroupIdx < playlist.length - 1) {
          setCurrentGroupIdx(prev => prev + 1);
          setCurrentStoryIdx(0);
      } else {
          onClose(true); 
      }
  }, [currentStoryIdx, currentGroupIdx, stories.length, playlist.length, onClose]);

  const handlePrev = useCallback(() => {
      if (currentStoryIdx > 0) {
          setCurrentStoryIdx(prev => prev - 1);
      } else if (currentGroupIdx > 0) {
          setCurrentGroupIdx(prev => prev - 1);
          setCurrentStoryIdx(playlist[currentGroupIdx - 1].stories.length - 1);
      }
  }, [currentStoryIdx, currentGroupIdx, playlist]);

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
  }, [currentStoryIdx, currentGroupIdx, isPaused, currentStory, showViewers]);

  useEffect(() => {
      if (progress >= 100 && !showViewers) handleNext();
  }, [progress, handleNext, showViewers]);

  const handleDelete = async () => {
      setIsPaused(true); 
      const ok = await confirm({ title: "¿Eliminar historia?", message: "Desaparecerá permanentemente.", confirmText: "Eliminar", variant: "danger" });

      if (ok) {
          try {
              await api.delete(`/social/stories/${currentStory.id}`);
              showToast("Historia eliminada", "success");
              onClose(true); 
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

  const getProfilePic = (url) => {
      if (!url) return "https://via.placeholder.com/40";
      if (url.startsWith("http")) return url;
      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "https://cuadralo.club"; 
      return `${baseUrl}${url}`;
  };

  if (!currentGroup || !currentStory) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-md flex items-center justify-center">
        
        {/* CONTENEDOR TIPO MÓVIL (9:16) */}
        <div className="relative w-full max-w-[420px] h-[100dvh] md:h-[90dvh] md:max-h-[850px] md:rounded-[2rem] md:border-4 border-black/50 overflow-hidden bg-black flex flex-col shadow-2xl">

            {/* OVERLAY SUPERIOR */}
            <div className="absolute top-0 left-0 w-full pt-4 pb-16 px-2 z-20 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none">

                {/* BARRAS DE PROGRESO */}
                <div className="flex gap-1 w-full mb-4 px-2">
                    {stories.map((story, idx) => (
                        <div key={story.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                            <motion.div
                                initial={{ width: idx < currentStoryIdx ? "100%" : "0%" }}
                                animate={{ width: idx === currentStoryIdx ? `${progress}%` : idx < currentStoryIdx ? "100%" : "0%" }}
                                transition={{ ease: "linear", duration: idx === currentStoryIdx ? 0.05 : 0 }}
                                className="h-full bg-white shadow-[0_0_2px_rgba(0,0,0,0.5)]"
                            />
                        </div>
                    ))}
                </div>

                {/* HEADER */}
                <div className="flex justify-between items-center px-2 pointer-events-auto">
                    <div className="flex items-center gap-3">
                        <img
                            src={getProfilePic(displayUser?.photo)}
                            className="w-8 h-8 rounded-full border border-white/50 object-cover bg-[#1a0b2e] shadow-md"
                            alt="Perfil"
                        />
                        <span className="text-white font-bold text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                            {displayUser?.name || "Usuario"}
                        </span>
                        <span className="text-white/90 text-xs drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                            {new Date(currentStory.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        {isOwner && (
                            <button onClick={handleDelete} className="text-white hover:text-red-500 transition-colors p-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                <Trash2 size={22} style={{ filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.8))" }} />
                            </button>
                        )}
                        <button onClick={() => onClose(false)} className="text-white p-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                            <X size={28} style={{ filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.8))" }} />
                        </button>
                    </div>
                </div>
            </div>

            {/* IMAGEN HISTORIA */}
            <div
                className="w-full h-full relative flex items-center justify-center overflow-hidden"
                onMouseDown={() => setIsPaused(true)} onMouseUp={() => setIsPaused(false)}
                onTouchStart={() => setIsPaused(true)} onTouchEnd={() => setIsPaused(false)}
            >
                <AnimatePresence mode="wait">
                    {/* Fondo Desenfoque (Opcional, para que no queden bordes negros puros) */}
                    <motion.img
                        key={`bg-${currentStory.id}`}
                        initial={{ opacity: 0.8 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0.8 }} transition={{ duration: 0.2 }}
                        src={getProfilePic(currentStory.image_url)}
                        className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 pointer-events-none"
                        alt="Background Blur"
                    />

                    <motion.img
                        key={currentStory.id}
                        initial={{ opacity: 0.8, scale: 1.02 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0.8 }} transition={{ duration: 0.2 }}
                        src={getProfilePic(currentStory.image_url)}
                        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                        alt="Story"
                    />
                </AnimatePresence>

                {/* Zonas de control tactil/click */}
                <div className="absolute inset-y-0 left-0 w-[40%] z-10" onClick={(e) => { e.stopPropagation(); handlePrev(); }} />
                <div className="absolute inset-y-0 right-0 w-[40%] z-10" onClick={(e) => { e.stopPropagation(); handleNext(); }} />
            </div>

            {/* CONTADOR DE VISTAS (EN VIVO) */}
            {isOwner && (
                <div className="absolute bottom-6 left-4 z-30 pointer-events-auto">
                    <button onClick={handleOpenViewers} className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full text-white border border-white/20 hover:bg-white/20 transition-colors shadow-lg">
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
                                        <img src={getProfilePic(view.user?.photo)} alt={view.user?.name} className="w-10 h-10 rounded-full object-cover border border-white/20" />
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
    </div>
  );
}