"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import CardStack from "@/components/CardStack";
import BottomNav from "@/components/BottomNav";
import ChatList from "@/components/ChatList";
import FilterModal from "@/components/FilterModal";
import SearchModal from "@/components/SearchModal";

export default function Home() {
  const [showFilters, setShowFilters] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [activeTab, setActiveTab] = useState("home");

  return (
    <main className="flex min-h-screen flex-col bg-cuadralo-dark text-white relative overflow-hidden">
      
      {/* Fondo de Luces (Ahora más grandes para cubrir pantalla completa) */}
      <div className="absolute top-0 left-0 w-full h-[50vh] bg-cuadralo-purple opacity-20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-full h-[50vh] bg-cuadralo-pink opacity-10 blur-[150px] pointer-events-none" />

      {/* RENDERIZADO CONDICIONAL */}
      
      {/* 1. PANTALLA HOME */}
      {activeTab === "home" && (
        <>
          <Navbar 
            onFilterClick={() => setShowFilters(true)} 
            onSearchClick={() => setShowSearch(true)} 
          />
          {/* CAMBIO CLAVE: Quitamos 'max-w-md' y usamos 'w-full' con 'max-w-none' */}
          <section className="flex-1 flex flex-col justify-center items-center w-full relative z-10 pt-16 animate-fade-in">
            <CardStack />
          </section>
        </>
      )}

      {/* 2. PANTALLA CHAT */}
      {activeTab === "chat" && (
        // CAMBIO CLAVE: Ancho completo para el chat también
        <section className="flex-1 w-full relative z-10 bg-black/20">
            <ChatList />
        </section>
      )}

      {/* 3. PANTALLAS PENDIENTES */}
      {(activeTab === "likes" || activeTab === "profile") && (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 animate-pulse">
            <h2 className="text-2xl font-bold mb-2">Próximamente 🚧</h2>
            <p>Estamos construyendo esta sección.</p>
        </div>
      )}

      {/* Menú Inferior */}
      <BottomNav 
        activeTab={activeTab} 
        onTabChange={(tab) => setActiveTab(tab)} 
      />

      {/* Modales */}
      <AnimatePresence>
        {showFilters && <FilterModal onClose={() => setShowFilters(false)} />}
        {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}
      </AnimatePresence>
      
    </main>
  );
}