"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { X, Send, Loader2, Trash2, Heart } from "lucide-react";
import { api } from "@/utils/api";
import { useConfirm } from "@/context/ConfirmContext";
import { useToast } from "@/context/ToastContext";

export default function CommentsModal({ onClose, postId, postAuthor, postOwnerId }) {
  const { confirm } = useConfirm();
  const { showToast } = useToast();
  const inputRef = useRef(null);
  
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  const [replyingTo, setReplyingTo] = useState(null); 

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) setCurrentUser(JSON.parse(userStr));

    const fetchComments = async () => {
        try {
            const data = await api.get(`/social/posts/${postId}/comments`);
            setComments(data);
        } catch (error) { console.error(error); } 
        finally { setLoading(false); }
    };
    fetchComments();
  }, [postId]);

  const handleSubmit = async (e) => {
      e.preventDefault();
      if (!newComment.trim()) return;
      setSending(true);

      const payload = { 
          content: newComment,
          parent_id: replyingTo ? replyingTo.id : null 
      };

      try {
          const res = await api.post(`/social/posts/${postId}/comments`, payload);
          // Inicializamos los valores para que no falle el renderizado
          const commentWithUser = { ...res, user: currentUser, replies: [], likes_count: 0, is_liked: false }; 

          if (replyingTo) {
              setComments(prev => prev.map(c => 
                  c.id === replyingTo.id ? { ...c, replies: [...(c.replies || []), commentWithUser] } : c
              ));
          } else {
              setComments([...comments, commentWithUser]);
          }

          setNewComment("");
          setReplyingTo(null); 
      } catch (error) { console.error(error); }
      finally { setSending(false); }
  };

  const handleDelete = async (commentId, parentId = null) => {
      const ok = await confirm({ title: "¿Borrar comentario?", message: "No podrás deshacerlo.", confirmText: "Borrar", variant: "danger" });
      if (!ok) return;

      try {
          await api.delete(`/social/comments/${commentId}`);
          
          if (parentId) {
              setComments(prev => prev.map(c => 
                  c.id === parentId ? { ...c, replies: c.replies.filter(r => r.id !== commentId) } : c
              ));
          } else {
              setComments(prev => prev.filter(c => c.id !== commentId));
          }
          showToast("Comentario eliminado");
      } catch (error) { showToast("Error al eliminar", "error"); }
  };

  const handleLikeComment = async (commentId, currentLiked, currentCount, parentId = null) => {
      // Optimistic Update: Actualizamos UI inmediatamente
      const updateLikeState = (list) => list.map(c => {
          if (c.id === commentId) {
              return { 
                  ...c, 
                  is_liked: !currentLiked, 
                  likes_count: currentLiked ? c.likes_count - 1 : c.likes_count + 1 
              };
          }
          if (c.replies) c.replies = updateLikeState(c.replies); 
          return c;
      });

      setComments(prev => updateLikeState(prev));

      try {
          await api.post(`/social/comments/${commentId}/like`, {});
      } catch (error) {
          // Revertir si falla
          setComments(prev => updateLikeState(prev)); 
      }
  };

  const timeAgo = (dateString) => {
      const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
      if (seconds < 60) return "ahora";
      const m = Math.floor(seconds / 60); if (m < 60) return `${m}m`;
      const h = Math.floor(m / 60); if (h < 24) return `${h}h`;
      const d = Math.floor(h / 24); if (d < 7) return `${d}d`;
      return `${Math.floor(d / 7)}sem`;
  };

  // --- SUB-COMPONENTE ITEM COMENTARIO ---
  const CommentItem = ({ c, isReply = false, parentId = null }) => (
    <div className={`flex gap-3 group ${isReply ? "mt-3 ml-10" : "mt-4"}`}>
        {/* FOTO */}
        <div className="flex-shrink-0">
            <img src={c.user?.photo || "https://via.placeholder.com/40"} className={`${isReply ? "w-7 h-7" : "w-9 h-9"} rounded-full object-cover border border-white/10`} alt={c.user?.name} />
        </div>
        
        {/* CONTENIDO TEXTO */}
        <div className="flex-1 min-w-0">
            <div className="flex flex-col">
                <p className="text-[13px] text-gray-200 leading-snug break-words">
                    <span className="font-bold text-white mr-2 hover:underline cursor-pointer">{c.user?.name}</span>
                    {c.content}
                </p>
                
                {/* METADATA: Tiempo y Botones */}
                <div className="flex items-center gap-4 mt-1.5 h-4">
                    <span className="text-[10px] text-gray-500 font-medium">{timeAgo(c.created_at)}</span>
                    
                    <button 
                        onClick={() => {
                            setReplyingTo({ id: parentId || c.id, user: c.user?.name }); 
                            inputRef.current?.focus();
                        }}
                        className="text-[10px] text-gray-500 font-bold hover:text-gray-300"
                    >
                        Responder
                    </button>
                    
                    {(currentUser?.id === c.user_id || currentUser?.id === postOwnerId) && (
                        <button onClick={() => handleDelete(c.id, parentId)} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-red-400 p-1">
                            <Trash2 size={12} />
                        </button>
                    )}
                </div>
            </div>
        </div>
        
        {/* COLUMNA LIKE (Corazón + Contador) */}
        <div className="flex flex-col items-center gap-0.5 pt-1 w-8">
            <button 
                onClick={() => handleLikeComment(c.id, c.is_liked, c.likes_count, parentId)}
                className="text-gray-500 hover:text-red-500 transition-colors p-1"
            >
                <Heart size={14} className={c.is_liked ? "fill-red-500 text-red-500" : ""} />
            </button>
            {/* Contador siempre visible si es > 0, o espacio vacío para mantener alineación */}
            {c.likes_count > 0 && (
                <span className="text-[10px] text-gray-500 font-medium">
                    {c.likes_count}
                </span>
            )}
        </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div 
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-md bg-[#1a0b2e] border-t sm:border border-white/10 rounded-t-3xl sm:rounded-3xl h-[75vh] flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-center p-4 border-b border-white/5 relative">
            <h3 className="text-white font-bold text-sm">Comentarios</h3>
            <button onClick={onClose} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-white/5 rounded-full"><X size={20} className="text-gray-400" /></button>
        </div>

        {/* Lista Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 pt-0 no-scrollbar">
            {loading ? (
                <div className="flex justify-center mt-10"><Loader2 className="animate-spin text-cuadralo-pink" /></div>
            ) : comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm gap-3 opacity-60 mt-10">
                    <MessageCircle size={40} />
                    <p>Sé el primero en comentar.</p>
                </div>
            ) : (
                comments.map((c) => (
                    <div key={c.id}>
                        {/* Comentario Principal */}
                        <CommentItem c={c} />
                        
                        {/* Respuestas */}
                        {c.replies && c.replies.map(reply => (
                             <CommentItem key={reply.id} c={reply} isReply={true} parentId={c.id} />
                        ))}
                    </div>
                ))
            )}
        </div>

        {/* Input */}
        <div className="bg-[#0f0518] border-t border-white/5 p-3 pb-6 sm:pb-3">
            {replyingTo && (
                <div className="flex justify-between items-center bg-white/5 px-3 py-1.5 mb-2 rounded-lg border border-white/5">
                    <span className="text-xs text-gray-400">Respondiendo a <span className="text-white font-bold">{replyingTo.user}</span></span>
                    <button onClick={() => setReplyingTo(null)} className="p-1 hover:bg-white/10 rounded-full"><X size={14} className="text-gray-500" /></button>
                </div>
            )}
            <form onSubmit={handleSubmit} className="flex items-center gap-3">
                <img src={currentUser?.photo || "https://via.placeholder.com/40"} className="w-9 h-9 rounded-full border border-white/10 object-cover" alt="Me" />
                <div className="flex-1 bg-white/5 rounded-full flex items-center pr-2 border border-transparent focus-within:border-white/10 transition-colors">
                    <input 
                        ref={inputRef}
                        type="text" 
                        placeholder={replyingTo ? `Responde a ${replyingTo.user}...` : `Comenta como ${currentUser?.name || 'usuario'}...`}
                        className="flex-1 bg-transparent px-4 py-2.5 text-sm text-white focus:outline-none placeholder-gray-500"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                    />
                    <button 
                        disabled={!newComment.trim() || sending} 
                        className="text-cuadralo-pink p-2 rounded-full hover:bg-white/5 disabled:opacity-50 disabled:hover:bg-transparent transition-all"
                    >
                        {sending ? <Loader2 size={18} className="animate-spin"/> : <Send size={18} className={newComment.trim() ? "fill-cuadralo-pink" : ""} />}
                    </button>
                </div>
            </form>
        </div>
      </motion.div>
    </div>
  );
}