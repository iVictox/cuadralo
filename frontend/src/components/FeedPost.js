"use client";

import { useState } from "react";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";

export default function FeedPost({ post }) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);

  const handleLike = () => {
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
  };

  return (
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
        <MoreHorizontal className="text-gray-400 cursor-pointer" />
      </div>

      {/* Imagen */}
      <div className="relative w-full aspect-[4/5] bg-gray-900 overflow-hidden" onDoubleClick={handleLike}>
         <img src={post.postImg} className="w-full h-full object-cover" />
         
         {/* Animación corazón al dar like */}
         {liked && (
            <motion.div 
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1.2 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
                <Heart size={100} className="text-white fill-white drop-shadow-2xl" />
            </motion.div>
         )}
      </div>

      {/* Acciones */}
      <div className="px-4 pt-4">
        <div className="flex justify-between mb-3">
            <div className="flex gap-4">
                <button onClick={handleLike} className="hover:scale-110 transition-transform">
                    <Heart size={26} className={liked ? "text-red-500 fill-red-500" : "text-white"} />
                </button>
                <MessageCircle size={26} className="text-white hover:text-gray-300 cursor-pointer" />
                <Send size={26} className="text-white hover:text-gray-300 cursor-pointer -rotate-12" />
            </div>
            <Bookmark size={26} className="text-white hover:text-gray-300 cursor-pointer" />
        </div>

        {/* Likes y Caption */}
        <p className="font-bold text-sm mb-1">{likesCount} Me gusta</p>
        <p className="text-sm text-gray-200">
            <span className="font-bold text-white mr-2">{post.userName}</span>
            {post.caption}
        </p>
        <p className="text-xs text-gray-500 mt-1 uppercase">Hace {post.time}</p>
      </div>
    </div>
  );
}