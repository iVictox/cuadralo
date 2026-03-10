"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2, Check } from "lucide-react";
import { api } from "@/utils/api";
import { motion } from "framer-motion";
import { useToast } from "@/context/ToastContext";

export default function EditProfileModal({ user, onClose, onUpdate }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [allInterests, setAllInterests] = useState([]);
  
  const [formData, setFormData] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    location: user?.location || "",
    photos: user?.photos || [],
    interests: user?.interests?.map(i => i.slug) || []
  });

  useEffect(() => {
    // Cargar todos los intereses disponibles del sistema
    api.get("/interests").then(setAllInterests).catch(console.error);
  }, []);

  const handleUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      showToast("Subiendo...", "info");
      const res = await api.upload(file);
      const newPhotos = [...formData.photos];
      if (index < newPhotos.length) newPhotos[index] = res.url;
      else newPhotos.push(res.url);
      setFormData({ ...formData, photos: newPhotos });
    } catch (e) { showToast("Error al subir", "error"); }
  };

  const toggleInterest = (slug) => {
    const current = [...formData.interests];
    const idx = current.indexOf(slug);
    if (idx > -1) current.splice(idx, 1);
    else current.push(slug);
    setFormData({ ...formData, interests: current });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put("/me", formData);
      showToast("¡Perfil Cuadrado!", "success");
      onUpdate();
      onClose();
    } catch (e) { showToast("Error al guardar", "error"); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4">
      <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white dark:bg-[#1a0b2e] w-full max-w-2xl max-h-[90vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        
        <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
          <h2 className="text-xl font-black uppercase tracking-tighter dark:text-white italic">Ajustar Perfil</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-all"><X size={24} className="dark:text-white"/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 no-scrollbar space-y-12">
          {/* GESTIÓN DE 6 FOTOS */}
          <div className="grid grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="relative aspect-[3/4] bg-gray-100 dark:bg-white/5 rounded-xl overflow-hidden border-2 border-dashed border-gray-200 dark:border-white/10">
                {formData.photos[i] ? (
                  <>
                    <img src={formData.photos[i]} className="w-full h-full object-cover" />
                    <button onClick={() => setFormData({...formData, photos: formData.photos.filter((_, idx) => idx !== i)})} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg shadow-lg">
                      <Trash2 size={12} />
                    </button>
                  </>
                ) : (
                  <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 dark:hover:bg-white/10 transition-all">
                    <Plus size={20} className="text-gray-400" />
                    <input type="file" className="hidden" onChange={(e) => handleUpload(e, i)} accept="image/*" />
                  </label>
                )}
                {i === 0 && formData.photos[i] && <div className="absolute bottom-0 w-full bg-cuadralo-pink text-[8px] text-center font-bold text-white py-1 uppercase">Principal</div>}
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <input type="text" value={formData.name} placeholder="Nombre" onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-xl p-5 text-sm dark:text-white focus:ring-2 focus:ring-cuadralo-pink" />
            <textarea rows={3} value={formData.bio} placeholder="Tu descripción..." onChange={e => setFormData({...formData, bio: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-xl p-5 text-sm dark:text-white focus:ring-2 focus:ring-cuadralo-pink resize-none" />
            <input type="text" value={formData.location} placeholder="Ubicación" onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-xl p-5 text-sm dark:text-white focus:ring-2 focus:ring-cuadralo-pink" />
          </div>

          {/* SELECTOR DE TODOS LOS INTERESES DISPONIBLES */}
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-cuadralo-pink mb-4">Intereses</h3>
            <div className="flex flex-wrap gap-2">
              {allInterests.map(interest => (
                <button
                  key={interest.id}
                  onClick={() => toggleInterest(interest.slug)}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${formData.interests.includes(interest.slug) ? 'bg-cuadralo-pink border-cuadralo-pink text-white' : 'bg-transparent border-gray-200 dark:border-white/10 text-gray-400'}`}
                >
                  {interest.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-white/5">
          <button onClick={handleSave} disabled={loading} className="w-full py-5 bg-cuadralo-pink text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all">
            {loading ? "Sincronizando..." : <><Check size={20} /> Guardar Cambios</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}