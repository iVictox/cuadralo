"use client";

import { useState, useRef, useEffect } from "react";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Copy, Trash2, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CommentsModal from "./CommentsModal"; 
import { api } from "@/utils/api";
import { useToast } from "@/context/ToastContext";
import { useConfirm } from "@/context/ConfirmContext";

export default function FeedPost({ post, onDelete, onViewStory }) {
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  // Estados de datos
  const [liked, setLiked] = useState(post.is_liked);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [showComments, setShowComments] = useState(false);
  
  // Estados de UI/Animación
  const [showBigHeart, setShowBigHeart] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  const timerRef = useRef(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) setCurrentUser(JSON.parse(userStr));
    
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  // --- LÓGICA DE LIKE ---
  const handleLike = async () => {
    const isLikingAction = !liked;
    
    // Animación corazón gigante (Solo al dar like)
    if (isLikingAction) {
        setShowBigHeart(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setShowBigHeart(false), 1000);
    }

    // Actualización Optimista
    setLiked(isLikingAction);
    setLikesCount(prev => isLikingAction ? prev + 1 : prev - 1);

    try { 
        await api.post(`/social/posts/${post.id}/like`, {}); 
    } catch (error) { 
        // Revertir si falla
        setLiked(!isLikingAction); 
        setLikesCount(prev => !isLikingAction ? prev + 1 : prev - 1); 
    }
  };

  // --- COMPARTIR ---
  const handleShare = async () => {
    if (navigator.share) {
        try { await navigator.share({ title: 'Cuadralo', text: post.caption, url: window.location.href }); } catch (e) {}
    } else {
        handleCopyLink();
    }
  };

  // --- ACCIONES DEL MENÚ ---
  const handleCopyLink = () => {
      navigator.clipboard.writeText(`https://cuadralo.com/post/${post.id}`);
      showToast("Enlace copiado al portapapeles");
      setShowMenu(false);
  };

  const handleDeletePost = async () => {
      setShowMenu(false);
      const ok = await confirm({
          title: "¿Eliminar publicación?",
          message: "Se borrará permanentemente de tu perfil.",
          confirmText: "Eliminar",
          variant: "danger"
      });
      if (!ok) return;

      try {
          await api.delete(`/social/posts/${post.id}`);
          showToast("Publicación eliminada");
          if (onDelete) onDelete(); // Actualizar lista en el padre
      } catch (error) {
          showToast("Error al eliminar", "error");
      }
  };

  const handleReportPost = async (reason) => {
      setShowMenu(false);
      const ok = await confirm({
          title: "¿Reportar publicación?",
          message: `¿Estás seguro de reportar esto por: ${reason}?`,
          confirmText: "Reportar",
          variant: "danger"
      });
      if(!ok) return;

      try {
          await api.post(`/social/posts/${post.id}/report`, { reason });
          showToast("Reporte enviado. Gracias.");
      } catch (error) {
          showToast("Error al reportar", "error");
      }
  };

  // --- LÓGICA DE HISTORIA ---
  const handleAvatarClick = () => {
      if (post.user?.has_story && onViewStory) {
          onViewStory(); 
      }
  };

  const timeAgo = (dateString) => {
      const diff = new Date() - new Date(dateString);
      const hours = Math.floor(diff / 3600000);
      if (hours < 1) return "HACE UN MOMENTO";
      if (hours < 24) return `HACE ${hours} HORAS`;
      return new Date(dateString).toLocaleDateString();
  };

  const isMyPost = currentUser?.id === post.user_id;

  return (
    <>
        <div className="w-full max-w-lg mx-auto bg-[#1a0b2e]/50 border-t border-b border-white/5 sm:border sm:rounded-3xl overflow-hidden mb-2 relative">
            
            {/* --- HEADER --- */}
            <div className="flex justify-between items-center px-4 py-3 relative z-10">
                <div className="flex items-center gap-3">
                    {/* Avatar con borde de historia */}
                    <div className="relative cursor-pointer" onClick={handleAvatarClick}>
                        <div className={`w-10 h-10 rounded-full p-[2px] ${post.user?.has_story ? "bg-gradient-to-tr from-yellow-400 via-cuadralo-pink to-purple-600 animate-spin-slow" : "bg-transparent"}`}>
                            <div className="w-full h-full rounded-full bg-black border border-white/10 overflow-hidden relative">
                                <img src={post.user?.photo || "https://via.placeholder.com/150"} className="w-full h-full object-cover" alt={post.user?.name} />
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <h4 className="font-bold text-sm text-white leading-none hover:underline cursor-pointer">{post.user?.name}</h4>
                        <p className="text-[10px] text-gray-400 mt-0.5">{post.location}</p>
                    </div>
                </div>
                
                {/* Botón 3 Puntos */}
                <div className="relative">
                    <button onClick={() => setShowMenu(!showMenu)} className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors">
                        <MoreHorizontal size={20} />
                    </button>

                    {/* Menú Desplegable */}
                    <AnimatePresence>
                        {showMenu && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                    className="absolute right-0 top-10 w-48 bg-[#0f0518] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden text-sm"
                                >
                                    {isMyPost ? (
                                        <>
                                            <button onClick={handleDeletePost} className="w-full text-left px-4 py-3 hover:bg-red-500/10 text-red-500 flex items-center gap-2">
                                                <Trash2 size={16} /> Eliminar
                                            </button>
                                            <div className="h-px bg-white/5" />
                                            <button onClick={handleCopyLink} className="w-full text-left px-4 py-3 hover:bg-white/5 text-gray-200 flex items-center gap-2">
                                                <Copy size={16} /> Copiar enlace
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => handleReportPost("Contenido inapropiado")} className="w-full text-left px-4 py-3 hover:bg-white/5 text-red-400 flex items-center gap-2">
                                                <AlertTriangle size={16} /> Reportar
                                            </button>
                                            <div className="h-px bg-white/5" />
                                            <button onClick={handleCopyLink} className="w-full text-left px-4 py-3 hover:bg-white/5 text-gray-200 flex items-center gap-2">
                                                <Copy size={16} /> Copiar enlace
                                            </button>
                                        </>
                                    )}
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* --- IMAGEN --- */}
            <div className="relative w-full aspect-[4/5] bg-[#0f0518] cursor-pointer group" onDoubleClick={handleLike}>
                <img src={post.image_url} className="w-full h-full object-cover" alt="Post" />
                
                {/* Animación Corazón Grande */}
                <AnimatePresence>
                    {showBigHeart && (
                        <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1.2, transition: { type: 'spring', stiffness: 300, damping: 20 } }} exit={{ opacity: 0, scale: 0.8 }} className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                            <Heart size={100} className="text-white fill-white drop-shadow-[0_5px_15px_rgba(0,0,0,0.3)]" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* --- FOOTER --- */}
            <div className="px-4 py-3">
                <div className="flex justify-between items-center mb-3">
                    <div className="flex gap-5">
                        <button onClick={handleLike} className="hover:scale-110 transition-transform active:scale-90">
                            <Heart size={26} className={liked ? "text-cuadralo-pink fill-cuadralo-pink" : "text-white hover:text-gray-200"} strokeWidth={liked ? 0 : 2} />
                        </button>
                        <button onClick={() => setShowComments(true)} className="hover:scale-110 transition-transform"><MessageCircle size={26} className="text-white -rotate-90" /></button>
                        <button onClick={handleShare} className="hover:scale-110 transition-transform"><Send size={26} className="text-white -rotate-12 mb-1" /></button>
                    </div>
                    <button><Bookmark size={26} className="text-white hover:text-gray-200" /></button>
                </div>

                <p className="font-bold text-sm text-white mb-2">{likesCount} Me gusta</p>
                
                <div className="text-sm text-gray-300 leading-relaxed mb-2">
                    <span className="font-bold text-white mr-2">{post.user?.name}</span>
                    {post.caption}
                </div>
                
                <button onClick={() => setShowComments(true)} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
                    Ver comentarios
                </button>
                
                <p className="text-[10px] text-gray-600 uppercase tracking-wide mt-1">{timeAgo(post.created_at)}</p>
            </div>
        </div>

        {/* --- MODAL COMENTARIOS --- */}
        <AnimatePresence>
            {showComments && (
                <CommentsModal 
                    onClose={() => setShowComments(false)} 
                    postId={post.id} 
                    postAuthor={post.user?.name} 
                    postOwnerId={post.user_id} 
                />
            )}
        </AnimatePresence>
    </>
  );
}