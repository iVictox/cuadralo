"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Heart, Trash2, Reply, Flag, MoreHorizontal } from "lucide-react";
import { api } from "@/utils/api";
import ReportModal from "./ReportModal";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

// ✅ FIX CRÍTICO: Recibimos 'post' como objeto, no 'postId'
export default function CommentsModal({ post, onClose, liked, likesCount, onLikeToggle }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  
  const [reportingComment, setReportingComment] = useState(null);
  const commentsEndRef = useRef(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) setCurrentUser(JSON.parse(userStr));
    
    if (post?.id) {
        fetchComments();
    }
  }, [post]);

  const fetchComments = async () => {
    try {
      const data = await api.get(`/social/posts/${post.id}/comments`);
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
      
      await api.post(`/social/posts/${post.id}/comments`, payload);
      setNewComment("");
      setReplyingTo(null);
      fetchComments();
      
      // Auto-scroll al fondo después de comentar
      setTimeout(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error) {
      console.error("Error posting comment:", error);
      alert("No se pudo publicar el comentario.");
    }
  };

  const handleDelete = async (commentId) => {
    if (!confirm("¿Seguro que deseas eliminar este comentario?")) return;
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

  // Sub-componente visual para cada comentario
  const CommentItem = ({ c, isReply = false }) => (
    <div className={`flex gap-3 group ${isReply ? 'ml-10 mt-3' : 'mt-5'}`}>
      <div className="w-8 h-8 rounded-full bg-gray-800 overflow-hidden shrink-0 border border-gray-700">
        {c.user?.photo ? (
          <img src={c.user.photo} alt={c.user.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold text-xs uppercase">
            {c.user?.username?.charAt(0)}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-200 leading-snug">
          <span className="font-bold text-white mr-2 hover:underline cursor-pointer">@{c.user?.username}</span>
          {c.content}
        </p>
        
        <div className="flex items-center gap-4 mt-1.5">
          <span className="text-[10px] text-gray-500 font-medium">
            {formatDistanceToNow(new Date(c.created_at), { addSuffix: true, locale: es })}
          </span>
          <button 
            onClick={() => handleLike(c.id)}
            className={`text-[10px] font-bold transition-colors ${c.is_liked ? 'text-cuadralo-pink' : 'text-gray-400 hover:text-gray-200'}`}
          >
            {c.likes_count > 0 ? `${c.likes_count} Me gusta` : 'Me gusta'}
          </button>
          {!isReply && (
            <button onClick={() => setReplyingTo(c)} className="text-[10px] font-bold text-gray-400 hover:text-gray-200 transition-colors">
              Responder
            </button>
          )}

          {/* Menú de Moderación del Comentario (Eliminar / Reportar) */}
          <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-3">
             {currentUser?.id === c.user_id ? (
                 <button onClick={() => handleDelete(c.id)} className="text-[10px] text-red-500 hover:text-red-400 font-bold">
                    Eliminar
                 </button>
             ) : (
                 <button onClick={() => setReportingComment(c)} className="text-[10px] text-yellow-500 hover:text-yellow-400 flex items-center gap-1 font-bold">
                    <Flag size={10} /> Reportar
                 </button>
             )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-2 md:p-6 backdrop-blur-sm">
        {/* Botón de cerrar exterior en móviles */}
        <button onClick={onClose} className="md:hidden absolute top-4 right-4 text-white z-[60] bg-black/50 p-2 rounded-full">
            <X size={24} />
        </button>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-5xl h-[90vh] md:h-[85vh] flex flex-col md:flex-row bg-[#0a0a0a] rounded-2xl md:rounded-[2rem] overflow-hidden shadow-2xl border border-gray-800"
        >
          {/* PANEL IZQUIERDO: LA FOTO */}
          <div className="hidden md:flex md:w-[55%] bg-black relative items-center justify-center border-r border-gray-800">
             {post?.image_url && (
                 <>
                    {/* Fondo borroso para rellenar espacios */}
                    <div className="absolute inset-0 bg-cover bg-center opacity-30 blur-2xl" style={{ backgroundImage: `url(${post.image_url})` }}></div>
                    <img src={post.image_url} alt="Post" className="max-w-full max-h-full object-contain relative z-10" />
                 </>
             )}
          </div>

          {/* PANEL DERECHO: COMENTARIOS */}
          <div className="flex flex-col w-full md:w-[45%] h-full bg-[#0a0a0a]">
            
            {/* Cabecera */}
            <div className="px-5 py-4 border-b border-gray-800 flex justify-between items-center bg-[#0a0a0a] shrink-0">
               <div className="flex items-center gap-3">
                   <img src={post?.user?.photo || "https://via.placeholder.com/150"} className="w-8 h-8 rounded-full object-cover border border-gray-700" />
                   <span className="font-bold text-white text-sm">@{post?.user?.username}</span>
               </div>
               <button onClick={onClose} className="hidden md:flex text-gray-400 hover:text-white transition-colors">
                  <X size={20} />
               </button>
            </div>

            {/* Zona de Comentarios (Scroll) */}
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                {/* Descripción original del post */}
                {post?.caption && (
                    <div className="flex gap-3 mb-6 pb-6 border-b border-gray-800/50">
                        <img src={post?.user?.photo || "https://via.placeholder.com/150"} className="w-8 h-8 rounded-full object-cover shrink-0 border border-gray-700" />
                        <div>
                            <p className="text-sm text-gray-200">
                                <span className="font-bold text-white mr-2">@{post?.user?.username}</span>
                                {post.caption}
                            </p>
                            <span className="text-[10px] text-gray-500 mt-1 block">
                                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: es })}
                            </span>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center py-10">
                        <div className="w-6 h-6 border-2 border-cuadralo-pink border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : rootComments.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                        <p className="text-sm font-medium">Aún no hay comentarios.</p>
                        <p className="text-xs mt-1">Inicia la conversación.</p>
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
                        <div ref={commentsEndRef} />
                    </div>
                )}
            </div>

            {/* Acciones de Post y Formulario de Comentario */}
            <div className="bg-[#0a0a0a] border-t border-gray-800 shrink-0">
                {/* Interacciones del Post principal */}
                <div className="px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={onLikeToggle} className="focus:outline-none">
                            <Heart size={24} className={`transition-colors duration-300 ${liked ? "fill-cuadralo-pink text-cuadralo-pink" : "text-gray-300 hover:text-white"}`} strokeWidth={liked ? 0 : 2} />
                        </button>
                    </div>
                    <span className="text-xs font-bold text-white">{likesCount} Me gusta</span>
                </div>

                {/* Formulario */}
                <div className="px-5 pb-5">
                    {replyingTo && (
                        <div className="flex justify-between items-center bg-gray-900 px-4 py-2 rounded-t-xl border-x border-t border-gray-800">
                            <div className="flex items-center gap-2 text-xs text-gray-400 truncate">
                            <Reply size={14} className="text-cuadralo-pink shrink-0" />
                            <span className="truncate">Respondiendo a <span className="font-bold text-white">@{replyingTo.user?.username}</span></span>
                            </div>
                            <button onClick={() => setReplyingTo(null)} className="text-gray-500 hover:text-white">
                            <X size={14} />
                            </button>
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="flex items-center gap-3 relative">
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Añade un comentario..."
                            className={`w-full bg-transparent text-white text-sm px-4 py-3 focus:outline-none border border-gray-800 focus:border-gray-600 transition-colors ${replyingTo ? 'rounded-b-xl border-t-0' : 'rounded-full'}`}
                        />
                        <button 
                            type="submit" 
                            disabled={!newComment.trim()}
                            className="font-bold text-sm text-cuadralo-pink hover:text-pink-400 disabled:opacity-50 disabled:text-gray-600 transition-colors"
                        >
                            Publicar
                        </button>
                    </form>
                </div>
            </div>

          </div>
        </motion.div>
      </div>

      {/* ✅ MODAL DE REPORTE INDEPENDIENTE */}
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