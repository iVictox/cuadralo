"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/utils/api";
import { AnimatePresence } from "framer-motion";

// Componentes
import BottomNav from "@/components/BottomNav";
import Navbar from "@/components/Navbar";
import CardStack from "@/components/CardStack"; // El Swipe
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
  
  // CAMBIO 1: Iniciar en "social" por defecto
  const [activeTab, setActiveTab] = useState("social");
  
  // Estados de Modales
  const [showFilters, setShowFilters] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatBadge, setChatBadge] = useState(0); 

  // CAMBIO 2: Lógica de Navbar Global
  // Solo mostramos el Navbar genérico (Filtros/Match) en la pestaña 'home' (Swipe)
  // Social tiene su propio header, al igual que Chat y Perfil.
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
        case "social": return <SocialFeed onUploadClick={() => setShowUpload(true)} />; // Principal
        case "home": return <CardStack />; // Swipe (Secundario)
        case "likes": return <MyLikes />;
        case "chat": return <ChatList onChatSelect={setSelectedChat} />;
        case "profile": return <Profile />;
        default: return <SocialFeed />;
    }
  };

  return (
    <main className="h-screen w-full bg-[#0f0518] relative overflow-hidden flex flex-col">
      
      {/* NAVBAR GLOBAL (Solo para Swipe) */}
      {showNavbar && (
          <Navbar 
            onFilterClick={() => setShowFilters(true)} 
            onSearchClick={() => setShowSearch(true)} 
          />
      )}

      {/* ÁREA DE CONTENIDO */}
      {/* Si hay Navbar global, bajamos el contenido (pt-20). Si no (como en Social), pt-0 porque Social tiene su propio header fixed */}
      <div className={`flex-1 w-full h-full relative ${showNavbar ? "pt-20" : "pt-0"}`}>
        {renderView()}
      </div>

      {/* BOTTOM NAV */}
      {!selectedChat && (
          <BottomNav 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
            chatBadge={chatBadge > 0 ? chatBadge : null} 
          />
      )}

      {/* MODALES */}
      <AnimatePresence>
        {showFilters && <FilterModal onClose={() => setShowFilters(false)} />}
        {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}
        {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
      </AnimatePresence>

    </main>
  );
}