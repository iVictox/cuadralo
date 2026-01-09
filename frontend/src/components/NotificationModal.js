"use client";

import { useState, useEffect } from "react";
import { X, Heart, MessageCircle, UserPlus, CheckCheck, Bell } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/utils/api";
import { useRouter } from "next/navigation";

export default function NotificationModal({ onClose }) {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
      try {
          const data = await api.get("/notifications");
          setNotifications(Array.isArray(data) ? data : []);
      } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const markAllRead = async () => {
      try {
          await api.post("/notifications/all/read", {});
          setNotifications(prev => prev.map(n => ({...n, is_read: true})));
      } catch (e) {}
  };

  const handleNotificationClick = async (notif) => {
      if (!notif.is_read) {
          api.post(`/notifications/${notif.id}/read`, {});
          setNotifications(prev => prev.map(n => n.id === notif.id ? {...n, is_read: true} : n));
      }
      router.push(`/u/${notif.sender.username}`);
      onClose();
  };

  const getIcon = (type) => {
      switch(type) {
          case "like": return <Heart size={16} className="text-red-500 fill-red-500" />;
          case "comment": return <MessageCircle size={16} className="text-blue-400 fill-blue-400" />;
          case "follow": return <UserPlus size={16} className="text-cuadralo-pink fill-cuadralo-pink" />;
          default: return <Bell size={16} className="text-gray-400" />;
      }
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end sm:justify-center sm:items-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25 }} onClick={(e) => e.stopPropagation()} className="w-full sm:w-[450px] h-[80vh] sm:h-[600px] bg-[#1a0b2e] border-t sm:border border-white/10 sm:rounded-3xl flex flex-col shadow-2xl relative overflow-hidden">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#0f0518]">
                <h3 className="text-white font-bold text-lg flex items-center gap-2"><Bell className="text-cuadralo-pink" size={20} /> Notificaciones</h3>
                <div className="flex gap-2">
                    <button onClick={markAllRead} className="p-2 bg-white/5 rounded-full text-green-400 hover:bg-white/10"><CheckCheck size={18} /></button>
                    <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-white hover:bg-white/10"><X size={20} /></button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
                {loading ? <div className="py-10 text-center text-gray-500">Cargando...</div> : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-60"><Bell size={48} className="mb-2" /><p>No tienes notificaciones</p></div>
                ) : (
                    <div className="space-y-1">
                        {notifications.map((notif) => (
                            <div key={notif.id} onClick={() => handleNotificationClick(notif)} className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors hover:bg-white/5 ${notif.is_read ? 'opacity-60' : 'bg-white/5 border border-white/5'}`}>
                                <div className="relative">
                                    <img src={notif.sender?.photo || "https://via.placeholder.com/150"} className="w-10 h-10 rounded-full object-cover" />
                                    <div className="absolute -bottom-1 -right-1 bg-[#1a0b2e] rounded-full p-0.5">{getIcon(notif.type)}</div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-200"><span className="font-bold text-white">{notif.sender?.name}</span> {notif.message}</p>
                                    <span className="text-xs text-gray-500 block mt-1">{new Date(notif.created_at).toLocaleDateString()}</span>
                                </div>
                                {notif.post && <img src={notif.post.image_url} className="w-10 h-10 rounded-lg object-cover border border-white/10" />}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    </div>
  );
}