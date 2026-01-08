"use client";

import { useState, useEffect } from "react";
import { X, Save, Camera, Music, Gamepad2, Plane, Coffee, Dumbbell, Film, Palette, Book, Dog, Wine, Laptop, Mountain, Heart, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/utils/api";
import { useToast } from "@/context/ToastContext";

// Usamos el mismo diccionario que ya tenías
const AVAILABLE_INTERESTS = [
    { id: "music", label: "Música", icon: <Music size={14} /> },
    { id: "games", label: "Gaming", icon: <Gamepad2 size={14} /> },
    { id: "travel", label: "Viajes", icon: <Plane size={14} /> },
    { id: "coffee", label: "Café", icon: <Coffee size={14} /> },
    { id: "gym", label: "Fitness", icon: <Dumbbell size={14} /> },
    { id: "movies", label: "Cine", icon: <Film size={14} /> },
    { id: "art", label: "Arte", icon: <Palette size={14} /> },
    { id: "books", label: "Libros", icon: <Book size={14} /> },
    { id: "dogs", label: "Perros", icon: <Dog size={14} /> },
    { id: "cooking", label: "Cocina", icon: <Wine size={14} /> },
    { id: "wine", label: "Vino", icon: <Wine size={14} /> },
    { id: "photo", label: "Fotografía", icon: <Camera size={14} /> },
    { id: "tech", label: "Tecnología", icon: <Laptop size={14} /> },
    { id: "crypto", label: "Crypto", icon: <Laptop size={14} /> },
    { id: "hiking", label: "Senderismo", icon: <Mountain size={14} /> },
    { id: "health", label: "Salud", icon: <Heart size={14} /> },
    { id: "party", label: "Fiesta", icon: <Music size={14} /> },
    { id: "guitar", label: "Guitarra", icon: <Music size={14} /> },
];

export default function EditProfileModal({ user, onClose, onSave }) {
    const { showToast } = useToast();
    const [formData, setFormData] = useState({ name: user.name, bio: user.bio || "", photo: user.photo, interests: [] });
    
    // --- CORRECCIÓN LÓGICA: Array directo ---
    useEffect(() => { 
        setFormData(prev => ({ 
            ...prev, 
            interests: Array.isArray(user.interests) ? user.interests : [] 
        })); 
    }, [user.interests]);

    const [isSaving, setIsSaving] = useState(false);
    
    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try { 
            const newUrl = await api.upload(file); 
            setFormData(prev => ({ ...prev, photo: newUrl })); 
            showToast("Foto cargada correctamente");
        } catch (error) { showToast("Error al subir imagen", "error"); }
    };

    const toggleInterest = (id) => { 
        setFormData(prev => { 
            const current = prev.interests; 
            return current.includes(id) 
                ? { ...prev, interests: current.filter(i => i !== id) } 
                : { ...prev, interests: [...current, id] }; 
        }); 
    };

    const handleSave = async () => {
        setIsSaving(true);
        try { 
            await api.put("/me", formData); 
            onSave(); 
        } catch (error) { 
            showToast("Error guardando cambios", "error"); 
        } finally { setIsSaving(false); }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center">
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="w-full max-w-md bg-[#1a0b2e] rounded-t-3xl sm:rounded-3xl p-6 border-t border-white/10 shadow-2xl h-[85vh] overflow-y-auto scrollbar-hide [&::-webkit-scrollbar]:hidden">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">Editar Perfil</h3>
                    <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"><X size={20} className="text-gray-400" /></button>
                </div>
                <div className="flex flex-col items-center mb-8">
                    <label className="relative w-32 h-32 group cursor-pointer">
                        <img src={formData.photo} className="w-full h-full rounded-full object-cover border-4 border-cuadralo-pink opacity-80 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 flex items-center justify-center"><Camera size={32} className="text-white drop-shadow-lg" /></div>
                        <input type="file" className="hidden" onChange={handlePhotoChange} accept="image/*" />
                    </label>
                    <p className="text-xs text-gray-400 mt-2 font-medium">Toca para cambiar foto</p>
                </div>
                <div className="space-y-6">
                    <div className="space-y-4">
                        <div><label className="text-[10px] font-bold text-gray-500 uppercase ml-2">Nombre</label><input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-cuadralo-pink outline-none mt-1"/></div>
                        <div><label className="text-[10px] font-bold text-gray-500 uppercase ml-2">Bio</label><textarea value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-cuadralo-pink outline-none mt-1 resize-none" placeholder="Cuéntanos algo sobre ti..."/></div>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase ml-2 mb-2 block">Tus Intereses</label>
                        <div className="grid grid-cols-2 gap-2">
                            {AVAILABLE_INTERESTS.map((item) => { 
                                const isActive = formData.interests.includes(item.id); 
                                return (
                                    <button key={item.id} onClick={() => toggleInterest(item.id)} className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${isActive ? 'bg-cuadralo-pink/20 border-cuadralo-pink text-white' : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'}`}>
                                        <div className={isActive ? "text-cuadralo-pink" : "text-gray-500"}>{item.icon}</div>
                                        <span className="text-sm font-medium">{item.label}</span>
                                    </button>
                                ); 
                            })}
                        </div>
                    </div>
                </div>
                <button onClick={handleSave} disabled={isSaving} className="w-full mt-8 bg-cuadralo-pink py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform disabled:opacity-50 mb-6">{isSaving ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Guardar Cambios</>}</button>
            </motion.div>
        </motion.div>
    );
}