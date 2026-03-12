"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Heart, MessageCircle, UserPlus, Flame, Sparkles, Loader2, CheckCheck, Bell } from "lucide-react";
import { api } from "@/utils/api";
import { useRouter } from "next/navigation";

export default function NotificationModal({ onClose, onReadSync }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const data = await api.get("/notifications");
            setNotifications(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error cargando notificaciones:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationClick = async (notif) => {
        if (!notif.is_read) {
            setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
            onReadSync && onReadSync();
            try {
                await api.post(`/notifications/${notif.id}/read`);
            } catch (e) { console.error(e); }
        }

        onClose();

        // ✅ ACTUALIZADO: Navegación inteligente a la nueva vista de POST
        if ((notif.type === "post_like" || notif.type === "comment") && notif.post_id) {
            router.push(`/post/${notif.post_id}`);
        } else if (notif.type === "follow" || notif.type === "swipe_like") {
            router.push(`/u/${notif.sender?.username}`);
        } else if (notif.type === "match") {
            router.push(`/chat`);
        } else {
            router.push(`/profile`);
        }
    };

    const getNotificationStyle = (type) => {
        switch (type) {
            case "post_like": return { icon: Heart, color: "text-cuadralo-pink", bg: "bg-cuadralo-pink/10 border-cuadralo-pink/20" };
            case "comment": return { icon: MessageCircle, color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20" };
            case "follow": return { icon: UserPlus, color: "text-green-500", bg: "bg-green-500/10 border-green-500/20" };
            case "match": return { icon: Flame, color: "text-orange-500", bg: "bg-orange-500/10 border-orange-500/20" };
            case "swipe_like": return { icon: Sparkles, color: "text-yellow-500", bg: "bg-yellow-500/10 border-yellow-500/20" };
            default: return { icon: Bell, color: "text-gray-500", bg: "bg-gray-500/10 border-gray-500/20" };
        }
    };

    return (
        <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 md:left-auto md:w-[400px] z-[150] bg-cuadralo-bgLight dark:bg-cuadralo-bgDark shadow-[-10px_0_30px_rgba(0,0,0,0.1)] dark:shadow-[-10px_0_30px_rgba(0,0,0,0.5)] flex flex-col border-l border-black/5 dark:border-white/5 transition-colors duration-300"
        >
            {/* HEADER */}
            <div className="p-5 border-b border-black/5 dark:border-white/10 flex justify-between items-center bg-cuadralo-cardLight dark:bg-cuadralo-cardDark">
                <div>
                    <h2 className="text-lg font-black text-cuadralo-textLight dark:text-white tracking-tight">Notificaciones</h2>
                    <p className="text-xs text-cuadralo-textMutedLight dark:text-gray-400 font-medium">Entérate de todo lo que pasa.</p>
                </div>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 transition-all">
                    <X size={24} />
                </button>
            </div>

            {/* LISTA DE NOTIFICACIONES */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3">
                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="animate-spin text-cuadralo-pink" size={32} /></div>
                ) : notifications.length > 0 ? (
                    notifications.map((notif) => {
                        const style = getNotificationStyle(notif.type);
                        const Icon = style.icon;

                        return (
                            <div
                                key={notif.id}
                                onClick={() => handleNotificationClick(notif)}
                                className={`relative flex items-center gap-4 p-4 rounded-[1.5rem] cursor-pointer transition-all duration-300 border ${notif.is_read ? 'bg-black/5 dark:bg-white/5 border-transparent hover:bg-black/10 dark:hover:bg-white/10' : 'bg-white dark:bg-cuadralo-cardDark border-cuadralo-pink/30 shadow-md shadow-cuadralo-pink/5 hover:scale-[1.02]'}`}
                            >
                                {!notif.is_read && (
                                    <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-cuadralo-pink rounded-full shadow-[0_0_8px_#f2138e]" />
                                )}

                                {/* Avatar y Badge Icono */}
                                <div className="relative flex-shrink-0 self-start">
                                    <img src={notif.sender?.photo || "https://via.placeholder.com/150"} alt="User" className="w-12 h-12 rounded-full object-cover border-2 border-black/5 dark:border-white/10" />
                                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-cuadralo-bgLight dark:border-cuadralo-bgDark ${style.bg} backdrop-blur-md`}>
                                        <Icon size={12} className={style.color} fill={notif.type === 'post_like' || notif.type === 'match' ? 'currentColor' : 'none'} />
                                    </div>
                                </div>

                                {/* Contenido Texto */}
                                <div className="flex-1 pr-2">
                                    <p className="text-sm text-cuadralo-textLight dark:text-gray-200">
                                        <span className="font-bold text-cuadralo-textLight dark:text-white">{notif.sender?.username}</span> {notif.message}
                                    </p>
                                    <span className="text-[10px] text-cuadralo-textMutedLight dark:text-gray-500 font-bold uppercase tracking-widest mt-1 block">
                                        {new Date(notif.created_at).toLocaleDateString()} • {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>

                                {/* ✅ MINIATURA DE LA PUBLICACIÓN (Aparece a la derecha) */}
                                {notif.post && notif.post.image_url && (
                                    <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-black/5 dark:border-white/10 shadow-sm ml-auto">
                                        <img src={notif.post.image_url} alt="Post" className="w-full h-full object-cover" />
                                    </div>
                                )}

                            </div>
                        );
                    })
                ) : (
                    <div className="flex flex-col items-center justify-center text-center mt-20 text-cuadralo-textMutedLight dark:text-gray-500">
                        <div className="w-16 h-16 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                            <CheckCheck size={32} className="opacity-50" />
                        </div>
                        <p className="font-bold">Todo al día</p>
                        <p className="text-sm mt-1">No tienes notificaciones nuevas.</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}