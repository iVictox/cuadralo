"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, CalendarDays, Heart, Sparkles, MessageCircle, Info, Flame, Flag } from "lucide-react";
import ProfileDetailsModal from "./ProfileDetailsModal";
import ReportModal from "./ReportModal"; // ✅ IMPORTANTE

export default function UserProfile({ user, onClose, onFollow, isFollowing, onChat }) {
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState("about");
  const [isHoveringImage, setIsHoveringImage] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // ✅ Estado para el Modal de Reportes
  const [reportingUser, setReportingUser] = useState(false);

  // Asegurar que photo siempre esté en el arreglo de photos
  const allPhotos = user?.photos && user.photos.length > 0 
    ? (user.photos.includes(user.photo) ? user.photos : [user.photo, ...user.photos].filter(Boolean))
    : [user?.photo].filter(Boolean);

  useEffect(() => {
    let interval;
    if (isHoveringImage && allPhotos.length > 1) {
      interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % allPhotos.length);
      }, 1500); // Cambia de foto cada 1.5s al hacer hover
    } else {
      setCurrentImageIndex(0);
    }
    return () => clearInterval(interval);
  }, [isHoveringImage, allPhotos.length]);

  if (!user) return null;

  const calculateAge = (dob) => {
    if (!dob) return '';
    const diff = Date.now() - new Date(dob).getTime();
    return Math.abs(new Date(diff).getUTCFullYear() - 1970);
  };

  const age = calculateAge(user.birth_date);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-[400px] bg-white dark:bg-[#121212] rounded-[2rem] overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh] border border-gray-100 dark:border-gray-800"
        >
          {/* Header con Imagen y Botón Cerrar */}
          <div className="relative h-[300px] md:h-[350px] shrink-0 bg-gray-200 dark:bg-gray-900 group"
               onMouseEnter={() => setIsHoveringImage(true)}
               onMouseLeave={() => setIsHoveringImage(false)}
          >
            {allPhotos.length > 0 ? (
              <>
                <AnimatePresence initial={false}>
                  <motion.img
                    key={currentImageIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    src={allPhotos[currentImageIndex]}
                    alt={user.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </AnimatePresence>
                {allPhotos.length > 1 && (
                  <div className="absolute top-4 left-0 right-0 flex justify-center gap-1 px-4 z-20">
                    {allPhotos.map((_, idx) => (
                      <div 
                        key={idx} 
                        className={`h-1 rounded-full transition-all duration-300 ${
                          idx === currentImageIndex ? 'w-6 bg-white' : 'w-2 bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">Sin foto</div>
            )}

            {/* Gradiente Inferior para que el texto resalte */}
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10 pointer-events-none" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2.5 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white transition-all z-20"
            >
              <X size={20} />
            </button>

            {/* Info Básica superpuesta en la imagen */}
            <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
              <div className="flex items-end justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h2 className="text-2xl md:text-3xl font-black text-white leading-none tracking-tight flex items-center gap-2 truncate">
                    {user.name}
                    {user.is_prime && (
                      <Sparkles size={18} className="text-yellow-400 fill-yellow-400 shrink-0" />
                    )}
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm font-medium text-white/90 truncate">@{user.username}</span>
                    <span className="text-white/50">•</span>
                    <span className="text-sm font-bold text-white bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-md shrink-0">
                      {age} años
                    </span>
                  </div>
                </div>
                
                {/* Botón de Información Detallada Flotante */}
                <button 
                  onClick={() => setShowDetails(true)}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white transition-colors shrink-0"
                >
                  <Info size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Cuerpo del Perfil (Scrollable) */}
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50 dark:bg-[#0a0a0a]">
            
            {/* Estadísticas Rápidas */}
            <div className="flex justify-around items-center p-4 bg-white dark:bg-[#121212] border-b border-gray-100 dark:border-gray-800">
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-1">Seguidores</p>
                <p className="text-lg font-black text-gray-900 dark:text-white">{user.followers_count || 0}</p>
              </div>
              <div className="w-px h-8 bg-gray-200 dark:bg-gray-800" />
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-1">Siguiendo</p>
                <p className="text-lg font-black text-gray-900 dark:text-white">{user.following_count || 0}</p>
              </div>
              <div className="w-px h-8 bg-gray-200 dark:bg-gray-800" />
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-1">Ubicación</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center justify-center gap-1">
                  <MapPin size={14} className="text-cuadralo-pink" /> 
                  <span className="truncate max-w-[80px]">{user.location || "Global"}</span>
                </p>
              </div>
            </div>

            {/* Pestañas (Bio / Intereses) */}
            <div className="p-6">
              <div className="flex gap-4 border-b border-gray-200 dark:border-gray-800 mb-4">
                <button 
                  onClick={() => setActiveTab('about')}
                  className={`pb-2 text-sm font-bold uppercase tracking-wider transition-colors relative ${activeTab === 'about' ? 'text-gray-900 dark:text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                >
                  Sobre mí
                  {activeTab === 'about' && (
                    <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 dark:bg-white rounded-t-full" />
                  )}
                </button>
                <button 
                  onClick={() => setActiveTab('interests')}
                  className={`pb-2 text-sm font-bold uppercase tracking-wider transition-colors relative ${activeTab === 'interests' ? 'text-gray-900 dark:text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                >
                  Intereses
                  {activeTab === 'interests' && (
                    <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 dark:bg-white rounded-t-full" />
                  )}
                </button>
              </div>

              <div className="min-h-[100px]">
                <AnimatePresence mode="wait">
                  {activeTab === 'about' ? (
                    <motion.div key="about" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {user.bio ? user.bio : <span className="italic opacity-50">Este usuario es un poco misterioso y no ha escrito una biografía.</span>}
                    </motion.div>
                  ) : (
                    <motion.div key="interests" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                      {user.interests && user.interests.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {user.interests.map((int, idx) => (
                            <span key={idx} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-lg border border-gray-200 dark:border-gray-700">
                              {typeof int === 'string' ? int : int.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 italic">No ha especificado intereses.</span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Acciones Principales (Footer) */}
          <div className="p-4 md:p-6 bg-white dark:bg-[#121212] border-t border-gray-100 dark:border-gray-800 flex gap-3 shrink-0">
            {onFollow && (
              <button 
                onClick={onFollow}
                className={`flex-1 py-4 md:py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm ${
                  isFollowing 
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700' 
                  : 'bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100'
                }`}
              >
                {isFollowing ? (
                  <>Siguiendo</>
                ) : (
                  <><Flame size={18} className={isFollowing ? "" : "text-orange-500"} /> Seguir</>
                )}
              </button>
            )}

            {onChat && (
              <button 
                onClick={() => { onClose(); onChat(user); }}
                className="p-4 md:p-5 bg-cuadralo-pink/10 hover:bg-cuadralo-pink/20 text-cuadralo-pink rounded-2xl transition-all active:scale-95 shadow-sm"
              >
                <MessageCircle size={24} />
              </button>
            )}

            {/* ✅ BOTÓN DE REPORTE */}
            <button 
              onClick={() => setReportingUser(true)}
              className="p-4 md:p-5 bg-orange-100 dark:bg-orange-900/30 hover:bg-orange-200 dark:hover:bg-orange-900/50 text-orange-600 dark:text-orange-400 rounded-2xl transition-all active:scale-95 shadow-sm"
              title="Reportar Usuario"
            >
              <Flag size={24} />
            </button>
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {showDetails && <ProfileDetailsModal user={user} onClose={() => setShowDetails(false)} />}
      </AnimatePresence>

      {/* ✅ MODAL DE REPORTE */}
      <AnimatePresence>
        {reportingUser && <ReportModal targetType="user" targetId={user.id} onClose={() => setReportingUser(false)} />}
      </AnimatePresence>
    </>
  );
}