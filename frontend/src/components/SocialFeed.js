"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Plus, Bell, Search, Loader2, RefreshCw } from "lucide-react"; 
import StoriesBar from "./StoriesBar"; // Ahora es tonto (solo visual)
import FeedPost from "./FeedPost";
import StoryViewer from "./StoryViewer"; // Visor Global
import { api } from "@/utils/api";
import { AnimatePresence } from "framer-motion";

export default function SocialFeed({ onSearchClick, onNotificationClick, onUploadClick }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // --- LÓGICA DE HISTORIAS ELEVADA ---
  const [stories, setStories] = useState([]); 
  const [myStories, setMyStories] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [viewingUserStories, setViewingUserStories] = useState(null);

  // Cargar Todo (Feed + Historias)
  const fetchData = async () => {
    try {
      const userStr = localStorage.getItem("user");
      const me = userStr ? JSON.parse(userStr) : null;
      setCurrentUser(me);

      // 1. Cargar Feed
      const feedData = await api.get("/social/feed");
      setPosts(feedData);

      // 2. Cargar Historias
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

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handlePostDeleted = (deletedPostId) => {
      setPosts(prev => prev.filter(p => p.id !== deletedPostId));
  };

  // --- FUNCIÓN PARA ABRIR HISTORIA (Desde Barra o Post) ---
  const handleViewStory = (userId) => {
      // Buscar si es mi historia
      if (currentUser && userId === currentUser.id) {
          if (myStories.length > 0) {
              setViewingUserStories({ list: myStories.map(s => ({...s, user: currentUser})), isOwner: true });
          }
          return;
      }

      // Buscar en otras historias
      const group = stories.find(g => g.user.id === userId);
      if (group) {
          const formattedStories = group.stories.map(s => ({ ...s, user: group.user }));
          setViewingUserStories({ list: formattedStories, isOwner: false });
      }
  };

  return (
    <div className="w-full h-full bg-[#0f0518] relative">
      
      {/* HEADER */}
      <div className="absolute top-0 left-0 w-full z-40 px-5 py-4 flex justify-between items-center bg-[#0f0518]/90 backdrop-blur-xl border-b border-white/5 shadow-sm">
          <div className="relative h-10 w-32">
            <Image src="/logo.svg" alt="Logo" fill className="object-contain object-left" priority />
          </div>
          <div className="flex gap-3">
            <button onClick={onSearchClick} className="p-2.5 rounded-full bg-white/5 text-gray-300 hover:text-white transition-all"><Search size={22} /></button>
            <button onClick={onNotificationClick} className="relative p-2.5 rounded-full bg-white/5 text-gray-300 hover:text-white transition-all">
              <Bell size={22} />
              <span className="absolute top-2.5 right-3 w-2 h-2 bg-cuadralo-pink rounded-full ring-2 ring-[#0f0518]" />
            </button>
          </div>
      </div>

      {/* FEED SCROLL */}
      <div className="w-full h-full overflow-y-auto pt-20 pb-28 no-scrollbar">
        <div className="mb-4">
            {/* BARRA DE HISTORIAS (Pasamos datos y función) */}
            <StoriesBar 
                stories={stories} 
                myStories={myStories} 
                currentUser={currentUser}
                onViewStory={handleViewStory}
                onRefresh={fetchData} 
            />
        </div>

        {loading ? (
           <div className="flex justify-center py-10"><Loader2 className="animate-spin text-cuadralo-pink" size={32} /></div>
        ) : (
           <div className="flex flex-col gap-4 pb-4">
              {posts.map(post => (
                <FeedPost 
                    key={post.id} 
                    post={post} 
                    onDelete={() => handlePostDeleted(post.id)}
                    onViewStory={() => handleViewStory(post.user.id)} // <--- PASAMOS FUNCIÓN AQUÍ
                />
              ))}
              
              <button onClick={handleRefresh} className="mx-auto flex items-center gap-2 text-xs text-gray-600 uppercase tracking-widest hover:text-cuadralo-pink transition-colors py-4">
                  {refreshing ? <Loader2 className="animate-spin" size={14}/> : <RefreshCw size={14}/>}
                  Actualizar Feed
              </button>
           </div>
        )}
      </div>

      {/* FAB */}
      <button onClick={onUploadClick} className="absolute bottom-24 right-5 w-14 h-14 bg-gradient-to-tr from-cuadralo-pink to-purple-600 rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all z-40 border border-white/20">
        <Plus size={28} className="text-white" strokeWidth={2.5} />
      </button>

      {/* VISOR GLOBAL DE HISTORIAS */}
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
      </AnimatePresence>
    </div>
  );
}