"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, MapPin, Image as ImageIcon, Wand2, Loader2, ChevronDown, ChevronUp } from "lucide-react";

export default function UploadModal({ onClose }) {
  // --- ESTADOS ---
  const [caption, setCaption] = useState("");
  const [activeFilter, setActiveFilter] = useState("normal");
  
  // 1. Estado para la imagen (Iniciamos con null para obligar a subir o dejamos una por defecto)
  const [image, setImage] = useState("https://images.pexels.com/photos/1854897/pexels-photo-1854897.jpeg?auto=compress&cs=tinysrgb&w=1200");
  
  // 2. Estados para Ubicación
  const [location, setLocation] = useState("");
  const [isLocating, setIsLocating] = useState(false);

  // 3. Estado para Opciones Avanzadas
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advancedSettings, setAdvancedSettings] = useState({
      hideLikes: false,
      disableComments: false
  });

  // Referencia para el input de archivo oculto
  const fileInputRef = useRef(null);

  // Bloqueo de Scroll (Igual que antes)
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // --- FUNCIONES ---

  // A) Manejar subida de imagen
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
        // Creamos una URL temporal para previsualizar el archivo local
        const imageUrl = URL.createObjectURL(file);
        setImage(imageUrl);
    }
  };

  // B) Simular obtener ubicación
  const handleGetLocation = () => {
    if (location) {
        setLocation(""); // Si ya tiene, la borra
        return;
    }
    
    setIsLocating(true);
    // Simulamos una espera de 1.5 segundos (como si consultara al GPS)
    setTimeout(() => {
        setLocation("Valencia, Carabobo");
        setIsLocating(false);
    }, 1500);
  };

  // C) Toggle de opciones avanzadas
  const toggleSetting = (key) => {
      setAdvancedSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Filtros CSS
  const filters = [
    { id: "normal", name: "Normal", class: "" },
    { id: "bw", name: "B&W", class: "grayscale" },
    { id: "vintage", name: "Vintage", class: "sepia contrast-125" },
    { id: "vivid", name: "Vivid", class: "saturate-150 contrast-110" },
    { id: "cyber", name: "Cyber", class: "hue-rotate-15 saturate-150" },
    { id: "warm", name: "Cálido", class: "sepia-[.5] hue-rotate-[-30deg]" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: "100%" }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[60] bg-[#0f0518] flex flex-col overflow-hidden"
    >
        {/* INPUT OCULTO PARA SUBIR ARCHIVOS */}
        <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            accept="image/*" 
            className="hidden" 
        />

        {/* 1. HEADER */}
        <div className="flex justify-between items-center px-6 py-4 bg-black/20 backdrop-blur-md z-20 border-b border-white/5 shrink-0">
            <button onClick={onClose} className="p-2 -ml-2 text-gray-300 hover:text-white transition-colors">
                <X size={28} />
            </button>
            <h2 className="text-lg font-bold tracking-wide">Nueva Publicación</h2>
            <button 
                className="text-cuadralo-pink font-bold text-sm hover:text-white transition-colors disabled:opacity-50"
                disabled={caption.length === 0}
                onClick={() => {
                    alert("¡Publicado con éxito!"); // Aquí conectarías con tu backend
                    onClose();
                }} 
            >
                Publicar
            </button>
        </div>

        {/* 2. CONTENEDOR PRINCIPAL */}
        <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden">
            
            {/* A) SECCIÓN IMAGEN */}
            <div className="w-full md:w-[60%] aspect-square md:aspect-auto md:h-full bg-[#1a1a1a] relative group flex items-center justify-center shrink-0">
                <img 
                    src={image}
                    alt="Preview"
                    className={`w-full h-full object-cover md:object-contain transition-all duration-500 ${filters.find(f => f.id === activeFilter)?.class}`}
                />
                
                {/* Botón flotante para CAMBIAR FOTO */}
                <button 
                    onClick={() => fileInputRef.current.click()} // Dispara el input oculto
                    className="absolute bottom-4 right-4 p-3 bg-black/60 backdrop-blur-md rounded-full text-white border border-white/10 hover:bg-cuadralo-pink transition-colors z-10 group-hover:scale-110"
                >
                    <ImageIcon size={20} />
                </button>
            </div>

            {/* B) SECCIÓN CONTROLES */}
            <div className="w-full md:w-[40%] md:h-full md:overflow-y-auto bg-[#0f0518] md:border-l border-white/5 relative">
                
                {/* Barra de Filtros */}
                <div className="py-6 px-4 border-b border-white/5">
                    <div className="flex items-center gap-2 mb-3 text-gray-400 text-xs font-bold uppercase tracking-wider">
                        <Wand2 size={14} />
                        <span>Filtros</span>
                    </div>
                    
                    <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar snap-x">
                        {filters.map((filter) => (
                            <button 
                                key={filter.id}
                                onClick={() => setActiveFilter(filter.id)}
                                className={`flex flex-col items-center gap-2 min-w-[80px] snap-start group`}
                            >
                                <div className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${activeFilter === filter.id ? 'border-cuadralo-pink scale-110 shadow-[0_0_15px_rgba(242,19,142,0.5)]' : 'border-transparent opacity-70 group-hover:opacity-100'}`}>
                                    <img 
                                        src={image} // Usamos la imagen subida también aquí
                                        className={`w-full h-full object-cover ${filter.class}`} 
                                        alt={filter.name}
                                    />
                                </div>
                                <span className={`text-xs font-medium ${activeFilter === filter.id ? 'text-white' : 'text-gray-500'}`}>
                                    {filter.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Formulario */}
                <div className="px-6 py-6 space-y-6 pb-24">
                    {/* Descripción */}
                    <div className="space-y-2">
                        <label className="text-gray-400 text-xs font-bold uppercase tracking-wider">Descripción</label>
                        <textarea 
                            placeholder="Escribe un pie de foto..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-cuadralo-purple transition-colors resize-none h-32"
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                        />
                    </div>

                    {/* Ubicación (Interactivo) */}
                    <div 
                        onClick={handleGetLocation}
                        className={`flex items-center gap-3 p-4 bg-white/5 border rounded-2xl cursor-pointer transition-all active:scale-[0.98] 
                        ${location ? 'border-cuadralo-pink bg-cuadralo-pink/10' : 'border-white/10 hover:bg-white/10'}`}
                    >
                        {isLocating ? (
                            <Loader2 className="text-cuadralo-pink animate-spin" size={24} />
                        ) : (
                            <MapPin className={`${location ? 'text-cuadralo-pink' : 'text-gray-400'}`} size={24} />
                        )}
                        
                        <div className="flex-1">
                            <p className={`font-medium ${location ? 'text-white' : 'text-gray-400'}`}>
                                {isLocating ? "Localizando..." : location || "Agregar Ubicación"}
                            </p>
                            {location && <p className="text-cuadralo-pink text-xs">Ubicación actual</p>}
                        </div>
                        
                        {location ? (
                            <X size={20} className="text-gray-400 hover:text-white" onClick={(e) => { e.stopPropagation(); setLocation(""); }} />
                        ) : (
                            <ArrowRight size={20} className="text-gray-600" />
                        )}
                    </div>

                    {/* Opciones Avanzadas (Desplegable) */}
                    <div className="border-t border-white/5 pt-4">
                        <div 
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="flex justify-between items-center p-2 cursor-pointer hover:bg-white/5 rounded-lg transition-colors"
                        >
                            <span className="text-sm text-gray-400 font-medium">Configuración Avanzada</span>
                            {showAdvanced ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                        </div>

                        <AnimatePresence>
                            {showAdvanced && (
                                <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="pt-2 space-y-3 px-2">
                                        {/* Switch 1: Ocultar Me Gusta */}
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-sm text-white">Ocultar recuento de Me gusta</span>
                                            <button 
                                                onClick={() => toggleSetting('hideLikes')}
                                                className={`w-11 h-6 rounded-full relative transition-colors ${advancedSettings.hideLikes ? 'bg-cuadralo-pink' : 'bg-gray-700'}`}
                                            >
                                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${advancedSettings.hideLikes ? 'left-6' : 'left-1'}`} />
                                            </button>
                                        </div>

                                        {/* Switch 2: Desactivar Comentarios */}
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-sm text-white">Desactivar comentarios</span>
                                            <button 
                                                onClick={() => toggleSetting('disableComments')}
                                                className={`w-11 h-6 rounded-full relative transition-colors ${advancedSettings.disableComments ? 'bg-cuadralo-pink' : 'bg-gray-700'}`}
                                            >
                                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${advancedSettings.disableComments ? 'left-6' : 'left-1'}`} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                </div>

            </div>
        </div>
    </motion.div>
  );
}