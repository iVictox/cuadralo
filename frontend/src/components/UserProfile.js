"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
    ArrowLeft, MoreVertical, MapPin, Grid, Settings, 
    Loader2, Heart, Edit3, Share2, X, MessageCircle, UserPlus, UserCheck, ChevronLeft, ChevronRight,
    Crown, Zap
} from "lucide-react";
import { api } from "@/utils/api";
import { useToast } from "@/context/ToastContext";
import { motion, AnimatePresence } from "framer-motion";
import EditProfileModal from "./EditProfileModal"; 
import SettingsModal from "./SettingsModal"; 
import FeedPost from "./FeedPost"; 
import { getInterestInfo } from "@/utils/interests"; 

export default function UserProfile({ username, isTab = false }) {
  const router = useRouter();
  const { showToast } = useToast();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Modales
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  const [selectedPost, setSelectedPost] = useState(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const fetchProfile = async () => {
    try {
      // Leer usuario actual para comparar IDs
      const userStr = localStorage.getItem("user");
      const myUser = userStr ? JSON.parse(userStr) : null;
      setCurrentUser(myUser);

      // Si estoy en la pestaña de perfil, cargo "/me" para tener datos frescos (Premium/Boost)
      const endpoint = (isTab && (!username || username === myUser?.username)) 
          ? "/me" 
          : `/u/${username}`;

      const data = await api.get(endpoint);
      
      if (data.user) {
          setProfile(data);
          setIsFollowing(data.user.is_following);
      } else {
          // Soporte para estructura antigua o directa de usuario
          if(!data.posts) {
              const myPosts = await api.get("/social/feed?user_id=" + data.id).catch(() => []);
              setProfile({ user: data, posts: myPosts });
          } else {
              setProfile({ user: data, posts: data.posts || [] });
          }
      }
    } catch (error) {
      console.error("Error loading profile", error);
      if (!isTab) {
          showToast("Usuario no encontrado", "error");
          router.push("/");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, [username, isTab]);

  const handleFollow = async () => {
    if (!profile) return;
    const previousState = isFollowing;
    setIsFollowing(!isFollowing);
    
    setProfile(prev => ({
        ...prev,
        user: { ...prev.user, followers_count: !previousState ? prev.user.followers_count + 1 : prev.user.followers_count - 1 }
    }));

    try { await api.post(`/users/${profile.user.id}/follow`, {}); } 
    catch (error) { setIsFollowing(previousState); showToast("Error al seguir", "error"); }
  };

  const handleEditSuccess = () => { setShowEditModal(false); fetchProfile(); };

  const handleShareProfile = async () => {
      if (!profile?.user) return;
      const shareUrl = `${window.location.origin}/u/${profile.user.username}`;
      const shareData = { title: `Perfil de ${profile.user.name}`, text: `Mira este perfil en Cuadralo`, url: shareUrl };
      if (navigator.share) { try { await navigator.share(shareData); } catch (err) {} } 
      else { navigator.clipboard.writeText(shareUrl); showToast("Enlace copiado 📋"); }
  };

  const getGallery = () => {
      if (!profile?.user) return [];
      const main = profile.user.photo;
      const gallery = profile.user.photos || [];
      if (gallery.length === 0) return [main];
      return gallery;
  };
  const galleryImages = getGallery();

  const nextPhoto = (e) => { if(e) e.stopPropagation(); setCurrentPhotoIndex((prev) => (prev + 1) % galleryImages.length); };
  const prevPhoto = (e) => { if(e) e.stopPropagation(); setCurrentPhotoIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length); };

  const renderInterests = () => {
      if (!user.interests || user.interests.length === 0) return null;
      return (
        <div className="flex flex-wrap gap-2">
            {user.interests.map((interest, idx) => {
                const { label, Icon } = getInterestInfo(interest);
                return (
                    <span key={idx} className="px-3 py-1.5 bg-white/5 rounded-full text-xs font-medium text-gray-200 border border-white/10 flex items-center gap-1.5 hover:bg-white/10 transition-colors capitalize">
                        <Icon size={14} className="text-cuadralo-pink" />{label}
                    </span>
                );
            })}
        </div>
      );
  };

  if (loading) return <div className="w-full h-full flex items-center justify-center min-h-[50vh]"><Loader2 className="animate-spin text-cuadralo-pink" size={40} /></div>;
  if (!profile) return <div className="text-white text-center mt-20">Perfil no disponible</div>;

  const { user, posts } = profile;
  const isMe = currentUser?.id === user.id;

  // ✅ LÓGICA VISUAL PREMIUM
  const isPrime = user.is_prime;
  const isBoosted = user.is_boosted;

  return (
    <div className={`w-full bg-[#05020a] relative ${isTab ? 'h-full overflow-y-auto pb-24' : 'min-h-screen pb-24 md:pl-20'}`}>
      
      <div className="hidden md:block absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-[#1a0b2e] to-[#05020a] z-0 pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl mx-auto md:px-6 md:py-8 grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* COLUMNA IZQUIERDA (FOTO) */}
        <div className="md:col-span-5 lg:col-span-4 flex flex-col gap-4">
            <div className={`relative w-full aspect-[3/4] sm:aspect-[4/5] md:aspect-[3/4] bg-[#1a0b2e] md:rounded-3xl overflow-hidden shadow-2xl group border-b border-white/5 md:border 
                ${isPrime ? 'border-yellow-500/50 shadow-yellow-900/20' : 'md:border-white/10'}
            `}>
                
                {/* ✅ EFECTO BOOST: Anillo Animado si está Boosted */}
                {isBoosted && (
                    <div className="absolute inset-0 z-20 pointer-events-none border-[3px] border-transparent rounded-3xl animate-pulse shadow-[inset_0_0_20px_rgba(236,72,153,0.5)] border-t-cuadralo-pink/50" />
                )}

                <AnimatePresence mode="wait">
                    <motion.img key={currentPhotoIndex} src={galleryImages[currentPhotoIndex]} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="w-full h-full object-cover" alt="Profile" />
                </AnimatePresence>

                {/* Navbar flotante en móvil */}
                <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent z-20">
                    <div>{!isTab && <button onClick={() => router.back()} className="p-2 rounded-full bg-black/20 backdrop-blur-md text-white border border-white/10 hover:bg-black/40"><ArrowLeft size={24} /></button>}</div>
                    <div>
                         {isMe ? (
                            <div className="flex gap-2 md:hidden">
                                <button onClick={() => setShowEditModal(true)} className="px-4 py-2 rounded-full bg-cuadralo-pink text-white text-xs font-bold shadow-lg flex items-center gap-2"><Edit3 size={14} /> Editar</button>
                                <button onClick={() => setShowSettingsModal(true)} className="p-2 rounded-full bg-black/40 text-white border border-white/10"><Settings size={18} /></button>
                            </div>
                         ) : (<button className="md:hidden p-2 rounded-full bg-black/20 backdrop-blur-md text-white border border-white/10"><MoreVertical size={24} /></button>)}
                    </div>
                </div>

                {/* Navegación Galería */}
                {galleryImages.length > 1 && (
                    <>
                        <div className="absolute inset-y-0 left-0 w-1/3 z-10 cursor-pointer" onClick={prevPhoto} />
                        <div className="absolute inset-y-0 right-0 w-1/3 z-10 cursor-pointer" onClick={nextPhoto} />
                        <div className="hidden md:flex absolute inset-0 items-center justify-between px-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-20">
                             <button onClick={prevPhoto} className="pointer-events-auto p-2 rounded-full bg-black/40 text-white hover:bg-cuadralo-pink hover:scale-110 transition-all"><ChevronLeft size={24}/></button>
                             <button onClick={nextPhoto} className="pointer-events-auto p-2 rounded-full bg-black/40 text-white hover:bg-cuadralo-pink hover:scale-110 transition-all"><ChevronRight size={24}/></button>
                        </div>
                        <div className="absolute top-3 left-0 w-full flex justify-center gap-1.5 z-30 px-10">
                            {galleryImages.map((_, idx) => (<div key={idx} className={`h-1 flex-1 rounded-full transition-all shadow-sm ${idx === currentPhotoIndex ? "bg-white" : "bg-white/30"}`} />))}
                        </div>
                    </>
                )}

                {/* Info en Móvil (con badges) */}
                <div className="md:hidden absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-[#05020a] via-[#05020a]/80 to-transparent z-20 pt-24">
                    <div className="flex items-center gap-2">
                        <h1 className="text-3xl font-bold text-white flex items-end gap-2">
                            {user.name} 
                        </h1>
                        {isPrime && <Crown size={24} className="text-yellow-400 fill-yellow-400 mb-1" />}
                        {isBoosted && <Zap size={24} className="text-cuadralo-pink fill-current mb-1 animate-pulse" />}
                        <span className="text-xl font-normal text-gray-300 mb-1">{user.age}</span>
                    </div>
                    <p className="text-sm text-gray-300 mt-1 flex items-center gap-1"><MapPin size={14} className="text-cuadralo-pink" /> {user.location || "Venezuela"}</p>
                </div>
            </div>

            {/* BOTONES PC (SIDEBAR) */}
            <div className="hidden md:flex flex-col gap-3">
                 {isMe ? (
                    <>
                        <button onClick={() => setShowEditModal(true)} className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 hover:border-cuadralo-pink/50 transition-all flex items-center justify-center gap-2">
                            <Edit3 size={18} /> Editar Perfil
                        </button>
                        <button onClick={() => setShowSettingsModal(true)} className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 hover:border-cuadralo-pink/50 transition-all flex items-center justify-center gap-2">
                            <Settings size={18} /> Ajustes de Cuenta
                        </button>
                    </>
                 ) : (
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={handleFollow} className={`py-3 rounded-xl font-bold flex justify-center items-center gap-2 transition-all shadow-lg ${isFollowing ? "bg-white/5 border border-white/20 text-white" : "bg-gradient-to-r from-cuadralo-pink to-purple-600 text-white shadow-lg"}`}>{isFollowing ? <><UserCheck size={18} className="mr-2"/> Siguiendo</> : <><UserPlus size={18} className="mr-2"/> Seguir</>}</button>
                        <button className="py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all flex justify-center items-center gap-2"><MessageCircle size={18} /> Mensaje</button>
                    </div>
                 )}
            </div>
        </div>

        {/* COLUMNA DERECHA (DETALLES Y POSTS) */}
        <div className="md:col-span-7 lg:col-span-8 flex flex-col gap-6 px-4 md:px-0">
            <div className="hidden md:flex flex-col gap-4 p-6 bg-[#0f0518] border border-white/5 rounded-3xl shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex justify-between items-start">
                        <div>
                            {/* ✅ NOMBRE CON INSIGNIAS (PC) */}
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className={`text-4xl font-bold ${isPrime ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500' : 'text-white'}`}>
                                    {user.name}
                                </h1>
                                {isPrime && <Crown size={28} className="text-yellow-400 fill-yellow-400" />}
                                {isBoosted && <div title="Perfil Destacado"><Zap size={28} className="text-cuadralo-pink fill-current animate-bounce" /></div>}
                            </div>
                            <p className="text-gray-400 text-lg">@{user.username || "usuario"} • {user.age} años</p>
                        </div>
                        <button onClick={handleShareProfile} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"><Share2 size={24}/></button>
                    </div>

                    <div className="flex items-center gap-6 mt-6">
                        <div className="flex flex-col"><span className="text-2xl font-bold text-white">{posts?.length || 0}</span><span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Posts</span></div>
                        <div className="w-px h-8 bg-white/10" />
                        <div className="flex flex-col"><span className="text-2xl font-bold text-white">{user.followers_count}</span><span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Seguidores</span></div>
                        <div className="w-px h-8 bg-white/10" />
                        <div className="flex flex-col"><span className="text-2xl font-bold text-white">{user.following_count}</span><span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Seguidos</span></div>
                    </div>

                    {user.bio && (<div className="mt-6 pt-6 border-t border-white/5"><p className="text-gray-300 leading-relaxed whitespace-pre-line max-w-2xl">{user.bio}</p></div>)}
                    {user.interests && <div className="mt-6">{renderInterests()}</div>}
                </div>
            </div>

            {/* INFO MOVIL */}
            <div className="md:hidden space-y-4">
                 {user.interests && <div className="px-2">{renderInterests()}</div>}
                 {user.bio && <p className="text-gray-300 text-sm leading-relaxed px-2">{user.bio}</p>}
                 <div className="flex items-center justify-around py-3 bg-white/5 rounded-2xl border border-white/5 mx-2">
                    <div className="text-center"><span className="block text-lg font-bold text-white">{posts?.length || 0}</span><span className="text-[10px] text-gray-500 uppercase font-bold">Posts</span></div>
                    <div className="text-center"><span className="block text-lg font-bold text-white">{user.followers_count}</span><span className="text-[10px] text-gray-500 uppercase font-bold">Seguidores</span></div>
                    <div className="text-center"><span className="block text-lg font-bold text-white">{user.following_count}</span><span className="text-[10px] text-gray-500 uppercase font-bold">Seguidos</span></div>
                 </div>
                 {!isMe && (
                    <div className="flex gap-3 px-2">
                         <button onClick={handleFollow} className={`flex-1 py-2.5 rounded-full text-sm font-bold flex justify-center items-center gap-2 transition-all ${isFollowing ? "bg-white/10 border border-white/20 text-white" : "bg-gradient-to-r from-cuadralo-pink to-purple-600 text-white shadow-lg"}`}>{isFollowing ? "Siguiendo" : "Seguir"}</button>
                         <button className="p-2.5 bg-white/10 border border-white/20 rounded-full text-white"><MessageCircle size={20} /></button>
                    </div>
                 )}
            </div>

            {/* GRID DE POSTS */}
            <div className="md:mt-4">
                <div className="hidden md:flex items-center gap-2 mb-4 pb-2 border-b border-white/5"><Grid size={20} className="text-cuadralo-pink" /><h3 className="text-lg font-bold text-white">Publicaciones</h3></div>
                {!posts || posts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-3xl border-2 border-dashed border-white/10"><Grid size={48} className="mb-4 text-white/20" /><p className="text-gray-400 font-medium">Aún no hay publicaciones</p></div>
                ) : (
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-1 md:gap-4">
                        {posts.map(post => (
                            <div key={post.id} onClick={() => setSelectedPost({ ...post, user: user })} className="relative aspect-square bg-[#1a0b2e] cursor-pointer group overflow-hidden md:rounded-xl">
                                <img src={post.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Post" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-bold text-sm"><Heart className="fill-white" size={18} /> <span>{post.likes_count}</span></div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedPost && (
            <div className="fixed inset-0 z-[50] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" onClick={() => setSelectedPost(null)}>
                <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto no-scrollbar rounded-3xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => setSelectedPost(null)} className="absolute top-4 right-4 z-50 p-2 bg-black/50 text-white rounded-full hover:bg-white/20 backdrop-blur-sm transition-colors"><X size={24} /></button>
                    <FeedPost 
                        post={selectedPost} 
                        isModal={true} 
                        onDelete={() => { setSelectedPost(null); fetchProfile(); }} 
                    />
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
          {showEditModal && <EditProfileModal user={user} onClose={() => setShowEditModal(false)} onUpdate={handleEditSuccess} />}
          {showSettingsModal && <SettingsModal onClose={() => setShowSettingsModal(false)} />}
      </AnimatePresence>
    </div>
  );
}