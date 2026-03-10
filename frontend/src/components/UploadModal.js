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
          const imageUrl = await api.upload(file);
          await api.post("/social/posts", { image_url: imageUrl, caption, location });
          showToast("¡Publicado! 🎉");
          window.location.reload(); 
      } catch (error) { showToast("Error", "error"); } 
      finally { setLoading(false); onClose(); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-md bg-cuadralo-cardLight dark:bg-cuadralo-cardDark border border-black/5 dark:border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-black/5 dark:border-white/10">
            <h3 className="font-black uppercase italic tracking-tighter">Nueva Publicación</h3>
            <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full"><X size={24} className="opacity-40" /></button>
        </div>

        {/* Contenido */}
        <div className="p-6 flex-1 overflow-y-auto no-scrollbar space-y-8">
            <div onClick={() => fileInputRef.current.click()} className={`w-full aspect-square rounded-[2rem] border-2 border-dashed border-black/10 dark:border-white/10 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-cuadralo-pink/5 overflow-hidden relative ${!preview && "bg-black/5 dark:bg-black/20"}`}>
                {preview ? <img src={preview} className="w-full h-full object-cover" /> : <><ImageIcon size={40} className="opacity-20 mb-2" /><p className="text-[10px] font-black uppercase tracking-widest opacity-40">Seleccionar Foto</p></>}
                <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileSelect} />
            </div>

            <div className="space-y-5">
                <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 ml-2 mb-2 block">Descripción</label>
                    <textarea placeholder="..." className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-cuadralo-pink resize-none h-32 transition-all" value={caption} onChange={(e) => setCaption(e.target.value)} />
                </div>
                <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 ml-2 mb-2 block">Ubicación</label>
                    <div className="relative">
                        <MapPin className="absolute left-4 top-3.5 opacity-30" size={18} />
                        <input type="text" placeholder="Ej. Valencia, VE" className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl py-3.5 pl-12 pr-5 text-sm outline-none focus:border-cuadralo-pink transition-all" value={location} onChange={(e) => setLocation(e.target.value)} />
                    </div>
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-black/5 dark:border-white/10 bg-black/5 dark:bg-black/20">
            <button onClick={handlePublish} disabled={!file || loading} className="w-full bg-cuadralo-pink text-white font-black uppercase tracking-widest py-4 rounded-2xl shadow-xl shadow-cuadralo-pink/30 disabled:opacity-50 flex items-center justify-center gap-2 text-xs">
                {loading ? <Loader2 className="animate-spin" size={20} /> : <>Compartir <CheckCircle size={20} /></>}
            </button>
        </div>
      </motion.div>
    </div>
  );
}