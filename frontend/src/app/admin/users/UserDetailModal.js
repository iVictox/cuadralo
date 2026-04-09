import { useState } from "react";
import { X, Calendar, MapPin, User, Activity, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function UserDetailModal({ user, onClose }) {
  if (!user) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-gray-800 rounded-xl max-w-3xl w-full border border-gray-700 overflow-hidden relative"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white z-10 bg-gray-900/50 rounded-full p-1"
          >
            <X size={24} />
          </button>

          <div className="p-6">
            <div className="flex items-start gap-6 border-b border-gray-700 pb-6 mb-6">
              <div className="w-24 h-24 rounded-full bg-gray-700 overflow-hidden shrink-0 border-2 border-purple-500">
                {user.photo ? (
                  <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <User size={40} />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  {user.name}
                  {user.is_prime && <span className="text-xs bg-yellow-500 text-yellow-900 px-2 py-1 rounded-full font-bold">VIP</span>}
                </h2>
                <p className="text-purple-400 font-medium">@{user.username}</p>
                <div className="mt-2 text-sm text-gray-400">
                  <p>{user.email}</p>
                  <p>Registrado: {new Date(user.created_at).toLocaleDateString('es-ES')}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b border-gray-700 pb-2">Información Personal</h3>
                <div className="space-y-2 text-sm">
                  <p className="flex justify-between"><span className="text-gray-400">Género:</span> <span>{user.gender || 'No especificado'}</span></p>
                  <p className="flex justify-between"><span className="text-gray-400">Nacimiento:</span> <span>{user.birth_date ? new Date(user.birth_date).toLocaleDateString('es-ES') : 'N/A'}</span></p>
                  <p className="flex justify-between"><span className="text-gray-400">Ubicación:</span> <span>{user.location || 'N/A'}</span></p>
                  <div className="pt-2">
                    <span className="text-gray-400 block mb-1">Biografía:</span>
                    <p className="bg-gray-900 p-3 rounded-lg text-gray-300 min-h-[60px]">{user.bio || 'Sin biografía.'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b border-gray-700 pb-2">Estadísticas</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-900 p-3 rounded-lg text-center">
                    <span className="block text-gray-400">Seguidores</span>
                    <span className="text-xl font-bold">{user.followers_count || 0}</span>
                  </div>
                  <div className="bg-gray-900 p-3 rounded-lg text-center">
                    <span className="block text-gray-400">Siguiendo</span>
                    <span className="text-xl font-bold">{user.following_count || 0}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
