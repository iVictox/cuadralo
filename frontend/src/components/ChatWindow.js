"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Send, Image as ImageIcon, X, Lock, Eye, EyeOff, Bookmark, Loader2, Crop as CropIcon, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Cropper from "react-easy-crop"; // IMPORTANTE: Instalar esta librería
import { api } from "@/utils/api";
import { useSocket } from "@/context/SocketContext";
import { getCroppedImg } from "@/utils/cropImage"; // Importar la utilidad creada

// Configuración de la animación Fade Up
const overlayVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    exit: { opacity: 0, y: 50, scale: 0.95, transition: { duration: 0.2 } }
};

export default function ChatWindow({ chat, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isViewOnce, setIsViewOnce] = useState(false);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  // --- ESTADOS PARA EL RECORTE DE IMAGEN ---
  const [imageSrc, setImageSrc] = useState(null); // URL local de la imagen seleccionada
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  // -----------------------------------------
  
  const { messages: incomingMessages, sendMessage, markViewed, toggleSave, onlineUsers } = useSocket();
  const [myId, setMyId] = useState(null);
  const isOnline = onlineUsers.has(chat.id);

  useEffect(() => {
    fetchMyId();
    loadHistory();
  }, [chat.id]);

  // Autoscroll y manejo de mensajes entrantes (Igual que antes)
  useEffect(() => {
    if (incomingMessages.length > 0) {
        const lastMsg = incomingMessages[incomingMessages.length - 1];
        if (lastMsg.sender_id === chat.id || (lastMsg.sender_id === myId && lastMsg.receiver_id === chat.id)) {
            setMessages(prev => {
                if (prev.some(m => m.ID === lastMsg.ID)) return prev;
                return [...prev, lastMsg];
            });
            scrollToBottom();
        }
    }
  }, [incomingMessages, chat.id, myId]);

  const fetchMyId = async () => { const me = await api.get("/me"); setMyId(me.id); }
  const loadHistory = async () => { try { const history = await api.get(`/messages/${chat.id}`); setMessages(history); scrollToBottom(); } catch (e) { console.error(e); } };
  const scrollToBottom = () => { setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100); };

  // Enviar texto normal
  const handleSendText = () => {
    if (!newMessage.trim()) return;
    const payload = { receiver_id: chat.id, content: newMessage, type: "text", is_view_once: false };
    sendMessage(payload);
    setNewMessage("");
  };

  // --- NUEVA LÓGICA DE SELECCIÓN DE IMAGEN ---
  const handleFileSelect = (e) => {
      if (e.target.files && e.target.files.length > 0) {
          const file = e.target.files[0];
          // Crear una URL local temporal para previsualizar
          const reader = new FileReader();
          reader.addEventListener("load", () => {
              setImageSrc(reader.result);
              setShowCropper(true); // Abrir modal de recorte
          });
          reader.readAsDataURL(file);
          // Resetear el input para poder seleccionar la misma imagen de nuevo si se cancela
          e.target.value = null; 
      }
  };

  // Callback de react-easy-crop cuando el usuario mueve/zoomea
  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
      setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // --- LÓGICA DE ENVÍO DE IMAGEN RECORTADA ---
  const handleSendCroppedImage = async () => {
      if (!croppedAreaPixels || !imageSrc) return;
      setUploading(true);

      try {
          // 1. Obtener el Blob recortado usando la utilidad
          const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
          
          // 2. Preparar FormData para subir
          const formData = new FormData();
          formData.append("file", croppedBlob, "image.jpg");

          // 3. Subir al backend (Endpoint corregido)
          const res = await api.post("/api/upload", formData);

          if (!res.url) throw new Error("La respuesta del servidor no contiene la URL de la imagen");

          // 4. Enviar mensaje vía Socket con la URL final
          const payload = {
              receiver_id: chat.id,
              content: res.url,
              type: "image",
              is_view_once: isViewOnce // Se respeta la opción seleccionada antes de abrir el cropper
          };
          sendMessage(payload);
          
          // 5. Limpieza
          closeCropper();

      } catch (err) {
          console.error("Error subiendo imagen:", err);
          alert("Error al subir la imagen. Inténtalo de nuevo.");
      } finally {
          setUploading(false);
      }
  };

  const closeCropper = () => {
      setShowCropper(false);
      setImageSrc(null);
      setCroppedAreaPixels(null);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
  };
  // -----------------------------------------

  // Funciones auxiliares (Igual que antes)
  const handleToggleSave = (msg) => {
      const newStatus = !msg.is_saved;
      setMessages(prev => prev.map(m => m.ID === msg.ID ? {...m, is_saved: newStatus} : m));
      toggleSave(msg.ID, newStatus);
  };

  const handleViewImage = (msg) => {
      if (msg.sender_id === myId) return;
      if (msg.is_view_once && !msg.is_viewed) {
          const confirmOpen = confirm("📷 Foto Efímera: ¿Ver ahora? Desaparecerá después.");
          if (confirmOpen) {
              window.open(msg.content, "_blank");
              markViewed(msg.ID);
              setMessages(prev => prev.map(m => m.ID === msg.ID ? {...m, is_viewed: true} : m));
          }
      }
  };

  return (
    <motion.div 
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 z-50 bg-black flex flex-col"
    >
      {/* HEADER */}
      <div className="flex items-center gap-3 p-4 bg-gray-900 border-b border-white/10">
        <button onClick={onClose}><X className="text-white" /></button>
        <div className="relative">
            <img src={chat.photo || "/placeholder.jpg"} className="w-10 h-10 rounded-full object-cover" />
            {isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>}
        </div>
        <div>
            <h3 className="text-white font-bold">{chat.name}</h3>
            <p className="text-xs text-gray-400">{isOnline ? "En línea" : "Desconectado"}</p>
        </div>
      </div>

      {/* MESSAGES AREA (Sin cambios significativos aquí) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black">
        {messages.map((msg, idx) => {
            const isMe = msg.sender_id === myId;
            const isText = msg.type === "text";
            return (
                <div key={idx} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className="flex flex-col gap-1 max-w-[75%]">
                        <div 
                            className={`p-3 rounded-2xl cursor-pointer transition-all border ${isMe ? "bg-cuadralo-purple text-white border-transparent" : msg.is_saved ? "bg-gray-800 border-yellow-500/50" : "bg-gray-800 border-white/5 text-gray-200"}`}
                            onClick={() => !isMe && handleToggleSave(msg)}
                        >
                            {isText && <p>{msg.content}</p>}
                            {!isText && (
                                <div className="mt-1">
                                    {msg.is_view_once ? (
                                        <div onClick={() => handleViewImage(msg)} className={`flex items-center gap-2 p-2 rounded bg-black/40 ${!msg.is_viewed && msg.sender_id !== myId ? "cursor-pointer hover:bg-white/10" : ""}`}>
                                            {msg.is_viewed || (isMe && msg.is_viewed) ? ( <> <EyeOff size={18} className="text-gray-500" /> <span className="text-gray-500 italic text-sm">Abierto</span> </> ) : ( <> <div className="w-8 h-8 rounded-full bg-cuadralo-pink flex items-center justify-center animate-pulse"> <Eye size={16} className="text-white" /> </div> <span className="text-cuadralo-pink font-bold text-sm">Foto (Ver 1 vez)</span> </> )}
                                        </div>
                                    ) : (
                                        <img src={msg.content} className="rounded-lg max-h-64 object-cover" />
                                    )}
                                </div>
                            )}
                        </div>
                        <div className={`flex items-center gap-1 text-[10px] text-gray-500 ${isMe ? "justify-end" : "justify-start"}`}>
                             {msg.is_saved && <span className="text-yellow-500 flex items-center gap-0.5"><Bookmark size={8} fill="currentColor" /> Guardado</span>}
                             <span>{new Date(msg.CreatedAt || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                    </div>
                </div>
            );
        })}
        <div ref={scrollRef} />
      </div>

      {/* INPUT AREA */}
      <div className="p-3 bg-gray-900 border-t border-white/10 flex items-center gap-2">
        <button 
            onClick={() => setIsViewOnce(!isViewOnce)} 
            className={`p-2 rounded-full transition-colors ${isViewOnce ? "bg-cuadralo-pink text-white" : "bg-gray-800 text-gray-400"}`}
            title="Enviar como 'Ver una sola vez'"
        >
            {isViewOnce ? <Lock size={20} /> : <Eye size={20} />}
        </button>

        <button onClick={() => fileInputRef.current.click()} className="p-2 bg-gray-800 text-cuadralo-purple rounded-full">
            <ImageIcon size={20} />
        </button>
        {/* Input oculto actualizado para llamar a handleFileSelect */}
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />

        <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendText()}
            placeholder={isViewOnce ? "Enviar foto efímera..." : "Escribe un mensaje..."}
            className="flex-1 bg-black/50 border border-white/10 rounded-full px-4 py-2 text-white text-sm focus:outline-none focus:border-cuadralo-purple"
        />

        <button onClick={handleSendText} className="p-2 bg-cuadralo-purple rounded-full text-white">
            <Send size={20} />
        </button>
      </div>

      {/* --- MODAL DE RECORTE DE IMAGEN (OVERLAY) --- */}
      <AnimatePresence>
          {showCropper && imageSrc && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 z-[60] bg-black flex flex-col"
              >
                 {/* Header del Cropper */}
                 <div className="flex items-center justify-between p-4 bg-black/80 z-10">
                    <button onClick={closeCropper} className="text-white p-2"><X size={24}/></button>
                    <h3 className="text-white font-bold flex items-center gap-2"><CropIcon size={20}/> Editar Imagen</h3>
                    {uploading ? (
                         <Loader2 size={24} className="text-cuadralo-purple animate-spin p-2"/>
                    ) : (
                        <button onClick={handleSendCroppedImage} className="text-cuadralo-purple p-2 font-bold flex items-center gap-1">
                            Enviar <Check size={20}/>
                        </button>
                    )}
                 </div>

                 {/* Área de Recorte */}
                 <div className="flex-1 relative bg-black">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={3 / 4} // Aspect ratio vertical estilo Snapchat/Instagram
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                        style={{
                            containerStyle: { backgroundColor: "#000" },
                            cropAreaStyle: { border: "2px solid #8A2BE2" } // Borde morado Cuadralo
                        }}
                    />
                 </div>

                 {/* Controles de Zoom (Opcional, react-easy-crop soporta pellizcar) */}
                 <div className="p-6 bg-black/80 z-10 flex justify-center">
                    <input
                        type="range"
                        value={zoom}
                        min={1}
                        max={3}
                        step={0.1}
                        aria-labelledby="Zoom"
                        onChange={(e) => setZoom(e.target.value)}
                        className="w-3/4 accent-cuadralo-purple"
                    />
                 </div>
              </motion.div>
          )}
      </AnimatePresence>

    </motion.div>
  );
}