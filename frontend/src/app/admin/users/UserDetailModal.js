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
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto pt-20 pb-20"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-cuadralo-cardDark rounded-xl max-w-4xl w-full border border-cuadralo-purple/30 overflow-hidden relative"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white z-10 bg-cuadralo-bgDark/50 rounded-full p-1"
          >
            <X size={24} />
          </button>

          <div className="p-6">
            <div className="flex items-start gap-6 border-b border-cuadralo-purple/30 pb-6 mb-6">
              <div className="w-24 h-24 rounded-full bg-cuadralo-bgDark overflow-hidden shrink-0 border-2 border-cuadralo-pink">
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
                <p className="text-cuadralo-purpleLight font-medium">@{user.username}</p>
                <div className="mt-2 text-sm text-gray-400">
                  <p>{user.email}</p>
                  <p>Registrado: {new Date(user.created_at).toLocaleDateString('es-ES')}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b border-cuadralo-purple/30 pb-2 text-white">Información Personal</h3>
                <div className="space-y-2 text-sm">
                  <p className="flex justify-between"><span className="text-gray-400">Género:</span> <span>{user.gender || 'No especificado'}</span></p>
                  <p className="flex justify-between"><span className="text-gray-400">Nacimiento:</span> <span>{user.birth_date ? new Date(user.birth_date).toLocaleDateString('es-ES') : 'N/A'}</span></p>
                  <p className="flex justify-between"><span className="text-gray-400">Ubicación:</span> <span className="text-right truncate max-w-[200px]">{user.location || 'N/A'}</span></p>
                  <p className="flex justify-between"><span className="text-gray-400">Coordenadas:</span> <span>{user.latitude ? `${user.latitude.toFixed(4)}, ${user.longitude.toFixed(4)}` : 'N/A'}</span></p>
                  <p className="flex justify-between"><span className="text-gray-400">Preferencias/Filtros:</span> <span>{user.preferences || 'N/A'}</span></p>
                  {user.interestsList && user.interestsList.length > 0 && (
                     <div className="pt-2">
                        <span className="text-gray-400 block mb-1">Intereses:</span>
                        <div className="flex flex-wrap gap-1">
                           {user.interestsList.map(int => <span key={int} className="text-xs bg-cuadralo-purple/20 text-cuadralo-purpleLight px-2 py-1 rounded">{int}</span>)}
                        </div>
                     </div>
                  )}
                  <div className="pt-2">
                    <span className="text-gray-400 block mb-1">Biografía:</span>
                    <p className="bg-cuadralo-bgDark p-3 rounded-lg text-gray-300 min-h-[60px] whitespace-pre-wrap">{user.bio || 'Sin biografía.'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold border-b border-cuadralo-purple/30 pb-2 text-white mb-4">Estadísticas</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-cuadralo-bgDark border border-cuadralo-purple/10 p-3 rounded-lg text-center">
                      <span className="block text-gray-400">Seguidores</span>
                      <span className="text-xl font-bold text-cuadralo-pinkLight">{user.followers_count || 0}</span>
                    </div>
                    <div className="bg-cuadralo-bgDark border border-cuadralo-purple/10 p-3 rounded-lg text-center">
                      <span className="block text-gray-400">Siguiendo</span>
                      <span className="text-xl font-bold text-cuadralo-pinkLight">{user.following_count || 0}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold border-b border-cuadralo-purple/30 pb-2 text-white mb-4">Galería de Fotos</h3>
                  {user.photos && user.photos.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {user.photos.map((photoUrl, idx) => (
                        <div key={idx} className="aspect-[3/4] bg-cuadralo-bgDark rounded overflow-hidden">
                          <img src={photoUrl} alt={`Foto ${idx+1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4 bg-cuadralo-bgDark rounded">Sin fotos subidas.</p>
                  )}
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
