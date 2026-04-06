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

  const renderView = () => {
    if (selectedChat) return <ChatWindow chat={selectedChat} onBack={() => setSelectedChat(null)} />;

    switch(activeTab) {
        case "social": return <SocialFeed onUploadClick={() => setShowUpload(true)} />;
        case "home": return <CardStack onOpenFilters={() => setShowFilters(true)} />; 
        case "likes": return <MyLikes />;
        case "chat": return <ChatList onChatSelect={setSelectedChat} />;
        case "profile": return <Profile />;
        default: return <SocialFeed />;
    }
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