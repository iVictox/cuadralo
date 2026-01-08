"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    ArrowLeft, Send, Phone, Video, MoreVertical, Image as ImageIcon, Smile, 
    Ban, Flag, Loader2, Trash2, Bookmark, Clock, Copy, MoreHorizontal, Check, CheckCheck, Eye, EyeOff, AlertTriangle, X as XIcon
} from "lucide-react";
import EmojiPicker from 'emoji-picker-react';
import { api } from "@/utils/api";
import { useToast } from "@/context/ToastContext";
import ProfileDetailsModal from "@/components/ProfileDetailsModal";

// --- SUB-COMPONENTE: FOTO "VER UNA VEZ" ---
const SecretImageMessage = ({ msg, isMe, onOpen, isViewed }) => {
    return (
        <div className="p-1">
            {isMe ? (
                // El remitente ve su foto borrosa
                <div className="relative group cursor-pointer overflow-hidden rounded-xl">
                    <img src={msg.content} alt="Foto enviada" className="w-full max-w-[280px] object-cover opacity-50 blur-sm" />
                    <div className="absolute inset-0 flex items-center justify-center">
                         <span className="text-xs font-bold bg-black/50 px-2 py-1 rounded text-white">Foto efímera enviada</span>
                    </div>
                </div>
            ) : (
                // El receptor ve el botón de abrir
                <button 
                    onClick={() => !isViewed && onOpen(msg)}
                    disabled={isViewed}
                    className={`w-[200px] h-[250px] rounded-xl flex flex-col items-center justify-center gap-3 transition-colors ${
                        isViewed ? "bg-gray-800 cursor-not-allowed" : "bg-gray-700/50 hover:bg-gray-700 cursor-pointer"
                    }`}
                >
                    <div className={`p-4 rounded-full ${isViewed ? "bg-gray-700" : "bg-white/10"}`}>
                        {isViewed ? <EyeOff size={32} className="text-gray-500" /> : <Eye size={32} className="text-cuadralo-pink animate-pulse" />}
                    </div>
                    <span className={`text-sm font-medium ${isViewed ? "text-gray-500" : "text-white"}`}>
                        {isViewed ? "Abierto" : "Toque para ver"}
                    </span>
                    {!isViewed && <span className="text-[10px] text-gray-400">1 visualización</span>}
                </button>
            )}
        </div>
    );
};

// --- SUB-COMPONENTE MessageItem ---
const MessageItem = ({ msg, isMe, onDelete, onToggleSave, onOpenImage }) => {
    const [showMenu, setShowMenu] = useState(false);
    
    // Alerta de captura de pantalla
    if (msg.type === "screenshot_alert") {
        return (
            <div className="flex justify-center my-4">
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-full px-4 py-1 flex items-center gap-2 text-yellow-500 text-xs font-medium">
                    <AlertTriangle size={12} />
                    {msg.content}
                </div>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`flex w-full mb-4 items-end gap-2 group ${isMe ? "justify-end" : "justify-start"}`}
        >
            {/* MENÚ IZQUIERDO (SI ES MI MENSAJE) */}
            {isMe && (
                <div className="relative">
                    <button onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }} className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><MoreHorizontal size={16} /></button>
                    {showMenu && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                            <div className="absolute bottom-8 right-0 w-40 bg-[#1a0b2e] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden text-xs">
                                <button onClick={() => onDelete(msg.id)} className="w-full text-left px-3 py-2 text-red-400 hover:bg-white/5 flex gap-2"><Trash2 size={12}/> Eliminar</button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* BURBUJA */}
            <div className={`relative max-w-[75%] rounded-2xl shadow-sm overflow-hidden ${isMe ? "bg-gradient-to-br from-cuadralo-pink to-purple-600 text-white rounded-br-none" : "bg-[#2a2a2a]/90 backdrop-blur-sm text-gray-100 border border-white/5 rounded-bl-none"}`}>
                
                {msg.type === "image" ? (
                    <SecretImageMessage 
                        msg={msg} 
                        isMe={isMe} 
                        isViewed={msg.is_viewed} 
                        onOpen={onOpenImage} 
                    />
                ) : (
                    <div className="px-4 py-2.5 text-[15px] leading-relaxed break-words">{msg.content}</div>
                )}
                
                <div className={`flex items-center justify-end gap-1.5 px-3 pb-1.5 text-[10px] ${isMe ? "text-blue-100/80" : "text-gray-400"}`}>
                    <span>{new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    {isMe && (<span>{msg.is_read ? <CheckCheck size={14} className="text-blue-200" /> : <Check size={14} className="text-white/60" />}</span>)}
                </div>
            </div>

            {/* MENÚ DERECHO (SI NO ES MIO) */}
            {!isMe && (
                 <div className="relative">
                 <button onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }} className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><MoreHorizontal size={16} /></button>
                 {showMenu && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                        <div className="absolute bottom-8 left-0 w-40 bg-[#1a0b2e] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden text-xs">
                            <button onClick={() => onDelete(msg.id)} className="w-full text-left px-3 py-2 text-red-400 hover:bg-white/5 flex gap-2"><Trash2 size={12}/> Eliminar para mí</button>
                        </div>
                    </>
                )}
             </div>
            )}
        </motion.div>
    );
};

