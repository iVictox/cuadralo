"use client";

import { useState, useRef, useEffect } from "react";
import { X, Save, Loader2, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/utils/api";
import { useToast } from "@/context/ToastContext";

export default function EditProfileModal({ user, onClose, onUpdate }) {
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState({
    name: user.name || "",
    bio: user.bio || "",
    gender: user.gender || "male",
  });

  // Lista de TODOS los intereses (del backend)
  const [availableInterests, setAvailableInterests] = useState([]);
  
  // Lista de MIS intereses seleccionados (Slugs)
  // user.interests suele venir como array de strings (slugs) desde GetMe
  const [selectedInterests, setSelectedInterests] = useState(user.interests || []);

  const [photos, setPhotos] = useState(
      (user.photos && user.photos.length > 0) ? user.photos : (user.photo ? [user.photo] : [])
  );

  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);
  const [targetIndex, setTargetIndex] = useState(null);

  // Cargar lista de intereses al montar
  useEffect(() => {
      const fetchInterests = async () => {
          try {
              const data = await api.get("/interests");
              if (Array.isArray(data)) setAvailableInterests(data);
          } catch (error) {
              console.error("Error loading interests", error);
          }
      };
      fetchInterests();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ LOGICA SELECCIÓN (Toggle)
  const toggleInterest = (slug) => {
      if (selectedInterests.includes(slug)) {
          // Quitar
          setSelectedInterests(prev => prev.filter(i => i !== slug));
      } else {
          // Agregar (Max 10)
          if (selectedInterests.length >= 10) {
              showToast("Máximo 10 intereses", "error");
              return;
          }
          setSelectedInterests(prev => [...prev, slug]);
      }
  };

  // --- FOTOS ---
  const handlePhotoClick = (index) => {
      setTargetIndex(index);
      fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      setSaving(true);
      try {
          const imageUrl = await api.upload(file);
          const newPhotos = [...photos];
          if (targetIndex >= newPhotos.length) newPhotos.push(imageUrl);
          else newPhotos[targetIndex] = imageUrl;
          setPhotos(newPhotos);
      } catch (error) { showToast("Error al subir", "error"); } 
      finally { setSaving(false); e.target.value = ""; }
  };

  const handleDeletePhoto = (e, index) => {
      e.stopPropagation();
      const newPhotos = photos.filter((_, i) => i !== index);
      setPhotos(newPhotos);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
        const mainPhoto = photos.length > 0 ? photos[0] : user.photo;
        await api.put("/me", {
            ...formData,
            photo: mainPhoto,
            photos: photos,
            interests: selectedInterests // Enviamos los slugs seleccionados
        });
        showToast("Perfil actualizado");
        onUpdate();
    } catch (error) {
        showToast("Error al actualizar", "error");
    } finally {
        setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#1a0b2e] w-full max-w-lg rounded-3xl border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#0f0518]">
            <h2 className="text-white font-bold">Editar Perfil</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
            
            {/* Fotos */}
            <h3 className="text-gray-400 text-xs font-bold uppercase mb-3 tracking-wider">Tus Fotos</h3>
            <div className="grid grid-cols-3 gap-3 mb-8">
                {[...Array(9)].map((_, index) => {
                    const hasPhoto = index < photos.length;
                    return (
                        <div key={index} onClick={() => handlePhotoClick(index)} className={`aspect-[3/4] rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center cursor-pointer relative overflow-hidden group transition-all ${!hasPhoto ? "hover:border-cuadralo-pink/50 hover:bg-white/5" : "border-transparent"}`}>
                            {hasPhoto ? (
                                <>
                                    <img src={photos[index]} className="w-full h-full object-cover" alt="User" />
                                    <button onClick={(e) => handleDeletePhoto(e, index)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"><X size={12} /></button>
                                    {index === 0 && <div className="absolute bottom-0 left-0 w-full bg-cuadralo-pink text-white text-[9px] font-bold text-center py-1">PRINCIPAL</div>}
                                </>
                            ) : (<Plus size={24} className="text-gray-600" />)}
                        </div>
                    );
                })}
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

            <form id="editForm" onSubmit={handleSubmit} className="space-y-6">
                {/* Campos Texto */}
                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-gray-400 font-bold uppercase ml-2">Nombre</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-[#0f0518] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cuadralo-pink focus:outline-none transition-colors" placeholder="Tu nombre" />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 font-bold uppercase ml-2">Biografía</label>
                        <textarea name="bio" value={formData.bio} onChange={handleChange} rows={3} className="w-full bg-[#0f0518] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cuadralo-pink focus:outline-none transition-colors resize-none" placeholder="Cuéntanos algo sobre ti..." />
                    </div>
                </div>

                {/* ✅ SELECCIÓN DE INTERESES (GRID) */}
                <div>
                    <label className="text-xs text-gray-400 font-bold uppercase ml-2 mb-2 block">Intereses</label>
                    <div className="flex flex-wrap gap-2">
                        {availableInterests.map((interest) => {
                            const isSelected = selectedInterests.includes(interest.slug);
                            return (
                                <button
                                    key={interest.id}
                                    type="button"
                                    onClick={() => toggleInterest(interest.slug)}
                                    className={`
                                        px-3 py-1.5 rounded-full text-xs font-bold transition-all border
                                        ${isSelected 
                                            ? "bg-cuadralo-pink border-cuadralo-pink text-white shadow-lg shadow-cuadralo-pink/20" 
                                            : "bg-[#0f0518] border-white/10 text-gray-400 hover:border-white/30 hover:text-white"
                                        }
                                    `}
                                >
                                    {interest.name}
                                </button>
                            );
                        })}
                    </div>
                    {availableInterests.length === 0 && (
                        <p className="text-xs text-gray-500 italic ml-2">Cargando intereses...</p>
                    )}
                </div>

                <div>
                    <label className="text-xs text-gray-400 font-bold uppercase ml-2">Género</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-[#0f0518] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cuadralo-pink focus:outline-none appearance-none">
                        <option value="male">Hombre</option>
                        <option value="female">Mujer</option>
                        <option value="other">Otro</option>
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