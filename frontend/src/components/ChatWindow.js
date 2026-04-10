"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Send, Image as ImageIcon, Camera, Phone, Video, Info,
  MoreVertical, Check, CheckCheck, X, Clock, ShieldAlert,
  Download, Copy, Forward, Shield, User, ImageOff, Lock, Bookmark,
  Flag // ✅ IMPORTANTE
} from "lucide-react";
import { useSocket } from "@/context/SocketContext";
import { api } from "@/utils/api";
import ReportModal from "./ReportModal"; // ✅ IMPORTANTE

// Componente para el mensaje individual
const MessageItem = ({ msg, isMe, onDelete, onToggleSave, onReport }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isSystemAlert = msg.type === "screenshot_alert";
  const isImage = msg.type === "image";
  const isImageExpired = isImage && !msg.saved && new Date(msg.expires_at) < new Date();
  
  if (isSystemAlert) {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] sm:text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full flex items-center gap-2">
          <ShieldAlert size={14} />
          {msg.content}
        </div>
      </div>
    );
  }

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusIcon = () => {
    if (!isMe) return null;
    if (msg.is_read) return <CheckCheck size={14} className="text-blue-500" />;
    return <Check size={14} className="text-gray-400" />;
  };

  const MessageContent = () => {
    if (isImage) {
      if (isImageExpired) {
        return (
          <div className="flex flex-col items-center justify-center p-4 bg-black/20 rounded-xl gap-2 w-48 h-48 border border-white/5">
            <ImageOff size={32} className="text-gray-500" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest text-center">Foto Expirada</span>
          </div>
        );
      }

      return (
        <div className="relative group cursor-pointer" onDoubleClick={() => onToggleSave(msg)}>
          <img src={msg.content} alt="Media" className="w-48 sm:w-64 rounded-xl object-cover shadow-sm border border-white/5" />
          {!msg.saved && (
            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1 text-[10px] text-white font-bold tracking-widest">
              <Clock size={10} /> 24H
            </div>
          )}
          {msg.saved && (
            <div className="absolute top-2 right-2 bg-blue-500/80 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1 text-[10px] text-white font-bold tracking-widest shadow-lg">
              <Bookmark size={10} /> GUARDADA
            </div>
          )}
        </div>
      );
    }

    return <p className="text-sm sm:text-[15px] leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>;
  };

  // Menú Contextual
  const MenuDropdown = () => (
    <AnimatePresence>
      {showMenu && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`absolute z-20 w-40 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl overflow-hidden py-1 ${isMe ? 'right-0 top-full mt-1' : 'left-0 top-full mt-1'}`}
        >
          {isMe && (
            <button onClick={() => { onDelete(msg.id); setShowMenu(false); }} className="w-full text-left px-4 py-3 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2 text-red-500 text-xs font-bold uppercase tracking-widest transition-colors">
              <Trash2 size={14} /> Eliminar
            </button>
          )}
          {isImage && !isImageExpired && (
            <button onClick={() => { onToggleSave(msg); setShowMenu(false); }} className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2 text-gray-700 dark:text-gray-300 text-xs font-bold uppercase tracking-widest transition-colors">
              <Bookmark size={14} /> {msg.saved ? 'Desguardar' : 'Guardar'}
            </button>
          )}
          
          {/* ✅ NUEVO: Botón de Reporte para mensajes recibidos */}
          {!isMe && (
            <button onClick={() => { onReport(msg); setShowMenu(false); }} className="w-full text-left px-4 py-3 hover:bg-orange-500/10 flex items-center gap-2 text-orange-500 text-xs font-bold uppercase tracking-widest border-t border-black/5 dark:border-white/5 transition-colors">
                <Flag size={14} /> Reportar
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex mb-4 relative ${isMe ? 'justify-end' : 'justify-start'}`}
      ref={menuRef}
    >
      <div className={`group flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] sm:max-w-[75%]`}>
        <div className="flex items-center gap-2">
          {!isMe && (
            <button onClick={() => setShowMenu(!showMenu)} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical size={16} />
            </button>
          )}
          
          <div className={`relative px-4 py-2.5 shadow-sm ${
            isMe 
              ? 'bg-cuadralo-pink text-white rounded-2xl rounded-tr-sm' 
              : 'bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white border border-gray-100 dark:border-gray-800 rounded-2xl rounded-tl-sm'
          }`}>
            <MessageContent />
          </div>

          {isMe && (
            <button onClick={() => setShowMenu(!showMenu)} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical size={16} />
            </button>
          )}
        </div>

        <div className={`flex items-center gap-1.5 mt-1 px-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-[10px] text-gray-500 font-medium">
            {formatTime(msg.created_at)}
          </span>
          {getStatusIcon()}
          {msg.saved && <Bookmark size={10} className="text-blue-500" />}
        </div>
      </div>
      <MenuDropdown />
    </motion.div>
  );
};


