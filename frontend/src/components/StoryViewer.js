"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { api } from "@/utils/api";
import { useConfirm } from "@/context/ConfirmContext";
import { useToast } from "@/context/ToastContext";

export default function StoryViewer({ stories, initialStoryIndex = 0, onClose, isOwner, onDeleteSuccess }) {
  const { confirm } = useConfirm();
  const { showToast } = useToast();
  
  const [currentIndex, setCurrentIndex] = useState(initialStoryIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const currentStory = stories[currentIndex];

  // --- LÓGICA DE TIEMPO Y PROGRESO ---
  useEffect(() => {
    if (!currentStory || isPaused) return;

    setProgress(0);
    const duration = 5000; // 5 segundos por historia
    const intervalTime = 50;
    const increment = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
        setProgress((prev) => {
            if (prev >= 100) {
                clearInterval(timer);
                handleNext(); // Avanzar automáticamente
                return 100;
            }
            return prev + increment;
        });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [currentIndex, isPaused, currentStory]);

  // --- NAVEGACIÓN ---
  const handleNext = useCallback(() => {
      if (currentIndex < stories.length - 1) {
          setCurrentIndex(prev => prev + 1);
          setProgress(0);
      } else {
          onClose(); // Si es la última, cerramos
      }
  }, [currentIndex, stories.length, onClose]);

  const handlePrev = useCallback(() => {
      if (currentIndex > 0) {
          setCurrentIndex(prev => prev - 1);
          setProgress(0);
      }
  }, [currentIndex]);

  // --- ACCIONES ---
  const handleDelete = async () => {
      setIsPaused(true); // Pausar mientras confirma
      const ok = await confirm({
          title: "¿Eliminar historia?",
          message: "Desaparecerá permanentemente.",
          confirmText: "Eliminar",
          variant: "danger"
      });

      if (ok) {
          try {
              await api.delete(`/social/stories/${currentStory.id}`);
              showToast("Historia eliminada");
              
              if (stories.length === 1) {
                  onClose(); // Si era la única, cerrar
                  if (onDeleteSuccess) onDeleteSuccess(); // Recargar feed
              } else {
                  // Si quedan más, quitar esta de la lista local (simple hack visual o recargar)
                  if (onDeleteSuccess) onDeleteSuccess();
                  handleNext();
              }
          } catch (error) {
              showToast("Error al eliminar", "error");
              setIsPaused(false);
          }
      } else {
          setIsPaused(false);
      }
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

        {/* HEADER USUARIO */}
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
                    <button onClick={handleDelete} className="text-white/80 hover:text-red-500 transition-colors p-2">
                        <Trash2 size={20} />
                    </button>
                )}
                <button onClick={onClose} className="text-white p-2">
                    <X size={28} />
                </button>
            </div>
        </div>

        {/* IMAGEN HISTORIA */}
        <div 
            className="w-full h-full relative"
            onMouseDown={() => setIsPaused(true)}
            onMouseUp={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
        >
            <img 
                src={currentStory.image_url} 
                className="w-full h-full object-contain bg-black" 
                alt="Story"
            />
            
            {/* ÁREAS DE NAVEGACIÓN INVISIBLES */}
            <div className="absolute inset-y-0 left-0 w-1/3 z-10" onClick={(e) => { e.stopPropagation(); handlePrev(); }} />
            <div className="absolute inset-y-0 right-0 w-1/3 z-10" onClick={(e) => { e.stopPropagation(); handleNext(); }} />
        </div>
    </div>
  );
}