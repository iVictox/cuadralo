"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
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
import UploadModal from "@/components/UploadModal"; // El nuevo modal de creación

export default function Home() {
  const [showFilters, setShowFilters] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // CAMBIO: Renombramos a showUpload para que sea "Nuevo Post"
  const [showUpload, setShowUpload] = useState(false);
  
  const [activeTab, setActiveTab] = useState("home");
  const [selectedChat, setSelectedChat] = useState(null);

  return (
    <main className="flex min-h-screen flex-col bg-cuadralo-dark text-white relative overflow-hidden">

      {/* Fondo de Luces */}
      <div className="absolute top-0 left-0 w-full h-[50vh] bg-cuadralo-purple opacity-20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-full h-[50vh] bg-cuadralo-pink opacity-10 blur-[150px] pointer-events-none" />

      {/* RENDERIZADO DE PANTALLAS */}

      {/* 1. HOME */}
      {activeTab === "home" && (
        <>
          <Navbar
            onFilterClick={() => setShowFilters(true)}
            onSearchClick={() => setShowSearch(true)}
          />
          <section className="flex-1 flex flex-col justify-center items-center w-full relative z-10 pt-16 animate-fade-in">
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
              // CAMBIO: Ahora pasamos la función para abrir el "UploadModal"
              onUploadClick={() => setShowUpload(true)}
            />
        </section>
      )}

      {/* 3. CHAT */}
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

      {/* 4. PERFIL */}
      {activeTab === "profile" && (
        <section className="flex-1 w-full relative z-10 animate-fade-in">
          <Profile />
        </section>
      )}

      {/* 5. LIKES */}
      {activeTab === "likes" && (
        <section className="flex-1 w-full relative z-10 animate-fade-in bg-black/20">
          <MyLikes />
        </section>
      )}

      {/* Menú Inferior */}
      {!selectedChat && (
        <BottomNav
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            if (tab !== "chat") setSelectedChat(null);
          }}
        />
      )}

      {/* --- MODALES --- */}
      <AnimatePresence>
        {showFilters && <FilterModal onClose={() => setShowFilters(false)} />}
        {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}
        {showNotifications && <NotificationModal onClose={() => setShowNotifications(false)} />}
        
        {/* Modal de Nuevo Post (Reemplaza a la cámara) */}
        {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
      </AnimatePresence>

    </main>
  );
}