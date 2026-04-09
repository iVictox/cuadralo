import { X, User, MapPin, CalendarDays, Heart, Sparkles, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function UserDetailModal({ user, onClose }) {
  if (!user) return null;

  // Calculamos la edad si existe fecha de nacimiento
  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const diff = Date.now() - new Date(dob).getTime();
    return Math.abs(new Date(diff).getUTCFullYear() - 1970) + " años";
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-gray-900 rounded-2xl max-w-4xl w-full border border-gray-700 shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]"
        >
          {/* Header del Modal */}
          <div className="sticky top-0 z-10 bg-gray-900/90 backdrop-blur border-b border-gray-800 px-6 py-4 flex justify-between items-center">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Expediente de Usuario <span className="text-gray-500 font-mono text-sm">#{user.id}</span>
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white bg-gray-800 hover:bg-red-500/20 hover:text-red-400 rounded-full p-2 transition-all">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto custom-scrollbar">
            {/* Perfil Principal */}
            <div className="flex flex-col md:flex-row gap-6 items-start mb-8">
              <div className="w-32 h-32 rounded-2xl bg-gray-800 overflow-hidden shrink-0 border-2 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                {user.photo ? (
                  <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <User size={48} />
                  </div>
                )}
              </div>

              <div className="flex-1 w-full">
                <div className="flex flex-wrap items-center gap-3 mb-1">
                  <h1 className="text-3xl font-black text-white">{user.name}</h1>
                  {user.is_prime && <span className="bg-gradient-to-r from-yellow-600 to-yellow-400 text-white px-3 py-1 rounded-full text-xs font-bold uppercase shadow-lg flex items-center gap-1"><Sparkles size={12}/> VIP</span>}
                  {user.role === 'admin' && <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase">Admin</span>}
                </div>
                <p className="text-purple-400 font-medium text-lg mb-4">@{user.username}</p>
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-300 bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                  <div className="flex items-center gap-2"><MapPin size={16} className="text-gray-500"/> {user.location || 'Sin ubicación'}</div>
                  <div className="flex items-center gap-2"><CalendarDays size={16} className="text-gray-500"/> {calculateAge(user.birth_date)}</div>
                  <div className="flex items-center gap-2"><User size={16} className="text-gray-500"/> {user.gender === 'M' ? 'Hombre' : user.gender === 'F' ? 'Mujer' : user.gender || 'No especificado'}</div>
                  <div className="flex items-center gap-2 font-mono text-gray-400"> GPS: {user.latitude || 0}, {user.longitude || 0}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Columna Izquierda */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Acerca de</h3>
                  <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 min-h-[100px] text-gray-300 text-sm leading-relaxed">
                    {user.bio || <span className="text-gray-600 italic">El usuario no ha escrito una biografía.</span>}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Heart size={16} className="text-pink-500" /> Preferencias de Búsqueda
                  </h3>
                  <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 text-sm text-gray-300">
                    <p className="font-mono">{user.preferences || 'Configuración predeterminada (Sin filtros estrictos)'}</p>
                  </div>
                </div>

                <div>
                   <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Intereses Registrados</h3>
                   <div className="flex flex-wrap gap-2">
                     {user.interests && user.interests.length > 0 ? (
                       user.interests.map((int, i) => (
                         <span key={i} className="bg-purple-900/40 border border-purple-500/30 text-purple-300 px-3 py-1.5 rounded-lg text-sm font-medium">
                           {typeof int === 'string' ? int : int.name}
                         </span>
                       ))
                     ) : (
                       <span className="text-gray-600 text-sm italic">Sin intereses seleccionados.</span>
                     )}
                   </div>
                </div>
              </div>

              {/* Columna Derecha */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex flex-col items-center justify-center">
                    <span className="text-gray-400 text-sm font-medium mb-1">Seguidores</span>
                    <span className="text-3xl font-black text-white">{user.followers_count || 0}</span>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex flex-col items-center justify-center">
                    <span className="text-gray-400 text-sm font-medium mb-1">Siguiendo</span>
                    <span className="text-3xl font-black text-white">{user.following_count || 0}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <ImageIcon size={16} /> Galería Completa
                  </h3>
                  {user.photos && user.photos.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {user.photos.map((url, i) => (
                        <div key={i} className="aspect-[3/4] rounded-xl overflow-hidden border border-gray-700 bg-gray-800 group relative">
                          <img src={url} alt={`Foto ${i+1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 text-center flex flex-col items-center justify-center text-gray-500">
                      <ImageIcon size={32} className="mb-2 opacity-50" />
                      <p className="text-sm">No ha subido fotos adicionales</p>
                    </div>
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