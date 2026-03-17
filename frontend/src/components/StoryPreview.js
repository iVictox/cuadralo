"use client";

import { useState, useRef } from "react";
import { X, Type, Smile, Sparkles, ChevronRight, Loader2, Trash2 } from "lucide-react";
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

    const [imagePreview] = useState(URL.createObjectURL(file));

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

    const toggleFilter = () => {
        setFilterIndex((prev) => (prev + 1) % FILTERS.length);
    };

    const generateFinalImage = async () => {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const img = new Image();
            
            img.src = imagePreview;

            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;

                ctx.filter = FILTERS[filterIndex].css;
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                ctx.filter = "none";

                const containerRect = containerRef.current.getBoundingClientRect();
                const scaleX = canvas.width / containerRect.width;
                const scaleY = canvas.height / containerRect.height;

                texts.forEach(t => {
                    ctx.font = `bold ${t.fontSize * scaleX}px ${t.fontFamily}`;
                    ctx.fillStyle = t.color;
                    ctx.textAlign = "left";
                    ctx.textBaseline = "top";
                    
                    const padding = 8;
                    const realX = (t.x + padding) * scaleX;
                    const realY = (t.y + padding) * scaleY;

                    const lines = t.text.split('\n');
                    lines.forEach((line, index) => {
                        ctx.fillText(line, realX, realY + (index * (t.fontSize * scaleX * 1.15)));
                    });
                });

                resolve(canvas.toDataURL("image/jpeg", 0.9));
            };

            img.onerror = (err) => {
                console.error("Error cargando la imagen de fondo en el canvas:", err);
                reject(new Error("No se pudo cargar la imagen para procesarla."));
            };
        });
    };

    const handlePublish = async () => {
        // Bloqueamos el botón para evitar clics dobles rápidos
        setIsPublishing(true);
        try {
            const finalImageDataUrl = await generateFinalImage();
            const res = await fetch(finalImageDataUrl);
            const blob = await res.blob();
            const finalFile = new File([blob], "story.jpg", { type: "image/jpeg" });

            // Llamamos la función onPublish inmediatamente sin el 'await'. 
            // El componente padre cerrará esta ventana en milisegundos y mostrará el overlay de carga.
            if (typeof onPublish === "function") {
                onPublish(finalFile);
            }
        } catch (error) {
            console.error("Error generando historia:", error);
            alert("Ocurrió un error al procesar tu foto. Inténtalo de nuevo.");
            setIsPublishing(false); // Solo habilitamos si hubo un error local
        }
    };

    return (
        <div className="fixed inset-0 z-[500] bg-black text-white flex flex-col h-[100dvh] overflow-hidden">
            
            <div className="absolute top-0 w-full flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent z-[600]">
                <button onClick={onCancel} className="p-3 bg-black/40 backdrop-blur-md rounded-full hover:bg-black/60 transition-colors cursor-pointer shadow-lg active:scale-95">
                    <X size={24} />
                </button>
                <div className="flex gap-3">
                    <button onClick={handleAddText} className="p-3 bg-black/40 backdrop-blur-md rounded-full hover:bg-black/60 transition-colors shadow-lg active:scale-95">
                        <Type size={22} />
                    </button>
                    <button onClick={() => setShowEmojis(!showEmojis)} className="p-3 bg-black/40 backdrop-blur-md rounded-full hover:bg-black/60 transition-colors shadow-lg active:scale-95">
                        <Smile size={22} />
                    </button>
                    <button onClick={toggleFilter} className="p-3 bg-black/40 backdrop-blur-md rounded-full hover:bg-black/60 transition-colors shadow-lg active:scale-95 flex items-center gap-2">
                        <Sparkles size={22} className={filterIndex > 0 ? "text-cuadralo-pink" : "text-yellow-400"} />
                        {filterIndex > 0 && <span className="text-[10px] font-bold uppercase tracking-widest">{FILTERS[filterIndex].name}</span>}
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

            <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex justify-end z-[600]">
                <button 
                    onClick={handlePublish}
                    disabled={isPublishing}
                    className="bg-cuadralo-pink text-white font-black uppercase tracking-widest text-sm px-6 py-4 rounded-full shadow-[0_0_20px_rgba(255,41,117,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                    {isPublishing ? (
                        <><Loader2 size={18} className="animate-spin" /> Preparando...</>
                    ) : (
                        <>Publicar Historia <ChevronRight size={18} /></>
                    )}
                </button>
            </div>
            
        </div>
    );
}