"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, MessageCircle, Heart, User, Search, 
  Bell, LogOut, Crown, Zap 
} from "lucide-react";
import SearchModal from "./SearchModal";
import NotificationModal from "./NotificationModal";
import UploadModal from "./UploadModal";
import PrimeModal from "./PrimeModal"; 
import BoostModal from "./BoostModal"; 

export default function Navbar() {
  const pathname = usePathname();
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  
  const [showPrime, setShowPrime] = useState(false);
  const [showBoost, setShowBoost] = useState(false);
  
  if (pathname === "/login" || pathname === "/register") return null;

  return (
    <>
      {/* NAVBAR SUPERIOR (Desktop) */}
      <div className="hidden md:flex fixed top-0 left-0 h-full w-20 bg-cuadralo-cardLight dark:bg-[#0f0518] border-r border-black/5 dark:border-white/10 flex-col items-center py-8 z-50 transition-colors duration-300">
        
        {/* LOGO */}
        <Link href="/" className="mb-10 w-14 h-14 flex items-center justify-center hover:scale-105 transition-transform">
          <img src="/logo.svg" alt="Cuadralo" className="w-full h-full object-contain" />
        </Link>

        {/* NAV ITEMS PRINCIPALES */}
        <div className="flex flex-col gap-6 w-full px-4">
            <NavItem icon={Home} href="/" active={pathname === "/"} />
            <NavItem icon={Search} onClick={() => setShowSearch(true)} />
            <NavItem icon={Heart} href="/likes" active={pathname === "/likes"} />
            <NavItem icon={MessageCircle} href="/chat" active={pathname.startsWith("/chat")} />
            <NavItem icon={Bell} onClick={() => setShowNotifications(true)} />
            <NavItem icon={User} href="/profile" active={pathname === "/profile"} />
        </div>

        {/* ACCIONES PREMIUM */}
        <div className="flex flex-col gap-4 w-full px-4 mt-8 pt-6 border-t border-black/5 dark:border-white/5">
             <button 
                onClick={() => setShowPrime(true)}
                className="w-full aspect-square flex items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 hover:scale-110 transition-all group relative"
                title="Cuadralo Prime"
             >
                <Crown size={22} strokeWidth={2.5} />
                <div className="absolute inset-0 bg-yellow-500/20 blur-lg rounded-full opacity-0 group-hover:opacity-50 transition-opacity" />
             </button>

             <button 
                onClick={() => setShowBoost(true)}
                className="w-full aspect-square flex items-center justify-center rounded-2xl bg-black/5 dark:bg-white/5 text-cuadralo-pink hover:bg-cuadralo-pink/10 transition-all"
                title="Activar Destello"
             >
                <Zap size={22} className="fill-current" />
             </button>
        </div>

        {/* BOTTOM ACTIONS (Upload & Logout) */}
        <div className="mt-auto flex flex-col gap-6 w-full px-4 mb-4">
             <button 
                onClick={() => setShowUpload(true)}
                className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/5 text-cuadralo-textLight dark:text-white flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-all border border-black/5 dark:border-transparent"
             >
                <div className="w-6 h-6 border-2 border-current rounded-md flex items-center justify-center">
                    <span className="text-lg font-black leading-none">+</span>
                </div>
             </button>
             
             <button 
                onClick={() => { localStorage.clear(); window.location.href = "/login"; }}
                className="w-12 h-12 rounded-2xl text-red-500 hover:bg-red-500/10 flex items-center justify-center transition-all"
             >
                <LogOut size={22} />
             </button>
        </div>
      </div>

      {/* MODALES GLOBALES */}
      {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}
      {showNotifications && <NotificationModal onClose={() => setShowNotifications(false)} />}
      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
      
      {showPrime && <PrimeModal onClose={() => setShowPrime(false)} />}
      {showBoost && <BoostModal onClose={() => setShowBoost(false)} />}
    </>
  );
}

function NavItem({ icon: Icon, href, active, onClick }) {
    const baseClass = "w-full aspect-square flex items-center justify-center rounded-2xl transition-all duration-300";
    const activeClass = "bg-cuadralo-pink text-white shadow-lg shadow-cuadralo-pink/30";
    const inactiveClass = "text-gray-400 dark:text-gray-500 hover:bg-black/5 dark:hover:bg-white/5 hover:text-cuadralo-textLight dark:hover:text-white";

    if (onClick) {
        return (
            <button onClick={onClick} className={`${baseClass} ${active ? activeClass : inactiveClass}`}>
                <Icon size={24} strokeWidth={active ? 2.5 : 2} />
            </button>
        );
    }
    return (
        <Link href={href} className={`${baseClass} ${active ? activeClass : inactiveClass}`}>
            <Icon size={24} strokeWidth={active ? 2.5 : 2} />
        </Link>
    );
}