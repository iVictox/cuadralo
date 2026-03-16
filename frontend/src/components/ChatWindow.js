"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    ArrowLeft, Send, MoreVertical, Image as ImageIcon, Smile, 
    Loader2, Trash2, Bookmark, Clock, Copy, MoreHorizontal, Check, CheckCheck, Eye, EyeOff, AlertTriangle, X as XIcon, MessageCircle
} from "lucide-react";
import { api } from "@/utils/api";
import { useToast } from "@/context/ToastContext";
import ProfileDetailsModal from "@/components/ProfileDetailsModal";
import CheckoutModal from "@/components/CheckoutModal"; 

// --- SUB-COMPONENTE: FOTO "VER UNA VEZ" ---
const SecretImageMessage = ({ msg, isMe, onOpen, isViewed }) => {
    return (
        <div className="p-1">
            {isMe ? (
                <div className="relative group cursor-pointer overflow-hidden rounded-xl">
                    <img src={msg.content} alt="Foto enviada" className="w-full max-w-[280px] object-cover opacity-50 blur-sm" />
                    <div className="absolute inset-0 flex items-center justify-center">
                         <span className="text-[10px] font-black uppercase bg-black/60 px-2 py-1 rounded text-white tracking-widest">Foto efímera</span>
                    </div>
                </div>
            ) : (
                <button 
                    onClick={() => !isViewed && onOpen(msg)}
                    disabled={isViewed}
                    className={`w-[200px] h-[250px] rounded-2xl flex flex-col items-center justify-center gap-3 transition-all ${
                        isViewed ? "bg-black/5 dark:bg-gray-800 opacity-50" : "bg-cuadralo-pink/10 hover:bg-cuadralo-pink/20"
                    }`}
                >
                    <div className={`p-4 rounded-full ${isViewed ? "opacity-30" : "bg-cuadralo-pink text-white shadow-lg shadow-cuadralo-pink/20 animate-pulse"}`}>
                        {isViewed ? <EyeOff size={32} /> : <Eye size={32} />}
                    </div>
                    <span className={`text-xs font-black uppercase tracking-widest ${isViewed ? "opacity-40" : "text-cuadralo-pink"}`}>
                        {isViewed ? "Abierto" : "Ver Foto"}
                    </span>
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
            return `${minutes}m`;
        };
        setTimeLeft(calculateTime());
        const timer = setInterval(() => setTimeLeft(calculateTime()), 60000);
        return () => clearInterval(timer);
    }, [msg.expires_at]);
    
    if (msg.type === "screenshot_alert") {
        return (
            <div className="flex justify-center my-6">
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-full px-4 py-1.5 flex items-center gap-2 text-yellow-600 dark:text-yellow-500 text-[10px] font-black uppercase tracking-widest shadow-sm">
                    <AlertTriangle size={12} />
                    {msg.content}
                </div>
            </div>
        );
    }

    const MenuDropdown = ({ align }) => (
        <>
            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className={`absolute bottom-10 ${align === 'right' ? 'right-0' : 'left-0'} w-48 bg-cuadralo-cardLight dark:bg-[#1a0b2e] border border-black/5 dark:border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden text-[11px] font-bold`}
            >
                <div className="px-4 py-3 opacity-50 border-b border-black/5 dark:border-white/5 flex items-center gap-2 italic">
                    <Clock size={12} /> {msg.saved ? "Guardado" : `Expira en ${timeLeft}`}
                </div>
                <button onClick={() => { onToggleSave(msg); setShowMenu(false); }} className="w-full text-left px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2 uppercase tracking-widest">
                    <Bookmark size={14} className={msg.saved ? "fill-cuadralo-pink text-cuadralo-pink" : ""} />
                    {msg.saved ? "Desguardar" : "Guardar"}
                </button>
                {isMe && (
                    <button onClick={() => { onDelete(msg.id); setShowMenu(false); }} className="w-full text-left px-4 py-3 hover:bg-red-500/10 flex items-center gap-2 text-red-500 uppercase tracking-widest border-t border-black/5 dark:border-white/5">
                        <Trash2 size={14} /> Eliminar
                    </button>
                )}
            </motion.div>
        </>
    );

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex w-full mb-5 items-end gap-2 group ${isMe ? "justify-end" : "justify-start"}`}>
            {isMe && <div className="relative"><button onClick={() => setShowMenu(!showMenu)} className="p-2 opacity-0 group-hover:opacity-100 transition-opacity"><MoreHorizontal size={16} /></button><AnimatePresence>{showMenu && <MenuDropdown align="right" />}</AnimatePresence></div>}
            <div className={`relative max-w-[75%] rounded-[20px] shadow-sm overflow-hidden ${isMe ? "bg-gradient-to-br from-cuadralo-pink to-purple-600 text-white rounded-br-none shadow-cuadralo-pink/20" : "bg-white dark:bg-[#2a2a2a] text-cuadralo-textLight dark:text-gray-100 border border-black/5 dark:border-white/5 rounded-bl-none shadow-black/5"}`}>
                {msg.type === "image" ? <SecretImageMessage msg={msg} isMe={isMe} isViewed={msg.is_viewed} onOpen={onOpenImage} /> : <div className="px-4 py-3 text-sm leading-relaxed break-words font-medium">{msg.content}</div>}
                <div className={`flex items-center justify-end gap-1.5 px-3 pb-2 text-[9px] font-black uppercase ${isMe ? "opacity-70" : "opacity-40"}`}>
                    <span>{new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    {isMe && (<span>{msg.is_read ? <CheckCheck size={12} className="text-blue-200" /> : <Check size={12} />}</span>)}
                </div>
            </div>
            {!isMe && <div className="relative"><button onClick={() => setShowMenu(!showMenu)} className="p-2 opacity-0 group-hover:opacity-100 transition-opacity"><MoreHorizontal size={16} /></button><AnimatePresence>{showMenu && <MenuDropdown align="left" />}</AnimatePresence></div>}
        </motion.div>
    );
};

export default function ChatWindow({ chat, onBack }) {
  const { showToast } = useToast();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [myId, setMyId] = useState(null);
  
  const [rompehielosCount, setRompehielosCount] = useState(0);
  const [showCheckout, setShowCheckout] = useState(false);

  const [viewProfile, setViewProfile] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(null); 
  const scrollContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  const rompehieloProduct = {
      id: "rompehielos_5",
      name: "Pack x5 Rompehielos",
      desc: "Mensajes directos sin límite",
      price: 3.99,
      type: "consumable"
  };

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) setMyId(JSON.parse(userStr).id);
    fetchMyPlan();
  }, []);

  const fetchMyPlan = async () => {
      try {
          const res = await api.get("/premium/status");
          setRompehielosCount(res.rompehielos_count || 0);
      } catch(e) {}
  };

  const fetchMessages = async () => {
    try {
        const data = await api.get(`/messages/${chat.id}`);
        setMessages(data);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
  }, [chat.id]);

  // Hacer scroll automático al último mensaje
  useEffect(() => {
      if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    const msg = newMessage;
    setNewMessage("");
    
    try {
        await api.post("/messages", { receiver_id: chat.id, content: msg, type: "text" });
        fetchMessages();
        
        if (chat.isDirect) {
            setRompehielosCount(prev => prev > 0 ? prev - 1 : 0);
        }
    } catch (error) { 
        setNewMessage(msg); 
        if (error.needs_purchase) {
            setShowCheckout(true);
        } else {
            showToast("Error enviando mensaje", "error");
        }
    }
  };

  const handleImageUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      setIsUploading(true);
      try {
          const imageUrl = await api.upload(file);
          await api.post("/messages", { receiver_id: chat.id, content: imageUrl, type: "image" });
          fetchMessages();
          if (chat.isDirect) setRompehielosCount(prev => prev > 0 ? prev - 1 : 0);
      } catch (error) { 
          if (error.needs_purchase) {
              setShowCheckout(true);
          } else {
              showToast("Error subiendo imagen", "error");
          }
      } 
      finally { setIsUploading(false); }
  };

  return (
    <>
        {/* ✅ CAMBIO CLAVE: h-[100dvh] md:h-full y overflow-hidden para bloquear los saltos del navegador */}
        <div className="flex flex-col h-[100dvh] md:h-full bg-cuadralo-bgLight dark:bg-cuadralo-bgDark relative z-50 w-full max-w-2xl mx-auto border-x border-black/5 dark:border-white/5 transition-colors duration-300 overflow-hidden">
        
        {/* HEADER: shrink-0 ancla la cabecera */}
        <div className="px-4 py-4 flex items-center justify-between bg-cuadralo-bgLight/90 dark:bg-cuadralo-bgDark/90 backdrop-blur-md border-b border-black/5 dark:border-white/5 z-20 shrink-0">
            <div className="flex items-center gap-3">
                <button onClick={onBack} className="p-2 -ml-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full"><ArrowLeft size={22} /></button>
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => !chat.isDirect && setViewProfile(true)}>
                    <div className="w-10 h-10 rounded-2xl overflow-hidden border border-black/5 dark:border-white/10 shadow-sm"><img src={chat.photo || "https://via.placeholder.com/150"} className="w-full h-full object-cover" /></div>
                    <div>
                        <h3 className="font-black text-sm">{chat.name}</h3>
                        <span className="text-[9px] uppercase font-black tracking-widest text-green-500">Online</span>
                    </div>
                </div>
            </div>
            
            {chat.isDirect && (
                <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-0.5">Tus Rompehielos</span>
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-sm ${rompehielosCount > 0 ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500'}`}>
                        <MessageCircle size={14} fill="currentColor" /> {rompehielosCount}
                    </div>
                </div>
            )}
        </div>

        {chat.isDirect && (
            <div className="bg-blue-500/10 border-b border-blue-500/20 p-3 text-center text-blue-500 font-bold text-xs shrink-0">
                ¡Estás en modo directo! Se consumirá 1 Rompehielos por mensaje.
            </div>
        )}

        {/* MESSAGES: flex-1 permite que esta sea la única zona que haga scroll interno */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
            {loading ? <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-cuadralo-pink border-t-transparent animate-spin rounded-full"/></div> : messages.map((msg) => (
                <MessageItem key={msg.id} msg={msg} isMe={msg.sender_id === myId} onDelete={() => {}} onOpenImage={setFullscreenImage} onToggleSave={() => {}} />
            ))}
        </div>

        {/* ✅ ZONA DE INPUT: shrink-0 y mt-auto la clavan absolutamente al fondo de la pantalla real */}
        <div className="bg-cuadralo-bgLight dark:bg-cuadralo-bgDark border-t border-black/5 dark:border-white/5 p-3 pb-6 md:pb-4 transition-colors relative z-20 shrink-0 mt-auto">
            
            {chat.isDirect && rompehielosCount <= 0 && (
                <div className="absolute inset-0 z-10 bg-cuadralo-bgLight/80 dark:bg-[#1a0b2e]/80 backdrop-blur-sm flex items-center justify-center border-t border-white/5">
                    <button onClick={() => setShowCheckout(true)} className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-black uppercase tracking-widest text-xs px-6 py-3 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                        <MessageCircle size={16} /> Comprar Rompehielos
                    </button>
                </div>
            )}

            <form onSubmit={handleSend} className="flex items-center gap-2 max-w-3xl mx-auto">
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                <button type="button" onClick={() => fileInputRef.current.click()} disabled={isUploading} className="p-3 bg-black/5 dark:bg-white/5 rounded-2xl text-cuadralo-textMutedLight dark:text-gray-400 hover:text-cuadralo-pink transition-all shrink-0">
                    {isUploading ? <Loader2 size={20} className="animate-spin" /> : <ImageIcon size={20} />}
                </button>
                <div className="flex-1 relative bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-cuadralo-pink/20 transition-all">
                    <input 
                        type="text" 
                        placeholder="Escribe..." 
                        className="w-full bg-transparent py-3.5 px-5 text-sm outline-none font-medium" 
                        value={newMessage} 
                        onChange={(e) => setNewMessage(e.target.value)} 
                    />
                </div>
                <button type="submit" disabled={!newMessage.trim()} className="p-3.5 bg-cuadralo-pink rounded-2xl text-white shadow-lg shadow-cuadralo-pink/20 hover:scale-105 active:scale-95 transition-all shrink-0">
                    <Send size={20} />
                </button>
            </form>
        </div>
        
        <AnimatePresence>{fullscreenImage && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[60] bg-black flex items-center justify-center p-4"><img src={fullscreenImage.content} className="max-w-full max-h-full object-contain" /><button onClick={() => setFullscreenImage(null)} className="absolute top-6 right-6 p-3 bg-white/10 rounded-full text-white"><XIcon size={24} /></button></motion.div>}</AnimatePresence>
        <AnimatePresence>{viewProfile && !chat.isDirect && <ProfileDetailsModal profile={chat} onClose={() => setViewProfile(false)} />}</AnimatePresence>
        </div>

        <AnimatePresence>
            {showCheckout && (
                <CheckoutModal 
                    product={rompehieloProduct} 
                    onClose={() => {
                        setShowCheckout(false);
                        fetchMyPlan(); 
                    }} 
                />
            )}
        </AnimatePresence>
    </>
  );
}