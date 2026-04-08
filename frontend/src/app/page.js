"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation"; 
import { api } from "@/utils/api";
import { AnimatePresence, motion } from "framer-motion";

// Componentes
import BottomNav from "@/components/BottomNav";
import Navbar from "@/components/Navbar";
import CardStack from "@/components/CardStack"; 
import ChatList from "@/components/ChatList";
import ChatWindow from "@/components/ChatWindow";
import MyLikes from "@/components/MyLikes";
import Profile from "@/components/Profile";
import SocialFeed from "@/components/SocialFeed";

// Modales
import FilterModal from "@/components/FilterModal";
import UploadModal from "@/components/UploadModal";

// 1. Componente interno que usa useSearchParams
function MainAppContent() {
  const router = useRouter();
  const searchParams = useSearchParams(); 
  
  const [activeTab, setActiveTab] = useState("social");
  const [showFilters, setShowFilters] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatBadge, setChatBadge] = useState(0); 

  useEffect(() => {
      const tabParam = searchParams.get("tab");
      if (tabParam && ["social", "home", "likes", "chat", "profile"].includes(tabParam)) {
          setActiveTab(tabParam);
      }
  }, [searchParams]);

  const showNavbar = !selectedChat && (activeTab === 'home' || activeTab === 'social');

  const checkNotifications = async () => {
      try {
          const data = await api.get("/matches");
          if (Array.isArray(data)) {
              const unreadCount = data.reduce((acc, curr) => acc + (Number(curr.unread_count) || 0), 0);
              setChatBadge(unreadCount);
          }
      } catch (e) { console.error(e); }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");
    else {
        checkNotifications();
        const interval = setInterval(checkNotifications, 5000); 
        return () => clearInterval(interval);
    }
  }, [router]);

  const [loadedSections, setLoadedSections] = useState({});
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (!loadedSections[activeTab]) {
      setInitialLoading(true);
    } else {
      setInitialLoading(false);
    }
  }, [activeTab, loadedSections]);

  const handleSectionLoaded = (section) => {
    setLoadedSections((prev) => ({ ...prev, [section]: true }));
    if (activeTab === section) {
        setInitialLoading(false);
    }
  };

  const UniversalLoader = () => (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-cuadralo-bgLight dark:bg-cuadralo-bgDark">
      <motion.div
        animate={{ rotate: 360, scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        className="w-12 h-12 bg-cuadralo-pink rounded-xl shadow-[0_0_15px_#f2138e]"
      />
    </div>
  );

  const renderView = () => {
    if (selectedChat) return <ChatWindow chat={selectedChat} onBack={() => setSelectedChat(null)} />;

    return (
      <>
        {initialLoading && <UniversalLoader />}

        <div style={{ display: activeTab === 'social' && !initialLoading ? 'block' : 'none', height: '100%' }}>
           <SocialFeed onUploadClick={() => setShowUpload(true)} isActive={activeTab === 'social'} onLoaded={() => handleSectionLoaded('social')} />
        </div>
        <div style={{ display: activeTab === 'home' && !initialLoading ? 'block' : 'none', height: '100%' }}>
           {(activeTab === 'home' || loadedSections['home']) && <CardStack onOpenFilters={() => setShowFilters(true)} onLoaded={() => handleSectionLoaded('home')} />}
        </div>
        <div style={{ display: activeTab === 'likes' && !initialLoading ? 'block' : 'none', height: '100%' }}>
           {(activeTab === 'likes' || loadedSections['likes']) && <MyLikes onLoaded={() => handleSectionLoaded('likes')} />}
        </div>
        <div style={{ display: activeTab === 'chat' && !initialLoading ? 'block' : 'none', height: '100%' }}>
           {(activeTab === 'chat' || loadedSections['chat']) && <ChatList onChatSelect={setSelectedChat} onLoaded={() => handleSectionLoaded('chat')} />}
        </div>
        <div style={{ display: activeTab === 'profile' && !initialLoading ? 'block' : 'none', height: '100%' }}>
           {(activeTab === 'profile' || loadedSections['profile']) && <Profile onLoaded={() => handleSectionLoaded('profile')} />}
        </div>
      </>
    );
  };

  return (
    <main className="min-h-screen w-full bg-cuadralo-bgLight dark:bg-cuadralo-bgDark text-cuadralo-textLight dark:text-cuadralo-textDark transition-colors duration-300 relative flex flex-col md:pl-20">
      
      {showNavbar && (
          <Navbar />
      )}

      <div className={`flex-1 w-full h-full relative ${showNavbar ? "pt-20" : "pt-0"}`}>
        {renderView()}
      </div>

      {!selectedChat && (
          <BottomNav 
            activeTab={activeTab} 
            onTabChange={(tab) => {
                setActiveTab(tab);
                window.history.pushState(null, "", `/?tab=${tab}`);
            }} 
            chatBadge={chatBadge > 0 ? chatBadge : null} 
          />
      )}

      <AnimatePresence>
        {showFilters && <FilterModal onClose={() => setShowFilters(false)} />}
        {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
      </AnimatePresence>
    </main>
  );
}

// 2. Exportación principal que envuelve TODO con Suspense
export default function Home() {
  return (
    <Suspense fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-cuadralo-bgLight dark:bg-cuadralo-bgDark">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cuadralo-pink"></div>
        </div>
    }>
      <MainAppContent />
    </Suspense>
  );
}