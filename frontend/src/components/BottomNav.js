"use client";

import { Home, Flame, Heart, MessageCircle, User } from "lucide-react";
import { motion } from "framer-motion";

export default function BottomNav({ activeTab, onTabChange, chatBadge }) {
  
  const navItems = [
    { id: "social", icon: Home, label: "Inicio" },
    { id: "home", icon: Flame, label: "Swipe" }, 
    { id: "likes", icon: Heart, label: "Likes" },
    { id: "chat", icon: MessageCircle, label: "Chat", badge: chatBadge },
    { id: "profile", icon: User, label: "Perfil" },
  ];

  return (
    <div className="
        fixed z-50 bg-white/90 dark:bg-[#0f0518]/90 backdrop-blur-xl text-cuadralo-textLight dark:text-white transition-colors duration-300
        /* --- MOBILE (Barra Inferior) --- */
        bottom-0 left-0 w-full h-16 border-t border-black/5 dark:border-white/10
        flex flex-row justify-around items-center px-2
        /* --- DESKTOP (Sidebar Izquierda) --- */
        md:top-0 md:left-0 md:w-20 md:h-screen md:border-t-0 md:border-r
        md:flex-col md:justify-center md:gap-10 md:px-0
    ">
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        const Icon = item.icon;

        return (
          <button
            key={item.id}
            onClick={() => onTabChange && onTabChange(item.id)}
            className={`
                relative flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-300 group
                ${isActive 
                    ? "text-cuadralo-pink" 
                    : "text-gray-400 dark:text-gray-500 hover:text-cuadralo-textLight dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"}
            `}
          >
            {/* Fondo activo sutil (Solo Desktop) */}
            {isActive && (
                <div className="hidden md:block absolute inset-0 bg-cuadralo-pink/10 rounded-2xl blur-md" />
            )}

            {/* Icono */}
            <div className="relative">
                <Icon 
                    size={26} 
                    strokeWidth={isActive ? 2.5 : 2} 
                    className={`transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-105"}`}
                />
                
                {/* Badge de Notificación */}
                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-cuadralo-pink text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-white dark:ring-[#0f0518]">
                    {item.badge}
                  </span>
                )}
            </div>

            {/* Indicador de activo */}
            {isActive && (
              <>
                  {/* Móvil: Punto abajo */}
                  <motion.div 
                    layoutId="nav-indicator-mobile"
                    className="md:hidden absolute -bottom-2 w-1.5 h-1.5 bg-cuadralo-pink rounded-full shadow-[0_0_8px_#f2138e]" 
                  />
                  
                  {/* Desktop: Barra izquierda */}
                  <motion.div 
                    layoutId="nav-indicator-desktop"
                    className="hidden md:block absolute left-0 w-1 h-8 bg-cuadralo-pink rounded-r-full shadow-[0_0_12px_#f2138e]" 
                  />
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}