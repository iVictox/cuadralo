"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2, Check, UploadCloud } from "lucide-react";
import { api } from "@/utils/api";
import { motion } from "framer-motion";
import { useToast } from "@/context/ToastContext";
import { INTERESTS_LIST } from "@/utils/interests"; // Asumiendo que tienes esta lista en frontend

export default function EditProfileModal({ user, onClose, onUpdate }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    location: user?.location || "",
    photos: user?.photos || [],
    interests: user?.interestsList || [] 
  });

  // Manejar subida de foto a un slot específico
  const handlePhotoUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      showToast("Subiendo foto...", "info");
      const res = await api.upload(file); // Tu endpoint de subida debe devolver la URL
      
      const newPhotos = [...formData.photos];
      if (index < newPhotos.length) {
          newPhotos[index] = res.url; // Reemplazar
      } else {
          newPhotos.push(res.url); // Añadir nueva
      }
      setFormData({ ...formData, photos: newPhotos });
    } catch (e) { 
      showToast("Error al subir la foto", "error"); 
    }
  };

  // Eliminar foto de un slot
  const removePhoto = (index) => {
      const newPhotos = formData.photos.filter((_, idx) => idx !== index);
      setFormData({ ...formData, photos: newPhotos });
  };

  // Activar/Desactivar interés
  const toggleInterest = (slug) => {
      const current = [...formData.interests];
      const idx = current.indexOf(slug);
      if (idx > -1) current.splice(idx, 1);
      else if (current.length < 10) current.push(slug); // Límite de 10 intereses opcional
      
      setFormData({ ...formData, interests: current });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put("/me", formData);
      showToast("¡Perfil actualizado con éxito!", "success");
      onUpdate();
      onClose();
    } catch (e) { 
      showToast("No se pudieron guardar los cambios", "error"); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm p-0 md:p-4">
      <motion.div 
        initial={{ y: "100%" }} 
        animate={{ y: 0 }} 
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="bg-white dark:bg-[#150a21] w-full md:max-w-2xl h-[90vh] md:max-h-[85vh] rounded-t-[2.5rem] md:rounded-[2.5rem] flex flex-col overflow-hidden shadow-[0_-10px_40px_rgba(0,0,0,0.3)] border border-white/5"
      >
        
        {/* Cabecera del Modal */}
        <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-transparent sticky top-0 z-10">
          <h2 className="text-xl font-black uppercase tracking-tighter text-cuadralo-textLight dark:text-white italic">Ajustar Perfil</h2>
          <button onClick={onClose} className="p-2 bg-gray-200/50 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 rounded-xl transition-all">
             <X size={20} className="text-gray-700 dark:text-white" />
          </button>
        </div>

        {/* Contenido Scrolleable */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 no-scrollbar space-y-12">
          
          {/* SECCIÓN 1: FOTOS (GRID 3x2) */}
          <section>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-cuadralo-pink mb-4">
                Mis Fotos (Máx. 6)
            </h3>
            <p className="text-xs text-gray-500 mb-4">La primera foto será tu miniatura principal.</p>
            
            <div className="grid grid-cols-3 gap-3 md:gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="relative aspect-[3/4] bg-gray-100 dark:bg-white/5 rounded-2xl overflow-hidden border-2 border-dashed border-gray-300 dark:border-white/10 group">
                  {formData.photos[i] ? (
                    <>
                      <img src={formData.photos[i]} className="w-full h-full object-cover" alt={`Foto ${i+1}`} />
                      
                      {/* Botón Borrar Flotante */}
                      <button 
                        onClick={() => removePhoto(i)} 
                        className="absolute top-2 right-2 p-1.5 md:p-2 bg-red-500 text-white rounded-xl shadow-lg hover:scale-110 active:scale-95 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>

                      {/* Etiqueta Principal */}
                      {i === 0 && (
                        <div className="absolute bottom-0 w-full bg-cuadralo-pink/90 backdrop-blur-sm text-[9px] text-center font-bold text-white py-1.5 uppercase tracking-widest">
                            Principal
                        </div>
                      )}
                    </>
                  ) : (
                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                      <div className="p-3 bg-white dark:bg-black/30 rounded-full shadow-sm mb-2">
                         <Plus size={20} className="text-gray-400 dark:text-gray-300" />
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Añadir</span>
                      <input type="file" className="hidden" onChange={(e) => handlePhotoUpload(e, i)} accept="image/*" />
                    </label>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* SECCIÓN 2: DATOS BÁSICOS */}
          <section className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-cuadralo-pink mb-4">Información Básica</h3>
            
            <div>
               <label className="text-xs font-bold text-gray-500 uppercase ml-2 mb-1 block">Nombre Visible</label>
               <input 
                 type="text" 
                 value={formData.name} 
                 onChange={e => setFormData({...formData, name: e.target.value})} 
                 className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-transparent rounded-2xl p-4 text-sm dark:text-white focus:ring-2 focus:ring-cuadralo-pink outline-none transition-all" 
               />
            </div>

            <div>
               <label className="text-xs font-bold text-gray-500 uppercase ml-2 mb-1 block">Tu Biografía</label>
               <textarea 
                 rows={4} 
                 value={formData.bio} 
                 placeholder="¿Qué te hace único?" 
                 onChange={e => setFormData({...formData, bio: e.target.value})} 
                 className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-transparent rounded-2xl p-4 text-sm dark:text-white focus:ring-2 focus:ring-cuadralo-pink outline-none resize-none transition-all" 
               />
            </div>

            <div>
               <label className="text-xs font-bold text-gray-500 uppercase ml-2 mb-1 block">Ubicación</label>
               <input 
                 type="text" 
                 value={formData.location} 
                 placeholder="Ej. Valencia, VE" 
                 onChange={e => setFormData({...formData, location: e.target.value})} 
                 className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-transparent rounded-2xl p-4 text-sm dark:text-white focus:ring-2 focus:ring-cuadralo-pink outline-none transition-all" 
               />
            </div>
          </section>

          {/* SECCIÓN 3: INTERESES */}
          <section>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-cuadralo-pink mb-4">Mis Intereses</h3>
            <p className="text-xs text-gray-500 mb-4">Selecciona lo que te apasiona para que otros conecten contigo.</p>
            
            <div className="flex flex-wrap gap-2.5">
              {INTERESTS_LIST.map(interest => {
                const isSelected = formData.interests.includes(interest.id);
                return (
                  <button
                    key={interest.id}
                    onClick={() => toggleInterest(interest.id)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                        isSelected 
                        ? 'bg-cuadralo-pink text-white shadow-lg shadow-cuadralo-pink/30 scale-105 border-transparent' 
                        : 'bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10 hover:border-cuadralo-pink/50'
                    }`}
                  >
                    <span>{interest.icon}</span>
                    {interest.label}
                  </button>
                );
              })}
            </div>
          </section>

        </div>

        {/* PIE DEL MODAL: BOTÓN GUARDAR */}
        <div className="p-6 border-t border-gray-100 dark:border-white/5 bg-white dark:bg-[#150a21]">
          <button 
            onClick={handleSave} 
            disabled={loading} 
            className="w-full py-4 bg-cuadralo-pink text-white rounded-2xl font-black uppercase tracking-[0.2em] text-sm shadow-[0_10px_30px_rgba(242,19,142,0.4)] flex items-center justify-center gap-3 active:scale-95 hover:bg-cuadralo-pinkLight transition-all"
          >
            {loading ? (
                <span className="animate-pulse">Guardando Cambios...</span>
            ) : (
                <><Check size={22} strokeWidth={3}/> Confirmar Cambios</>
            )}
          </button>
        </div>

      </motion.div>
    </div>
  );
}