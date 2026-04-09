"use client";

import { useState } from "react";
import { Heart, MessageCircle, MoreVertical, Flag, Trash2, Share2, MapPin } from "lucide-react";
import { api } from "@/utils/api";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import CommentsModal from "./CommentsModal";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/context/ConfirmContext";
import { useToast } from "@/context/ToastContext";

export default function FeedPost({ post, onDelete, onViewStory, isModal = false }) {
  const router = useRouter();
  const { confirm } = useConfirm();
  const { showToast } = useToast();

  const [liked, setLiked] = useState(post.is_liked);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [commentsCount, setCommentsCount] = useState(post.comments_count || 0);
  
  const [showMenu, setShowMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);
  
  const userStr = typeof window !== 'undefined' ? localStorage.getItem("user") : null;
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const isMyPost = currentUser && currentUser.id === post.user.id;

  const hasStory = post.user?.has_story;
  const hasUnseen = post.user?.has_unseen_story;
  
  // Anillo de historia minimalista
  const ringClass = hasStory 
    ? (hasUnseen ? "ring-2 ring-cuadralo-pink ring-offset-2 dark:ring-offset-cuadralo-bgDark ring-offset-cuadralo-bgLight" : "ring-2 ring-gray-300 dark:ring-gray-600 ring-offset-2")
    : "";

  const handleAvatarClick = (e) => {
      e.stopPropagation();
      if (hasStory) onViewStory(post.user.id);
      else router.push(`/u/${post.user.username}`);
  };

  const handleLike = async () => {
    const prevLiked = liked;
    const prevCount = likesCount;
    setLiked(!liked);
    setLikesCount(prev => prev + (liked ? -1 : 1));
    try { await api.post(`/social/posts/${post.id}/like`); } 
    catch (error) { setLiked(prevLiked); setLikesCount(prevCount); }
  };

  const handleDeletePost = async () => {
      setShowMenu(false); 
      
      const ok = await confirm({ 
          title: "¿Eliminar publicación?", 
          message: "Esta acción no se puede deshacer y desaparecerá de tu perfil.", 
          confirmText: "Eliminar", 
          variant: "danger" 
      });

      if (ok) {
          try {
              await api.delete(`/social/posts/${post.id}`);
              showToast("Publicación eliminada", "success");
              if (onDelete) onDelete(post.id);
          } catch (error) {
              console.error(error);
              showToast("Error al eliminar la publicación", "error");
          }
      }
  };

  return (
    <>
        <div className="w-full bg-cuadralo-cardLight dark:bg-cuadralo-cardDark rounded-3xl overflow-hidden shadow-glass-light dark:shadow-glass-dark border border-gray-100 dark:border-white/5 transition-colors duration-500">
            
            {/* CABECERA */}
            <div className="flex justify-between items-center p-4">
                <div className="flex items-center gap-3">
                    <img 
                        src={post.user?.photo || "https://via.placeholder.com/150"} 
                        alt={post.user?.name} 
                        onClick={handleAvatarClick}
                        className={`w-10 h-10 rounded-full object-cover cursor-pointer ${ringClass}`}
                    />
                    <div className="cursor-pointer" onClick={() => router.push(`/u/${post.user.username}`)}>
                        <h4 className="text-cuadralo-textLight dark:text-cuadralo-textDark font-semibold text-sm hover:underline">
                            {post.user?.name}
                        </h4>
                        <p className="text-cuadralo-textMutedLight dark:text-cuadralo-textMutedDark text-xs">
                            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: es })}
                        </p>
                    </div>
                </div>

                <div className="relative">
                    <button onClick={() => setShowMenu(!showMenu)} className="text-gray-400 hover:text-cuadralo-textLight dark:hover:text-white p-2 rounded-full transition-colors">
                        <MoreVertical size={20} />
                    </button>

                    <AnimatePresence>
                        {showMenu && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                className="absolute right-0 top-10 w-40 bg-white dark:bg-[#1a0b2e] border border-gray-100 dark:border-white/10 rounded-2xl shadow-xl z-20 overflow-hidden py-2"
                            >
                                {isMyPost ? (
                                    <button onClick={handleDeletePost} className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-50 dark:hover:bg-white/5 text-sm flex items-center gap-2 transition-colors">
                                        <Trash2 size={16} /> Eliminar
                                    </button>
                                ) : (
                                    <button className="w-full text-left px-4 py-2 text-yellow-600 dark:text-yellow-500 hover:bg-gray-50 dark:hover:bg-white/5 text-sm flex items-center gap-2 transition-colors">
                                        <Flag size={16} /> Reportar
                                    </button>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* IMAGEN */}
            <div className="relative w-full aspect-square md:aspect-[4/5] bg-gray-100 dark:bg-black">
                <img 
                    src={post.image_url} 
                    alt="Post content" 
                    onDoubleClick={handleLike}
                    onClick={() => {
                        if (!window.location.pathname.includes('/post/')) {
                            router.push(`/post/${post.id}`);
                        }
                    }}
                    className="w-full h-full object-cover cursor-pointer"
                    loading="lazy"
                />
            </div>

            {/* ACCIONES Y TEXTO */}
            <div className="p-4">
                <div className="flex gap-5 mb-3 items-center">
                    <button onClick={handleLike} className="focus:outline-none">
                        <motion.div whileTap={{ scale: 0.8 }} animate={liked ? { scale: [1, 1.2, 1] } : { scale: 1 }}>
                            <Heart size={26} className={`transition-colors duration-300 ${liked ? "fill-cuadralo-pink text-cuadralo-pink" : "text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white"}`} strokeWidth={liked ? 0 : 2} />
                        </motion.div>
                    </button>

                    <button onClick={() => setShowComments(true)} className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white transition-all hover:-translate-y-0.5">
                        <MessageCircle size={26} strokeWidth={2} />
                    </button>
                    
                    <button className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white transition-all hover:-translate-y-0.5 ml-auto">
                        <Share2 size={24} strokeWidth={2} />
                    </button>
                </div>

                <div className="font-semibold text-cuadralo-textLight dark:text-cuadralo-textDark text-sm mb-2">
                    {likesCount} Me gusta
                </div>

                {/* ✅ SOLUCIÓN: Cambiamos a post.caption, que es la variable real que envía el backend */}
                {post.caption && (
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-1">
                        <span className="font-semibold text-cuadralo-textLight dark:text-cuadralo-textDark mr-2 cursor-pointer hover:underline" onClick={() => router.push(`/u/${post.user.username}`)}>
                            {post.user?.name}
                        </span>
                        {post.caption}
                    </p>
                )}

                {/* UBICACIÓN */}
                {post.location && (
                    <div className="flex items-center gap-1.5 mb-3 text-gray-500 dark:text-gray-400">
                        <MapPin size={14} />
                        <span className="text-xs font-medium">{post.location}</span>
                    </div>
                )}

                <button onClick={() => setShowComments(true)} className="text-cuadralo-textMutedLight dark:text-cuadralo-textMutedDark text-sm hover:underline mt-1">
                    {commentsCount > 0 ? `Ver los ${commentsCount} comentarios` : "Añadir un comentario..."}
                </button>
            </div>
        </div>

        {showComments && (
            <CommentsModal
                post={post}
                onClose={() => setShowComments(false)}
                liked={liked}
                likesCount={likesCount}
                onLikeToggle={handleLike}
            />
        )}
    </>
  );
}