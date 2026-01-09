"use client";

import { useState, useEffect } from "react";
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
import SearchModal from "@/components/SearchModal";
import UploadModal from "@/components/UploadModal";

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams(); 
  
  const [activeTab, setActiveTab] = useState("social");
  
  const [showFilters, setShowFilters] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatBadge, setChatBadge] = useState(0); 

  useEffect(() => {
      const tabParam = searchParams.get("tab");
      if (tabParam && ["social", "home", "likes", "chat", "profile"].includes(tabParam)) {
          setActiveTab(tabParam);
      }
  }, [searchParams]);

  const showNavbar = !selectedChat && activeTab === 'home';

  const checkNotifications = async () => {
      try {
          const data = await api.get("/matches");
          if (Array.isArray(data)) {
              const newMatchesCount = data.filter(u => !u.last_message).length;
              const unreadMessagesCount = data.reduce((acc, curr) => acc + (Number(curr.unread_count) || 0), 0);
              setChatBadge(newMatchesCount + unreadMessagesCount);
          }
      } catch (e) { 
          console.error("Error checking notifs", e); 
      }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
        router.push("/login");
    } else {
        checkNotifications();
        const interval = setInterval(checkNotifications, 3000); 
        return () => clearInterval(interval);
    }
  }, [router]);

  const renderView = () => {
    if (selectedChat) {
        return <ChatWindow chat={selectedChat} onBack={() => { setSelectedChat(null); checkNotifications(); }} />;
    }

    switch(activeTab) {
        case "social": return <SocialFeed onUploadClick={() => setShowUpload(true)} />;
        case "home": return <CardStack />; 
        case "likes": return <MyLikes />;
        case "chat": return <ChatList onChatSelect={setSelectedChat} />;
        case "profile": return <Profile />;
        default: return <SocialFeed />;
    }
  };

  return (
    // ✅ AGREGADO: md:pl-20 para empujar el contenido cuando aparece la sidebar
    <main className="h-screen w-full bg-[#0f0518] relative overflow-hidden flex flex-col md:pl-20">
      
      {showNavbar && (
          <Navbar 
            onFilterClick={() => setShowFilters(true)} 
            onSearchClick={() => setShowSearch(true)} 
          />
      )}

      {/* Contenido principal */}
      <div className={`flex-1 w-full h-full relative ${showNavbar ? "pt-20" : "pt-0"}`}>
        {renderView()}
      </div>

      {/* Navegación (Ahora responsive: Bottom en móvil, Left en PC) */}
      {!selectedChat && (
          <BottomNav 
            activeTab={activeTab} 
            onTabChange={(tab) => {
                setActiveTab(tab);
                router.replace("/", undefined, { shallow: true });
            }} 
            chatBadge={chatBadge > 0 ? chatBadge : null} 
          />
      )}

      <AnimatePresence>
        {showFilters && <FilterModal onClose={() => setShowFilters(false)} />}
        {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}
        {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
      </AnimatePresence>

    </main>
  );
}