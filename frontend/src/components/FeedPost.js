"use client";

import { useState } from "react";
import { Heart, MessageCircle, MoreVertical, Flag, Trash2, Share2 } from "lucide-react";
import { api } from "@/utils/api";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import CommentsModal from "./CommentsModal";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function FeedPost({ post, onDelete, onViewStory, isModal = false }) {
  const router = useRouter();
  const [liked, setLiked] = useState(post.is_liked);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [commentsCount, setCommentsCount] = useState(post.comments_count || 0);
  
  const [showMenu, setShowMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);
  
  const userStr = typeof window !== 'undefined' ? localStorage.getItem("user") : null;
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const isMyPost = currentUser && currentUser.id === post.user.id;

  // Estado de historia
  const hasStory = post.user?.has_story;
  const hasUnseen = post.user?.has_unseen_story;
  
  // Color del anillo
  const ringClass = hasStory 
    ? (hasUnseen ? "bg-gradient-to-tr from-yellow-400 via-cuadralo-pink to-purple-600" : "bg-gray-600")
    : "bg-transparent";

  // --- NAVEGACIÓN ---
  const handleAvatarClick = (e) => {
      e.stopPropagation();
      if (hasStory) {
          onViewStory(post.user.id);
      } else {
          router.push(`/u/${post.user.username}`);
      }
  };

  const handleNameClick = (e) => {
      e.stopPropagation();
      router.push(`/u/${post.user.username}`);
  };

  const handleLike = async () => {
    const prevLiked = liked;
    const prevCount = likesCount;

    setLiked(!liked);
    setLikesCount(prev => prev + (liked ? -1 : 1));

    try {
        await api.post(`/social/posts/${post.id}/like`);
    } catch (error) {
        setLiked(prevLiked);
        setLikesCount(prevCount);
    }
  };

  const handleShare = async () => {
    const shareData = {
        title: `Post de ${post.user?.name}`,
        text: post.description || 'Mira esta publicación en Cuadralo',
        url: window.location.href,
    };
    if (navigator.share) {
        try { await navigator.share(shareData); } catch (err) {}
    } else {
        navigator.clipboard.writeText(window.location.href);
        alert("Enlace copiado al portapapeles");
    }
  };

  const handleDelete = async () => {
      if (!confirm("¿Seguro que quieres eliminar este post?")) return;
      try {
          await api.delete(`/social/posts/${post.id}`);
          if (onDelete) onDelete();
      } catch (e) {
          alert("Error al eliminar");
      }
  };

  const handleReport = async () => {
      try {
          await api.post(`/social/posts/${post.id}/report`);
          alert("Publicación reportada. Gracias.");
          setShowMenu(false);
      } catch (e) {}
  };

  return (
    <>
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300"
        >
            
            {/* HEADER DEL POST */}
            <div className="flex justify-between items-center p-3">
                <div className="flex items-center gap-3">
                    
                    <div 
                        className={`relative p-[2px] rounded-full ${ringClass} cursor-pointer`}
                        onClick={handleAvatarClick}
                    >
                        <img 
                            src={post.user?.photo || "https://via.placeholder.com/150"} 
                            alt={post.user?.name} 
                            className="w-9 h-9 rounded-full object-cover ring-2 ring-black bg-black"
                        />
                    </div>

                    <div className="cursor-pointer group" onClick={handleNameClick}>
                        <h4 className="text-white font-bold text-sm group-hover:text-cuadralo-pink transition-colors">
                            {post.user?.name}
                        </h4>
                        <p className="text-gray-500 text-[10px] uppercase tracking-wide">
                            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: es })}
                        </p>
                    </div>
                </div>

                <div className="relative">
                    {/* ✅ CORRECCIÓN: Botón visible pero desplazado si es modal */}
                    <button 
                        onClick={() => setShowMenu(!showMenu)} 
                        className={`text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors ${isModal ? "mr-12" : ""}`}
                    >
                        <MoreVertical size={20} />
                    </button>

                    {showMenu && (
                        <div className="absolute right-0 top-8 w-40 bg-[#1a0b2e] border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden py-1">
                            {isMyPost ? (
                                <button onClick={handleDelete} className="w-full text-left px-4 py-3 text-red-400 hover:bg-white/5 text-sm flex items-center gap-2">
                                    <Trash2 size={16} /> Eliminar
                                </button>
                            ) : (
                                <button onClick={handleReport} className="w-full text-left px-4 py-3 text-yellow-500 hover:bg-white/5 text-sm flex items-center gap-2">
                                    <Flag size={16} /> Reportar
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* IMAGEN DEL POST */}
            <div className="relative w-full group overflow-hidden bg-black">
                <img 
                    src={post.image_url} 
                    alt="Post content" 
                    onDoubleClick={handleLike}
                    className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out cursor-pointer"
                    loading="lazy"
                />
            </div>

            {/* ACCIONES Y DESCRIPCIÓN */}
            <div className="p-3">
                <div className="flex gap-4 mb-2 items-center">
                    <button onClick={handleLike} className="focus:outline-none">
                        <motion.div
                            whileTap={{ scale: 0.8 }}
                            animate={liked ? { scale: [1, 1.4, 1], rotate: [0, 15, -15, 0] } : { scale: 1, rotate: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            <Heart 
                                size={28} 
                                className={`transition-colors duration-300 ${liked ? "fill-red-500 text-red-500" : "text-white hover:text-red-400"}`} 
                                strokeWidth={2} 
                            />
                        </motion.div>
                    </button>

                    <button 
                        onClick={() => setShowComments(true)} 
                        className="text-white hover:text-cuadralo-pink transition-all hover:scale-110"
                    >
                        <MessageCircle size={28} strokeWidth={2} />
                    </button>
                    
                    <button 
                        onClick={handleShare}
                        className="text-white hover:text-blue-400 transition-all hover:scale-110 ml-auto"
                        title="Compartir"
                    >
                        <Share2 size={26} strokeWidth={2} />
                    </button>
                </div>

                <div className="font-bold text-white text-sm mb-1 ml-1">
                    {likesCount} Me gusta
                </div>

                {post.description && (
                    <p className="text-gray-300 text-sm leading-relaxed ml-1 break-words">
                        <span 
                            className="font-bold text-white mr-2 cursor-pointer hover:underline"
                            onClick={handleNameClick}
                        >
                            {post.user?.name}
                        </span>
                        {post.description}
                    </p>
                )}

                <button 
                    onClick={() => setShowComments(true)} 
                    className="text-gray-500 text-xs mt-2 ml-1 hover:text-gray-300 transition-colors"
                >
                    {commentsCount > 0 
                        ? `Ver los ${commentsCount} comentarios...` 
                        : "Añadir un comentario..."
                    }
                </button>
            </div>
        </motion.div>

        {showComments && (
            <CommentsModal 
                postId={post.id} 
                onClose={() => setShowComments(false)} 
            />
        )}
    </>
  );
}