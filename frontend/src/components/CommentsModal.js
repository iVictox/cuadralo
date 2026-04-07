"use client";

import { useState, useEffect, useRef } from "react";
import { X, Send, Trash2, Loader2, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/utils/api";
import { useToast } from "@/context/ToastContext";
import { useConfirm } from "@/context/ConfirmContext";

export default function CommentsModal({ onClose, post }) {
  const postId = post?.id;
  const postAuthor = post?.user?.name;
  const postOwnerId = post?.user?.id;
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  const [replyingTo, setReplyingTo] = useState(null); 
  const [visibleReplyCounts, setVisibleReplyCounts] = useState({});

  const commentsEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) setCurrentUser(JSON.parse(userStr));

    const fetchComments = async () => {
        try {
            const data = await api.get(`/social/posts/${postId}/comments`);
            setComments(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error comments", error);
            showToast("Error al cargar comentarios", "error");
        } finally {
            setLoading(false);
        }
    };
    
    if (postId) fetchComments();
  }, [postId]);

  useEffect(() => {
      if (!replyingTo && !loading) {
          commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
  }, [comments, loading]);

  const handleSend = async () => {
      if (!newComment.trim()) return;
      setSending(true);

      try {
          const payload = { content: newComment };
          if (replyingTo) payload.parent_id = Number(replyingTo.id);

          const comment = await api.post(`/social/posts/${postId}/comments`, payload);
          
          // ✅ SOLUCIÓN: Aseguramos que el parent_id esté inyectado y atado correctamente 
          // a la respuesta para que React lo coloque en el árbol instantáneamente.
          const newCommentObj = {
              ...comment,
              parent_id: payload.parent_id || comment.parent_id,
              user: comment.user || currentUser 
          };

          setComments([...comments, newCommentObj]);
          setNewComment("");
          setReplyingTo(null); 
          
          if (payload.parent_id) {
              setVisibleReplyCounts(prev => ({ 
                  ...prev, 
                  [payload.parent_id]: (prev[payload.parent_id] || 2) + 1 
              }));
          }

      } catch (error) {
          showToast("Error al enviar", "error");
      } finally {
          setSending(false);
      }
  };

  const handleDelete = async (commentId) => {
      const ok = await confirm({ title: "¿Borrar comentario?", message: "Se borrarán también las respuestas.", confirmText: "Borrar", variant: "danger" });
      if (!ok) return;

      try {
          await api.delete(`/social/comments/${commentId}`);
          setComments(comments.filter(c => c.id !== commentId && c.parent_id !== commentId));
          showToast("Eliminado", "success");
      } catch (error) { showToast("Error al eliminar", "error"); }
  };

  const handleLikeComment = async (commentId) => {
      setComments(prev => prev.map(c => {
          if (c.id === commentId) {
              const isLiking = !c.is_liked;
              return { ...c, is_liked: isLiking, likes_count: isLiking ? (c.likes_count||0)+1 : (c.likes_count||0)-1 };
          }
          return c;
      }));
      try { await api.post(`/social/comments/${commentId}/like`, {}); } catch (e) { }
  };

  const handleStartReply = (comment) => {
      const parentId = comment.parent_id || comment.id;
      setReplyingTo({ id: parentId, username: comment.user?.name });
      inputRef.current?.focus();
  };

  const handleShowMore = (parentId) => {
      setVisibleReplyCounts(prev => ({
          ...prev,
          [parentId]: (prev[parentId] || 2) + 5
      }));
  };

  const CommentItem = ({ c, isReply = false }) => (
      <div className={`flex gap-3 group items-start ${isReply ? "mt-3" : "mt-4"}`}>
          <img src={c.user?.photo || "https://via.placeholder.com/150"} className="w-8 h-8 rounded-full object-cover border border-white/10 mt-1" alt="User" />
          <div className="flex-1">
              <div className="bg-white/5 p-3 rounded-2xl inline-block min-w-[120px]">
                  <span className="text-xs font-bold text-white block mb-0.5">{c.user?.name}</span>
                  <p className="text-sm text-gray-200 break-words whitespace-pre-wrap">{c.content}</p>
              </div>
              
              <div className="flex items-center gap-4 mt-1 ml-1">
                  <span className="text-[10px] text-gray-500">{new Date(c.created_at).toLocaleDateString()}</span>
                  <button onClick={() => handleStartReply(c)} className="text-[10px] font-bold text-gray-400 hover:text-white transition-colors">Responder</button>
                  {(currentUser?.id === c.user_id || currentUser?.id === postOwnerId) && (
                      <button onClick={() => handleDelete(c.id)} className="text-[10px] text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={10} /></button>
                  )}
              </div>
          </div>
          
          <div className="flex flex-col items-center gap-0.5 mt-2">
              <button onClick={() => handleLikeComment(c.id)} className="active:scale-90 transition-transform">
                  <Heart size={14} className={c.is_liked ? "text-red-500 fill-red-500" : "text-gray-500"} />
              </button>
              {(c.likes_count > 0) && <span className="text-[9px] text-gray-400">{c.likes_count}</span>}
          </div>
      </div>
  );

  const rootComments = comments.filter(c => !c.parent_id);
  const getReplies = (parentId) => comments.filter(c => c.parent_id === parentId);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end md:justify-center items-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
        
        <motion.div 
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full h-[85vh] md:h-[650px] md:max-w-4xl lg:max-w-5xl bg-[#1a0b2e] md:bg-transparent border-t md:border-0 border-white/10 md:rounded-3xl flex flex-col md:flex-row shadow-2xl relative overflow-hidden"
        >
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-black/70 md:hidden"
            >
                <X size={20} />
            </button>

            {/* Left Column: Post Preview (Hidden on small mobile if you want, or kept stacked. Let's keep it stacked but mostly for md+) */}
            <div className="hidden md:flex w-[50%] lg:w-[55%] bg-black relative flex-col items-center justify-center">
                <img
                    src={post?.image_url}
                    alt="Post"
                    className="w-full h-full object-contain"
                />
            </div>

            {/* Right Column: Comments Section */}
            <div className="w-full md:w-[50%] lg:w-[45%] h-full bg-[#1a0b2e] flex flex-col border-l border-white/10 relative">
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#0f0518]">
                    <div className="flex items-center gap-3">
                        <img src={post?.user?.photo || "https://via.placeholder.com/150"} alt={postAuthor} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                        <div>
                            <h3 className="text-white font-bold text-sm">{postAuthor}</h3>
                            {post?.caption && <p className="text-xs text-gray-300 line-clamp-1">{post.caption}</p>}
                        </div>
                    </div>
                    <button onClick={onClose} className="hidden md:block p-2 bg-white/5 rounded-full text-white hover:bg-white/10"><X size={20} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
                {loading ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-cuadralo-pink" /></div> : 
                 comments.length === 0 ? <div className="text-center text-gray-500 py-10 text-sm">Sé el primero en comentar 👇</div> : (
                    rootComments.map((root) => {
                        const replies = getReplies(root.id);
                        const currentLimit = visibleReplyCounts[root.id] || 2; 
                        const visibleReplies = replies.slice(0, currentLimit);
                        const remaining = replies.length - visibleReplies.length;
                        const nextBatchSize = Math.min(5, remaining);

                        return (
                            <div key={root.id} className="mb-4">
                                <CommentItem c={root} />
                                {replies.length > 0 && (
                                    <div className="ml-12 border-l-2 border-white/5 pl-4">
                                        {visibleReplies.map(reply => (
                                            <CommentItem key={reply.id} c={reply} isReply={true} />
                                        ))}
                                        {remaining > 0 && (
                                            <button 
                                                onClick={() => handleShowMore(root.id)}
                                                className="mt-3 text-xs text-gray-400 hover:text-white flex items-center gap-2 font-bold transition-colors"
                                            >
                                                <div className="w-6 h-[1px] bg-gray-600"></div>
                                                Ver {nextBatchSize} respuestas más
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
                <div ref={commentsEndRef} />
            </div>

            <div className="bg-[#0f0518] border-t border-white/10">
                {replyingTo && (
                    <div className="px-4 py-2 bg-white/5 flex justify-between items-center text-xs text-gray-300">
                        <span>Respondiendo a <span className="text-cuadralo-pink font-bold">@{replyingTo.username}</span></span>
                        <button onClick={() => setReplyingTo(null)}><X size={14}/></button>
                    </div>
                )}
                
                <div className="p-3 flex gap-2 items-center">
                    <img src={currentUser?.photo} className="w-8 h-8 rounded-full object-cover border border-white/10" />
                    <div className="flex-1 relative">
                        <input 
                            ref={inputRef}
                            type="text" 
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={replyingTo ? `Responde a ${replyingTo.username}...` : "Agrega un comentario..."}
                            className="w-full bg-[#1a0b2e] text-white text-sm rounded-full pl-4 pr-10 py-2.5 border border-white/10 focus:border-cuadralo-pink focus:outline-none"
                        />
                        <button 
                            onClick={handleSend}
                            disabled={!newComment.trim() || sending}
                            className="absolute right-1 top-1 p-1.5 bg-cuadralo-pink rounded-full text-white disabled:opacity-50 hover:scale-105 transition-transform"
                        >
                            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        </button>
                    </div>
                </div>
            </div>
            </div>
        </motion.div>
    </div>
  );
}