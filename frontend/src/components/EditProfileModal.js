"use client";

import { useState, useRef, useEffect } from "react";
import { X, Save, Loader2, Plus, GripHorizontal, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/utils/api";
import { useToast } from "@/context/ToastContext";
import { getInterestInfo } from "@/utils/interests"; 

export default function EditProfileModal({ user, onClose, onUpdate }) {
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    gender: user?.gender || "male",
    location: user?.location || ""
  });

  const [allInterests, setAllInterests] = useState([]);
  const [groupedInterests, setGroupedInterests] = useState({});
  
  // ✅ Inicialización correcta de intereses (Asegurando que sean strings/slugs)
  const [selectedInterests, setSelectedInterests] = useState(user?.interestsList || []);
  
  // ✅ FILTRADO ESTRICTO DE FOTOS PARA EVITAR PANTALLAS NEGRAS ("")
  const [photos, setPhotos] = useState(() => {
      let initial = [];
      if (user?.photos && Array.isArray(user.photos)) {
          initial = user.photos.filter(p => typeof p === 'string' && p.trim() !== '');
      }
      if (initial.length === 0 && user?.photo && typeof user.photo === 'string' && user.photo.trim() !== '') {
          initial = [user.photo];
      }
      return initial;
  });
  
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  useEffect(() => {
      const fetchInterests = async () => {
          try {
              const data = await api.get("/interests");
              if (Array.isArray(data)) {
                  setAllInterests(data);
                  const groups = {};
                  data.forEach(item => {
                      const cat = item.category || "Otros";
                      if (!groups[cat]) groups[cat] = [];
                      groups[cat].push(item);
                  });
                  setGroupedInterests(groups);
              }
          } catch (error) { console.error("Error intereses", error); }
      };
      fetchInterests();
  }, []);

  const handleChange = (e) => { 
      setFormData({ ...formData, [e.target.name]: e.target.value }); 
  };

  const toggleInterest = (slug) => {
      if (selectedInterests.includes(slug)) {
          setSelectedInterests(prev => prev.filter(i => i !== slug));
      } else {
          if (selectedInterests.length >= 10) return showToast("Máximo 10 intereses", "error");
          setSelectedInterests(prev => [...prev, slug]);
      }
  };

  const handleAddPhotoClick = () => { fileInputRef.current.click(); };
  
  const handleFileChange = async (e) => {
      const file = e.target.files[0]; 
      if (!file) return; 
      
      if (photos.length >= 9) return showToast("Máximo 9 fotos permitidas", "error");

      setUploading(true);
      showToast("Subiendo imagen...", "info");
      try {
          const imageUrl = await api.upload(file);
          if (imageUrl) {
            setPhotos(prev => [...prev, imageUrl]);
            showToast("Foto añadida", "success");
          }
      } catch (error) { 
          showToast("Error al subir foto", "error"); 
      } finally { 
          setUploading(false); 
          e.target.value = ""; 
      }
  };

  const handleDeletePhoto = (e, index) => { 
      e.stopPropagation(); 
      if (photos.length <= 1) return showToast("Debes tener al menos una foto principal", "error");
      setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleDragStart = (e, position) => { dragItem.current = position; };
  const handleDragEnter = (e, position) => { dragOverItem.current = position; };
  const handleDragEnd = () => {
      const copyListItems = [...photos];
      const dragItemContent = copyListItems[dragItem.current];
      copyListItems.splice(dragItem.current, 1);
      copyListItems.splice(dragOverItem.current, 0, dragItemContent);
      dragItem.current = null;
      dragOverItem.current = null;
      setPhotos(copyListItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    if (formData.bio.length > 1000) return showToast("Biografía demasiado larga", "error");

    setSaving(true);
    try {
        const finalPhotos = photos.filter(p => typeof p === 'string' && p.trim() !== '');
        const mainPhoto = finalPhotos.length > 0 ? finalPhotos[0] : (user.photo || "");
        
        await api.put("/me", { 
            ...formData, 
            photo: mainPhoto, 
            photos: finalPhotos, 
            interests: selectedInterests 
        });
        showToast("Perfil actualizado correctamente", "success"); 
        onUpdate();
        onClose();
    } catch (error) { 
        showToast("Error al guardar cambios", "error"); 
    } finally { 
        setSaving(false); 
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#1a0b2e] w-full max-w-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* HEADER */}
        <div className="p-5 border-b border-white/10 flex justify-between items-center bg-[#0f0518]">
            <h2 className="text-white font-black uppercase tracking-widest text-lg">Ajustar Perfil</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-all"><X size={20} /></button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 no-scrollbar space-y-10">
            
            {/* FOTOS */}
            <div>
                <div className="flex justify-between items-end mb-4">
                    <h3 className="text-cuadralo-pink text-[10px] font-black uppercase tracking-[0.3em]">Tus Fotos</h3>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Arrastra para ordenar</span>
                </div>
                
                <div className="grid grid-cols-3 gap-3 md:gap-4">
                    {photos.map((photo, index) => (
                        <motion.div
                            layout 
                            key={`photo-${index}-${photo}`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragEnter={(e) => handleDragEnter(e, index)}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => e.preventDefault()}
                            className={`relative aspect-[3/4] rounded-2xl overflow-hidden group cursor-grab active:cursor-grabbing border-2 border-transparent hover:border-white/20 transition-all bg-black/50 ${index === 0 ? "ring-2 ring-cuadralo-pink ring-offset-2 ring-offset-[#1a0b2e]" : ""}`}
                        >
                            <img src={photo} className="w-full h-full object-cover pointer-events-none" alt={`Uploaded ${index}`} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <button onClick={(e) => handleDeletePhoto(e, index)} className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity shadow-lg backdrop-blur-sm"><Trash2 size={14} /></button>
                            <div className="absolute bottom-2 right-2 text-white/70 opacity-0 group-hover:opacity-100"><GripHorizontal size={16}/></div>
                            {index === 0 && (<div className="absolute bottom-0 left-0 w-full bg-cuadralo-pink text-white text-[9px] font-bold text-center py-1.5 shadow-sm tracking-widest uppercase">Principal</div>)}
                        </motion.div>
                    ))}

                    {photos.length < 9 && (
                        <div onClick={handleAddPhotoClick} className={`aspect-[3/4] rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center transition-all group ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-cuadralo-pink/50 hover:bg-white/5'}`}>
                            {uploading ? (
                                <Loader2 className="animate-spin text-cuadralo-pink" size={28} />
                            ) : (
                                <>
                                    <div className="p-3 rounded-full bg-white/5 group-hover:bg-cuadralo-pink group-hover:text-white transition-colors mb-2"><Plus size={24} className="text-gray-400 group-hover:text-white" /></div>
                                    <span className="text-[10px] text-gray-500 group-hover:text-gray-300 font-bold uppercase tracking-widest">Añadir</span>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />

            {/* FORMULARIO DATOS */}
            <form id="editForm" onSubmit={handleSubmit} className="space-y-8">
                
                <div className="space-y-5">
                    <div>
                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-2 mb-1 block">Nombre Visible</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-[#0f0518] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:ring-2 focus:ring-cuadralo-pink focus:border-transparent outline-none transition-all" placeholder="Ej. Alex" />
                    </div>
                    <div>
                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-2 mb-1 block">Ubicación</label>
                        <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full bg-[#0f0518] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:ring-2 focus:ring-cuadralo-pink focus:border-transparent outline-none transition-all" placeholder="Ej. Valencia, VE" />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-2">Biografía</label>
                            <span className={`text-[10px] font-bold mr-2 ${formData.bio.length >= 1000 ? "text-red-500" : formData.bio.length > 900 ? "text-yellow-500" : "text-gray-600"}`}>{formData.bio.length}/1000</span>
                        </div>
                        <textarea name="bio" value={formData.bio} onChange={handleChange} rows={4} maxLength={1000} className="w-full bg-[#0f0518] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:ring-2 focus:ring-cuadralo-pink focus:border-transparent outline-none transition-all resize-none" placeholder="¿Qué te hace único?" />
                    </div>
                    <div>
                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-2 mb-1 block">Género</label>
                        <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-[#0f0518] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:ring-2 focus:ring-cuadralo-pink focus:border-transparent outline-none appearance-none">
                            <option value="male">Hombre</option>
                            <option value="female">Mujer</option>
                            <option value="other">Otro</option>
                        </select>
                    </div>
                </div>

                {/* CATEGORÍAS DE INTERESES */}
                <div>
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-2 mb-4 block">Tus Intereses</label>
                    <div className="space-y-6">
                        {Object.entries(groupedInterests).map(([category, items]) => (
                            <div key={category} className="bg-[#0f0518] p-5 rounded-3xl border border-white/5">
                                <h4 className="text-cuadralo-pink text-[10px] font-black uppercase tracking-[0.2em] mb-4 ml-1">{category}</h4>
                                <div className="flex flex-wrap gap-2.5">
                                    {items.map((interest) => {
                                        const slug = interest.slug || interest.id;
                                        const isSelected = selectedInterests.includes(slug);
                                        const info = getInterestInfo(slug); 
                                        return (
                                            <button 
                                                key={interest.id} 
                                                type="button" 
                                                onClick={() => toggleInterest(slug)}
                                                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${isSelected ? "bg-cuadralo-pink border-cuadralo-pink text-white shadow-[0_5px_15px_rgba(242,19,142,0.3)] scale-105" : "bg-white/5 border-white/10 text-gray-400 hover:border-white/30 hover:text-white hover:bg-white/10"}`}
                                            >
                                                <span className="text-sm">{info.icon}</span> {interest.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </form>
        </div>

        {/* FOOTER */}
        <div className="p-5 border-t border-white/10 bg-[#0f0518] flex justify-end gap-4">
            <button onClick={onClose} className="px-6 py-3 rounded-xl text-gray-400 font-bold hover:bg-white/5 hover:text-white transition-colors text-sm">Cancelar</button>
            <button type="submit" form="editForm" disabled={saving || uploading} className="px-8 py-3 bg-cuadralo-pink rounded-xl text-white font-black uppercase tracking-widest shadow-lg shadow-cuadralo-pink/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 text-xs">
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Guardar Cambios
            </button>
        </div>
      </motion.div>
    </div>
  );
}