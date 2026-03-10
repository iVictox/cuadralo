"use client";

import { useState, useEffect } from "react";
import { Edit3, MapPin, Crown, LogOut, Grid } from "lucide-react";
import { api } from "@/utils/api";
import { motion, AnimatePresence } from "framer-motion";
import EditProfileModal from "./EditProfileModal";
import { useRouter } from "next/navigation";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);
  const [showEdit, setShowEdit] = useState(false);
  const router = useRouter();

  const fetchUser = async () => {
    try {
      const data = await api.get("/me");
      setUser(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUser(); }, []);

  if (loading) return (
    <div className="flex h-full items-center justify-center bg-[#0f0518]">
      <div className="animate-spin rounded-lg h-10 w-10 border-2 border-cuadralo-pink border-t-transparent"></div>
    </div>
  );

  const photos = user?.photos?.length > 0 ? user.photos : [user?.photo || "https://via.placeholder.com/600x800"];

  return (
    <div className="w-full h-full overflow-y-auto no-scrollbar bg-white dark:bg-[#0f0518] pb-24">
      
      {/* SECCIÓN DE FOTOS (SLIDER TIPO TINDER) */}
      <div className="relative w-full aspect-[3/4.5] md:max-w-md mx-auto md:mt-4 overflow-hidden md:rounded-2xl shadow-2xl bg-black">
        <AnimatePresence mode="wait">
          <motion.img
            key={activePhoto}
            src={photos[activePhoto]}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>

        {/* Indicadores superiores */}
        <div className="absolute top-4 inset-x-4 flex gap-1.5 z-20">
          {photos.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i === activePhoto ? 'bg-white' : 'bg-white/30'}`} />
          ))}
        </div>

        {/* Areas de toque para cambiar foto */}
        <div className="absolute inset-0 flex z-10">
          <div className="w-1/2" onClick={() => activePhoto > 0 && setActivePhoto(activePhoto - 1)} />
          <div className="w-1/2" onClick={() => activePhoto < photos.length - 1 && setActivePhoto(activePhoto + 1)} />
        </div>

        {/* Info sobre la foto */}
        <div className="absolute bottom-0 w-full p-8 bg-gradient-to-t from-black/80 to-transparent text-white">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">
            {user?.name}, {user?.birth_date ? new Date().getFullYear() - new Date(user.birth_date).getFullYear() : ""}
          </h1>
          <div className="flex items-center gap-2 mt-1 text-xs font-bold uppercase tracking-widest text-cuadralo-pink">
            <MapPin size={14} /> {user?.location || "Ubicación desconocida"}
          </div>
        </div>
      </div>

      {/* CONTENIDO DEL PERFIL */}
      <div className="max-w-md mx-auto px-6 py-10 space-y-10">
        
        <div className="flex gap-3">
          <button onClick={() => setShowEdit(true)} className="flex-1 py-4 bg-cuadralo-pink text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg flex items-center justify-center gap-2">
            <Edit3 size={16} /> Ajustar Perfil
          </button>
          <button onClick={() => { localStorage.clear(); router.push("/login"); }} className="p-4 bg-gray-100 dark:bg-white/5 rounded-xl text-red-500">
            <LogOut size={20} />
          </button>
        </div>

        {/* BIOGRAFIA */}
        <section>
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-3">La Bio</h3>
          <p className="text-sm dark:text-gray-300 leading-relaxed italic">
            {user?.bio ? `"${user.bio}"` : "Tu bio está vacía..."}
          </p>
        </section>

        {/* INTERESES */}
        <section>
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-4">Intereses</h3>
          <div className="flex flex-wrap gap-2">
            {user?.interests?.map((item) => (
              <span key={item.id} className="px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest dark:text-white">
                {item.name}
              </span>
            ))}
          </div>
        </section>
      </div>

      <AnimatePresence>
        {showEdit && <EditProfileModal user={user} onClose={() => setShowEdit(false)} onUpdate={fetchUser} />}
      </AnimatePresence>
    </div>
  );
}