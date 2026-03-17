"use client";

import { useState, useRef } from "react";
import { Plus, Loader2 } from "lucide-react";
import { api } from "@/utils/api";
import { useToast } from "@/context/ToastContext";
import { AnimatePresence, motion } from "framer-motion";
import StoryPreview from "./StoryPreview";

export default function StoriesBar({ stories, myStories, currentUser, onViewStory, onRefresh }) {
  const { showToast } = useToast();
  const fileInputRef = useRef(null);
  const sliderRef = useRef(null);
  
  const [uploading, setUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState(null); 
  
  const handleFileSelect = (e) => {
      const file = e.target.files[0];
      if (file) setPreviewFile(file);
      if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleConfirmUpload = async (fileToUpload) => {
      const finalFile = fileToUpload || previewFile;
      if (!finalFile) return;
      
      // 1. Cerramos el editor/cámara INMEDIATAMENTE
      setPreviewFile(null); 
      if (fileInputRef.current) fileInputRef.current.value = "";
      
      // 2. Activamos la pantalla de carga "Publicando historia..."
      setUploading(true);
      
      try {
          const imageUrl = await api.upload(finalFile);
          await api.post("/social/stories", { image_url: imageUrl });
          showToast("¡Historia subida con éxito! 🎉", "success");
          if(onRefresh) onRefresh(); 
      } catch (error) {
          showToast(error.message || "Error al subir historia", "error");
      } finally {
          setUploading(false);
      }
  };

  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const handleMouseDown = (e) => { setIsDown(true); setStartX(e.pageX - sliderRef.current.offsetLeft); setScrollLeft(sliderRef.current.scrollLeft); };
  const handleMouseMove = (e) => { if (!isDown) return; e.preventDefault(); const x = e.pageX - sliderRef.current.offsetLeft; sliderRef.current.scrollLeft = scrollLeft - (x - startX) * 1.5; };

  return (
    <>
        <div 
          ref={sliderRef}
          className={`w-full flex gap-4 px-4 overflow-x-auto overflow-y-hidden pb-4 pt-2 no-scrollbar scroll-pl-4 transition-colors duration-300 ${isDown ? 'cursor-grabbing' : 'cursor-grab'}`}
          onMouseDown={handleMouseDown} onMouseLeave={() => setIsDown(false)} onMouseUp={() => setIsDown(false)} onMouseMove={handleMouseMove}
        >
          {/* MI HISTORIA */}
          <div className="flex flex-col items-center min-w-[70px] cursor-pointer group select-none relative mt-2">
              
              {/* BADGE NUMÉRICO */}
              {myStories && myStories.length > 1 && (
                  <span className="absolute -top-1 -right-1 bg-cuadralo-pink text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-cuadralo-bgLight dark:border-cuadralo-bgDark z-20 shadow-md">
                      {myStories.length}
                  </span>
              )}

              <div 
                className={`w-[74px] h-[74px] rounded-full flex items-center justify-center p-[2.5px] transition-all duration-300 ${
                    myStories && myStories.length > 0 
                    ? "bg-gradient-to-tr from-yellow-400 via-cuadralo-pink to-purple-600 shadow-sm" 
                    : "bg-transparent border-2 border-black/10 dark:border-white/20 border-dashed"
                }`}
                onClick={() => {
                    if (myStories && myStories.length > 0) {
                        onViewStory(currentUser.id);
                    } else {
                        fileInputRef.current.click();
                    }
                }}
              >
                  <div className="w-full h-full rounded-full bg-cuadralo-bgLight dark:bg-black border-2 border-cuadralo-bgLight dark:border-black overflow-hidden relative shadow-sm">
                      <img 
                        src={currentUser?.photo || "https://via.placeholder.com/150"} 
                        className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${myStories && myStories.length > 0 ? "opacity-100" : "opacity-80 group-hover:opacity-100"}`} 
                        alt="Mi historia" 
                      />
                  </div>
              </div>
              
              <button 
                onClick={(e) => { e.stopPropagation(); fileInputRef.current.click(); }} 
                className="absolute bottom-6 right-0 bg-cuadralo-pink rounded-full p-1.5 border-2 border-cuadralo-bgLight dark:border-cuadralo-bgDark hover:scale-110 transition-transform z-10 shadow-sm"
              >
                 <Plus size={14} className="text-white stroke-[3]" />
              </button>
              
              <span className="text-xs text-cuadralo-textLight dark:text-white mt-2 font-medium truncate w-16 text-center">Tu historia</span>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
          </div>

          {/* OTRAS HISTORIAS */}
          {stories && stories.map((group) => {
            const ringColor = group.all_seen 
                ? "bg-black/10 dark:bg-white/20" 
                : "bg-gradient-to-tr from-yellow-400 via-cuadralo-pink to-purple-600 shadow-sm";

            return (
                <div 
                    key={group.user.id} 
                    className="flex flex-col items-center min-w-[70px] cursor-pointer group select-none mt-2 relative" 
                    onClick={() => onViewStory(group.user.id)}
                >
                    {/* Badge para otros usuarios */}
                    {group.stories.length > 1 && (
                        <span className="absolute -top-1 -right-1 bg-black/50 dark:bg-white/20 text-white text-[9px] font-black px-1.5 py-0.5 flex items-center justify-center rounded-full border-2 border-cuadralo-bgLight dark:border-cuadralo-bgDark z-20 backdrop-blur-sm">
                            {group.stories.length}
                        </span>
                    )}

                    <div className={`w-[74px] h-[74px] rounded-full flex items-center justify-center ${ringColor} p-[2.5px] transition-all duration-300`}>
                        <div className="w-full h-full rounded-full bg-cuadralo-bgLight dark:bg-black border-2 border-cuadralo-bgLight dark:border-black overflow-hidden relative">
                            <img src={group.user.photo || "https://via.placeholder.com/150"} alt={group.user.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                    </div>
                    <span className="text-xs text-cuadralo-textMutedLight dark:text-gray-300 mt-2 font-medium truncate w-16 text-center group-hover:text-cuadralo-textLight dark:group-hover:text-white transition-colors">
                        {group.user.name.split(" ")[0]}
                    </span>
                </div>
            );
          })}
        </div>

        <AnimatePresence>
            {/* Modal de edición de historia */}
            {previewFile && (
                <StoryPreview 
                    file={previewFile} 
                    onCancel={() => { setPreviewFile(null); if(fileInputRef.current) fileInputRef.current.value = ""; }} 
                    onPublish={handleConfirmUpload} 
                />
            )}

            {/* OVERLAY PANTALLA DE CARGA GLOBAL */}
            {uploading && (
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }} 
                    className="fixed inset-0 z-[2000] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center text-white"
                >
                    <Loader2 size={60} className="animate-spin text-cuadralo-pink mb-6" />
                    <h2 className="text-2xl font-black tracking-widest uppercase animate-pulse drop-shadow-[0_0_15px_rgba(255,41,117,0.8)]">
                        Publicando historia...
                    </h2>
                    <p className="text-white/60 mt-2 text-sm">Esto tomará solo un segundo</p>
                </motion.div>
            )}
        </AnimatePresence>
    </>
  );
}