export default function ChatWindow({ user, onClose }) {
  const { socket, connected } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // ✅ Estado para el modal de reporte
  const [reportingMsg, setReportingMsg] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await api.get(`/messages/${user.id}`);
        setMessages(data || []);
        
        const unreadIds = data.filter(m => !m.is_read && m.sender_id === user.id).map(m => m.id);
        if (unreadIds.length > 0 && socket) {
          unreadIds.forEach(id => {
            socket.send(JSON.stringify({
              type: "mark_read",
              payload: { message_id: id }
            }));
            api.post(`/messages/${id}/view`);
          });
          
          setMessages(prev => prev.map(m => 
            unreadIds.includes(m.id) ? { ...m, is_read: true } : m
          ));
        }

      } catch (error) {
        console.error("Error cargando mensajes:", error);
      } finally {
        setLoading(false);
        scrollToBottom();
      }
    };

    fetchMessages();
  }, [user.id, socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "new_message") {
        const msg = data.payload;
        if (msg.sender_id === user.id || msg.receiver_id === user.id) {
          setMessages(prev => {
            if (prev.find(m => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          
          if (msg.sender_id === user.id) {
            socket.send(JSON.stringify({
              type: "mark_read",
              payload: { message_id: msg.id }
            }));
            api.post(`/messages/${msg.id}/view`);
          }
        }
      } else if (data.type === "message_read") {
        setMessages(prev => prev.map(m => 
          m.id === data.payload.message_id ? { ...m, is_read: true } : m
        ));
      }
    };

    socket.addEventListener("message", handleMessage);
    return () => socket.removeEventListener("message", handleMessage);
  }, [socket, user.id]);

  const handleSendText = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || uploading) return;

    const msgContent = newMessage;
    setNewMessage("");

    try {
      const res = await api.post("/messages", {
        receiver_id: user.id,
        content: msgContent,
        type: "text"
      });
      setMessages(prev => [...prev, res]);
    } catch (error) {
      console.error("Error enviando mensaje:", error);
      setNewMessage(msgContent); 
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const imageUrl = await api.upload(file);
      const res = await api.post("/messages", {
        receiver_id: user.id,
        content: imageUrl,
        type: "image"
      });
      setMessages(prev => [...prev, res]);
    } catch (error) {
      console.error("Error subiendo imagen:", error);
      alert("Error enviando imagen. Intenta de nuevo.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteMessage = async (msgId) => {
    try {
      await api.delete(`/messages/${msgId}`);
      setMessages(prev => prev.filter(m => m.id !== msgId));
    } catch (error) {
      console.error("Error eliminando mensaje:", error);
    }
  };

  const handleToggleSave = async (msg) => {
    try {
      const res = await api.post(`/messages/${msg.id}/toggle-save`);
      setMessages(prev => prev.map(m => 
        m.id === msg.id ? { ...m, saved: res.saved } : m
      ));
    } catch (error) {
      console.error("Error guardando mensaje:", error);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex flex-col bg-gray-50 dark:bg-[#0a0a0a] sm:p-4 md:p-6 transition-colors duration-300">
        
        {/* Header Superior */}
        <header className="bg-white/80 dark:bg-[#121212]/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between shrink-0 sm:rounded-t-3xl sm:mx-auto sm:max-w-4xl w-full z-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800 border-2 border-transparent group-hover:border-cuadralo-pink transition-colors">
                  {user.photo ? (
                    <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold uppercase">{user.username?.charAt(0)}</div>
                  )}
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-[#121212] rounded-full shadow-sm"></div>
              </div>
              
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base leading-tight group-hover:text-cuadralo-pink transition-colors">
                  {user.name}
                </h3>
                <p className="text-[10px] sm:text-xs text-gray-500 font-medium">En línea ahora</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button className="p-2 sm:p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors">
              <Phone size={20} />
            </button>
            <button className="p-2 sm:p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors">
              <Video size={20} />
            </button>
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 mx-1 hidden sm:block"></div>
            <button className="p-2 sm:p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors hidden sm:block">
              <Info size={20} />
            </button>
          </div>
        </header>

        {/* Área de Mensajes */}
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:mx-auto sm:max-w-4xl w-full relative">
          
          <div className="flex flex-col items-center justify-center py-8 mb-8">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800 mb-4 shadow-lg border-4 border-white dark:border-[#0a0a0a]">
              {user.photo ? (
                <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-2xl uppercase">{user.username?.charAt(0)}</div>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mb-1">{user.name}</h2>
            <p className="text-sm text-gray-500 mb-4">@{user.username}</p>
            <div className="bg-gray-200/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-600 dark:text-gray-400 text-xs px-4 py-2 rounded-full font-medium">
              Inicio de la conversación segura
            </div>
          </div>

          <div className="space-y-1">
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <div className="w-8 h-8 border-4 border-cuadralo-pink border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : messages.length === 0 ? (
              <p className="text-center text-gray-400 text-sm italic">Envía un mensaje para romper el hielo.</p>
            ) : (
              messages.map((msg, index) => {
                const isMe = msg.sender_id === currentUser?.id;
                const showDateMarker = index === 0 || new Date(messages[index - 1].created_at).toDateString() !== new Date(msg.created_at).toDateString();
                
                return (
                  <div key={msg.id}>
                    {showDateMarker && (
                      <div className="flex justify-center my-6">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-100 dark:bg-gray-900 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-800">
                          {new Date(msg.created_at).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    )}
                    <MessageItem 
                      msg={msg} 
                      isMe={isMe} 
                      onDelete={handleDeleteMessage}
                      onToggleSave={handleToggleSave}
                      onReport={setReportingMsg} // ✅ Pasar la función de reporte
                    />
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Bottom Bar */}
        <div className="bg-white/80 dark:bg-[#121212]/80 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 p-3 sm:p-4 shrink-0 sm:rounded-b-3xl sm:mx-auto sm:max-w-4xl w-full pb-safe">
          <form onSubmit={handleSendText} className="flex items-end gap-2 max-w-3xl mx-auto">
            
            <button 
              type="button" 
              onClick={() => fileInputRef.current.click()}
              disabled={uploading}
              className="p-3.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors disabled:opacity-50 shrink-0"
            >
              <ImageIcon size={20} />
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload}
                accept="image/*" 
                className="hidden" 
              />
            </button>
            
            <button 
              type="button"
              className="p-3.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors hidden sm:block shrink-0"
            >
              <Camera size={20} />
            </button>

            <div className="flex-1 bg-gray-100 dark:bg-[#1a1a1a] rounded-3xl border border-gray-200 dark:border-gray-800 flex items-center px-4 py-1 focus-within:ring-2 focus-within:ring-cuadralo-pink/20 focus-within:border-cuadralo-pink transition-all min-h-[52px]">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Mensaje..."
                className="w-full bg-transparent text-gray-900 dark:text-white text-[15px] focus:outline-none resize-none max-h-32 custom-scrollbar py-3"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendText(e);
                  }
                }}
              />
            </div>

            {newMessage.trim() || uploading ? (
              <button 
                type="submit" 
                disabled={uploading}
                className="p-3.5 rounded-full bg-cuadralo-pink text-white hover:scale-105 active:scale-95 transition-all shadow-md shrink-0 flex items-center justify-center disabled:opacity-50"
              >
                {uploading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Send size={20} className="translate-x-0.5 -translate-y-0.5" />
                )}
              </button>
            ) : (
              <div className="p-3.5 w-[52px]"></div> 
            )}
          </form>
        </div>

      </div>

      {/* ✅ INYECCIÓN DEL MODAL UNIVERSAL DE REPORTES */}
      <AnimatePresence>
          {reportingMsg && (
              <ReportModal 
                 targetType="message" 
                 targetId={reportingMsg.id} 
                 onClose={() => setReportingMsg(null)} 
              />
          )}
      </AnimatePresence>
    </>
  );
}