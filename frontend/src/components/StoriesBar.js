"use client";

import { useState, useRef } from "react";
import { Plus } from "lucide-react";
import { api } from "@/utils/api";
import { useToast } from "@/context/ToastContext";
import { AnimatePresence } from "framer-motion";
import StoryPreview from "./StoryPreview";

export default function StoriesBar({ stories, myStories, currentUser, onViewStory, onRefresh }) {
  const { showToast } = useToast();
  const fileInputRef = useRef(null);
  const sliderRef = useRef(null);
  
  const [uploading, setUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState(null); 
  
  // 1. Selección (Abre Editor)
  const handleFileSelect = (e) => {
      const file = e.target.files[0];
      if (file) setPreviewFile(file);
      e.target.value = "";
  };

  // 2. Subida Final
  const handleConfirmUpload = async (fileToUpload) => {
      const finalFile = fileToUpload || previewFile;
      if (!finalFile) return;
      
      setUploading(true);
      try {
          const imageUrl = await api.upload(finalFile);
          await api.post("/social/stories", { image_url: imageUrl });
          showToast("Historia subida 🎉");
          setPreviewFile(null); 
          onRefresh(); // Avisar al padre para recargar
      } catch (error) {
          showToast("Error al subir historia", "error");
      } finally {
          setUploading(false);
      }
  };

  // Scroll Drag Logic
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  
  const handleMouseDown = (e) => { 
      setIsDown(true); 
      setStartX(e.pageX - sliderRef.current.offsetLeft); 
      setScrollLeft(sliderRef.current.scrollLeft); 
  };
  
  const handleMouseMove = (e) => { 
      if (!isDown) return; 
      e.preventDefault(); 
      const x = e.pageX - sliderRef.current.offsetLeft; 
      const walk = (x - startX) * 1.5; 
      sliderRef.current.scrollLeft = scrollLeft - walk; 
  };

  return (
    <>
        <div 
          ref={sliderRef}
          className={`w-full flex gap-4 px-4 overflow-x-auto overflow-y-hidden pb-4 pt-2 no-scrollbar scroll-pl-4 ${isDown ? 'cursor-grabbing' : 'cursor-grab'}`}
          onMouseDown={handleMouseDown}
          onMouseLeave={() => setIsDown(false)}
          onMouseUp={() => setIsDown(false)}
          onMouseMove={handleMouseMove}
        >
          {/* MI HISTORIA */}
          <div className="flex flex-col items-center min-w-[70px] cursor-pointer group select-none relative">
              <div 
                className={`w-[74px] h-[74px] rounded-full flex items-center justify-center p-[2px] ${
                    myStories.length > 0 
                    ? "bg-gray-500" // Mis historias en gris
                    : "bg-transparent border-2 border-white/20 border-dashed"
                }`}
                onClick={() => {
                    if (myStories.length > 0) onViewStory(currentUser.id);
                    else fileInputRef.current.click();
                }}
              >
                  <div className="w-full h-full rounded-full bg-black border-2 border-black overflow-hidden relative">
                      <img 
                        src={currentUser?.photo || "https://via.placeholder.com/150"} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-100" 
                        alt="Mi historia" 
                      />
                  </div>
              </div>
              
              <button 
                onClick={(e) => { e.stopPropagation(); fileInputRef.current.click(); }} 
                className="absolute bottom-5 right-0 bg-cuadralo-pink rounded-full p-1 border-2 border-black hover:scale-110 transition-transform z-10"
              >
                 <Plus size={12} className="text-white" />
              </button>
              
              <span className="text-xs text-white mt-2 font-medium truncate w-16 text-center">Tu historia</span>
              <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileSelect} />
          </div>

          {/* OTRAS HISTORIAS */}
          {stories.map((group) => {
            // ✅ LÓGICA DE COLOR: all_seen ? Gris : Gradiente
            const ringColor = group.all_seen 
                ? "bg-gray-600" 
                : "bg-gradient-to-tr from-yellow-400 via-cuadralo-pink to-purple-600";

            return (
                <div 
                    key={group.user.id} 
                    className="flex flex-col items-center min-w-[70px] cursor-pointer group select-none" 
                    onClick={() => onViewStory(group.user.id)}
                >
                    <div className={`w-[74px] h-[74px] rounded-full flex items-center justify-center ${ringColor} p-[2px] transition-colors duration-300`}>
                        <div className="w-full h-full rounded-full bg-black border-2 border-black overflow-hidden relative">
                            <img 
                                src={group.user.photo || "https://via.placeholder.com/150"} 
                                alt={group.user.name} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                            />
                        </div>
                    </div>
                    <span className="text-xs text-white mt-2 font-medium truncate w-16 text-center">
                        {group.user.name}
                    </span>
                </div>
            );
          })}
        </div>

        {/* EDITOR (PREVIEW) */}
        <AnimatePresence>
            {previewFile && (
                <StoryPreview 
                    file={previewFile} 
                    onClose={() => setPreviewFile(null)} 
                    onUpload={handleConfirmUpload} 
                    isUploading={uploading} 
                />
            )}
        </AnimatePresence>
    </>
  );
}