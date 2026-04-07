"use client";

import { useState, useRef } from "react";
import { X, Save, Loader2, Plus, GripHorizontal, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/utils/api";
import { useToast } from "@/context/ToastContext";
import { INTERESTS_LIST, getInterestInfo } from "@/utils/interests"; 
import Loader from "@/components/Loader";

export default function EditProfileModal({ user, onClose, onUpdate }) {
  const { showToast } = useToast();
  
  // ✅ CORRECCIÓN: "location" eliminado del estado inicial
  const [formData, setFormData] = useState({
    name: user?.name || "",
    username: user?.username || "",
    bio: user?.bio || "",
    gender: user?.gender || "male"
  });

  const groupedInterests = INTERESTS_LIST.reduce((acc, item) => {
      const cat = item.category || "Otros";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
  }, {});

  const [selectedInterests, setSelectedInterests] = useState(user?.interestsList || []);
  
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        exit={{ scale: 0.95, opacity: 0 }} 
        className="bg-cuadralo-cardLight dark:bg-cuadralo-cardDark w-full max-w-xl rounded-[2.5rem] border border-black/5 dark:border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col transition-colors duration-300"
      >
        
        {/* HEADER */}
        <div className="p-6 border-b border-black/5 dark:border-white/10 flex justify-between items-center bg-black/5 dark:bg-white/5">
            <h2 className="text-cuadralo-textLight dark:text-white font-black uppercase tracking-widest text-sm">Ajustar Perfil</h2>
            <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full text-cuadralo-textMutedLight dark:text-gray-400 transition-all"><X size={20} /></button>
        </div>

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
                            className={`relative aspect-[3/4] rounded-2xl overflow-hidden group cursor-grab active:cursor-grabbing border-2 border-transparent hover:border-cuadralo-pink/50 transition-all bg-gray-200 dark:bg-gray-800 ${index === 0 ? "ring-2 ring-cuadralo-pink ring-offset-2 dark:ring-offset-cuadralo-cardDark ring-offset-cuadralo-cardLight" : ""}`}
                        >
                            <img src={photo} className="w-full h-full object-cover pointer-events-none" alt={`Uploaded ${index}`} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <button type="button" onClick={(e) => handleDeletePhoto(e, index)} className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity shadow-lg backdrop-blur-sm"><Trash2 size={14} /></button>
                            <div className="absolute bottom-2 right-2 text-white/70 opacity-0 group-hover:opacity-100"><GripHorizontal size={16}/></div>
                            {index === 0 && (<div className="absolute bottom-0 left-0 w-full bg-cuadralo-pink text-white text-[9px] font-bold text-center py-1.5 shadow-sm tracking-widest uppercase">Principal</div>)}
                        </motion.div>
                    ))}

                    {photos.length < 9 && (
                        <div onClick={handleAddPhotoClick} className={`aspect-[3/4] rounded-2xl border-2 border-dashed border-black/10 dark:border-white/10 flex flex-col items-center justify-center transition-all group ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-cuadralo-pink/50 bg-black/5 dark:bg-white/5'}`}>
                            {uploading ? (
                                <Loader />
                            ) : (
                                <>
                                    <div className="p-3 rounded-full bg-white dark:bg-white/5 group-hover:bg-cuadralo-pink group-hover:text-white transition-colors mb-2 shadow-sm"><Plus size={24} className="text-gray-400 group-hover:text-white" /></div>
                                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Añadir</span>
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
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-cuadralo-bgLight dark:bg-black/40 border border-black/5 dark:border-white/10 rounded-2xl px-5 py-4 text-sm text-cuadralo-textLight dark:text-white focus:ring-2 focus:ring-cuadralo-pink focus:border-transparent outline-none transition-all" placeholder="Ej. Alex" />
                    </div>

                    <div>
                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-2 mb-1 block">Nombre de Usuario (@)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-4 text-cuadralo-pink font-bold">@</span>
                            <input 
                                type="text" 
                                name="username" 
                                value={formData.username} 
                                onChange={(e) => setFormData({...formData, username: e.target.value.toLowerCase().replace(/\s+/g, '')})} 
                                className="w-full bg-cuadralo-bgLight dark:bg-black/40 border border-black/5 dark:border-white/10 rounded-2xl pl-10 pr-5 py-4 text-sm text-cuadralo-textLight dark:text-white focus:ring-2 focus:ring-cuadralo-pink focus:border-transparent outline-none transition-all lowercase" 
                                placeholder="alex123" 
                            />
                        </div>
                    </div>

                    {/* ✅ ELIMINADO EL CAMPO MANUAL DE UBICACIÓN */}

                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-2">Biografía</label>
                            <span className={`text-[10px] font-bold mr-2 ${formData.bio.length >= 1000 ? "text-red-500" : formData.bio.length > 900 ? "text-yellow-500" : "text-gray-500"}`}>{formData.bio.length}/1000</span>
                        </div>
                        <textarea name="bio" value={formData.bio} onChange={handleChange} rows={4} maxLength={1000} className="w-full bg-cuadralo-bgLight dark:bg-black/40 border border-black/5 dark:border-white/10 rounded-2xl px-5 py-4 text-sm text-cuadralo-textLight dark:text-white focus:ring-2 focus:ring-cuadralo-pink focus:border-transparent outline-none transition-all resize-none" placeholder="¿Qué te hace único?" />
                    </div>
                    <div>
                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-2 mb-1 block">Género</label>
                        <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-cuadralo-bgLight dark:bg-black/40 border border-black/5 dark:border-white/10 rounded-2xl px-5 py-4 text-sm text-cuadralo-textLight dark:text-white focus:ring-2 focus:ring-cuadralo-pink focus:border-transparent outline-none appearance-none">
                            <option value="male">Hombre</option>
                            <option value="female">Mujer</option>
                            <option value="other">Otro</option>
                        </select>
                    </div>
                </div>

                {/* CATEGORÍAS DE INTERESES */}
                <div>
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-2 mb-4 block">Tus Intereses ({selectedInterests.length}/10)</label>
                    <div className="space-y-6">
                        {Object.entries(groupedInterests).map(([category, items]) => (
                            <div key={category} className="bg-cuadralo-bgLight dark:bg-black/20 p-5 rounded-3xl border border-black/5 dark:border-white/5">
                                <h4 className="text-cuadralo-pink text-[10px] font-black uppercase tracking-[0.2em] mb-4 ml-1">{category}</h4>
                                <div className="flex flex-wrap gap-2.5">
                                    {items.map((interest) => {
                                        const slug = interest.slug || interest.id;
                                        const isSelected = selectedInterests.includes(slug);
                                        const info = getInterestInfo(slug); 
                                        return (
                                            <button 
                                                key={slug} 
                                                type="button" 
                                                onClick={() => toggleInterest(slug)}
                                                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${isSelected ? "bg-cuadralo-pink border-cuadralo-pink text-white shadow-lg shadow-cuadralo-pink/30 scale-105" : "bg-white dark:bg-white/5 border-black/5 dark:border-white/10 text-gray-500 hover:border-cuadralo-pink/50 hover:text-cuadralo-textLight dark:hover:text-white"}`}
                                            >
                                                <span className="text-sm flex items-center justify-center">{info.icon}</span> 
                                                <span>{info.name}</span>
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
        <div className="p-6 border-t border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5 flex justify-end gap-4">
            <button onClick={onClose} className="px-6 py-3 rounded-2xl text-gray-500 font-bold hover:bg-black/5 dark:hover:bg-white/5 hover:text-cuadralo-textLight dark:hover:text-white transition-colors text-sm">Cancelar</button>
            <button type="submit" form="editForm" disabled={saving || uploading} className="px-8 py-3 bg-cuadralo-pink rounded-2xl text-white font-black uppercase tracking-widest shadow-xl shadow-cuadralo-pink/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 text-xs">
                {saving ? <Loader size="sm" /> : <Save size={18} />} Guardar Cambios
            </button>
        </div>
      </motion.div>
    </div>
  );
}