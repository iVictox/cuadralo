"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Send, Heart } from "lucide-react";

export default function CommentsModal({ onClose, postAuthor }) {
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([
    { id: 1, user: "Sofia", text: "¡Qué fotaza amiga! 😍", time: "2h", likes: 4 },
    { id: 2, user: "Carlos", text: "El lugar se ve increíble 📍", time: "1h", likes: 1 },
    { id: 3, user: "Andrea", text: "Tenemos que ir!!!", time: "30m", likes: 0 },
  ]);

  const handleSend = () => {
    if (!newComment.trim()) return;
    
    // Agregamos el comentario (simulado)
    const comment = {
        id: Date.now(),
        user: "Tú",
        text: newComment,
        time: "Ahora",
        likes: 0
    };
    
    setComments([...comments, comment]);
    setNewComment("");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md h-[75vh] bg-[#1a1a1a] rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden border-t border-white/10 shadow-2xl"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-white/5 bg-[#202020]">
            <div className="w-8" /> {/* Espaciador */}
            <h3 className="font-bold text-white text-sm">Comentarios</h3>
            <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-white">
                <X size={20} />
            </button>
        </div>

        {/* Lista de Comentarios */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Caption Original */}
            <div className="flex gap-3 mb-6 pb-6 border-b border-white/5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cuadralo-pink to-purple-600 p-[1.5px] shrink-0">
                    <img src="https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=150" className="w-full h-full rounded-full object-cover bg-black" />
                </div>
                <div>
                    <p className="text-sm text-white">
                        <span className="font-bold mr-2">{postAuthor}</span>
                        Disfrutando del día ✨
                    </p>
                    <p className="text-xs text-gray-500 mt-1">2h</p>
                </div>
            </div>

            {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-700 shrink-0 overflow-hidden">
                        <img src={`https://ui-avatars.com/api/?name=${comment.user}&background=random`} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm text-gray-200">
                            <span className="font-bold text-white mr-2">{comment.user}</span>
                            {comment.text}
                        </p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 font-medium">
                            <span>{comment.time}</span>
                            <button className="hover:text-gray-300">Responder</button>
                        </div>
                    </div>
                    <button className="self-center p-1 text-gray-500 hover:text-red-500 transition-colors flex flex-col items-center">
                        <Heart size={14} />
                        {comment.likes > 0 && <span className="text-[10px] mt-0.5">{comment.likes}</span>}
                    </button>
                </div>
            ))}
        </div>

        {/* Input Fijo */}
        <div className="p-3 bg-[#202020] border-t border-white/5 flex gap-2 items-center">
            <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden shrink-0">
                <img src="https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 bg-[#111] rounded-full flex items-center px-4 py-2 border border-white/5 focus-within:border-gray-500 transition-colors">
                <input 
                    type="text" 
                    placeholder={`Comenta como ${postAuthor}...`}
                    className="bg-transparent border-none outline-none text-white text-sm w-full placeholder-gray-500"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button 
                    onClick={handleSend}
                    disabled={!newComment.trim()}
                    className="text-cuadralo-pink font-bold text-sm ml-2 disabled:opacity-50 hover:scale-110 transition-transform"
                >
                    Publicar
                </button>
            </div>
        </div>

      </motion.div>
    </motion.div>
  );
}