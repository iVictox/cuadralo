"use client";

import { useState, useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/utils/api";

export default function FilterModal({ onClose }) {
  const [loading, setLoading] = useState(false);
  const [prefs, setPrefs] = useState({
    distance: 50,
    show: "Todos",
    ageRange: [18, 30] 
  });

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const user = await api.get("/me");
        if (user.preferences) {
          const savedPrefs = JSON.parse(user.preferences);
          setPrefs(prev => ({ ...prev, ...savedPrefs }));
        }
      } catch (error) { console.error(error); }
    };
    fetchPrefs();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const prefsToSend = { ...prefs };
      if (prefsToSend.ageRange[1] >= 60) prefsToSend.ageRange[1] = 100;

      await api.put("/me", { preferences: prefsToSend });
      window.location.reload(); 
      onClose();
    } catch (error) { alert("Error al guardar"); } 
    finally { setLoading(false); }
  };

  // CORRECCIÓN: z-[200]
  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        className="w-full max-w-md bg-[#1a0b2e] rounded-3xl p-6 border border-white/10 shadow-2xl"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Filtros</h2>
          <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-gray-400">
            <X size={20} />
          </button>
        </div>

        {/* Contenido */}
        <div className="space-y-8">
            {/* GÉNERO */}
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 block">Mostrarme</label>
                <div className="flex bg-white/5 p-1 rounded-xl">
                    {['Hombres', 'Mujeres', 'Todos'].map((opt) => (
                        <button 
                            key={opt} 
                            onClick={() => setPrefs({...prefs, show: opt})} 
                            className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${prefs.show === opt ? 'bg-cuadralo-pink text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>

            {/* EDAD MÁXIMA */}
            <div>
                <div className="flex justify-between mb-3 items-end">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Edad Máxima</label>
                    <span className="text-2xl font-extrabold text-white">
                        {prefs.ageRange[1] >= 60 ? "60+" : prefs.ageRange[1]} 
                        <span className="text-sm font-medium text-gray-500"> años</span>
                    </span>
                </div>
                
                <input 
                    type="range" min="18" max="60" 
                    value={Math.min(prefs.ageRange[1], 60)} 
                    onChange={(e) => setPrefs({...prefs, ageRange: [18, parseInt(e.target.value)]})}
                    className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cuadralo-pink hover:accent-purple-500 transition-all"
                />
            </div>

            {/* DISTANCIA */}
            <div>
                <div className="flex justify-between mb-3 items-end">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Distancia</label>
                    <span className="text-sm font-bold text-cuadralo-pink">{prefs.distance} km</span>
                </div>
                <input 
                    type="range" min="1" max="100" 
                    value={prefs.distance} 
                    onChange={(e) => setPrefs({...prefs, distance: parseInt(e.target.value)})} 
                    className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cuadralo-pink"
                />
            </div>
        </div>

        <button 
            onClick={handleSave} 
            disabled={loading}
            className="w-full mt-8 py-4 rounded-xl bg-gradient-to-r from-cuadralo-pink to-purple-600 text-white font-bold text-sm shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
        >
            {loading ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Aplicar Filtros</>}
        </button>

      </motion.div>
    </div>
  );
}