"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2, RefreshCw, Crown, Sparkles } from "lucide-react"; 
import StoriesBar from "./StoriesBar"; 
import FeedPost from "./FeedPost";
import StoryViewer from "./StoryViewer";
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
  
  // Esto guardará la lista de historias a reproducir
  const [viewingUserStories, setViewingUserStories] = useState(null);

  const [showPrime, setShowPrime] = useState(false);
  const [isPrime, setIsPrime] = useState(false);

  const fetchData = async () => {
    try {
      const status = await api.get("/premium/status").catch(() => ({ is_prime: false }));
      setIsPrime(status.is_prime);

      const userStr = localStorage.getItem("user");
      const me = userStr ? JSON.parse(userStr) : null;
      setCurrentUser(me);

      const feedData = await api.get("/social/feed");
      setPosts(Array.isArray(feedData) ? feedData : []);

      // Obtenemos del nuevo endpoint unificado
      const storiesResponse = await api.get("/social/stories");
      
      // Asignamos las listas
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

  useEffect(() => { fetchData(); }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handlePostDeleted = (deletedPostId) => {
      setPosts(prev => prev.filter(p => p.id !== deletedPostId));
  };

  // ✅ CORRECCIÓN DE COMUNICACIÓN:
  // Esta función recibe el ID de la persona de la que queremos ver la historia
  const handleViewStory = (targetUserId) => {
      if (currentUser && targetUserId === currentUser.id) {
          // Son mis historias
          if (myStories.length > 0) {
              setViewingUserStories({ list: myStories, isOwner: true });
          }
      } else {
          // Son historias de otro usuario
          const targetGroup = stories.find(g => g.user.id === targetUserId);
          if (targetGroup && targetGroup.stories.length > 0) {
              setViewingUserStories({ list: targetGroup.stories, isOwner: false });
          }
      }
  };

  return (
    <div className="w-full h-full relative overflow-y-auto pb-28 no-scrollbar scroll-smooth">
      
      {/* SECCIÓN DE HISTORIAS */}
      <div className="mb-4 pt-20 px-2 md:px-6">
          <StoriesBar 
              stories={stories} 
              myStories={myStories} 
              currentUser={currentUser}
              onViewStory={handleViewStory} // Pasamos la función corregida
              onRefresh={fetchData} 
          />
      </div>

      {/* BANNER PREMIUM (Minimalista) */}
      {!isPrime && !loading && (
          <div className="flex justify-center mb-8 px-4">
              <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => setShowPrime(true)}
                  className="group w-full max-w-md flex items-center justify-center gap-3 px-6 py-3 rounded-2xl bg-white/40 dark:bg-black/40 border border-yellow-500/30 hover:border-yellow-400 shadow-glass-light dark:shadow-glass-dark backdrop-blur-lg transition-all"
              >
                  <Crown size={18} className="text-yellow-500 group-hover:scale-110 transition-transform" fill="currentColor" />
                  <span className="text-sm font-medium text-gray-700 dark:text-yellow-100/90">
                      Sube tus fotos en <b className="text-yellow-600 dark:text-yellow-400">Ultra HD</b>
                  </span>
                  <Sparkles size={16} className="text-yellow-400 opacity-50 group-hover:opacity-100 animate-pulse" />
              </motion.button>
          </div>
      )}

      {/* FEED DE POSTS */}
      {loading ? (
         <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-cuadralo-pink" size={40} />
         </div>
      ) : (
         <div className="w-full max-w-[600px] mx-auto px-4 flex flex-col gap-8 pb-20">
            <AnimatePresence>
                {posts.map((post, i) => (
                  <motion.div 
                      key={post.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: i * 0.1, duration: 0.4, ease: "easeOut" }}
                  >
                      <FeedPost 
                          post={post} 
                          onDelete={() => handlePostDeleted(post.id)}
                          onViewStory={() => handleViewStory(post.user.id)} // También corregimos esto
                      />
                  </motion.div>
                ))}
            </AnimatePresence>

            {posts.length === 0 && (
               <div className="text-center text-cuadralo-textMutedLight dark:text-cuadralo-textMutedDark py-20 font-medium">
                  No hay publicaciones aún.<br/>¡Sé el primero en romper el hielo!
               </div>
            )}
            
            <button onClick={handleRefresh} className="mx-auto flex items-center gap-2 text-xs text-cuadralo-textMutedLight dark:text-cuadralo-textMutedDark hover:text-cuadralo-pink transition-colors py-6 mb-10 bg-white/5 dark:bg-black/20 px-6 rounded-full backdrop-blur-md">
                {refreshing ? <Loader2 className="animate-spin" size={16}/> : <RefreshCw size={16}/>}
                Actualizar Feed
            </button>
         </div>
      )}

      {/* BOTÓN FLOTANTE PARA SUBIR POST */}
      <button 
          onClick={onUploadClick} 
          className="fixed bottom-24 right-6 md:bottom-10 md:right-10 w-14 h-14 bg-cuadralo-pink text-white rounded-2xl flex items-center justify-center shadow-[0_8px_30px_rgb(242,19,142,0.4)] hover:shadow-[0_8px_30px_rgb(242,19,142,0.6)] hover:-translate-y-1 active:scale-95 transition-all z-40 group"
      >
        <Plus size={28} className="group-hover:rotate-90 transition-transform duration-300" strokeWidth={2.5} />
      </button>

      <AnimatePresence>
          {viewingUserStories && (
              <StoryViewer 
                  stories={viewingUserStories.list} 
                  isOwner={viewingUserStories.isOwner}
                  onClose={() => setViewingUserStories(null)} 
                  onDeleteSuccess={() => {
                      setViewingUserStories(null);
                      fetchData(); 
                  }}
              />
          )}
          {showPrime && <PrimeModal onClose={() => setShowPrime(false)} />}
      </AnimatePresence>
    </div>
  );
}