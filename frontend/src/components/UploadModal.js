"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Image as ImageIcon, Camera, MapPin, Loader2, CheckCircle, Navigation } from "lucide-react";
import { api } from "@/utils/api";
import { useToast } from "@/context/ToastContext";

export default function UploadModal({ onClose }) {
  const { showToast } = useToast();
  const fileInputRef = useRef(null);
  
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);

  const [gettingLocation, setGettingLocation] = useState(false);

  const handleFileSelect = (e) => {
      const selected = e.target.files[0];
      if (selected) {
          setFile(selected);
          setPreview(URL.createObjectURL(selected));
      }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
        showToast("Tu navegador no soporta geolocalización", "error");
        return;
    }
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                // Reverse geocoding básico con Nominatim OpenStreetMap
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=es`);
                const data = await res.json();

                // Intentar construir un nombre de ciudad y país amigable
                const city = data.address.city || data.address.town || data.address.village || "Ciudad desconocida";
                const country = data.address.country || "País desconocido";

                setLocation(`${city}, ${country}`);
                showToast("Ubicación encontrada", "success");
            } catch (error) {
                showToast("Error al obtener nombre de ubicación", "error");
            } finally {
                setGettingLocation(false);
            }
        },
        (error) => {
            showToast("Permiso denegado o error de red", "error");
            setGettingLocation(false);
        }
    );
  };

  const handlePublish = async () => {
      if (!file) return;
      setLoading(true);
      try {
          const imageUrl = await api.upload(file);
          await api.post("/social/posts", { image_url: imageUrl, caption, location });
          showToast("¡Publicación creada exitosamente!");
          window.location.reload(); 
      } catch (error) { showToast("Error al subir", "error"); }
      finally { setLoading(false); onClose(); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-0">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-4xl bg-cuadralo-bgLight dark:bg-[#1a0b2e] border border-black/5 dark:border-white/10 md:rounded-[2rem] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-[650px] transition-colors duration-300"
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-50 p-2 bg-black/40 backdrop-blur-md text-white hover:bg-black/60 rounded-full transition-colors"><X size={20} /></button>

        {/* Lado Izquierdo: FOTO */}
        <div className="w-full md:w-[55%] h-[40vh] md:h-full bg-gray-100 dark:bg-black relative flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-black/5 dark:border-white/10 overflow-hidden group">
            {preview ? (
                <>
                    <img src={preview} className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-50 scale-110 pointer-events-none" alt="blur" />
                    <img src={preview} className="relative w-full h-full object-contain pointer-events-none z-10" alt="Preview" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center justify-center gap-4">
                        <button onClick={() => { setFile(null); setPreview(null); }} className="px-4 py-2 bg-red-500/80 backdrop-blur-md text-white rounded-full font-semibold text-sm hover:bg-red-500 transition-colors shadow-lg">Eliminar foto</button>
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center gap-6 z-10 p-6 w-full max-w-sm">
                    <div className="p-5 bg-white dark:bg-white/5 rounded-full shadow-xl border border-black/5 dark:border-white/10">
                        <ImageIcon size={48} className="text-cuadralo-pink" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Sube una foto</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Comparte tus mejores momentos con la comunidad.</p>
                    </div>
                    <div className="flex flex-col w-full gap-3">
                        <button onClick={() => fileInputRef.current.click()} className="w-full bg-cuadralo-pink hover:bg-pink-600 text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-cuadralo-pink/20 flex items-center justify-center gap-2">
                            <ImageIcon size={20} /> Elegir de la galería
                        </button>
                        <div className="relative w-full flex items-center justify-center">
                            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileSelect} />
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Lado Derecho: FORMULARIO */}
        <div className="w-full md:w-[45%] h-[50vh] md:h-full bg-white dark:bg-[#1a0b2e] flex flex-col relative overflow-hidden">

            <div className="p-6 border-b border-black/5 dark:border-white/10 bg-gray-50/50 dark:bg-black/20">
                <h3 className="font-bold text-lg text-gray-800 dark:text-white">Nueva Publicación</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Completa los detalles de tu post.</p>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">

                {/* Descripción */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Escribe una descripción</label>
                    <textarea
                        placeholder="¿Qué tienes en mente?..."
                        className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl p-4 text-sm text-gray-800 dark:text-white outline-none focus:border-cuadralo-pink focus:ring-1 focus:ring-cuadralo-pink/30 resize-none h-32 transition-all placeholder:text-gray-400"
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                    />
                </div>

                {/* Ubicación */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Agregar ubicación (Opcional)</label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Ej. Madrid, España"
                                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-gray-800 dark:text-white outline-none focus:border-cuadralo-pink focus:ring-1 focus:ring-cuadralo-pink/30 transition-all placeholder:text-gray-400"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={handleGetLocation}
                            disabled={gettingLocation}
                            className="shrink-0 px-4 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50"
                            title="Usar mi ubicación actual"
                        >
                            {gettingLocation ? <Loader2 size={18} className="animate-spin text-cuadralo-pink" /> : <Navigation size={18} />}
                        </button>
                    </div>
                    <p className="text-[11px] text-gray-400 ml-1">Puedes escribir la ciudad a mano o usar tu GPS.</p>
                </div>
            </div>

            {/* Footer / Publicar */}
            <div className="p-6 border-t border-black/5 dark:border-white/10 bg-gray-50 dark:bg-black/20">
                <button
                    onClick={handlePublish}
                    disabled={!file || loading}
                    className="w-full bg-cuadralo-pink hover:bg-pink-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-cuadralo-pink/30 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                    {loading ? <><Loader2 className="animate-spin" size={20} /> Procesando...</> : <>Publicar Post <CheckCircle size={20} /></>}
                </button>
            </div>
        </div>

      </motion.div>
    </div>
  );
}