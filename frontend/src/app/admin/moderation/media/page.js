"use client";
import { useEffect, useState } from "react";
import { api } from "@/utils/api";
import { Image as ImageIcon, Trash2, X, MessageSquare, FileText, User, ShieldAlert, AlertOctagon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminMedia() {
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("posts"); // posts, chats, profiles

  // Lightbox State
  const [selectedMedia, setSelectedMedia] = useState(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/admin/moderation/media?filter=${filter}&limit=40`);
      setMediaList(data.media || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
      fetchMedia(); 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleDelete = async (mediaType, sourceId) => {
    if (!confirm(`⚠️ ¿Estás seguro de purgar esta imagen? \n\nSi es un Post o un Chat, se eliminará el mensaje entero. Si es un Perfil, el usuario se quedará sin fotos.`)) return;
    
    try {
      await api.delete(`/admin/moderation/media?type=${mediaType}&source_id=${sourceId}`);
      setSelectedMedia(null);
      fetchMedia();
    } catch (error) {
      alert("Error al eliminar el archivo multimedia.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white flex items-center gap-3"><ImageIcon className="text-purple-500" /> Galería de Media Global</h1>
        <p className="text-gray-400 mt-1">El centro de vigilancia visual. Intercepta imágenes de cualquier parte del sistema.</p>
      </div>

      {/* Tabs Selector */}
      <div className="inline-flex bg-gray-900 border border-gray-800 p-1.5 rounded-xl mb-6 shadow-inner gap-1 flex-wrap">
          <button 
              onClick={() => setFilter('posts')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${filter === 'posts' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}
          >
              <FileText size={16}/> Publicaciones Públicas
          </button>
          <button 
              onClick={() => setFilter('chats')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${filter === 'chats' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}
          >
              <MessageSquare size={16}/> Chats Privados
          </button>
          <button 
              onClick={() => setFilter('profiles')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${filter === 'profiles' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}
          >
              <User size={16}/> Avatares de Perfil
          </button>
      </div>

      {/* Grid de Imágenes */}
      {loading ? (
         <div className="text-center py-16 text-purple-500 font-bold animate-pulse">Sincronizando satélites visuales...</div> 
      ) : mediaList.length === 0 ? (
         <div className="text-center py-16 text-gray-500 font-medium">Bandeja limpia. No hay medios en esta categoría.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {mediaList.map((media) => (
             <div 
                key={media.id} 
                onClick={() => setSelectedMedia(media)}
                className="aspect-square bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden relative group cursor-pointer shadow-lg hover:shadow-purple-500/20 hover:border-purple-500/50 transition-all"
             >
                <img src={media.url} alt="Media" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                
                {/* Etiqueta flotante inferior */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-8 pb-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-xs font-black text-white truncate">@{media.username}</p>
                </div>
             </div>
          ))}
        </div>
      )}

      {/* MODAL LIGHTBOX AVANZADO */}
      <AnimatePresence>
          {selectedMedia && (
             <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
             >
                <button onClick={() => setSelectedMedia(null)} className="absolute top-6 right-6 text-gray-400 hover:text-white bg-gray-900 hover:bg-red-500/20 p-3 rounded-full transition-colors z-50">
                    <X size={24} />
                </button>

                <motion.div 
                   initial={{ scale: 0.9, y: 20 }}
                   animate={{ scale: 1, y: 0 }}
                   exit={{ scale: 0.9, y: 20 }}
                   className="w-full max-w-5xl h-[85vh] flex flex-col md:flex-row bg-[#0b0f19] border border-gray-800 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]"
                >
                   {/* Zona Izquierda: La Imagen Pura */}
                   <div className="w-full md:w-2/3 h-[50vh] md:h-full bg-black flex items-center justify-center relative p-4 group">
                       <img src={selectedMedia.url} alt="Preview" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
                       <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white text-[10px] font-mono px-3 py-1.5 rounded-lg border border-white/10 uppercase tracking-widest">
                           Origen: {selectedMedia.type}
                       </div>
                   </div>

                   {/* Zona Derecha: El Panel de Auditoría */}
                   <div className="w-full md:w-1/3 p-6 md:p-8 flex flex-col bg-gray-950 border-l border-gray-800">
                       <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2 border-b border-gray-800 pb-4">
                           <ShieldAlert className="text-purple-500" /> Datos Forenses
                       </h3>

                       <div className="flex items-center gap-4 bg-gray-900 p-4 rounded-2xl border border-gray-800 mb-6 shadow-inner">
                           <div className="w-14 h-14 rounded-full border-2 border-gray-700 bg-gray-800 overflow-hidden shrink-0">
                               {selectedMedia.user_pic ? <img src={selectedMedia.user_pic} className="w-full h-full object-cover" /> : <User className="m-auto h-full text-gray-500"/>}
                           </div>
                           <div className="min-w-0">
                               <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-0.5">Propiedad de</p>
                               <p className="text-base font-black text-purple-400 truncate">@{selectedMedia.username}</p>
                           </div>
                       </div>

                       <div className="space-y-4 bg-gray-900/50 p-5 rounded-2xl border border-gray-800/50 mb-auto">
                           <div>
                               <span className="block text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Fecha de Captura</span>
                               <span className="text-gray-300 font-mono text-sm">{selectedMedia.date}</span>
                           </div>
                           <div>
                               <span className="block text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">ID Interno Origen</span>
                               <span className="text-gray-300 font-mono text-sm">#{selectedMedia.source_id}</span>
                           </div>
                           <div>
                               <span className="block text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">URL Base</span>
                               <a href={selectedMedia.url} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 text-xs font-mono truncate block hover:underline">
                                   Ver archivo original ↗
                               </a>
                           </div>
                       </div>

                       {/* BOTÓN DE DESTRUCCIÓN */}
                       <div className="pt-6 mt-6 border-t border-gray-800">
                           <p className="text-xs text-red-400/80 mb-3 text-center font-medium leading-relaxed">
                               Si este archivo incumple las normativas, puedes purgarlo del sistema inmediatamente.
                           </p>
                           <button 
                               onClick={() => handleDelete(selectedMedia.type, selectedMedia.source_id)}
                               className="w-full bg-red-950 hover:bg-red-600 text-red-500 hover:text-white border border-red-900 hover:border-red-500 py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2 active:scale-95"
                           >
                               <AlertOctagon size={18} /> Purgar Archivo
                           </button>
                       </div>
                   </div>
                </motion.div>
             </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
}