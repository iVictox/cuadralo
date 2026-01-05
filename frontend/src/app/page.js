"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; 
import { AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react"; 

// Componentes
import Navbar from "@/components/Navbar";
import CardStack from "@/components/CardStack";
import BottomNav from "@/components/BottomNav";
import ChatList from "@/components/ChatList";
import ChatWindow from "@/components/ChatWindow";
import FilterModal from "@/components/FilterModal";
import SearchModal from "@/components/SearchModal";
import Profile from "@/components/Profile";
import MyLikes from "@/components/MyLikes";
import SocialFeed from "@/components/SocialFeed";
import NotificationModal from "@/components/NotificationModal";
import UploadModal from "@/components/UploadModal";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true); 
  
  const [showFilters, setShowFilters] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  
  const [activeTab, setActiveTab] = useState("home");
  const [selectedChat, setSelectedChat] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else {
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#0f0518] flex flex-col items-center justify-center text-white">
        <Loader2 size={48} className="animate-spin text-cuadralo-pink mb-4" />
        <p className="text-sm font-medium tracking-widest uppercase text-gray-500">Cargando Cuadralo...</p>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-cuadralo-dark text-white relative overflow-hidden">

      <div className="absolute top-0 left-0 w-full h-[50vh] bg-cuadralo-purple opacity-20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-full h-[50vh] bg-cuadralo-pink opacity-10 blur-[150px] pointer-events-none" />

      {/* 1. HOME */}
      {activeTab === "home" && (
        <>
          <Navbar
            onFilterClick={() => setShowFilters(true)}
            onSearchClick={() => setShowSearch(true)}
          />
          {/* CORRECCIÓN AQUÍ:
              1. Quitamos 'justify-center' para evitar el hueco grande arriba.
              2. Usamos 'pt-20' para separar del Navbar.
              3. Usamos 'pb-24' para separar del BottomNav.
          */}
          <section className="flex-1 flex flex-col items-center w-full relative z-10 pt-20 pb-24 animate-fade-in">
            <CardStack />
          </section>
        </>
      )}

      {/* 2. SOCIAL FEED */}
      {activeTab === "social" && (
        <section className="flex-1 w-full relative z-10 bg-black/20 animate-fade-in">
            <SocialFeed 
              onSearchClick={() => setShowSearch(true)} 
              onNotificationClick={() => setShowNotifications(true)}
              onUploadClick={() => setShowUpload(true)}
            />
        </section>
      )}

      {/* 3. LIKES */}
      {activeTab === "likes" && (
        <section className="flex-1 w-full relative z-10 animate-fade-in bg-black/20">
          <MyLikes />
        </section>
      )}

      {/* 4. CHAT */}
      {activeTab === "chat" && (
        <section className="flex-1 w-full relative z-10 bg-black/20 h-screen flex flex-col">
          {selectedChat ? (
            <ChatWindow
              chat={selectedChat}
              onBack={() => setSelectedChat(null)}
            />
          ) : (
            <ChatList
              onChatSelect={(chat) => setSelectedChat(chat)}
            />
          )}
        </section>
      )}

      {/* 5. PERFIL */}
      {activeTab === "profile" && (
        <section className="flex-1 w-full relative z-10 animate-fade-in">
          <Profile />
        </section>
      )}

      {!selectedChat && (
        <BottomNav
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            if (tab !== "chat") setSelectedChat(null);
          }}
        />
      )}

      <AnimatePresence>
        {showFilters && <FilterModal onClose={() => setShowFilters(false)} />}
        {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}
        {showNotifications && <NotificationModal onClose={() => setShowNotifications(false)} />}
        {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
      </AnimatePresence>

    </main>
  );
}