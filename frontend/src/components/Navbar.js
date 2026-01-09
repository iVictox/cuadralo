"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SlidersHorizontal, Search, Bell } from "lucide-react";
import SearchModal from "./SearchModal";
import NotificationModal from "./NotificationModal";

export default function Navbar({ onFilterClick }) {
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Clase común para los botones
  const buttonClass = "p-3 rounded-full bg-white/5 text-white backdrop-blur-md border border-white/10 hover:bg-cuadralo-pink hover:scale-105 transition-all shadow-lg";

  return (
    <>
      {/* CORRECCIÓN VISUAL PARA PC:
         - md:left-20  -> Empuja el navbar 80px (ancho del sidebar) a la derecha.
         - right-0     -> Lo ancla al borde derecho.
         - md:w-auto   -> Deja que el ancho se calcule automáticamente (100% - 80px).
      */}
      <div className="fixed top-0 left-0 md:left-20 right-0 z-50 px-6 py-4 flex justify-between items-center bg-gradient-to-b from-cuadralo-dark/90 to-transparent pointer-events-none w-full md:w-auto">
        
        {/* Logo */}
        <div className="relative h-12 w-32 pointer-events-auto cursor-pointer">
          <Link href="/feed">
            <Image 
              src="/logo.svg" 
              alt="Logo Cuadralo" 
              fill
              className="object-contain object-left"
              priority
            />
          </Link>
        </div>

        {/* Botones */}
        <div className="flex gap-3 pointer-events-auto">
          
          <button 
            onClick={() => setShowSearch(true)}
            className={buttonClass}
            aria-label="Buscar"
          >
            <Search size={20} />
          </button>

          <button 
            onClick={() => setShowNotifications(true)}
            className={buttonClass}
            aria-label="Notificaciones"
          >
            <Bell size={20} />
          </button>

          {onFilterClick && (
            <button 
                onClick={onFilterClick}
                className={buttonClass}
                aria-label="Filtros"
            >
              <SlidersHorizontal size={20} />
            </button>
          )}
        </div>
      </div>

      {showSearch && (
        <SearchModal onClose={() => setShowSearch(false)} />
      )}

      {showNotifications && (
        <NotificationModal onClose={() => setShowNotifications(false)} />
      )}
    </>
  );
}