"use client";

import { useState, useRef, useEffect } from "react";
import { X, Type, Smile, ChevronRight, Loader2, Trash2, Wand2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import EmojiPicker from 'emoji-picker-react';

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

    const [imagePreview, setImagePreview] = useState("");
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setImagePreview(objectUrl);
            return () => URL.revokeObjectURL(objectUrl); 
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

    // ✅ SOLUCIÓN: Recorte perfecto idéntico a la pantalla (object-cover replicado en el Canvas)
    const generateFinalImage = async () => {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const img = new Image();
            
            img.src = imagePreview;

            img.onload = () => {
                const containerRect = containerRef.current.getBoundingClientRect();
                const screenRatio = containerRect.width / containerRect.height;
                const imgRatio = img.width / img.height;

                // Definimos una resolución base alta para que no pierda calidad (ej. 1080px de ancho)
                const targetWidth = 1080;
                const targetHeight = targetWidth / screenRatio; 

                canvas.width = targetWidth;
                canvas.height = targetHeight;

                // Matemáticas para recortar la foto idénticamente a como se ve en el celular (object-cover)
                let sx, sy, sw, sh;
                if (imgRatio > screenRatio) {
                    // La imagen original es más ancha que la pantalla, cortamos los lados
                    sh = img.height;
                    sw = img.height * screenRatio;
                    sx = (img.width - sw) / 2;
                    sy = 0;
                } else {
                    // La imagen original es más alta que la pantalla, cortamos arriba/abajo
                    sw = img.width;
                    sh = img.width / screenRatio;
                    sx = 0;
                    sy = (img.height - sh) / 2;
                }

                // 1. Aplicamos filtro
                ctx.filter = FILTERS[filterIndex].css;
                
                // 2. Dibujamos solo la porción recortada de la imagen para que llene el canvas
                ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

                // 3. Reseteamos filtros para los textos
                ctx.filter = "none";

                // Como el canvas es idéntico en proporción a la pantalla, 
                // la escala es directa y los textos quedarán exactamente donde los pusiste.
                const scale = targetWidth / containerRect.width;

                texts.forEach(t => {
                    const finalFontSize = t.fontSize * scale;
                    ctx.font = `bold ${finalFontSize}px ${t.fontFamily}`;
                    ctx.fillStyle = t.color;
                    ctx.textAlign = "left";
                    ctx.textBaseline = "top";
                    
                    const padding = 8;
                    const realX = (t.x + padding) * scale;
                    const realY = (t.y + padding) * scale;

                    const lines = t.text.split('\n');
                    lines.forEach((line, index) => {
                        ctx.fillText(line, realX, realY + (index * (finalFontSize * 1.15)));
                    });
                });

                resolve(canvas.toDataURL("image/jpeg", 0.95)); // Alta calidad
            };

            img.onerror = (err) => {
                console.error("Error cargando la imagen de fondo en el canvas:", err);
                reject(new Error("No se pudo cargar la imagen para procesarla."));
            };
        });
    };

    const handlePublish = async () => {
        setIsPublishing(true);
        try {
            const finalImageDataUrl = await generateFinalImage();
            const res = await fetch(finalImageDataUrl);
            const blob = await res.blob();
            const finalFile = new File([blob], "story.jpg", { type: "image/jpeg" });

            if (typeof onPublish === "function") {
                onPublish(finalFile);
            }
        } catch (error) {
            console.error("Error generando historia:", error);
            alert("Ocurrió un error al procesar tu foto. Inténtalo de nuevo.");
            setIsPublishing(false); 
        }
    };

    if (!imagePreview) return null;

    return (
        <div className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-sm text-white flex items-center justify-center h-[100dvh] overflow-hidden">
            
            {/* CONTENEDOR TIPO MÓVIL (9:16) */}
            <div className="relative w-full max-w-[420px] h-[100dvh] md:h-[90dvh] md:max-h-[850px] md:rounded-2xl md:border border-white/10 overflow-hidden bg-black flex flex-col shadow-2xl">

                {/* CABECERA */}
                <div className="absolute top-0 w-full flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent z-[600]">
                    <button onClick={onCancel} className="p-3 bg-black/40 backdrop-blur-md rounded-full hover:bg-black/60 transition-colors cursor-pointer shadow-lg active:scale-95">
                        <X size={24} />
                    </button>
                    <div className="flex gap-3">
                        <button onClick={() => setShowFilters(!showFilters)} className={`p-3 backdrop-blur-md rounded-full transition-colors shadow-lg active:scale-95 ${showFilters ? 'bg-cuadralo-pink' : 'bg-black/40 hover:bg-black/60'}`}>
                            <Wand2 size={22} />
                        </button>
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
                    {/* Imagen Principal Adaptada */}
                    <img
                        src={imagePreview}
                        style={{ filter: FILTERS[filterIndex].css }}
                        className="w-full h-full object-cover pointer-events-none select-none transition-all duration-300"
                        alt="Historia"
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
                            className={`absolute top-0 left-0 cursor-move inline-block p-2 touch-none ${activeTextId === t.id ? 'ring-2 ring-white/50 rounded-xl bg-black/40 backdrop-blur-sm z-50' : 'z-40'}`}
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
                                        className="absolute -top-12 right-0 p-3 bg-red-600 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all text-white border border-white/20 z-50 cursor-pointer"
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

                {/* CARRUSEL HORIZONTAL DE FILTROS */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            className="absolute bottom-[130px] w-full flex items-center gap-4 px-4 overflow-x-auto pb-4 pt-2 z-[600]"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
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
                                            className="w-full h-full object-cover pointer-events-none"
                                            alt={filter.name}
                                        />
                                    </div>
                                    <span className="text-[10px] font-bold tracking-wider drop-shadow-md">{filter.name}</span>
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* BOTÓN DE PUBLICAR */}
                <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex justify-end z-[600]">
                    <button
                        onClick={handlePublish}
                        disabled={isPublishing}
                        className="bg-cuadralo-pink text-white font-black uppercase tracking-widest text-sm px-6 py-4 rounded-full shadow-[0_0_20px_rgba(255,41,117,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer w-full md:w-auto justify-center"
                    >
                        {isPublishing ? (
                            <><Loader2 size={18} className="animate-spin" /> Preparando...</>
                        ) : (
                            <>Publicar Historia <ChevronRight size={18} /></>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}