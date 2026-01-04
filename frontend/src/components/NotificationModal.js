"use client";

import { motion } from "framer-motion";
import { X, Heart, UserPlus, Zap, MessageCircle } from "lucide-react";

export default function NotificationModal({ onClose }) {
  // Datos simulados de notificaciones
  const notifications = [
    { id: 1, type: "match", user: "Valeria", text: "Hicieron Match 🔥", time: "Hace 2 min" },
    { id: 2, type: "like", user: "Andrea", text: "Le gustó tu foto", time: "Hace 15 min" },
    { id: 3, type: "follow", user: "Carlos", text: "Comenzó a seguirte", time: "Hace 1 hora" },
    { id: 4, type: "message", user: "Sofia", text: "Te envió un mensaje", time: "Hace 3 horas" },
    { id: 5, type: "system", user: "Cuadralo", text: "¡Bienvenido a Cuadralo Gold!", time: "Ayer" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose} // Cierra al hacer clic fuera
    >
      <motion.div
        initial={{ y: -50, scale: 0.9 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: -20, scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#1a1a1a] w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-white/10"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-white/5 bg-[#252525]">
          <h2 className="text-xl font-bold text-white">Notificaciones</h2>
          <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Lista */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
            {notifications.length === 0 ? (
                <div className="p-10 text-center text-gray-500">No tienes notificaciones nuevas.</div>
            ) : (
                notifications.map((notif) => (
                    <div key={notif.id} className="flex items-center gap-4 p-4 hover:bg-white/5 rounded-xl transition-colors cursor-pointer border-b border-white/5 last:border-0">
                        {/* Icono según tipo */}
                        <div className={`p-3 rounded-full shrink-0 ${
                            notif.type === 'match' ? 'bg-cuadralo-pink/20 text-cuadralo-pink' :
                            notif.type === 'like' ? 'bg-red-500/20 text-red-500' :
                            notif.type === 'follow' ? 'bg-blue-500/20 text-blue-500' :
                            notif.type === 'system' ? 'bg-yellow-500/20 text-yellow-500' :
                            'bg-purple-500/20 text-purple-500'
                        }`}>
                            {notif.type === 'match' && <Zap size={20} />}
                            {notif.type === 'like' && <Heart size={20} fill="currentColor" />}
                            {notif.type === 'follow' && <UserPlus size={20} />}
                            {notif.type === 'message' && <MessageCircle size={20} />}
                            {notif.type === 'system' && <Zap size={20} />}
                        </div>
                        
                        <div className="flex-1">
                            <p className="text-sm text-white font-medium">
                                <span className="font-bold">{notif.user}</span> {notif.text}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                        </div>

                        {/* Indicador de no leído */}
                        <div className="w-2 h-2 bg-cuadralo-pink rounded-full" />
                    </div>
                ))
            )}
        </div>
      </motion.div>
    </motion.div>
  );
}