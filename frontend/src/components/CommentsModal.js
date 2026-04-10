"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Heart, Trash2, Reply, CornerDownRight, MoreVertical, Flag, MessageSquare } from "lucide-react"; // ✅ FIX: Importamos MessageSquare correctamente
import { api } from "@/utils/api";
import ReportModal from "./ReportModal";

export default function CommentsModal({ postId, onClose }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null); // ✅ FIX: Corregido el nombre a setReplyingTo
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  
  const [reportingComment, setReportingComment] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) setCurrentUser(JSON.parse(userStr));
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const data = await api.get(`/social/posts/${postId}/comments`);
      setComments(data || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const payload = { content: newComment };
      if (replyingTo) {
        payload.parent_id = replyingTo.id;
      }
      
      await api.post(`/social/posts/${postId}/comments`, payload);
      setNewComment("");
      setReplyingTo(null); // ✅ FIX
      fetchComments();
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  const handleDelete = async (commentId) => {
    if (!confirm("¿Eliminar este comentario?")) return;
    try {
      await api.delete(`/social/comments/${commentId}`);
      fetchComments();
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleLike = async (commentId) => {
    try {
      const res = await api.post(`/social/comments/${commentId}/like`);
      setComments(prev => prev.map(c => {
        if (c.id === commentId) {
          return {
            ...c,
            is_liked: res.is_liked,
            likes_count: res.is_liked ? c.likes_count + 1 : c.likes_count - 1
          };
        }
        return c;
      }));
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const rootComments = comments.filter(c => !c.parent_id);
  const replies = comments.filter(c => c.parent_id);

  const CommentItem = ({ c, isReply = false }) => (
    <div className={`flex gap-3 group ${isReply ? 'ml-8 mt-2' : 'mt-4'}`}>
      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden shrink-0">
        {c.user?.photo ? (
          <img src={c.user.photo} alt={c.user.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold text-xs uppercase">
            {c.user?.username?.charAt(0)}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="bg-gray-100 dark:bg-[#1a1a1a] rounded-2xl rounded-tl-none px-4 py-2 inline-block max-w-full">
          <span className="font-bold text-sm text-gray-900 dark:text-white mr-2">@{c.user?.username}</span>
          <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words inline">{c.content}</p>
        </div>
        <div className="flex items-center gap-4 mt-1 ml-2">
          <span className="text-[10px] text-gray-500 font-medium">
            {new Date(c.created_at).toLocaleDateString()}
          </span>
          <button 
            onClick={() => handleLike(c.id)}
            className={`text-[10px] font-bold flex items-center gap-1 transition-colors ${c.is_liked ? 'text-cuadralo-pink' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            {c.likes_count > 0 && c.likes_count} Me gusta
          </button>
          {!isReply && (
            <button 
              onClick={() => setReplyingTo(c)} // ✅ FIX
              className="text-[10px] font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Responder
            </button>
          )}
          {currentUser?.id === c.user_id ? (
             <button 
                onClick={() => handleDelete(c.id)}
                className="text-[10px] text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
             >
                Eliminar
             </button>
          ) : (
             <button 
                onClick={() => setReportingComment(c)} 
                className="text-[10px] text-orange-400 hover:text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
             >
                <Flag size={10} /> Reportar
             </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm sm:backdrop-blur-md transition-all duration-300">
        <motion.div
          initial={{ opacity: 0, y: "100%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="w-full max-w-lg bg-white dark:bg-[#0a0a0a] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col h-[85vh] sm:h-[80vh] overflow-hidden border border-gray-200 dark:border-gray-800"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-10">
            <h3 className="font-black text-lg text-gray-900 dark:text-white flex items-center gap-2">
              Comentarios <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs px-2 py-0.5 rounded-full">{comments.length}</span>
            </h3>
            <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400 transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Lista de Comentarios */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50 dark:bg-[#0a0a0a]">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="w-8 h-8 border-4 border-cuadralo-pink border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : rootComments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-400 dark:text-gray-600">
                <MessageSquare size={40} className="mb-2 opacity-50" /> {/* ✅ FIX: Ícono Válido */}
                <p className="font-medium text-sm">Sé el primero en comentar</p>
              </div>
            ) : (
              <div className="pb-4">
                {rootComments.map(c => (
                  <div key={c.id}>
                    <CommentItem c={c} />
                    {replies.filter(r => r.parent_id === c.id).map(reply => (
                      <CommentItem key={reply.id} c={reply} isReply={true} />
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Formulario de Comentario */}
          <div className="p-3 bg-white dark:bg-[#0a0a0a] border-t border-gray-200 dark:border-gray-800">
            {replyingTo && (
              <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-900 px-4 py-2 rounded-xl mb-3 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 truncate">
                  <Reply size={14} className="text-cuadralo-pink shrink-0" />
                  <span className="truncate">Respondiendo a <span className="font-bold text-gray-900 dark:text-white">@{replyingTo.user?.username}</span>: "{replyingTo.content}"</span>
                </div>
                <button onClick={() => setReplyingTo(null)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white shrink-0 ml-2">
                  <X size={14} />
                </button>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="flex items-end gap-2 relative">
              <div className="flex-1 bg-gray-100 dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden relative focus-within:ring-2 focus-within:ring-cuadralo-pink/20 focus-within:border-cuadralo-pink transition-all">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={replyingTo ? "Escribe tu respuesta..." : "Añade un comentario..."}
                  className="w-full bg-transparent text-gray-900 dark:text-white text-sm px-4 py-3 focus:outline-none resize-none max-h-32 min-h-[44px] custom-scrollbar block"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
              </div>
              <button 
                type="submit" 
                disabled={!newComment.trim()}
                className="p-3 rounded-full bg-cuadralo-pink text-white disabled:opacity-50 disabled:bg-gray-300 dark:disabled:bg-gray-800 disabled:text-gray-500 hover:scale-105 active:scale-95 transition-all shrink-0 shadow-sm"
              >
                <Send size={18} className={newComment.trim() ? "translate-x-0.5 -translate-y-0.5" : ""} />
              </button>
            </form>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
          {reportingComment && (
              <ReportModal 
                 targetType="comment" 
                 targetId={reportingComment.id} 
                 onClose={() => setReportingComment(null)} 
              />
          )}
      </AnimatePresence>
    </>
  );
}