// --- COMPONENTE PRINCIPAL ---
export default function ChatWindow({ chat, onBack }) {
  const { showToast } = useToast();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [myId, setMyId] = useState(null);
  
  const [showEmoji, setShowEmoji] = useState(false);
  const [viewProfile, setViewProfile] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [fullscreenImage, setFullscreenImage] = useState(null); 

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) setMyId(JSON.parse(userStr).id);
  }, []);

  const fetchMessages = async () => {
    try {
        const data = await api.get(`/messages/${chat.id}`);
        setMessages(data);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [chat.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- DETECTOR DE CAPTURA DE PANTALLA ---
  const handleScreenshotDetected = useCallback(async () => {
    if (fullscreenImage) {
        setFullscreenImage(null);
        showToast("📷 ¡Captura detectada!", "error");
        
        try {
            await api.post("/messages", {
                receiver_id: chat.id,
                content: "📸 Tomó una captura de pantalla",
                type: "screenshot_alert"
            });
            fetchMessages(); 
        } catch (e) { console.error("Error enviando alerta screenshot", e); }
    }
  }, [fullscreenImage, chat.id]);

  useEffect(() => {
    const handleKeyUp = (e) => {
        if (e.key === "PrintScreen") handleScreenshotDetected();
    };
    window.addEventListener("keyup", handleKeyUp);
    return () => { window.removeEventListener("keyup", handleKeyUp); };
  }, [handleScreenshotDetected]);

  // --- MANEJO DE IMAGEN FULLSCREEN (Sin Timer) ---
  const handleOpenImage = async (msg) => {
      setFullscreenImage(msg);
      
      // Marcar visualmente como visto de inmediato
      setMessages(prev => prev.map(m => m.id === msg.id ? {...m, is_viewed: true} : m));

      // Persistir en backend
      try {
          // Asegúrate de tener la ruta POST /messages/:id/view creada en backend
          // Si no la tienes aún, esto dará 404 pero la UI funcionará igual por ahora.
          await api.post(`/messages/${msg.id}/view`, {});
      } catch (e) { console.error("Error marcando vista", e); }
  };

  const handleCloseImage = () => {
      setFullscreenImage(null);
  };

  // --- RESTO DE FUNCIONES ---
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const tempMsg = newMessage;
    setNewMessage(""); 
    setShowEmoji(false);
    try {
        await api.post("/messages", { receiver_id: chat.id, content: tempMsg, type: "text" });
        fetchMessages();
    } catch (error) { setNewMessage(tempMsg); }
  };

  const onEmojiClick = (emojiObj) => setNewMessage(prev => prev + emojiObj.emoji);

  const handleImageUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      setIsUploading(true);
      try {
          const imageUrl = await api.upload(file);
          await api.post("/messages", { receiver_id: chat.id, content: imageUrl, type: "image" });
          fetchMessages();
      } catch (error) { showToast("Error al subir", "error"); } 
      finally { setIsUploading(false); if(fileInputRef.current) fileInputRef.current.value = ""; }
  };

  const handleDeleteMessage = async (msgId) => {
    try {
        await api.delete(`/messages/${msgId}`);
        setMessages(prev => prev.filter(m => m.id !== msgId));
    } catch (e) {}
  };

  return (
    <div className="flex flex-col h-screen bg-[#0f0518] relative z-50 w-full max-w-2xl mx-auto border-x border-white/5">
      {/* HEADER */}
      <div className="px-4 py-3 flex items-center justify-between bg-[#0f0518]/90 backdrop-blur-md border-b border-white/5 sticky top-0 z-20">
         <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 -ml-2 hover:bg-white/5 rounded-full text-gray-300"><ArrowLeft size={22} /></button>
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setViewProfile(true)}>
                <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10"><img src={chat.photo || "https://via.placeholder.com/150"} alt={chat.name} className="w-full h-full object-cover" /></div>
                <div><h3 className="font-bold text-white text-sm">{chat.name}</h3><span className="text-[10px] text-green-400 font-medium">En línea</span></div>
            </div>
         </div>
         <div className="flex items-center gap-2 text-cuadralo-pink relative">
             <button className="p-2 rounded-full hover:bg-white/5"><MoreVertical size={20}/></button>
         </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 bg-[url('/bg-stars.svg')] bg-fixed bg-cover">
        {loading ? <div className="flex justify-center mt-10"><Loader2 className="animate-spin text-cuadralo-pink" /></div> : messages.map((msg) => (
            <MessageItem 
                key={msg.id} 
                msg={msg} 
                isMe={msg.sender_id === myId} 
                onDelete={handleDeleteMessage} 
                onOpenImage={handleOpenImage}
                onToggleSave={() => {}} 
            />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUTS */}
      <div className="bg-[#0f0518] border-t border-white/5 relative z-30">
          <AnimatePresence>
            {showEmoji && (<motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden"><EmojiPicker theme="dark" width="100%" height={300} onEmojiClick={onEmojiClick} searchDisabled={true} /></motion.div>)}
          </AnimatePresence>
          <form onSubmit={handleSend} className="p-3 flex items-end gap-2 pb-6 sm:pb-3">
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            <button type="button" onClick={() => fileInputRef.current.click()} disabled={isUploading} className="p-3 text-gray-400 hover:text-cuadralo-pink bg-white/5 rounded-full">{isUploading ? <Loader2 size={20} className="animate-spin" /> : <ImageIcon size={20} />}</button>
            <div className="flex-1 relative bg-white/5 border border-white/10 rounded-3xl overflow-hidden focus-within:border-cuadralo-pink/50 transition-colors">
                <input type="text" placeholder="Escribe un mensaje..." className="w-full bg-transparent py-3 pl-4 pr-10 text-white text-sm focus:outline-none" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
                <button type="button" onClick={() => setShowEmoji(!showEmoji)} className="absolute right-3 top-3 text-gray-500 hover:text-yellow-400"><Smile size={20} /></button>
            </div>
            <button type="submit" disabled={!newMessage.trim()} className="p-3 bg-cuadralo-pink rounded-full text-white hover:bg-purple-600 shadow-lg"><Send size={20} className="-ml-0.5 mt-0.5" /></button>
          </form>
      </div>
      
      {/* MODAL FULLSCREEN "VER UNA VEZ" (SIN LIMIT) */}
      <AnimatePresence>
          {fullscreenImage && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center"
              >
                  {/* Imagen */}
                  <div className="relative w-full h-full flex items-center justify-center p-2">
                      <img 
                        src={fullscreenImage.content} 
                        alt="Secreto" 
                        className="max-w-full max-h-full object-contain pointer-events-none select-none"
                        style={{ userSelect: "none" }}
                      />
                  </div>

                  {/* Aviso de seguridad */}
                  <div className="absolute bottom-10 bg-black/50 backdrop-blur-md text-white text-xs px-4 py-2 rounded-full flex items-center gap-2">
                      <AlertTriangle size={14} className="text-yellow-400" />
                      Capturas serán notificadas
                  </div>

                  {/* Botón Cerrar (Ahora más importante porque es la única forma de salir) */}
                  <button onClick={handleCloseImage} className="absolute top-6 right-6 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 backdrop-blur-md z-50">
                      <XIcon size={24} />
                  </button>
              </motion.div>
          )}
      </AnimatePresence>
      
      <AnimatePresence>{viewProfile && <ProfileDetailsModal profile={chat} onClose={() => setViewProfile(false)} />}</AnimatePresence>
    </div>
  );
}