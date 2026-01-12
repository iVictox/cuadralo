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
  
  // LÓGICA HISTORIAS
  const [stories, setStories] = useState([]); 
  const [myStories, setMyStories] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [viewingUserStories, setViewingUserStories] = useState(null);

  // ESTADOS DE SUSCRIPCIÓN
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

      let storiesData = await api.get("/social/stories");
      if (!Array.isArray(storiesData)) storiesData = [];

      if (me) {
          const mine = storiesData.find(g => g.user.id === me.id);
          setMyStories(mine ? mine.stories : []);
          setStories(storiesData.filter(g => g.user.id !== me.id));
      } else {
          setStories(storiesData);
      }

    } catch (error) {
      console.error("Error data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const handleSocketEvent = (event) => {
        const { type, payload } = event.detail;
        if (type === "new_story") {
             if (currentUser && payload.user_id === currentUser.id) {
                setMyStories(prev => [...prev, payload]);
             } else {
                fetchData(); 
             }
        }
    };
    window.addEventListener("socket_event", handleSocketEvent);
    return () => window.removeEventListener("socket_event", handleSocketEvent);
  }, [currentUser]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handlePostDeleted = (deletedPostId) => {
      setPosts(prev => prev.filter(p => p.id !== deletedPostId));
  };

  const handleViewStory = (userId) => {
      if (currentUser && userId === currentUser.id) {
          if (myStories.length > 0) {
              setViewingUserStories({ list: myStories.map(s => ({...s, user: currentUser})), isOwner: true });
          }
          return;
      }
      const group = stories.find(g => g.user.id === userId);
      if (group) {
          const formattedStories = group.stories.map(s => ({ ...s, user: group.user }));
          setViewingUserStories({ list: formattedStories, isOwner: false });
      }
  };

  return (
    <div className="w-full h-full bg-[#0f0518] relative">
      
      <div className="w-full h-full overflow-y-auto pb-28 no-scrollbar scroll-smooth">
        
        <div className="mb-2 pt-20 px-2 md:px-6">
            <StoriesBar 
                stories={stories} 
                myStories={myStories} 
                currentUser={currentUser}
                onViewStory={handleViewStory}
                onRefresh={fetchData} 
            />
        </div>

        {/* 🔥 NUEVA UBICACIÓN: Separador elegante entre Historias y Feed */}
        {!isPrime && !loading && (
            <div className="flex justify-center mb-6">
                <motion.button
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setShowPrime(true)}
                    className="group flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-yellow-500/20 hover:border-yellow-500/50 hover:bg-yellow-500/10 transition-all backdrop-blur-md cursor-pointer"
                >
                    <Crown size={14} className="text-yellow-500 group-hover:scale-110 transition-transform" fill="currentColor" />
                    <span className="text-xs font-medium text-yellow-200/80 group-hover:text-yellow-100 transition-colors">
                        Activar calidad <b className="text-yellow-400">Ultra HD</b> en tus posts
                    </span>
                    <Sparkles size={12} className="text-yellow-400 opacity-50 group-hover:opacity-100 animate-pulse" />
                </motion.button>
            </div>
        )}

        {loading ? (
           <div className="flex justify-center py-20"><Loader2 className="animate-spin text-cuadralo-pink" size={40} /></div>
        ) : (
           <div className="w-full max-w-[1800px] mx-auto px-2 md:px-4">
              
              <div className="columns-1 md:columns-2 xl:columns-3 gap-4 md:gap-6 space-y-4 md:space-y-6">
                  {posts.map(post => (
                    <div key={post.id} className="break-inside-avoid">
                        <FeedPost 
                            post={post} 
                            onDelete={() => handlePostDeleted(post.id)}
                            onViewStory={() => handleViewStory(post.user.id)}
                        />
                    </div>
                  ))}
              </div>

              {posts.length === 0 && (
                 <div className="text-center text-gray-500 py-20">No hay publicaciones aún. ¡Sé el primero!</div>
              )}
              
              <button onClick={handleRefresh} className="mx-auto flex items-center gap-2 text-xs text-gray-500 uppercase tracking-widest hover:text-cuadralo-pink transition-colors py-10">
                  {refreshing ? <Loader2 className="animate-spin" size={14}/> : <RefreshCw size={14}/>}
                  ACTUALIZAR FEED
              </button>
           </div>
        )}
      </div>

      <button onClick={onUploadClick} className="absolute bottom-24 right-5 md:bottom-10 md:right-10 w-14 h-14 bg-gradient-to-tr from-cuadralo-pink to-purple-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all z-40 border border-white/20 group">
        <Plus size={28} className="text-white group-hover:rotate-90 transition-transform duration-300" strokeWidth={2.5} />
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