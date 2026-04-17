"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Heart, Trash2, Reply, Flag, Share2, MessageSquare, MoreHorizontal } from "lucide-react";
import { api } from "@/utils/api";
import ReportModal from "./ReportModal";
import SquareLoader from "./SquareLoader";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const CommentItem = ({ c, isReply = false, currentUser, onLike, onReply, onDelete, onReport }) => {
  const [showOptions, setShowOptions] = useState(false);
  const isOwner = currentUser?.id === c.user_id;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-4 group ${isReply ? 'ml-14 mt-4 relative before:absolute before:-left-6 before:top-0 before:w-6 before:h-6 before:border-l-2 before:border-b-2 before:border-gray-200 dark:before:border-gray-800 before:rounded-bl-xl' : 'mt-8'}`}
    >
      {/* Avatar */}
      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden shrink-0 shadow-sm border border-gray-100 dark:border-gray-800">
        {c.user?.photo ? (
          <img src={c.user.photo} alt={c.user.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500 font-black text-sm uppercase">
            {c.user?.username?.charAt(0)}
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="flex-1 min-w-0 flex flex-col items-start">
        
        <div className="bg-white dark:bg-[#150a21] rounded-2xl rounded-tl-sm px-5 py-3 md:py-4 inline-block max-w-full shadow-sm border border-gray-100 dark:border-white/5 relative">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-black text-[15px] md:text-base text-gray-900 dark:text-white cursor-pointer hover:text-cuadralo-pink transition-colors">
              @{c.user?.username}
            </span>
            <span className="text-xs text-gray-400 font-medium ml-2">
              {formatDistanceToNow(new Date(c.created_at), { addSuffix: true, locale: es })}
            </span>
          </div>
          
          <p className="text-[15px] md:text-base text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words leading-relaxed">
            {c.content}
          </p>
        </div>
        
        {/* Acciones */}
        <div className="flex items-center gap-6 mt-3 ml-2 relative">
          <button 
            onClick={() => onLike(c.id)}
            className={`flex items-center gap-1.5 text-xs md:text-sm font-bold transition-all hover:scale-105 active:scale-95 ${c.is_liked ? 'text-cuadralo-pink' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}
          >
            <Heart size={16} className={c.is_liked ? "fill-cuadralo-pink" : ""} strokeWidth={c.is_liked ? 0 : 2} />
            {c.likes_count > 0 ? c.likes_count : "Me gusta"}
          </button>
          
          {!isReply && (
            <button 
              onClick={() => onReply(c)} 
              className="flex items-center gap-1.5 text-xs md:text-sm font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-all hover:scale-105 active:scale-95"
            >
              <Reply size={16} />
              Responder
            </button>
          )}

          <div className="relative">
            <button 
              onClick={() => setShowOptions(!showOptions)}
              className="p-1 text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white transition-colors"
            >
              <MoreHorizontal size={16} />
            </button>
            
            <AnimatePresence>
              {showOptions && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 5 }}
                  className="absolute top-full left-0 mt-1 w-32 bg-white dark:bg-[#1a1a1a] rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 z-10 overflow-hidden"
                >
                  {isOwner ? (
                    <button 
                      onClick={() => { onDelete(c.id); setShowOptions(false); }} 
                      className="w-full flex items-center gap-2 px-4 py-3 text-left text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors uppercase tracking-widest"
                    >
                      <Trash2 size={14} /> Eliminar
                    </button>
                  ) : (
                    <button 
                      onClick={() => { onReport(c); setShowOptions(false); }} 
                      className="w-full flex items-center gap-2 px-4 py-3 text-left text-xs font-bold text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-colors uppercase tracking-widest"
                    >
                      <Flag size={14} /> Reportar
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

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



  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 md:p-6 backdrop-blur-md">
        
        {/* Botón de cerrar exterior en móviles */}
        <button onClick={onClose} className="md:hidden absolute top-4 right-4 text-white z-[60] bg-black/50 hover:bg-black/80 transition-colors p-3 rounded-full shadow-lg">
            <X size={24} />
        </button>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 50 }}
          className="w-full max-w-[1200px] h-[92vh] md:h-[88vh] flex flex-col md:flex-row bg-cuadralo-bgLight dark:bg-[#0f0518] rounded-t-[2.5rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/20 dark:border-white/10"
        >
          {/* PANEL IZQUIERDO: FOTO + DESCRIPCIÓN Y HERRAMIENTAS */}
          <div className="hidden md:flex flex-col md:w-1/2 border-r border-gray-200 dark:border-white/10 bg-black relative">
             
             {/* Zona de la Imagen */}
             <div className="flex-1 relative flex items-center justify-center overflow-hidden">
                 {post?.image_url && (
                     <>
                        <div className="absolute inset-0 bg-cover bg-center opacity-30 blur-3xl scale-110" style={{ backgroundImage: `url(${post.image_url})` }}></div>
                        <img src={post.image_url} alt="Post" className="w-full h-full object-contain relative z-10" />
                     </>
                 )}
             </div>

             {/* Interacciones y Descripción del Lado Izquierdo */}
             <div className="p-8 bg-white dark:bg-[#150a21] border-t border-gray-100 dark:border-white/5 shrink-0 z-20">
                 <div className="flex gap-6 mb-5 items-center">
                    <button 
                      onClick={onLikeToggle} 
                      className="flex items-center gap-2 group focus:outline-none"
                    >
                        <Heart size={32} className={`transition-all duration-300 group-hover:scale-110 ${liked ? "fill-cuadralo-pink text-cuadralo-pink drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]" : "text-gray-400 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"}`} strokeWidth={liked ? 0 : 2} />
                        <span className={`font-black text-lg ${liked ? "text-cuadralo-pink" : "text-gray-500 dark:text-gray-300"}`}>
                          {likesCount} Me gusta
                        </span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-400 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-all group">
                        <Share2 size={28} strokeWidth={2} className="group-hover:scale-110 transition-transform" />
                    </button>
                 </div>
                 
                 <div className="flex items-start gap-4 mb-3">
                   <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800 shrink-0 border-2 border-transparent">
                     <img src={post?.user?.photo || "https://via.placeholder.com/150"} alt="User" className="w-full h-full object-cover" />
                   </div>
                   <div>
                     <p className="text-base md:text-lg text-gray-800 dark:text-gray-200 leading-relaxed">
                         <span className="font-black text-gray-900 dark:text-white mr-2 cursor-pointer hover:text-cuadralo-pink transition-colors">@{post?.user?.username}</span>
                         {post?.caption}
                     </p>
                     <span className="text-xs text-gray-500 mt-2 block font-black uppercase tracking-widest opacity-80">
                         {formatDistanceToNow(new Date(post?.created_at), { addSuffix: true, locale: es })}
                     </span>
                   </div>
                 </div>
             </div>
          </div>

          {/* PANEL DERECHO: EXCLUSIVO PARA COMENTARIOS */}
          <div className="flex flex-col w-full md:w-1/2 h-full bg-gray-50 dark:bg-[#0f0518]">
            
            {/* Cabecera del Panel de Comentarios */}
            <div className="px-6 md:px-8 py-5 border-b border-gray-200 dark:border-white/10 flex justify-between items-center bg-white dark:bg-[#150a21] shrink-0 shadow-sm z-10">
               <div className="flex items-center gap-4">
                   <h3 className="font-black text-xl md:text-2xl tracking-tight text-gray-900 dark:text-white">Comentarios</h3>
                   <span className="bg-cuadralo-pink/10 text-cuadralo-pink font-black text-sm px-3 py-1 rounded-full border border-cuadralo-pink/20">
                       {comments.length}
                   </span>
               </div>
               <button onClick={onClose} className="hidden md:flex bg-gray-100 dark:bg-white/5 p-2.5 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 transition-all active:scale-95">
                  <X size={24} />
               </button>
            </div>

            {/* Zona de Comentarios (Scroll) */}
            <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 custom-scrollbar">
                {/* 📱 Solo en Móvil: Mostramos la descripción aquí arriba porque el panel izquierdo está oculto */}
                <div className="md:hidden flex gap-4 mb-8 pb-8 border-b border-gray-200 dark:border-white/10">
                    <img src={post?.user?.photo || "https://via.placeholder.com/150"} className="w-12 h-12 rounded-full object-cover shrink-0 border border-gray-200 dark:border-gray-800 shadow-sm" />
                    <div>
                        <p className="text-base text-gray-800 dark:text-gray-200 leading-relaxed">
                            <span className="font-black text-gray-900 dark:text-white mr-2">@{post?.user?.username}</span>
                            {post?.caption}
                        </p>
                        <span className="text-xs text-gray-500 mt-2 block font-black uppercase tracking-widest opacity-80">
                            {formatDistanceToNow(new Date(post?.created_at), { addSuffix: true, locale: es })}
                        </span>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <SquareLoader size="large" />
                    </div>
                ) : rootComments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-gray-400 dark:text-gray-500">
                        <div className="w-24 h-24 bg-gray-200 dark:bg-white/5 rounded-full flex items-center justify-center mb-6 shadow-inner">
                          <MessageSquare size={48} className="opacity-40" />
                        </div>
                        <p className="text-lg font-black text-gray-900 dark:text-white mb-2">Aún no hay comentarios</p>
                        <p className="text-sm font-medium text-center max-w-[250px]">Sé el primero en iniciar la conversación y romper el hielo.</p>
                    </div>
                ) : (
                    <div className="pb-8 space-y-6">
                        {rootComments.map(c => (
                        <div key={c.id}>
                            <CommentItem 
                              c={c} 
                              currentUser={currentUser}
                              onLike={handleLike}
                              onReply={setReplyingTo}
                              onDelete={handleDelete}
                              onReport={setReportingComment}
                            />
                            {replies.filter(r => r.parent_id === c.id).map(reply => (
                                <CommentItem 
                                  key={reply.id} 
                                  c={reply} 
                                  isReply={true} 
                                  currentUser={currentUser}
                                  onLike={handleLike}
                                  onReply={setReplyingTo}
                                  onDelete={handleDelete}
                                  onReport={setReportingComment}
                                />
                            ))}
                        </div>
                        ))}
                        <div ref={commentsEndRef} />
                    </div>
                )}
            </div>

            {/* Formulario para comentar */}
            <div className="bg-white dark:bg-[#150a21] border-t border-gray-200 dark:border-white/5 shrink-0 px-4 md:px-8 py-5 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] dark:shadow-none z-10">
                {replyingTo && (
                    <div className="flex justify-between items-center bg-gray-100 dark:bg-black/50 px-5 py-3 rounded-t-2xl border-x border-t border-gray-200 dark:border-white/5 -mb-2 relative z-0">
                        <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600 dark:text-gray-400 truncate">
                          <Reply size={16} className="text-cuadralo-pink shrink-0" />
                          <span className="truncate">Respondiendo a <span className="font-black text-gray-900 dark:text-white">@{replyingTo.user?.username}</span></span>
                        </div>
                        <button onClick={() => setReplyingTo(null)} className="p-1.5 rounded-full text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                          <X size={16} strokeWidth={3} />
                        </button>
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="flex items-end gap-3 relative z-10">
                    <div className={`flex-1 bg-gray-100 dark:bg-black/50 border border-gray-200 dark:border-white/10 overflow-hidden relative transition-all focus-within:bg-white dark:focus-within:bg-[#1a0e2a] focus-within:ring-2 focus-within:ring-cuadralo-pink/30 focus-within:border-cuadralo-pink shadow-inner focus-within:shadow-lg ${replyingTo ? 'rounded-b-2xl border-t-0' : 'rounded-3xl'}`}>
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Añade un comentario..."
                            className="w-full bg-transparent text-gray-900 dark:text-white text-base px-6 py-4 focus:outline-none resize-none max-h-32 min-h-[56px] custom-scrollbar block placeholder:text-gray-400 dark:placeholder:text-gray-500"
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
                        className="p-4 rounded-full bg-cuadralo-pink text-white disabled:opacity-50 disabled:bg-gray-300 dark:disabled:bg-gray-800 disabled:text-gray-500 hover:bg-pink-600 hover:scale-105 active:scale-95 transition-all shrink-0 shadow-lg shadow-cuadralo-pink/30 disabled:shadow-none"
                    >
                        <Send size={22} className={newComment.trim() ? "translate-x-0.5 -translate-y-0.5" : ""} strokeWidth={2.5} />
                    </button>
                </form>
            </div>

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