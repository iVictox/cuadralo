"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation"; 
import { api } from "@/utils/api";
import { AnimatePresence } from "framer-motion";

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
import Loader from "@/components/Loader";

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

  const [mountedTabs, setMountedTabs] = useState({ social: true });

  useEffect(() => {
    setMountedTabs((prev) => ({ ...prev, [activeTab]: true }));
  }, [activeTab]);

  const renderView = () => {
    if (selectedChat) return <ChatWindow chat={selectedChat} onBack={() => setSelectedChat(null)} />;

    return (
      <>
        {mountedTabs.social && <div style={{ display: activeTab === 'social' ? 'block' : 'none', height: '100%' }}><SocialFeed isActive={activeTab === "social"} onUploadClick={() => setShowUpload(true)} /></div>}
        {mountedTabs.home && <div style={{ display: activeTab === 'home' ? 'block' : 'none', height: '100%' }}><CardStack onOpenFilters={() => setShowFilters(true)} /></div>}
        {mountedTabs.likes && <div style={{ display: activeTab === 'likes' ? 'block' : 'none', height: '100%' }}><MyLikes /></div>}
        {mountedTabs.chat && <div style={{ display: activeTab === 'chat' ? 'block' : 'none', height: '100%' }}><ChatList onChatSelect={setSelectedChat} /></div>}
        {mountedTabs.profile && <div style={{ display: activeTab === 'profile' ? 'block' : 'none', height: '100%' }}><Profile /></div>}
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
      <Loader fullScreen />
    }>
      <MainAppContent />
    </Suspense>
  );
}