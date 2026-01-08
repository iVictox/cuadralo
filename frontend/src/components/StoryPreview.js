"use client";

import { useState, useRef } from "react";
import { X, Type, Smile, Sparkles, ChevronRight, Loader2, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Draggable from "react-draggable";
import EmojiPicker from 'emoji-picker-react';
import { toPng } from 'html-to-image'; // <--- USAMOS toPng ES MÁS ESTABLE

export default function StoryPreview({ file, onClose, onUpload, isUploading }) {
    const [previewUrl, setPreviewUrl] = useState(URL.createObjectURL(file));
    const containerRef = useRef(null);

    // Herramientas
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [textMode, setTextMode] = useState(false);
    const [currentText, setCurrentText] = useState("");

    // Elementos y Estado de Arrastre
    const [stickers, setStickers] = useState([]); 
    const [filterIndex, setFilterIndex] = useState(0);
    const [isDragging, setIsDragging] = useState(false); 

    // Filtros CSS
    const filters = [
        { name: "Normal", class: "" },
        { name: "B&N", class: "grayscale" },
        { name: "Sepia", class: "sepia" },
        { name: "Vívido", class: "saturate-150 contrast-110" },
        { name: "Frío", class: "hue-rotate-180" },
    ];

    const toggleFilter = () => setFilterIndex((prev) => (prev + 1) % filters.length);

    const addSticker = (emojiData) => {
        const newSticker = { id: Date.now(), content: emojiData.emoji, type: 'emoji' };
        setStickers([...stickers, newSticker]);
        setShowEmojiPicker(false);
    };

    const addText = () => {
        if (!currentText.trim()) { setTextMode(false); return; }
        const newText = { id: Date.now(), content: currentText, type: 'text' };
        setStickers([...stickers, newText]);
        setCurrentText("");
        setTextMode(false);
    };

    const removeElement = (id) => {
        setStickers(prev => prev.filter(s => s.id !== id));
        setIsDragging(false);
    };

    // --- CORRECCIÓN EN EL GUARDADO ---
    const handleFinalUpload = async () => {
        if (!containerRef.current) return;
        try {
            // 1. Usamos toPng con cacheBust: FALSE (Crucial para blobs locales)
            const dataUrl = await toPng(containerRef.current, { 
                cacheBust: false, 
                pixelRatio: 2,
                skipAutoScale: true
            });
            
            // 2. Convertir DataURL (Base64) a File
            const res = await fetch(dataUrl);
            const blob = await res.blob();
            const processedFile = new File([blob], "story_edited.png", { type: "image/png" });
            
            // 3. Subir
            onUpload(processedFile);
        } catch (err) {
            console.error("Error generando imagen", err);
            // Fallback: Si falla la edición, subimos la original sin editar
            onUpload(file);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[80] bg-black flex flex-col"
        >
            {/* HEADER */}
            {!isDragging && (
                <div className="absolute top-0 left-0 w-full p-4 pt-6 flex justify-between items-start z-50 bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
                    <button onClick={onClose} className="p-2 rounded-full text-white hover:bg-white/10 transition-colors pointer-events-auto"><X size={28} /></button>
                    <div className="flex gap-4 pr-2 pointer-events-auto">
                        <button onClick={() => setTextMode(true)} className="p-2 rounded-full text-white hover:bg-white/10 transition-colors"><Type size={24} /></button>
                        <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2 rounded-full text-white hover:bg-white/10 transition-colors"><Smile size={24} /></button>
                        <button onClick={toggleFilter} className="p-2 rounded-full text-white hover:bg-white/10 transition-colors flex flex-col items-center">
                            <Sparkles size={24} />
                            <span className="text-[9px] font-bold uppercase tracking-widest mt-0.5 text-yellow-400">{filters[filterIndex].name !== "Normal" ? filters[filterIndex].name : ""}</span>
                        </button>
                    </div>
                </div>
            )}

            {/* CANVAS DE EDICIÓN */}
            <div ref={containerRef} className="flex-1 relative overflow-hidden bg-black flex items-center justify-center">
                <img src={previewUrl} alt="Preview" className={`w-full h-full object-cover transition-all duration-300 ${filters[filterIndex].class}`} />

                {/* CAPA DE ELEMENTOS */}
                <div className="absolute inset-0 z-10 overflow-hidden">
                    {stickers.map((s) => (
                        <DraggableItem 
                            key={s.id} 
                            s={s} 
                            onDragStart={() => setIsDragging(true)}
                            onDragStop={(shouldDelete) => {
                                setIsDragging(false);
                                if (shouldDelete) removeElement(s.id);
                            }}
                        />
                    ))}
                </div>

                {/* MODAL INPUT TEXTO */}
                {textMode && (
                    <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                        <input autoFocus type="text" value={currentText} onChange={(e) => setCurrentText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addText()} onBlur={addText} placeholder="Escribe algo..." className="bg-transparent text-white text-3xl font-bold text-center border-b-2 border-white focus:outline-none w-full" />
                    </div>
                )}

                {/* OVERLAY CARGA */}
                {isUploading && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-50">
                        <Loader2 className="animate-spin text-cuadralo-pink mb-2" size={40} />
                        <span className="text-white font-bold tracking-widest text-sm">PUBLICANDO...</span>
                    </div>
                )}
            </div>

            {/* ZONA DE PAPELERA */}
            <AnimatePresence>
                {isDragging && (
                    <motion.div 
                        initial={{ y: 100, opacity: 0 }} 
                        animate={{ y: 0, opacity: 1 }} 
                        exit={{ y: 100, opacity: 0 }}
                        className="absolute bottom-10 left-0 w-full flex justify-center z-[60] pointer-events-none"
                    >
                        <div className="bg-red-500/80 backdrop-blur-md p-4 rounded-full shadow-lg border-2 border-white/20">
                            <Trash2 size={32} className="text-white" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* FOOTER */}
            {!isDragging && (
                <div className="absolute bottom-0 left-0 w-full p-5 pb-8 flex items-center justify-end z-50 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none">
                    <button onClick={handleFinalUpload} disabled={isUploading} className="pointer-events-auto flex items-center gap-2 bg-white text-black pl-5 pr-4 py-3 rounded-full font-bold shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
                        <span>Tu historia</span>
                        <div className="bg-black text-white rounded-full p-1"><ChevronRight size={16} /></div>
                    </button>
                </div>
            )}

            {/* POPUP EMOJIS */}
            {showEmojiPicker && (
                <div className="absolute top-24 right-4 z-[60]">
                    <EmojiPicker theme="dark" onEmojiClick={addSticker} width={300} height={400} searchDisabled />
                </div>
            )}
        </motion.div>
    );
}

// --- DRAGGABLE ITEM CON NODEREF ---
const DraggableItem = ({ s, onDragStart, onDragStop }) => {
    const nodeRef = useRef(null);

    const handleStop = (e, data) => {
        const screenHeight = window.innerHeight;
        // Soporte touch y mouse
        const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
        const isOverTrash = clientY > screenHeight - 150;
        onDragStop(isOverTrash);
    };

    return (
        <Draggable 
            nodeRef={nodeRef} 
            bounds="parent"
            onStart={onDragStart}
            onStop={handleStop}
        >
            <div 
                ref={nodeRef} 
                className="absolute left-1/2 top-1/2 cursor-move inline-block touch-none select-none active:scale-110 transition-transform z-20"
                style={{ marginLeft: "-20px", marginTop: "-20px" }}
            >
                {s.type === 'emoji' ? (
                    <div className="text-6xl drop-shadow-lg filter">
                        {s.content}
                    </div>
                ) : (
                    <div className="bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-xl text-xl font-bold shadow-lg border border-white/20 whitespace-pre-wrap max-w-[80vw] -ml-[50%]">
                        {s.content}
                    </div>
                )}
            </div>
        </Draggable>
    );
};