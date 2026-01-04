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

export default function Home() {
  const [showFilters, setShowFilters] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
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

      {/* 2. PANTALLA SOCIAL FEED (NUEVA) */}
      {activeTab === "social" && (
        <section className="flex-1 w-full relative z-10 bg-black/20 animate-fade-in">
            <SocialFeed />
        </section>
      )}

      {/* 2. CHAT */}
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

      {/* 3. LIKES / PERFIL */}
      {activeTab === "profile" && (
        <section className="flex-1 w-full relative z-10 animate-fade-in">
          <Profile />
        </section>
      )}

      {/* 4. PANTALLA LIKES */}
      {activeTab === "likes" && (
        <section className="flex-1 w-full relative z-10 animate-fade-in bg-black/20">
          <MyLikes />
        </section>
      )}

      {/* CAMBIO AQUÍ: Ocultamos el menú si estamos dentro de un chat */}
      {!selectedChat && (
        <BottomNav
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            if (tab !== "chat") setSelectedChat(null);
          }}
        />
      )}

      {/* Modales */}
      <AnimatePresence>
        {showFilters && <FilterModal onClose={() => setShowFilters(false)} />}
        {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}
      </AnimatePresence>

    </main>
  );
}