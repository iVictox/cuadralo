"use client";

import { useState, useEffect } from "react";
import { MapPin, Crown, FileText, UserCircle, UserPlus, UserCheck, MessageCircle, ArrowLeft, Grid, Edit3, Settings, Flag } from "lucide-react";
import { api } from "@/utils/api";
import { motion, AnimatePresence } from "framer-motion";
import EditProfileModal from "./EditProfileModal";
import SettingsModal from "./SettingsModal";
import ChatWindow from "./ChatWindow";
import ReportModal from "./ReportModal";
import { getInterestInfo } from "@/utils/interests";
import { useRouter } from "next/navigation";

export default function UserProfile({ username }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);

  const [isMe, setIsMe] = useState(false);

  const [showEdit, setShowEdit] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDirectChat, setShowDirectChat] = useState(false);
  const [reportingUser, setReportingUser] = useState(false);

  const fetchProfileAndPosts = async () => {
    try {
      const data = await api.get(`/u/${username}`);

      let processedInterests = [];
      if (data.interestsList && data.interestsList.length > 0) {
        processedInterests = data.interestsList;
      } else if (data.interests && data.interests.length > 0) {
        processedInterests = data.interests.map(i => i.slug || i.id || i);
      }

      const userWithInterests = { ...data, interestsList: processedInterests };
      setUser(userWithInterests);

      const userStr = localStorage.getItem("user");
      if (userStr && data && data.id) {
        const myUser = JSON.parse(userStr);
        if (myUser.id === data.id) {
          setIsMe(true);
        }
      }

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

  useEffect(() => { fetchProfileAndPosts(); }, [username]);

  const handleFollow = async () => {
    if (isMe) return;
    try {
      const res = await api.post(`/users/${user.id}/follow`);
      setUser({
        ...user,
        is_following: res.following,
        followers_count: res.following ? user.followers_count + 1 : user.followers_count - 1
      });
    } catch (error) { console.error(error); }
  };

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

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-cuadralo-bgLight dark:bg-[#0f0518]">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="h-12 w-12 border-4 border-cuadralo-pink border-t-transparent rounded-2xl" />
    </div>
  );

  if (!user) return (
    <div className="flex flex-col h-screen items-center justify-center bg-cuadralo-bgLight dark:bg-[#0f0518] text-cuadralo-textLight dark:text-white">
      <h2 className="text-3xl font-black uppercase mb-4 tracking-widest">No Encontrado</h2>
      <button onClick={() => router.back()} className="text-cuadralo-pink flex items-center gap-2 font-bold px-6 py-3 bg-white dark:bg-white/5 rounded-2xl shadow-sm hover:scale-105 transition-transform"><ArrowLeft size={18} /> Volver al feed</button>
    </div>
  );

  const isPrime = user?.is_prime;

  return (
    <div className="w-full h-full overflow-y-auto no-scrollbar bg-cuadralo-bgLight dark:bg-[#0f0518] text-cuadralo-textLight dark:text-white relative">

      <button onClick={() => router.back()} className="absolute top-6 left-4 md:hidden z-40 p-3 bg-black/30 hover:bg-black/50 backdrop-blur-md rounded-2xl text-white transition-all shadow-lg border border-white/10">
        <ArrowLeft size={24} />
      </button>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-0 md:gap-12 lg:gap-20 md:p-8 lg:p-12 pb-24">

        <div className="w-full md:w-[45%] lg:w-[450px] flex-shrink-0 md:sticky md:top-8 h-max z-10">
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
                alt="User Profile"
              />
            </AnimatePresence>

            {photos.length > 1 && (
              <div className="absolute top-4 inset-x-16 flex gap-1.5 z-20">
                {photos.map((_, i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i === activePhoto ? 'bg-white shadow-md' : 'bg-white/30 backdrop-blur-md'}`} />
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
              {user?.username && (
                <div className="text-sm font-bold text-gray-300 drop-shadow-md mt-1">
                  @{user.username}
                </div>
              )}
              <div className="flex items-center gap-2 mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-300">
                <MapPin size={14} className="text-cuadralo-pink" /> {user?.location || "En algún lugar..."}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 px-6 md:px-0 mt-8 md:mt-0 space-y-8 md:space-y-10 pb-10">

          <button onClick={() => router.back()} className="hidden md:flex items-center gap-2 text-gray-500 hover:text-cuadralo-pink transition-colors font-bold uppercase tracking-widest text-xs mb-4">
            <ArrowLeft size={16} /> Volver
          </button>

          <div className="hidden md:block">
            <h1 className="text-6xl lg:text-7xl font-black uppercase tracking-tighter flex items-end gap-3 drop-shadow-md">
              {user?.name}
              <span className="text-5xl font-light text-cuadralo-pink mb-1">
                {user?.birth_date ? new Date().getFullYear() - new Date(user?.birth_date).getFullYear() : ""}
              </span>
            </h1>
            {user?.username && (
              <div className="text-xl font-bold text-gray-500 dark:text-gray-400 mt-1">
                @{user.username}
              </div>
            )}
            <div className="flex items-center gap-2 mt-3 text-sm font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
              <MapPin size={18} className="text-cuadralo-pink" /> {user?.location || "Ubicación oculta"}
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
              {isMe ? (
                <>
                  <button onClick={() => setShowEdit(true)} className="flex-1 py-4 md:py-5 bg-cuadralo-pink hover:bg-cuadralo-pinkLight text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-xl shadow-cuadralo-pink/20 transition-all active:scale-95">
                    <Edit3 size={18} /> Editar Perfil
                  </button>
                  <button onClick={() => setShowSettings(true)} className="p-4 md:p-5 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 rounded-2xl border border-gray-100 dark:border-white/5 transition-all shadow-sm active:scale-95 text-gray-700 dark:text-white">
                    <Settings size={22} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleFollow}
                    className={`flex-1 py-4 md:py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all active:scale-95
                            ${user.is_following
                        ? 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white border border-transparent dark:border-white/10'
                        : 'bg-cuadralo-pink text-white shadow-xl shadow-cuadralo-pink/20 hover:bg-cuadralo-pinkLight'}
                        `}
                  >
                    {user.is_following ? <><UserCheck size={18} /> Siguiendo</> : <><UserPlus size={18} /> Seguir</>}
                  </button>

                  <button
                    onClick={() => setShowDirectChat(true)}
                    className="p-4 md:p-5 bg-purple-100 dark:bg-purple-600 hover:bg-purple-200 dark:hover:bg-purple-500 text-purple-700 dark:text-white rounded-2xl transition-all active:scale-95 shadow-sm"
                  >
                    <MessageCircle size={24} fill="currentColor" className="dark:text-white text-purple-700" />
                  </button>

                  <button
                    onClick={() => setReportingUser(true)}
                    className="p-4 md:p-5 bg-orange-100 dark:bg-orange-900/30 hover:bg-orange-200 dark:hover:bg-orange-900/50 text-orange-600 dark:text-orange-400 rounded-2xl transition-all active:scale-95 shadow-sm"
                    title="Reportar Usuario"
                  >
                    <Flag size={24} />
                  </button>
                </>
              )}
            </div>
          </div>

          <section className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3 text-cuadralo-pink">
              <FileText size={18} />
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">{isMe ? "Mi Biografía" : "Sobre Mí"}</h3>
            </div>
            <div className="bg-white dark:bg-[#150a21] p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
              <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed italic">
                {user?.bio || (isMe ? "Aún no has escrito nada sobre ti." : "Persona de pocas palabras.")}
              </p>
            </div>
          </section>

          <section className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4 text-cuadralo-pink">
              <UserCircle size={18} />
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">{isMe ? "Mis Intereses" : "Intereses"}</h3>
            </div>
            {user?.interestsList && user.interestsList.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {user.interestsList.map((slug, idx) => {
                  const info = getInterestInfo(slug);
                  return (
                    <span key={idx} className="px-5 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-xs md:text-sm font-bold tracking-widest uppercase text-gray-700 dark:text-white shadow-sm flex items-center gap-2 transition-colors hover:border-cuadralo-pink/50">
                      <span className="text-cuadralo-pink">{info.icon}</span>
                      {info.name}
                    </span>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">{isMe ? "No tienes intereses agregados." : "Misterio total."}</p>
            )}
          </section>

          <section className="pt-8 md:pt-10 border-t border-gray-200 dark:border-white/10">
            <div className="flex items-center gap-2 mb-6 md:ml-2">
              <Grid size={20} className="text-cuadralo-pink" />
              <h3 className="text-sm font-black uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">{isMe ? "Mis Publicaciones" : "Publicaciones"}</h3>
            </div>

            {posts && posts.length > 0 ? (
              <div className="grid grid-cols-3 gap-1 md:gap-3">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => router.push(`/post/${post.id}`)}
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
                <p className="text-gray-500 italic">{isMe ? "Aún no tienes publicaciones en tu muro." : "Este usuario aún no tiene publicaciones."}</p>
              </div>
            )}
          </section>
        </div>
      </div>

      <AnimatePresence>
        {showEdit && <EditProfileModal user={user} onClose={() => setShowEdit(false)} onUpdate={fetchProfileAndPosts} />}
        {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {showDirectChat && (
          <div className="fixed inset-0 z-[400] bg-black/90 flex items-center justify-center">
            <div className="w-full h-full md:max-w-2xl md:h-[90vh] md:rounded-[2rem] overflow-hidden relative">
              <ChatWindow
                chat={{
                  id: user.id,
                  name: user.name,
                  photo: photos[0],
                  // ✅ SOLUCIÓN: Si es match, isDirect es falso (Chat Gratis). Si no, es Rompehielos.
                  isDirect: !user.is_match
                }}
                onBack={() => setShowDirectChat(false)}
              />
            </div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {reportingUser && <ReportModal targetType="user" targetId={user.id} onClose={() => setReportingUser(false)} />}
      </AnimatePresence>
    </div>
  );
}