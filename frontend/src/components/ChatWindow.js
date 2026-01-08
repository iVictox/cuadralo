"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    ArrowLeft, Send, Phone, Video, MoreVertical, Image as ImageIcon, Smile, 
    Ban, Flag, Loader2, Trash2, Bookmark, Clock, Copy, MoreHorizontal, Check, CheckCheck, Eye, EyeOff, AlertTriangle, X as XIcon, ArrowDown
} from "lucide-react";
import EmojiPicker from 'emoji-picker-react';
import { api } from "@/utils/api";
import { useToast } from "@/context/ToastContext";
import { useConfirm } from "@/context/ConfirmContext"; // <--- NUEVO IMPORT
import ProfileDetailsModal from "@/components/ProfileDetailsModal";

// --- SUB-COMPONENTE: FOTO "VER UNA VEZ" ---
const SecretImageMessage = ({ msg, isMe, onOpen, isViewed }) => {
    return (
        <div className="p-1">
            {isMe ? (
                <div className="relative group cursor-pointer overflow-hidden rounded-xl">
                    <img src={msg.content} alt="Foto enviada" className="w-full max-w-[280px] object-cover opacity-50 blur-sm" />
                    <div className="absolute inset-0 flex items-center justify-center">
                         <span className="text-xs font-bold bg-black/50 px-2 py-1 rounded text-white">Foto efímera enviada</span>
                    </div>
                </div>
            ) : (
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
const MessageItem = ({ msg, isMe, onDelete, onOpenImage, onToggleSave }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        const calculateTime = () => {
            const expires = new Date(msg.expires_at).getTime();
            const now = new Date().getTime();
            const diff = expires - now;
            if (diff <= 0) return "Expirado";
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            if (hours > 0) return `${hours}h ${minutes}m`;
            return `${minutes}m restantes`;
        };
        setTimeLeft(calculateTime());
        const timer = setInterval(() => setTimeLeft(calculateTime()), 60000);
        return () => clearInterval(timer);
    }, [msg.expires_at]);
    
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

    const MenuDropdown = ({ align }) => (
        <>
            <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setShowMenu(false); }} />
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className={`absolute bottom-8 ${align === 'right' ? 'right-0' : 'left-0'} w-48 bg-[#1a0b2e] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden text-xs`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-3 py-2 text-gray-400 border-b border-white/5 flex items-center gap-2 mb-1">
                    <Clock size={12} /> {msg.saved ? "Guardado (No expira)" : timeLeft}
                </div>
                
                <button onClick={() => { onToggleSave(msg); setShowMenu(false); }} className="w-full text-left px-3 py-2 hover:bg-white/5 flex items-center gap-2 text-gray-200">
                    <Bookmark size={14} className={msg.saved ? "fill-yellow-400 text-yellow-400" : ""} />
                    {msg.saved ? "Desguardar" : "Guardar"}
                </button>
                
                {msg.type === 'text' && (
                    <button onClick={() => { navigator.clipboard.writeText(msg.content); setShowMenu(false); }} className="w-full text-left px-3 py-2 hover:bg-white/5 flex items-center gap-2 text-gray-200">
                        <Copy size={14} /> Copiar texto
                    </button>
                )}

                <div className="h-px bg-white/5 my-1" />
                
                {isMe && (
                    <button onClick={() => { onDelete(msg.id); setShowMenu(false); }} className="w-full text-left px-3 py-2 hover:bg-red-500/10 flex items-center gap-2 text-red-400">
                        <Trash2 size={14} /> Eliminar
                    </button>
                )}
            </motion.div>
        </>
    );

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`flex w-full mb-4 items-end gap-2 group ${isMe ? "justify-end" : "justify-start"}`}
        >
            {isMe && (
                <div className="relative">
                    <button onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }} className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><MoreHorizontal size={16} /></button>
                    <AnimatePresence>{showMenu && <MenuDropdown align="right" />}</AnimatePresence>
                </div>
            )}

            <div className={`relative max-w-[75%] rounded-2xl shadow-sm overflow-hidden ${isMe ? "bg-gradient-to-br from-cuadralo-pink to-purple-600 text-white rounded-br-none" : "bg-[#2a2a2a]/90 backdrop-blur-sm text-gray-100 border border-white/5 rounded-bl-none"}`}>
                {msg.type === "image" ? (
                    <SecretImageMessage msg={msg} isMe={isMe} isViewed={msg.is_viewed} onOpen={onOpenImage} />
                ) : (
                    <div className="px-4 py-2.5 text-[15px] leading-relaxed break-words">{msg.content}</div>
                )}
                <div className={`flex items-center justify-end gap-1.5 px-3 pb-1.5 text-[10px] ${isMe ? "text-blue-100/80" : "text-gray-400"}`}>
                    {msg.saved && <Bookmark size={10} className="fill-current" />}
                    <span>{new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    {isMe && (<span>{msg.is_read ? <CheckCheck size={14} className="text-blue-200" /> : <Check size={14} className="text-white/60" />}</span>)}
                </div>
            </div>

            {!isMe && (
                 <div className="relative">
                 <button onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }} className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><MoreHorizontal size={16} /></button>
                 <AnimatePresence>{showMenu && <MenuDropdown align="left" />}</AnimatePresence>
             </div>
            )}
        </motion.div>
    );
};

