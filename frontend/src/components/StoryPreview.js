"use client";

import { useState, useRef } from "react";
import { X, Type, Smile, Sparkles, ChevronRight, Loader2, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Draggable from "react-draggable";
import EmojiPicker from 'emoji-picker-react';

export default function StoryPreview({ file, onPublish, onCancel }) {
    const [texts, setTexts] = useState([]);
    const [activeTextId, setActiveTextId] = useState(null);
    const [isPublishing, setIsPublishing] = useState(false);
    const [showEmojis, setShowEmojis] = useState(false);
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

    // ✅ OPTIMIZACIÓN DE RENDIMIENTO: Solo actualizamos el estado cuando el usuario SUELTA el elemento
    const handleStop = (id, e, data) => {
        setTexts(prev => prev.map(t => t.id === id ? { ...t, x: data.x, y: data.y } : t));
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

    const generateFinalImage = async () => {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const img = new Image();
            
            img.crossOrigin = "anonymous"; 
            img.src = imagePreview;

            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;

                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                const containerRect = containerRef.current.getBoundingClientRect();
                const scaleX = canvas.width / containerRect.width;
                const scaleY = canvas.height / containerRect.height;

                texts.forEach(t => {
                    ctx.font = `bold ${t.fontSize * scaleX}px ${t.fontFamily}`;
                    ctx.fillStyle = t.color;
                    ctx.textAlign = "left";
                    ctx.textBaseline = "top";
                    
                    const realX = t.x * scaleX;
                    const realY = t.y * scaleY;

                    const lines = t.text.split('\n');
                    lines.forEach((line, index) => {
                        ctx.fillText(line, realX, realY + (index * (t.fontSize * scaleX * 1.2)));
                    });
                });

                resolve(canvas.toDataURL("image/jpeg", 0.9));
            };

            img.onerror = () => {
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

            await onPublish(finalFile);
        } catch (error) {
            console.error("Error generando historia:", error);
            alert("Ocurrió un error al procesar tu foto. Inténtalo de nuevo.");
        } finally {
            setIsPublishing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] bg-black text-white flex flex-col h-[100dvh] overflow-hidden">
            
            <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent absolute top-0 w-full z-30 pointer-events-none">
                <button onClick={onCancel} className="pointer-events-auto p-2 bg-black/40 backdrop-blur-md rounded-full hover:bg-black/60 transition-colors">
                    <X size={24} />
                </button>
                <div className="flex gap-3 pointer-events-auto">
                    <button onClick={handleAddText} className="p-2.5 bg-black/40 backdrop-blur-md rounded-full hover:bg-black/60 transition-colors shadow-lg active:scale-95">
                        <Type size={22} />
                    </button>
                    <button onClick={() => setShowEmojis(!showEmojis)} className="p-2.5 bg-black/40 backdrop-blur-md rounded-full hover:bg-black/60 transition-colors shadow-lg active:scale-95">
                        <Smile size={22} />
                    </button>
                    <button className="p-2.5 bg-black/40 backdrop-blur-md rounded-full hover:bg-black/60 transition-colors shadow-lg active:scale-95">
                        <Sparkles size={22} className="text-yellow-400" />
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {showEmojis && (
                    <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }} className="absolute top-20 right-4 z-50 shadow-2xl">
                        <EmojiPicker onEmojiClick={onEmojiClick} theme="dark" width={300} height={400} />
                    </motion.div>
                )}
            </AnimatePresence>

            <div 
                ref={containerRef}
                className="relative flex-1 w-full h-full bg-black flex items-center justify-center overflow-hidden touch-none"
                onClick={() => setActiveTextId(null)}
            >
                <img src={imagePreview} className="w-full h-full object-cover pointer-events-none select-none" alt="Fondo de Historia" />

                {texts.map(t => (
                    <Draggable 
                        key={t.id} 
                        // ✅ OPTIMIZACIÓN CLAVE: Cambiamos "position" por "defaultPosition" y "onDrag" por "onStop"
                        defaultPosition={{ x: t.x, y: t.y }} 
                        onStop={(e, data) => handleStop(t.id, e, data)}
                        bounds="parent"
                    >
                        <div 
                            className={`absolute cursor-move inline-block p-2 ${activeTextId === t.id ? 'ring-2 ring-white/50 rounded-xl bg-black/20 backdrop-blur-sm' : ''}`}
                            onClick={(e) => { e.stopPropagation(); setActiveTextId(t.id); }}
                            style={{ color: t.color, fontSize: `${t.fontSize}px`, fontFamily: t.fontFamily, textShadow: "0px 2px 10px rgba(0,0,0,0.8)" }}
                        >
                            {activeTextId === t.id ? (
                                <div className="relative">
                                    <textarea
                                        autoFocus
                                        value={t.text}
                                        onChange={(e) => handleTextChange(t.id, e.target.value)}
                                        className="bg-transparent border-none outline-none resize-none overflow-hidden block w-full text-center font-bold"
                                        style={{ color: t.color, minWidth: "150px", height: `${t.fontSize * 2}px` }}
                                    />
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleDeleteText(t.id); }}
                                        // ✅ Separamos visualmente el botón de eliminar usando touch-none para que no interfiera con el arrastre
                                        className="absolute -top-12 right-0 p-2.5 bg-red-600 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all text-white border border-white/20 touch-none cursor-pointer"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ) : (
                                <span className="font-bold whitespace-pre-wrap">{t.text}</span>
                            )}
                        </div>
                    </Draggable>
                ))}
            </div>

            <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-black/90 to-transparent flex justify-end z-30 pointer-events-none">
                <button 
                    onClick={handlePublish}
                    disabled={isPublishing}
                    className="pointer-events-auto bg-cuadralo-pink text-white font-black uppercase tracking-widest text-sm px-6 py-4 rounded-full shadow-[0_0_20px_rgba(255,41,117,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
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