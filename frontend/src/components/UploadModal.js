"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { X, Image as ImageIcon, MapPin, Loader2, CheckCircle } from "lucide-react";
import { api } from "@/utils/api";
import { useToast } from "@/context/ToastContext";

export default function UploadModal({ onClose }) {
  const { showToast } = useToast();
  const fileInputRef = useRef(null);
  
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileSelect = (e) => {
      const selected = e.target.files[0];
      if (selected) {
          setFile(selected);
          setPreview(URL.createObjectURL(selected));
      }
  };

  const handlePublish = async () => {
      if (!file) return;
      setLoading(true);

      try {
          // 1. Subir imagen
          const imageUrl = await api.upload(file);

          // 2. Crear Post en Base de Datos
          await api.post("/social/posts", {
              image_url: imageUrl,
              caption: caption,
              location: location
          });

          showToast("¡Publicado con éxito! 🎉");
          
          // Recargar página para ver el post (o podrías usar un contexto para actualizar feed)
          window.location.reload(); 
          
      } catch (error) {
          console.error("Error publicando:", error);
          showToast("Error al publicar", "error");
      } finally {
          setLoading(false);
          onClose();
      }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-md bg-[#1a0b2e] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h3 className="text-white font-bold">Nueva Publicación</h3>
            <button onClick={onClose}><X size={24} className="text-gray-400 hover:text-white" /></button>
        </div>

        {/* Contenido */}
        <div className="p-4 flex-1 overflow-y-auto">
            {/* Preview Imagen */}
            <div 
                onClick={() => fileInputRef.current.click()}
                className={`w-full aspect-square rounded-2xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer transition-colors hover:bg-white/5 overflow-hidden relative ${!preview && "bg-black/20"}`}
            >
                {preview ? (
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                    <>
                        <ImageIcon size={40} className="text-gray-500 mb-2" />
                        <p className="text-gray-400 text-sm">Toca para subir foto</p>
                    </>
                )}
                <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileSelect} />
            </div>

            {/* Inputs */}
            <div className="mt-6 space-y-4">
                <textarea 
                    placeholder="Escribe un pie de foto..." 
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-cuadralo-pink resize-none h-24"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                />
                
                <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-gray-500" size={18} />
                    <input 
                        type="text" 
                        placeholder="Agregar ubicación"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-cuadralo-pink"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                    />
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#0f0518]">
            <button 
                onClick={handlePublish}
                disabled={!file || loading}
                className="w-full bg-gradient-to-r from-cuadralo-pink to-purple-600 text-white font-bold py-3 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {loading ? <Loader2 className="animate-spin" /> : <>Compartir <CheckCircle size={18} /></>}
            </button>
        </div>

      </motion.div>
    </div>
  );
}