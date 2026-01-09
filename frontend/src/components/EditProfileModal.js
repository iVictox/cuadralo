"use client";

import { useState, useRef, useEffect } from "react";
import { X, Save, Loader2, Plus, GripHorizontal, Trash2 } from "lucide-react";
import { motion, Reorder } from "framer-motion"; // Usamos motion para animar el layout
import { api } from "@/utils/api";
import { useToast } from "@/context/ToastContext";
import { getInterestInfo } from "@/utils/interests"; 

export default function EditProfileModal({ user, onClose, onUpdate }) {
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState({
    name: user.name || "",
    bio: user.bio || "",
    gender: user.gender || "male",
  });

  const [allInterests, setAllInterests] = useState([]);
  const [groupedInterests, setGroupedInterests] = useState({});
  const [selectedInterests, setSelectedInterests] = useState(Array.isArray(user.interests) ? user.interests : []);
  
  // Array de Fotos
  const [photos, setPhotos] = useState(
      (user.photos && user.photos.length > 0) ? user.photos : (user.photo ? [user.photo] : [])
  );
  
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);
  
  // Referencias para Drag & Drop
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

  // --- SUBIDA DE FOTOS ---
  const handleAddPhotoClick = () => { 
      fileInputRef.current.click(); 
  };
  
  const handleFileChange = async (e) => {
      const file = e.target.files[0]; if (!file) return; 
      
      // Validar límite de fotos (9 máx)
      if (photos.length >= 9) return showToast("Máximo 9 fotos permitidas", "error");

      setSaving(true);
      try {
          const imageUrl = await api.upload(file);
          // Agregamos la nueva foto al final
          setPhotos([...photos, imageUrl]);
      } catch (error) { showToast("Error al subir", "error"); } finally { setSaving(false); e.target.value = ""; }
  };

  // --- BORRAR FOTO (CON RESTRICCIÓN) ---
  const handleDeletePhoto = (e, index) => { 
      e.stopPropagation(); 
      // 🛑 RESTRICCIÓN: No borrar si es la única
      if (photos.length <= 1) {
          return showToast("Debes tener al menos una foto de perfil", "error");
      }
      const newPhotos = photos.filter((_, i) => i !== index);
      setPhotos(newPhotos);
  };

  // --- LÓGICA DRAG & DROP (TINDER STYLE) ---
  const handleDragStart = (e, position) => {
      dragItem.current = position;
  };

  const handleDragEnter = (e, position) => {
      dragOverItem.current = position;
  };

  const handleDragEnd = () => {
      const copyListItems = [...photos];
      const dragItemContent = copyListItems[dragItem.current];
      
      // Eliminar del origen e insertar en destino
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
        // La foto principal SIEMPRE es la index 0 del array
        const mainPhoto = photos.length > 0 ? photos[0] : user.photo;
        
        await api.put("/me", { 
            ...formData, 
            photo: mainPhoto, 
            photos: photos, // Enviamos el array ordenado
            interests: selectedInterests 
        });
        showToast("Perfil actualizado"); onUpdate();
    } catch (error) { showToast("Error al actualizar", "error"); } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#1a0b2e] w-full max-w-lg rounded-3xl border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#0f0518]">
            <h2 className="text-white font-bold">Editar Perfil</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
            
            <div className="mb-8">
                <div className="flex justify-between items-end mb-3">
                    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Tus Fotos</h3>
                    <span className="text-[10px] text-gray-500">Arrastra para ordenar</span>
                </div>
                
                {/* GRID DE FOTOS DRAGGABLE */}
                <div className="grid grid-cols-3 gap-3">
                    {/* Renderizamos las fotos existentes */}
                    {photos.map((photo, index) => (
                        <motion.div
                            layout // ✨ Magia de Framer Motion: Anima el cambio de posición
                            key={photo} // Usamos la URL como key única
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragEnter={(e) => handleDragEnter(e, index)}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => e.preventDefault()}
                            className={`
                                relative aspect-[3/4] rounded-xl overflow-hidden group cursor-grab active:cursor-grabbing border-2 border-transparent hover:border-white/20 transition-all
                                ${index === 0 ? "border-cuadralo-pink/50 shadow-[0_0_15px_rgba(242,19,142,0.3)]" : ""}
                            `}
                        >
                            <img src={photo} className="w-full h-full object-cover pointer-events-none" alt="User" />
                            
                            {/* Overlay degradado */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                            {/* Botón Borrar */}
                            <button 
                                onClick={(e) => handleDeletePhoto(e, index)} 
                                className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md backdrop-blur-sm"
                            >
                                <Trash2 size={12} />
                            </button>
                            
                            {/* Indicador de Drag */}
                            <div className="absolute bottom-1 right-1 text-white/50 opacity-0 group-hover:opacity-100">
                                <GripHorizontal size={14}/>
                            </div>

                            {/* Etiqueta Principal */}
                            {index === 0 && (
                                <div className="absolute bottom-0 left-0 w-full bg-cuadralo-pink text-white text-[9px] font-bold text-center py-1 shadow-sm tracking-wide">
                                    PRINCIPAL
                                </div>
                            )}
                            
                            {/* Enumeración pequeña */}
                            {index > 0 && (
                                <div className="absolute top-1 left-1 bg-black/40 px-1.5 py-0.5 rounded text-[9px] text-white font-bold backdrop-blur-sm">
                                    {index + 1}
                                </div>
                            )}
                        </motion.div>
                    ))}

                    {/* Botón Agregar (Si hay espacio) */}
                    {photos.length < 9 && (
                        <div 
                            onClick={handleAddPhotoClick} 
                            className="aspect-[3/4] rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-cuadralo-pink/50 hover:bg-white/5 transition-all group"
                        >
                            <div className="p-3 rounded-full bg-white/5 group-hover:bg-cuadralo-pink group-hover:text-white transition-colors mb-2">
                                <Plus size={20} className="text-gray-400 group-hover:text-white" />
                            </div>
                            <span className="text-[10px] text-gray-500 group-hover:text-gray-300 font-bold uppercase">Agregar</span>
                        </div>
                    )}
                </div>
            </div>

            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

            <form id="editForm" onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <div><label className="text-xs text-gray-400 font-bold uppercase ml-2">Nombre</label><input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-[#0f0518] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cuadralo-pink focus:outline-none transition-colors" placeholder="Tu nombre" /></div>
                    
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-xs text-gray-400 font-bold uppercase ml-2">Biografía</label>
                            <span className={`text-[10px] font-bold mr-2 ${formData.bio.length >= 1000 ? "text-red-500" : formData.bio.length > 900 ? "text-yellow-500" : "text-gray-500"}`}>
                                {formData.bio.length}/1000
                            </span>
                        </div>
                        <textarea name="bio" value={formData.bio} onChange={handleChange} rows={3} maxLength={1000} className="w-full bg-[#0f0518] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cuadralo-pink focus:outline-none transition-colors resize-none" placeholder="Cuéntanos algo sobre ti..." />
                    </div>
                </div>

                <div>
                    <label className="text-xs text-gray-400 font-bold uppercase ml-2 mb-3 block">Intereses</label>
                    <div className="space-y-5">
                        {Object.entries(groupedInterests).map(([category, items]) => (
                            <div key={category}>
                                <h4 className="text-cuadralo-pink text-xs font-bold uppercase tracking-wider mb-2 ml-1">{category}</h4>
                                <div className="flex flex-wrap gap-2">
                                    {items.map((interest) => {
                                        const isSelected = selectedInterests.includes(interest.slug);
                                        const { Icon } = getInterestInfo(interest); 
                                        return (
                                            <button key={interest.id} type="button" onClick={() => toggleInterest(interest.slug)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border flex items-center gap-1.5 ${isSelected ? "bg-cuadralo-pink border-cuadralo-pink text-white shadow-lg shadow-cuadralo-pink/20" : "bg-white/5 border-white/10 text-gray-400 hover:border-white/30 hover:text-white"}`}
                                            >
                                                <Icon size={14} />{interest.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="text-xs text-gray-400 font-bold uppercase ml-2">Género</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-[#0f0518] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cuadralo-pink focus:outline-none appearance-none">
                        <option value="male">Hombre</option><option value="female">Mujer</option><option value="other">Otro</option>
                    </select>
                </div>
            </form>
        </div>

        <div className="p-4 border-t border-white/10 bg-[#0f0518] flex justify-end gap-3">
            <button onClick={onClose} className="px-6 py-2 rounded-full text-white font-bold hover:bg-white/5 transition-colors">Cancelar</button>
            <button type="submit" form="editForm" disabled={saving} className="px-8 py-2 bg-gradient-to-r from-cuadralo-pink to-purple-600 rounded-full text-white font-bold shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Guardar
            </button>
        </div>
      </motion.div>
    </div>
  );
}