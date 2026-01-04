"use client";

import { useState } from "react";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CommentsModal from "./CommentsModal"; // Importamos el modal

export default function FeedPost({ post }) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [showComments, setShowComments] = useState(false); // Estado para el modal

  const handleLike = () => {
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
  };

  const handleShare = async () => {
    // Usamos la API nativa de compartir si está disponible (móviles)
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Cuadralo Social',
                text: `Mira la foto de ${post.userName} en Cuadralo!`,
                url: window.location.href,
            });
        } catch (error) {
            console.log('Error compartiendo', error);
        }
    } else {
        // Fallback para PC
        alert("Enlace copiado al portapapeles 📋");
    }
  };

  return (
    <>
        <div className="w-full max-w-lg mx-auto bg-black/40 backdrop-blur-md border-b border-white/5 pb-6 mb-6">
            {/* Header del Post */}
            <div className="flex justify-between items-center px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cuadralo-pink to-purple-600 p-[2px]">
                        <img src={post.userImg} className="w-full h-full rounded-full object-cover border border-black" />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm text-white">{post.userName}</h4>
                        <p className="text-xs text-gray-400">{post.location}</p>
                    </div>
                </div>
                <MoreHorizontal className="text-gray-400 cursor-pointer hover:text-white" />
            </div>

            {/* Imagen (Doble click Like) */}
            <div className="relative w-full aspect-[4/5] bg-gray-900 overflow-hidden cursor-pointer" onDoubleClick={handleLike}>
                <img src={post.postImg} className="w-full h-full object-cover" />
                
                {/* Animación corazón gigante */}
                <AnimatePresence>
                    {liked && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1.2 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        >
                            <Heart size={100} className="text-white fill-white drop-shadow-2xl" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Acciones */}
            <div className="px-4 pt-4">
                <div className="flex justify-between mb-3">
                    <div className="flex gap-5">
                        {/* Like */}
                        <button onClick={handleLike} className="hover:scale-110 transition-transform active:scale-90">
                            <Heart size={26} className={liked ? "text-red-500 fill-red-500" : "text-white"} />
                        </button>
                        
                        {/* Comentarios */}
                        <button onClick={() => setShowComments(true)} className="hover:scale-110 transition-transform hover:text-gray-300">
                            <MessageCircle size={26} className="text-white" />
                        </button>
                        
                        {/* Compartir */}
                        <button onClick={handleShare} className="hover:scale-110 transition-transform hover:text-gray-300">
                            <Send size={26} className="text-white -rotate-12 mb-1" />
                        </button>
                    </div>
                    
                    <button className="hover:scale-110 transition-transform">
                        <Bookmark size={26} className="text-white hover:text-gray-300" />
                    </button>
                </div>

                {/* Likes y Caption */}
                <p className="font-bold text-sm mb-1">{likesCount} Me gusta</p>
                <div className="text-sm text-gray-200">
                    <span className="font-bold text-white mr-2">{post.userName}</span>
                    {post.caption}
                </div>
                
                {/* Botón ver comentarios */}
                <button onClick={() => setShowComments(true)} className="text-xs text-gray-500 mt-1 mb-1 hover:text-gray-300">
                    Ver los 3 comentarios
                </button>
                
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">Hace {post.time}</p>
            </div>
        </div>

        {/* Modal de Comentarios */}
        <AnimatePresence>
            {showComments && (
                <CommentsModal onClose={() => setShowComments(false)} postAuthor={post.userName} />
            )}
        </AnimatePresence>
    </>
  );
}