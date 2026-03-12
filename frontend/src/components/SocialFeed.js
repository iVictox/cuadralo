"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2, RefreshCw, Crown, Sparkles } from "lucide-react"; 
import StoriesBar from "./StoriesBar"; 
import FeedPost from "./FeedPost";
import StoryViewer from "./StoryViewer";
import SocialHeader from "./SocialHeader"; 
import SearchModal from "./SearchModal"; 
// ✅ IMPORTAMOS EL MODAL DE NOTIFICACIONES
import NotificationModal from "./NotificationModal"; 
import { api } from "@/utils/api";
import { AnimatePresence, motion } from "framer-motion";
import PrimeModal from "@/components/PrimeModal";

export default function SocialFeed({ onUploadClick }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [stories, setStories] = useState([]); 
  const [myStories, setMyStories] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  
  const [viewingUserStories, setViewingUserStories] = useState(null);
  const [showPrime, setShowPrime] = useState(false);
  const [isPrime, setIsPrime] = useState(false);
  
  const [showSearchModal, setShowSearchModal] = useState(false);
  // ✅ ESTADOS DE NOTIFICACIONES
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);

  const [activeTab, setActiveTab] = useState("for_you");

  const fetchData = async (tab = activeTab, isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);

      const status = await api.get("/premium/status").catch(() => ({ is_prime: false }));
      setIsPrime(status.is_prime);

      const userStr = localStorage.getItem("user");
      const me = userStr ? JSON.parse(userStr) : null;
      setCurrentUser(me);

      // ✅ Cargar cantidad de notificaciones no leídas
      const notifs = await api.get("/notifications").catch(() => []);
      if (Array.isArray(notifs)) {
          setUnreadNotifsCount(notifs.filter(n => !n.is_read).length);
      }

      const feedData = await api.get(`/social/feed?tab=${tab}`);
      setPosts(Array.isArray(feedData) ? feedData : []);

      const storiesResponse = await api.get("/social/stories");
      if (storiesResponse) {
          setStories(storiesResponse.feed || []);
          setMyStories(storiesResponse.my_stories || []);
      }
    } catch (error) {
      console.error("Error data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(activeTab); }, [activeTab]);

  // WebSockets para tiempo real
  useEffect(() => {
      const handleSocketEvent = (e) => {
          const { type, payload } = e.detail;

          // ✅ NUEVO: ESCUCHAR NOTIFICACIONES EN TIEMPO REAL
          if (type === "new_notification") {
              setUnreadNotifsCount(prev => prev + 1);
          }

          if (type === "new_story") {
              api.get("/social/stories").then(res => {
                  if (res) { setStories(res.feed || []); setMyStories(res.my_stories || []); }
              }).catch(() => {});
          }

          if (type === "story_viewed") {
              setStories(prev => prev.map(group => {
                  let changed = false;
                  const newGroupStories = group.stories.map(s => {
                      if (String(s.id) === String(payload.story_id) && !s.seen) { changed = true; return { ...s, seen: true }; }
                      return s;
                  });
                  if (changed) return { ...group, stories: newGroupStories, all_seen: newGroupStories.every(s => s.seen) };
                  return group;
              }));
          }

          if (type === "story_seen_by") {
              setMyStories(prev => prev.map(s => String(s.id) === String(payload.story_id) ? { ...s, views_count: (s.views_count || 0) + 1 } : s));
              setViewingUserStories(prev => {
                  if (prev && prev.isOwner) return { ...prev, list: prev.list.map(s => String(s.id) === String(payload.story_id) ? { ...s, views_count: (s.views_count || 0) + 1 } : s) };
                  return prev;
              });
          }

          if (type === "story_deleted") {
              const { story_id, user_id } = payload;
              if (currentUser && String(user_id) === String(currentUser.id)) {
                  setMyStories(prev => prev.filter(s => String(s.id) !== String(story_id)));
              } else {
                  setStories(prev => prev.map(group => {
                      if (String(group.user.id) === String(user_id)) return { ...group, stories: group.stories.filter(s => String(s.id) !== String(story_id)) };
                      return group;
                  }).filter(group => group.stories.length > 0));
              }
              setViewingUserStories(prev => {
                  if (!prev) return null;
                  const newList = prev.list.filter(s => String(s.id) !== String(story_id));
                  if (newList.length === 0) return null;
                  return { ...prev, list: newList };
              });
          }
      };

      window.addEventListener("socket_event", handleSocketEvent);
      return () => window.removeEventListener("socket_event", handleSocketEvent);
  }, [currentUser]);

  const handleRefresh = () => { setRefreshing(true); fetchData(activeTab, true); };
  const handlePostDeleted = (deletedPostId) => { setPosts(prev => prev.filter(p => p.id !== deletedPostId)); };

  const handleViewStory = (targetUserId) => {
      if (currentUser && targetUserId === currentUser.id) {
          if (myStories.length > 0) setViewingUserStories({ list: myStories, isOwner: true });
      } else {
          const targetGroup = stories.find(g => g.user.id === targetUserId);
          if (targetGroup && targetGroup.stories.length > 0) setViewingUserStories({ list: targetGroup.stories, isOwner: false });
      }
  };

  return (
    <div className="w-full h-full relative overflow-y-auto pb-28 no-scrollbar scroll-smooth">
      
      {/* HEADER SUPERIOR */}
      <SocialHeader 
        unreadCount={unreadNotifsCount} // ✅ Conectado en tiempo real
        onSearchClick={() => setShowSearchModal(true)} 
        onNotifClick={() => setShowNotifModal(true)} // ✅ Abre el modal
      />

      {/* HISTORIAS */}
      <div className="mb-4 pt-[10px] px-2 md:px-6">
          <StoriesBar stories={stories} myStories={myStories} currentUser={currentUser} onViewStory={handleViewStory} onRefresh={() => fetchData(activeTab, true)} />
      </div>

      {/* TABS DE NAVEGACIÓN */}
      <div className="flex justify-center mb-6 px-4">
          <div className="flex bg-black/5 dark:bg-white/5 p-1.5 rounded-2xl w-full max-w-[320px] shadow-inner">
              <button onClick={() => setActiveTab("for_you")} className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all duration-300 ${activeTab === "for_you" ? "bg-white dark:bg-cuadralo-cardDark text-cuadralo-pink shadow-md" : "text-cuadralo-textMutedLight dark:text-gray-400 hover:text-cuadralo-textLight dark:hover:text-white"}`}>Para ti</button>
              <button onClick={() => setActiveTab("following")} className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all duration-300 ${activeTab === "following" ? "bg-white dark:bg-cuadralo-cardDark text-cuadralo-pink shadow-md" : "text-cuadralo-textMutedLight dark:text-gray-400 hover:text-cuadralo-textLight dark:hover:text-white"}`}>Siguiendo</button>
          </div>
      </div>

      {/* BANNER PREMIUM */}
      {!isPrime && !loading && (
          <div className="flex justify-center mb-8 px-4">
              <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} onClick={() => setShowPrime(true)} className="group w-full max-w-md flex items-center justify-center gap-3 px-6 py-3 rounded-2xl bg-white/40 dark:bg-black/40 border border-yellow-500/30 hover:border-yellow-400 shadow-glass-light dark:shadow-glass-dark backdrop-blur-lg transition-all">
                  <Crown size={18} className="text-yellow-500 group-hover:scale-110 transition-transform" fill="currentColor" />
                  <span className="text-sm font-medium text-gray-700 dark:text-yellow-100/90">Sube tus fotos en <b className="text-yellow-600 dark:text-yellow-400">Ultra HD</b></span>
                  <Sparkles size={16} className="text-yellow-400 opacity-50 group-hover:opacity-100 animate-pulse" />
              </motion.button>
          </div>
      )}

      {/* FEED DE POSTS */}
      {loading ? (
         <div className="flex justify-center py-10"><Loader2 className="animate-spin text-cuadralo-pink" size={40} /></div>
      ) : (
         <div className="w-full max-w-[600px] mx-auto px-4 flex flex-col gap-8 pb-20">
            <AnimatePresence mode="popLayout">
                {posts.map((post, i) => (
                  <motion.div key={post.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.1, duration: 0.4, ease: "easeOut" }}>
                      <FeedPost post={post} onDelete={() => handlePostDeleted(post.id)} onViewStory={() => handleViewStory(post.user.id)} />
                  </motion.div>
                ))}
            </AnimatePresence>

            {posts.length === 0 && (
               <div className="text-center text-cuadralo-textMutedLight dark:text-cuadralo-textMutedDark py-16 px-6 font-medium">
                  {activeTab === "following" 
                      ? "Aún no sigues a nadie o tus amigos no han publicado nada. ¡Usa el buscador para conectarte!" 
                      : "No hay publicaciones aún. ¡Sé el primero en romper el hielo!"}
               </div>
            )}
            
            {posts.length > 0 && (
                <button onClick={handleRefresh} className="mx-auto flex items-center gap-2 text-xs text-cuadralo-textMutedLight dark:text-cuadralo-textMutedDark hover:text-cuadralo-pink transition-colors py-6 mb-10 bg-white/5 dark:bg-black/20 px-6 rounded-full backdrop-blur-md">
                    {refreshing ? <Loader2 className="animate-spin" size={16}/> : <RefreshCw size={16}/>} Actualizar Feed
                </button>
            )}
         </div>
      )}

      <button onClick={onUploadClick} className="fixed bottom-24 right-6 md:bottom-10 md:right-10 w-14 h-14 bg-cuadralo-pink text-white rounded-2xl flex items-center justify-center shadow-[0_8px_30px_rgb(242,19,142,0.4)] hover:shadow-[0_8px_30px_rgb(242,19,142,0.6)] hover:-translate-y-1 active:scale-95 transition-all z-40 group">
        <Plus size={28} className="group-hover:rotate-90 transition-transform duration-300" strokeWidth={2.5} />
      </button>

      <AnimatePresence>
          {showSearchModal && <SearchModal onClose={() => setShowSearchModal(false)} />}
          
          {/* ✅ RENDERIZAMOS EL MODAL DE NOTIFICACIONES */}
          {showNotifModal && (
              <NotificationModal 
                  onClose={() => setShowNotifModal(false)} 
                  onReadSync={() => setUnreadNotifsCount(prev => Math.max(0, prev - 1))}
              />
          )}

          {viewingUserStories && (
              <StoryViewer stories={viewingUserStories.list} isOwner={viewingUserStories.isOwner} onClose={() => setViewingUserStories(null)} />
          )}
          {showPrime && <PrimeModal onClose={() => setShowPrime(false)} />}
      </AnimatePresence>
    </div>
  );
}