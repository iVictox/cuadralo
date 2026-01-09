"use client";

import { useState, useRef, useEffect } from "react";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Copy, Trash2, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CommentsModal from "./CommentsModal"; 
import { api } from "@/utils/api";
import { useToast } from "@/context/ToastContext";
import { useConfirm } from "@/context/ConfirmContext";

export default function FeedPost({ post, onDelete, onViewStory }) {
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const [liked, setLiked] = useState(post.is_liked);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [showComments, setShowComments] = useState(false);
  const [showBigHeart, setShowBigHeart] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) setCurrentUser(JSON.parse(userStr));
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const handleLike = async () => {
    const isLikingAction = !liked;
    if (isLikingAction) {
        setShowBigHeart(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setShowBigHeart(false), 1000);
    }
    setLiked(isLikingAction);
    setLikesCount(prev => isLikingAction ? prev + 1 : prev - 1);
    try { await api.post(`/social/posts/${post.id}/like`, {}); } 
    catch (error) { setLiked(!isLikingAction); setLikesCount(prev => !isLikingAction ? prev + 1 : prev - 1); }
  };

  const handleShare = async () => {
    if (navigator.share) { try { await navigator.share({ title: 'Cuadralo', text: post.caption, url: window.location.href }); } catch (e) {} } 
    else { handleCopyLink(); }
  };

  const handleCopyLink = () => {
      navigator.clipboard.writeText(`https://cuadralo.com/post/${post.id}`);
      showToast("Enlace copiado");
      setShowMenu(false);
  };

  const handleDeletePost = async () => {
      setShowMenu(false);
      const ok = await confirm({ title: "¿Eliminar?", message: "Se borrará para siempre.", confirmText: "Eliminar", variant: "danger" });
      if (!ok) return;
      try {
          await api.delete(`/social/posts/${post.id}`);
          showToast("Eliminado");
          if (onDelete) onDelete();
      } catch (error) { showToast("Error", "error"); }
  };

  const handleReportPost = async () => {
      setShowMenu(false);
      const ok = await confirm({ title: "¿Reportar?", message: "Contenido inapropiado", confirmText: "Reportar", variant: "danger" });
      if(!ok) return;
      try { await api.post(`/social/posts/${post.id}/report`, { reason: "spam" }); showToast("Reportado"); } catch (error) {}
  };

  const handleAvatarClick = () => { if (post.user?.has_story && onViewStory) onViewStory(); };
  const timeAgo = (d) => { const diff = new Date() - new Date(d); const h = Math.floor(diff/36e5); return h<1?"AHORA":h<24?`${h}H`:new Date(d).toLocaleDateString(); };
  const isMyPost = currentUser?.id === post.user_id;

  return (
    <>
        <div className="w-full max-w-lg mx-auto bg-[#1a0b2e] border-t border-b border-white/5 sm:border sm:rounded-3xl overflow-hidden mb-2 relative">
            <div className="flex justify-between items-center px-4 py-3 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="relative cursor-pointer" onClick={handleAvatarClick}>
                        <div className={`w-10 h-10 rounded-full p-[2px] ${post.user?.has_story ? "bg-gradient-to-tr from-yellow-400 via-cuadralo-pink to-purple-600" : "bg-transparent"}`}>
                            <img src={post.user?.photo || "https://via.placeholder.com/150"} className="w-full h-full rounded-full object-cover border border-white/10" alt={post.user?.name} />
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold text-sm text-white leading-none">{post.user?.name}</h4>
                        <p className="text-[10px] text-gray-400 mt-0.5">{post.location}</p>
                    </div>
                </div>
                <div className="relative">
                    <button onClick={() => setShowMenu(!showMenu)} className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/5"><MoreHorizontal size={20} /></button>
                    <AnimatePresence>
                        {showMenu && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="absolute right-0 top-10 w-40 bg-[#0f0518] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden text-sm">
                                    {isMyPost ? (
                                        <>
                                            <button onClick={handleDeletePost} className="w-full text-left px-4 py-3 hover:bg-red-500/10 text-red-500 flex gap-2"><Trash2 size={16} /> Eliminar</button>
                                            <button onClick={handleCopyLink} className="w-full text-left px-4 py-3 hover:bg-white/5 text-gray-200 flex gap-2"><Copy size={16} /> Copiar</button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={handleReportPost} className="w-full text-left px-4 py-3 hover:bg-white/5 text-red-400 flex gap-2"><AlertTriangle size={16} /> Reportar</button>
                                            <button onClick={handleCopyLink} className="w-full text-left px-4 py-3 hover:bg-white/5 text-gray-200 flex gap-2"><Copy size={16} /> Copiar</button>
                                        </>
                                    )}
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="relative w-full aspect-[4/5] bg-[#0f0518] cursor-pointer group" onDoubleClick={handleLike}>
                <img src={post.image_url} className="w-full h-full object-cover" alt="Post" />
                <AnimatePresence>
                    {showBigHeart && <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1.2 }} exit={{ opacity: 0, scale: 0.8 }} className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"><Heart size={100} className="text-white fill-white drop-shadow-lg" /></motion.div>}
                </AnimatePresence>
            </div>

            <div className="px-4 py-3">
                <div className="flex justify-between items-center mb-3">
                    <div className="flex gap-5">
                        <button onClick={handleLike} className="active:scale-90 transition-transform"><Heart size={26} className={liked ? "text-cuadralo-pink fill-cuadralo-pink" : "text-white"} strokeWidth={liked ? 0 : 2} /></button>
                        <button onClick={() => setShowComments(true)}><MessageCircle size={26} className="text-white -rotate-90" /></button>
                        <button onClick={handleShare}><Send size={26} className="text-white -rotate-12 mb-1" /></button>
                    </div>
                    <button><Bookmark size={26} className="text-white" /></button>
                </div>
                <p className="font-bold text-sm text-white mb-2">{likesCount} Me gusta</p>
                <div className="text-sm text-gray-300 leading-relaxed mb-2"><span className="font-bold text-white mr-2">{post.user?.name}</span>{post.caption}</div>
                <button onClick={() => setShowComments(true)} className="text-xs text-gray-500">Ver comentarios</button>
                <p className="text-[10px] text-gray-600 uppercase tracking-wide mt-1">{timeAgo(post.created_at)}</p>
            </div>
        </div>
        <AnimatePresence>{showComments && <CommentsModal onClose={() => setShowComments(false)} postId={post.id} postAuthor={post.user?.name} postOwnerId={post.user_id} />}</AnimatePresence>
    </>
  );
}