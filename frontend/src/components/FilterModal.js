"use client";

import { useState, useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/utils/api";
import { INTERESTS_LIST } from "@/utils/interests"; // ✅ Usamos estrictamente tu lista oficial

export default function FilterModal({ onClose }) {
  const [loading, setLoading] = useState(false);
  const [prefs, setPrefs] = useState({
    distance: 50,
    show: "Todos",
    ageRange: [18, 30],
    interests: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await api.get("/me");
        if (user.preferences) {
          const savedPrefs = typeof user.preferences === 'string' ? JSON.parse(user.preferences) : user.preferences;
          setPrefs(prev => ({ ...prev, ...savedPrefs, interests: savedPrefs.interests || [] }));
        }
        // ❌ Ya NO hacemos fetch a /interests de la base de datos.
      } catch (error) { console.error(error); }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const prefsToSend = { ...prefs };
      if (prefsToSend.ageRange[1] >= 60) prefsToSend.ageRange[1] = 100;
      await api.put("/me", { preferences: prefsToSend });
      window.location.reload(); 
      onClose();
    } catch (error) { alert("Error al guardar filtros"); } 
    finally { setLoading(false); }
  };

  const toggleInterest = (slug) => {
    setPrefs(prev => {
        const current = prev.interests || [];
        if (current.includes(slug)) {
            return { ...prev, interests: current.filter(i => i !== slug) };
        } else {
            return { ...prev, interests: [...current, slug] };
        }
    });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        className="w-full max-w-md bg-cuadralo-cardLight dark:bg-cuadralo-cardDark rounded-[2.5rem] p-8 border border-black/5 dark:border-white/10 shadow-2xl transition-colors duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-black uppercase italic tracking-tighter">Filtros de Búsqueda</h2>
          <button onClick={onClose} className="p-2 bg-black/5 dark:bg-white/5 rounded-full hover:scale-110 transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-8">
            <div>
                <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50 mb-4 block">Mostrarme</label>
                <div className="flex bg-black/5 dark:bg-white/5 p-1.5 rounded-2xl border border-black/5 dark:border-white/5">
                    {['Hombres', 'Mujeres', 'Todos'].map((opt) => (
                        <button 
                            key={opt} 
                            onClick={() => setPrefs({...prefs, show: opt})} 
                            className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${prefs.show === opt ? 'bg-cuadralo-pink text-white shadow-lg shadow-cuadralo-pink/20 scale-105' : 'opacity-40 hover:opacity-100'}`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <div className="flex justify-between mb-4 items-end">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50">Edad Máxima</label>
                    <span className="text-3xl font-black italic text-cuadralo-pink">
                        {prefs.ageRange[1] >= 60 ? "60+" : prefs.ageRange[1]} 
                        <span className="text-[10px] font-black uppercase tracking-widest text-cuadralo-textLight dark:text-white ml-1">años</span>
                    </span>
                </div>
                <input type="range" min="18" max="60" value={Math.min(prefs.ageRange[1], 60)} onChange={(e) => setPrefs({...prefs, ageRange: [18, parseInt(e.target.value)]})} className="w-full h-2 bg-black/5 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cuadralo-pink" />
            </div>

            <div>
                <div className="flex justify-between mb-4 items-end">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50">Distancia</label>
                    <span className="text-sm font-black italic text-cuadralo-pink">{prefs.distance} <span className="text-[10px] font-black uppercase tracking-widest text-cuadralo-textLight dark:text-white ml-1">km</span></span>
                </div>
                <input type="range" min="1" max="100" value={prefs.distance} onChange={(e) => setPrefs({...prefs, distance: parseInt(e.target.value)})} className="w-full h-2 bg-black/5 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cuadralo-pink" />
            </div>

            <div>
                <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50 mb-4 block">Intereses en Común (Opcional)</label>
                
                {/* ✅ Mismo diseño visual que tu register/page.js */}
                <div className="flex flex-wrap gap-2.5 max-h-[30vh] overflow-y-auto no-scrollbar pb-2 content-start">
                    {INTERESTS_LIST.map(interest => {
                        const isSelected = prefs.interests?.includes(interest.slug);
                        return (
                            <button
                                key={interest.slug}
                                onClick={() => toggleInterest(interest.slug)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all border-2 text-xs font-bold tracking-wide ${isSelected ? 'bg-cuadralo-pink border-cuadralo-pink text-white shadow-md shadow-cuadralo-pink/30 scale-[1.02]' : 'bg-transparent border-black/5 dark:border-white/5 text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 hover:border-cuadralo-pink/50'}`}
                            >
                                <span className={isSelected ? "text-white" : "text-gray-500"}>{interest.icon}</span>
                                {interest.name}
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>

        <button onClick={handleSave} disabled={loading} className="w-full mt-10 py-5 rounded-2xl bg-cuadralo-pink text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-cuadralo-pink/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
            {loading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Guardar Cambios</>}
        </button>
      </motion.div>
    </div>
  );
}