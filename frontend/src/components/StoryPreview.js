"use client";

import { useState, useRef, useEffect } from "react";
import { X, Type, Smile, Loader2, Trash2, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import EmojiPicker from 'emoji-picker-react';

// Lista de filtros CSS
const FILTERS = [
    { name: "Normal", css: "none" },
    { name: "Clásico", css: "contrast(1.2) saturate(1.2)" },
    { name: "Cálido", css: "sepia(0.5) contrast(1.1) brightness(1.1)" },
    { name: "Frío", css: "saturate(1.5) hue-rotate(180deg)" },
    { name: "B&N", css: "grayscale(1) contrast(1.2)" },
    { name: "Vintage", css: "sepia(0.8) hue-rotate(-30deg) contrast(1.2)" }
];

export default function StoryPreview({ file, onPublish, onCancel }) {
    const [texts, setTexts] = useState([]);
    const [activeTextId, setActiveTextId] = useState(null);
    const [isPublishing, setIsPublishing] = useState(false);
    const [showEmojis, setShowEmojis] = useState(false);
    
    const [filterIndex, setFilterIndex] = useState(0);
    const containerRef = useRef(null);

    // Evita crashes si file viene nulo por accidente
    const [imagePreview, setImagePreview] = useState("");

    useEffect(() => {
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setImagePreview(objectUrl);
            return () => URL.revokeObjectURL(objectUrl); // Limpieza de memoria
        }
    }, [file]);

    const handleAddText = () => {
        setTexts(prev => [
            ...prev,
            {
                id: Date.now(), 
                text: "Escribe aquí...",
                x: 50 + (prev.length * 30), 
                y: 100 + (prev.length * 30),
                color: "#FFFFFF",
                fontSize: 32,
                fontFamily: "Arial",
            }
        ]);
    };

    const handleTextChange = (id, newText) => {
        setTexts(prev => prev.map(t => t.id === id ? { ...t, text: newText } : t));
    };

    const handleDeleteText = (id) => {
        setTexts(prev => prev.filter(t => t.id !== id));
        if (activeTextId === id) setActiveTextId(null);
    };

    const onEmojiClick = (emojiObject) => {
        if (activeTextId) {
            setTexts(prev => prev.map(t => t.id === activeTextId ? { ...t, text: t.text + emojiObject.emoji } : t));
        } else {
             setTexts(prev => [
                ...prev,
                {
                    id: Date.now(),
                    text: emojiObject.emoji,
                    x: 100, 
                    y: 150,
                    color: "#FFFFFF",
                    fontSize: 45,
                    fontFamily: "Arial",
                }
            ]);
        }
        setShowEmojis(false);
    };

    // ✅ SOLUCIÓN: Generación de imagen en ALTA RESOLUCIÓN
    const generateFinalImage = async () => {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const img = new Image();
            
            img.src = imagePreview;

            img.onload = () => {
                // 1. El canvas toma el tamaño REAL de la imagen de alta calidad, no el de la pantalla
                canvas.width = img.width;
                canvas.height = img.height;

                // Aplicar el filtro actual al canvas
                ctx.filter = FILTERS[filterIndex].css;
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                // Resetear el filtro para que los textos no se vean afectados
                ctx.filter = "none";

                // 2. Factor de escala: Comparamos el tamaño de la pantalla del cel vs el tamaño real de la foto
                // Para saber cuánto hay que agrandar los textos para que se vean proporcionados
                const containerRect = containerRef.current.getBoundingClientRect();
                
                // La imagen de fondo tiene 'object-cover', calculamos cómo se está mostrando en pantalla
                const imageAspectRatio = img.width / img.height;
                const containerAspectRatio = containerRect.width / containerRect.height;
                
                let renderWidth, renderHeight;
                let offsetX = 0, offsetY = 0;

                // Matemáticas para replicar object-cover y hallar las coordenadas exactas
                if (imageAspectRatio > containerAspectRatio) {
                    renderHeight = containerRect.height;
                    renderWidth = img.width * (containerRect.height / img.height);
                    offsetX = (containerRect.width - renderWidth) / 2;
                } else {
                    renderWidth = containerRect.width;
                    renderHeight = img.height * (containerRect.width / img.width);
                    offsetY = (containerRect.height - renderHeight) / 2;
                }

                // Relación real (alta resolución) vs renderizada (pantalla)
                const scale = img.width / renderWidth; 

                texts.forEach(t => {
                    // Calculamos el tamaño de fuente real
                    const finalFontSize = t.fontSize * scale;
                    ctx.font = `bold ${finalFontSize}px ${t.fontFamily}`;
                    ctx.fillStyle = t.color;
                    ctx.textAlign = "left";
                    ctx.textBaseline = "top";
                    
                    const padding = 8;
                    // Proyectamos la posición X e Y de la pantalla a la imagen gigante
                    const realX = (t.x - offsetX + padding) * scale;
                    const realY = (t.y - offsetY + padding) * scale;

                    const lines = t.text.split('\n');
                    lines.forEach((line, index) => {
                        ctx.fillText(line, realX, realY + (index * (finalFontSize * 1.15)));
                    });
                });

                // Extraemos en JPEG calidad casi máxima
                resolve(canvas.toDataURL("image/jpeg", 0.95));
            };

            img.onerror = (err) => {
                console.error("Error cargando la imagen de fondo en el canvas:", err);
                reject(new Error("No se pudo cargar la imagen para procesarla."));
            };
        });
    };

    const handlePublish = async () => {
        // Validación de seguridad por si el padre no pasa la función
        if (typeof onPublish !== "function") {
            console.error("Error: onPublish no fue provisto como una función por el componente padre.");
            alert("Error de configuración: no se puede publicar. Revisa el código del componente padre.");
            return;
        }

        setIsPublishing(true);
        try {
            const finalImageDataUrl = await generateFinalImage();
            const res = await fetch(finalImageDataUrl);
            const blob = await res.blob();
            const finalFile = new File([blob], "story.jpg", { type: "image/jpeg" });

            await onPublish(finalFile);
        } catch (error) {
            console.error("Error generando historia:", error);
            alert("Ocurrió un error al procesar tu foto. Inténtalo de nuevo.");
        } finally {
            setIsPublishing(false);
        }
    };

    const handleCancel = () => {
        // Validación de seguridad para onCancel
        if (typeof onCancel === "function") {
            onCancel();
        } else {
            console.warn("La función onCancel no ha sido provista por el padre.");
        }
    };

    if (!imagePreview) return null; // Evita renderizados en blanco mientras carga la URL

    return (
        <div className="fixed inset-0 z-[1000] bg-black text-white flex flex-col h-[100dvh] overflow-hidden">
            
            {/* CABECERA */}
            <div className="absolute top-0 w-full flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent z-[600] pointer-events-none">
                <button 
                    onClick={handleCancel} 
                    className="p-3 bg-black/40 backdrop-blur-md rounded-full hover:bg-black/60 transition-colors shadow-lg active:scale-95 pointer-events-auto"
                >
                    <X size={24} />
                </button>
                <div className="flex gap-3 pointer-events-auto">
                    <button onClick={handleAddText} className="p-3 bg-black/40 backdrop-blur-md rounded-full hover:bg-black/60 transition-colors shadow-lg active:scale-95">
                        <Type size={22} />
                    </button>
                    <button onClick={() => setShowEmojis(!showEmojis)} className="p-3 bg-black/40 backdrop-blur-md rounded-full hover:bg-black/60 transition-colors shadow-lg active:scale-95">
                        <Smile size={22} />
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {showEmojis && (
                    <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }} className="absolute top-24 right-4 z-[600] shadow-2xl">
                        <EmojiPicker onEmojiClick={onEmojiClick} theme="dark" width={300} height={400} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* CONTENEDOR PRINCIPAL */}
            <div 
                ref={containerRef}
                className="relative flex-1 w-full h-full bg-black flex items-center justify-center overflow-hidden touch-none"
                onClick={() => setActiveTextId(null)}
            >
                <img 
                    src={imagePreview} 
                    style={{ filter: FILTERS[filterIndex].css }}
                    className="w-full h-full object-cover pointer-events-none select-none transition-all duration-300" 
                    alt="Fondo de Historia" 
                />

                {texts.map(t => (
                    <motion.div 
                        key={t.id} 
                        id={`story-elem-${t.id}`}
                        drag 
                        dragConstraints={containerRef}
                        dragMomentum={false} 
                        dragElastic={0} 
                        initial={{ x: t.x, y: t.y }} 
                        onDragEnd={() => {
                            const el = document.getElementById(`story-elem-${t.id}`);
                            const container = containerRef.current;
                            if (!el || !container) return;

                            const containerRect = container.getBoundingClientRect();
                            const elRect = el.getBoundingClientRect();

                            const newX = elRect.left - containerRect.left;
                            const newY = elRect.top - containerRect.top;

                            setTexts(prev => prev.map(item => item.id === t.id ? { ...item, x: newX, y: newY } : item));
                        }}
                        className={`absolute top-0 left-0 cursor-move inline-block p-2 touch-none ${activeTextId === t.id ? 'ring-2 ring-white/50 rounded-xl bg-black/40 backdrop-blur-sm z-[550]' : 'z-[500]'}`}
                        onClick={(e) => { e.stopPropagation(); setActiveTextId(t.id); }}
                        style={{ color: t.color, fontSize: `${t.fontSize}px`, fontFamily: t.fontFamily, textShadow: "0px 2px 10px rgba(0,0,0,0.8)" }}
                    >
                        {activeTextId === t.id ? (
                            <div className="relative">
                                <textarea
                                    autoFocus
                                    value={t.text}
                                    onChange={(e) => handleTextChange(t.id, e.target.value)}
                                    className="bg-transparent border-none outline-none resize-none overflow-hidden block w-full text-left font-bold"
                                    style={{ color: t.color, minWidth: "150px", height: `${t.fontSize * 2.5}px` }}
                                />
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleDeleteText(t.id); }}
                                    className="absolute -top-12 right-0 p-3 bg-red-600 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all text-white border border-white/20 z-[600] cursor-pointer"
                                    onPointerDown={(e) => e.stopPropagation()} 
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ) : (
                            <span className="font-bold whitespace-pre-wrap leading-tight block">{t.text}</span>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* NUEVO DISEÑO DE FILTROS (CARRUSEL HORIZONTAL) */}
            <div 
                className="absolute bottom-[88px] w-full flex items-center gap-4 px-4 overflow-x-auto pb-4 pt-2 z-[600]"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // Oculta la barra de scroll nativa
            >
                {FILTERS.map((filter, index) => (
                    <button
                        key={index}
                        onClick={() => setFilterIndex(index)}
                        className={`flex flex-col items-center gap-1 transition-all duration-300 min-w-[70px] ${filterIndex === index ? "scale-110 opacity-100" : "scale-100 opacity-60 hover:opacity-100"}`}
                    >
                        <div className={`w-14 h-14 rounded-full overflow-hidden border-2 shadow-lg ${filterIndex === index ? "border-cuadralo-pink shadow-cuadralo-pink/50" : "border-white/20"}`}>
                            <img 
                                src={imagePreview} 
                                style={{ filter: filter.css }} 
                                className="w-full h-full object-cover" 
                                alt={filter.name} 
                            />
                        </div>
                        <span className="text-[10px] font-bold tracking-wider drop-shadow-md">{filter.name}</span>
                    </button>
                ))}
            </div>

            {/* PIE DE PÁGINA */}
            <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-black via-black/80 to-transparent flex justify-end z-[600] pointer-events-none">
                <button 
                    onClick={handlePublish}
                    disabled={isPublishing}
                    className="bg-cuadralo-pink text-white font-black uppercase tracking-widest text-sm px-6 py-4 rounded-full shadow-[0_0_20px_rgba(255,41,117,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer pointer-events-auto"
                >
                    {isPublishing ? (
                        <><Loader2 size={18} className="animate-spin" /> Procesando...</>
                    ) : (
                        <>Publicar Historia <ChevronRight size={18} /></>
                    )}
                </button>
            </div>
            
        </div>
    );
}