// --- COMPONENTE PRINCIPAL ---
export default function ChatWindow({ chat, onBack }) {
  const { showToast } = useToast();
  const { confirm } = useConfirm(); // <--- INYECTAMOS EL HOOK
  
  const [messages, setMessages] = useState([]);
  const messagesRef = useRef([]); 
  
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [myId, setMyId] = useState(null);
  
  const [showEmoji, setShowEmoji] = useState(false);
  const [viewProfile, setViewProfile] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(null); 
  
  const scrollContainerRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const isUserNearBottom = useRef(true); 

  const prevMessagesLength = useRef(0);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) setMyId(JSON.parse(userStr).id);
  }, []);

  const fetchMessages = async () => {
    try {
        const data = await api.get(`/messages/${chat.id}`);
        const current = messagesRef.current;
        const isDifferent = 
            data.length !== current.length || 
            (data.length > 0 && data[data.length - 1].id !== current[current.length - 1]?.id) ||
            (data.length > 0 && JSON.stringify(data) !== JSON.stringify(current));

        if (isDifferent) {
            setMessages(data);
            messagesRef.current = data;
        }
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [chat.id]);

  useEffect(() => {
    if (!scrollContainerRef.current) return;
    const currentLength = messages.length;
    const prevLength = prevMessagesLength.current;
    const isNewMessage = currentLength > prevLength;
    prevMessagesLength.current = currentLength;

    if (!isNewMessage) return;

    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.sender_id === myId) {
        scrollToBottom();
    } else if (messages.length > 0 && loading) {
        scrollToBottom();
    } else if (isUserNearBottom.current) {
        scrollToBottom();
    } else {
        setShowScrollButton(true);
    }
  }, [messages, myId]); 

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        setShowScrollButton(false);
    }
  };

  const handleScroll = () => {
      if (!scrollContainerRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      const isBottom = scrollHeight - scrollTop - clientHeight < 100;
      isUserNearBottom.current = isBottom;
      if (isBottom) setShowScrollButton(false);
  };

  const handleScreenshotDetected = useCallback(async () => {
    if (fullscreenImage) {
        setFullscreenImage(null);
        showToast("📷 ¡Captura detectada!", "error");
        try {
            await api.post("/messages", { receiver_id: chat.id, content: "📸 Tomó una captura de pantalla", type: "screenshot_alert" });
            fetchMessages(); 
        } catch (e) {}
    }
  }, [fullscreenImage, chat.id]);

  useEffect(() => {
    const handleKeyUp = (e) => { if (e.key === "PrintScreen") handleScreenshotDetected(); };
    window.addEventListener("keyup", handleKeyUp);
    return () => { window.removeEventListener("keyup", handleKeyUp); };
  }, [handleScreenshotDetected]);

  const handleOpenImage = async (msg) => {
      setFullscreenImage(msg);
      setMessages(prev => prev.map(m => m.id === msg.id ? {...m, is_viewed: true} : m));
      try { await api.post(`/messages/${msg.id}/view`, {}); } catch (e) {}
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const tempMsg = newMessage;
    setNewMessage(""); 
    setShowEmoji(false);
    try {
        await api.post("/messages", { receiver_id: chat.id, content: tempMsg, type: "text" });
        fetchMessages();
        scrollToBottom(); 
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

  const handleToggleSave = async (msg) => {
    try {
        await api.post(`/messages/${msg.id}/toggle-save`, {});
        setMessages(prev => prev.map(m => m.id === msg.id ? {...m, saved: !m.saved} : m));
        showToast(msg.saved ? "Mensaje desguardado" : "Mensaje guardado ⭐");
    } catch (error) { showToast("Error al actualizar", "error"); }
  };

  const handleDeleteMessage = async (msgId) => {
    // --- NUEVO SISTEMA DE CONFIRMACIÓN ELEGANTE ---
    const isConfirmed = await confirm({
        title: "¿Eliminar mensaje?",
        message: "Este mensaje desaparecerá del chat. Esta acción no se puede deshacer.",
        confirmText: "Eliminar",
        cancelText: "Cancelar",
        variant: "danger"
    });

    if (!isConfirmed) return;

    try {
        await api.delete(`/messages/${msgId}`);
        setMessages(prev => prev.filter(m => m.id !== msgId));
        showToast("Mensaje eliminado");
    } catch (e) { showToast("Error al eliminar", "error"); }
  };

  const handleBlockUser = async () => {
    const isConfirmed = await confirm({
        title: "¿Bloquear usuario?",
        message: "Dejarás de ver este chat y el usuario desaparecerá de tus matches.",
        confirmText: "Bloquear",
        variant: "danger"
    });

    if(!isConfirmed) return;

    try {
        await api.delete(`/matches/${chat.id}`);
        showToast("Usuario bloqueado");
        onBack(); 
    } catch (error) { showToast("Error al bloquear", "error"); }
  };

  const handleReportUser = () => {
      showToast("Reporte enviado");
      // Aquí también podrías poner un confirm si quisieras
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
             <button onClick={() => setShowMenu(!showMenu)} className="p-2 rounded-full hover:bg-white/5"><MoreVertical size={20}/></button>
         </div>
      </div>

      {/* MESSAGES */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 bg-[url('/bg-stars.svg')] bg-fixed bg-cover scroll-smooth"
      >
        {loading ? <div className="flex justify-center mt-10"><Loader2 className="animate-spin text-cuadralo-pink" /></div> : messages.map((msg) => (
            <MessageItem 
                key={msg.id} 
                msg={msg} 
                isMe={msg.sender_id === myId} 
                onDelete={handleDeleteMessage} 
                onOpenImage={handleOpenImage}
                onToggleSave={handleToggleSave} 
            />
        ))}
      </div>

      {/* SCROLL DOWN BTN */}
      <AnimatePresence>
        {showScrollButton && (
            <motion.button
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                onClick={scrollToBottom}
                className="absolute bottom-24 right-6 p-3 bg-cuadralo-pink text-white rounded-full shadow-lg z-40 hover:bg-purple-600 transition-colors"
            >
                <ArrowDown size={20} className="animate-bounce" />
            </motion.button>
        )}
      </AnimatePresence>

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
      
      {/* MODAL FULLSCREEN */}
      <AnimatePresence>
          {fullscreenImage && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center"
              >
                  <div className="relative w-full h-full flex items-center justify-center p-2">
                      <img src={fullscreenImage.content} alt="Secreto" className="max-w-full max-h-full object-contain pointer-events-none select-none" style={{ userSelect: "none" }} />
                  </div>
                  <div className="absolute bottom-10 bg-black/50 backdrop-blur-md text-white text-xs px-4 py-2 rounded-full flex items-center gap-2">
                      <AlertTriangle size={14} className="text-yellow-400" /> Capturas serán notificadas
                  </div>
                  <button onClick={() => setFullscreenImage(null)} className="absolute top-6 right-6 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 backdrop-blur-md z-50"><XIcon size={24} /></button>
              </motion.div>
          )}
      </AnimatePresence>
      <AnimatePresence>{viewProfile && <ProfileDetailsModal profile={chat} onClose={() => setViewProfile(false)} />}</AnimatePresence>
    </div>
  );
}