"use client";

import { useState, useEffect } from "react";
import { Settings, Edit3, MapPin, Crown, LogOut, FileText, UserCircle, Grid } from "lucide-react";
import { api } from "@/utils/api";
import { motion, AnimatePresence } from "framer-motion";
import EditProfileModal from "./EditProfileModal";
import SettingsModal from "./SettingsModal";
import PostModal from "./PostModal";
import { useRouter } from "next/navigation";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);
  
  const [showEdit, setShowEdit] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const router = useRouter();

  const fetchUserAndPosts = async () => {
    try {
      const data = await api.get("/me");
      setUser(data);
      
      if (data && data.id) {
          const userPosts = await api.get(`/users/${data.id}/posts`);
          setPosts(userPosts || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUserAndPosts(); }, []);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  const handleDeletePost = async (postId) => {
      try {
          await api.delete(`/social/posts/${postId}`);
          setPosts(posts.filter(p => p.id !== postId));
          setSelectedPost(null); 
      } catch (error) {
          console.error(error);
      }
  };

  // ✅ FILTRADO ESTRICTO DE FOTOS PARA EVITAR EL ERROR DE NEXT.JS
  const getValidPhotos = () => {
      if (!user) return ["https://via.placeholder.com/600x800"];
      let valid = [];
      if (user.photos && Array.isArray(user.photos)) {
          valid = user.photos.filter(p => typeof p === 'string' && p.trim() !== "");
      }
      if (valid.length === 0 && user.photo && typeof user.photo === 'string' && user.photo.trim() !== "") {
          valid = [user.photo];
      }
      if (valid.length === 0) {
          valid = ["https://via.placeholder.com/600x800"];
      }
      return valid;
  };

  const photos = getValidPhotos();

  const nextPhoto = () => {
    if (activePhoto < photos.length - 1) setActivePhoto(activePhoto + 1);
  };

  const prevPhoto = () => {
    if (activePhoto > 0) setActivePhoto(activePhoto - 1);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-cuadralo-bgLight dark:bg-[#0f0518]">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="h-12 w-12 border-4 border-cuadralo-pink border-t-transparent rounded-2xl" />
      </div>
    );
  }

  const isPrime = user?.is_prime;

  return (
    <div className="w-full h-full overflow-y-auto no-scrollbar bg-cuadralo-bgLight dark:bg-[#0f0518] text-cuadralo-textLight dark:text-white relative">
      
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-0 md:gap-10 lg:gap-16 md:p-8 lg:p-12 pb-28">
        
        {/* COLUMNA IZQUIERDA: FOTO PROTAGONISTA */}
        <div className="w-full md:w-[40%] lg:w-[420px] flex-shrink-0 md:sticky md:top-8 h-max z-10">
          <div className={`relative w-full aspect-[3/4] md:rounded-[2.5rem] rounded-b-[2.5rem] overflow-hidden bg-black shadow-2xl transition-all ${isPrime ? 'ring-4 ring-yellow-500 shadow-[0_10px_40px_rgba(234,179,8,0.3)]' : 'shadow-cuadralo-pink/10'}`}>
            
            {isPrime && (
              <div className="absolute top-6 right-5 z-30 bg-gradient-to-r from-yellow-400 to-yellow-600 p-2.5 rounded-xl shadow-lg border border-yellow-300">
                <Crown size={20} className="text-white fill-white animate-pulse" />
              </div>
            )}

            <AnimatePresence mode="wait">
              <motion.img
                key={activePhoto}
                src={photos[activePhoto]}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full object-cover"
                alt="Profile"
              />
            </AnimatePresence>

            {photos.length > 1 && (
                <div className="absolute top-4 inset-x-4 flex gap-1.5 z-20">
                {photos.map((_, i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i === activePhoto ? 'bg-white shadow-[0_0_5px_rgba(255,255,255,0.8)]' : 'bg-white/30 backdrop-blur-md'}`} />
                ))}
                </div>
            )}

            <div className="absolute inset-0 flex z-10">
              <div className="w-1/2 cursor-pointer" onClick={prevPhoto} />
              <div className="w-1/2 cursor-pointer" onClick={nextPhoto} />
            </div>

            <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent text-white pointer-events-none md:hidden">
              <h1 className="text-4xl font-black uppercase tracking-tighter flex items-end gap-2 drop-shadow-md">
                {user?.name}
                <span className="text-3xl font-light text-cuadralo-pink">
                  {user?.birth_date ? new Date().getFullYear() - new Date(user?.birth_date).getFullYear() : ""}
                </span>
              </h1>
              <div className="flex items-center gap-2 mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-300">
                <MapPin size={14} className="text-cuadralo-pink" /> {user?.location || "Sin ubicación"}
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA */}
        <div className="flex-1 px-6 md:px-0 mt-8 md:mt-0 space-y-8 md:space-y-10 pb-10">
          
          <div className="hidden md:block">
            <h1 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter flex items-end gap-3 drop-shadow-md">
              {user?.name}
              <span className="text-4xl lg:text-5xl font-light text-cuadralo-pink mb-1">
                {user?.birth_date ? new Date().getFullYear() - new Date(user?.birth_date).getFullYear() : ""}
              </span>
            </h1>
            <div className="flex items-center gap-2 mt-3 text-sm font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
              <MapPin size={18} className="text-cuadralo-pink" /> {user?.location || "Sin ubicación configurada"}
            </div>
          </div>
          
          <div className="flex flex-col xl:flex-row gap-6 max-w-2xl">
              <div className="flex flex-1 justify-around bg-white dark:bg-[#150a21] p-4 md:p-5 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
                  <div className="text-center">
                      <span className="block text-2xl font-black text-cuadralo-textLight dark:text-white">{user?.followers_count || 0}</span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Seguidores</span>
                  </div>
                  <div className="text-center">
                      <span className="block text-2xl font-black text-cuadralo-textLight dark:text-white">{user?.following_count || 0}</span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Seguidos</span>
                  </div>
              </div>

              <div className="flex flex-1 gap-3">
                <button onClick={() => setShowEdit(true)} className="flex-1 py-4 md:py-5 bg-cuadralo-pink hover:bg-cuadralo-pinkLight text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-xl shadow-cuadralo-pink/20 transition-all active:scale-95">
                  <Edit3 size={18} /> Editar Perfil
                </button>
                <button onClick={() => setShowSettings(true)} className="p-4 md:p-5 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 rounded-2xl border border-gray-100 dark:border-white/5 transition-all shadow-sm active:scale-95 text-gray-700 dark:text-white">
                  <Settings size={24} />
                </button>
              </div>
          </div>

          <section className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3 text-cuadralo-pink">
                <FileText size={18} />
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">Mi Biografía</h3>
            </div>
            <div className="bg-white dark:bg-[#150a21] p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
               <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed italic">
                 {user?.bio ? `"${user.bio}"` : "Aún no has escrito nada sobre ti. ¿Qué te hace único?"}
               </p>
            </div>
          </section>

          <section className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4 text-cuadralo-pink">
                <UserCircle size={18} />
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">Mis Intereses</h3>
            </div>
            {user?.interestsList && user.interestsList.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {user.interestsList.map((slug, idx) => (
                    <span key={idx} className="px-5 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-xs md:text-sm font-bold tracking-widest uppercase text-gray-700 dark:text-white/90 shadow-sm hover:border-cuadralo-pink/50 transition-colors">
                      {slug.replace("-", " ")}
                    </span>
                  ))}
                </div>
            ) : (
                <p className="text-sm text-gray-400 italic">No tienes intereses agregados.</p>
            )}
          </section>

          <section className="pt-8 md:pt-10 border-t border-gray-200 dark:border-white/10">
              <div className="flex items-center gap-2 mb-6 md:ml-2">
                  <Grid size={20} className="text-cuadralo-pink" />
                  <h3 className="text-sm font-black uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">Mis Publicaciones</h3>
              </div>
              
              {posts && posts.length > 0 ? (
                  <div className="grid grid-cols-3 gap-1 md:gap-3">
                      {posts.map((post) => (
                          <div 
                              key={post.id} 
                              onClick={() => setSelectedPost(post)}
                              className="relative aspect-square bg-gray-200 dark:bg-black rounded-lg md:rounded-2xl overflow-hidden cursor-pointer group"
                          >
                              <img 
                                  src={post.image_url} 
                                  alt="Post" 
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
                          </div>
                      ))}
                  </div>
              ) : (
                  <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-3xl p-10 text-center flex flex-col items-center justify-center shadow-sm">
                      <Grid size={40} className="text-gray-400 dark:text-gray-600 mb-4 opacity-50" />
                      <p className="text-gray-500 italic mb-4">Aún no tienes publicaciones en tu muro.</p>
                  </div>
              )}
          </section>

          <button onClick={handleLogout} className="max-w-2xl w-full py-4 md:py-5 mt-8 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-red-500 hover:text-white transition-all flex justify-center items-center gap-2">
            <LogOut size={18} /> Cerrar Sesión
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showEdit && <EditProfileModal user={user} onClose={() => setShowEdit(false)} onUpdate={fetchUserAndPosts} />}
        {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
        {selectedPost && (
            <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} onDelete={() => handleDeletePost(selectedPost.id)} />
        )}
      </AnimatePresence>
    </div>
  );
}