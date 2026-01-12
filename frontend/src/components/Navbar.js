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
import PrimeModal from "./PrimeModal"; // ✅ IMPORTADO
import BoostModal from "./BoostModal"; // ✅ IMPORTADO

export default function Navbar() {
  const pathname = usePathname();
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  
  // Estados para los modales premium
  const [showPrime, setShowPrime] = useState(false);
  const [showBoost, setShowBoost] = useState(false);
  
  // Rutas donde NO mostrar navbar
  if (pathname === "/login" || pathname === "/register") return null;

  return (
    <>
      {/* NAVBAR SUPERIOR (Desktop) */}
      <div className="hidden md:flex fixed top-0 left-0 h-full w-20 bg-[#0f0518] border-r border-white/10 flex-col items-center py-8 z-50">
        
        {/* LOGO */}
        <Link href="/" className="mb-10">
          <div className="w-10 h-10 bg-gradient-to-tr from-cuadralo-pink to-purple-600 rounded-xl flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-purple-500/20">
            C
          </div>
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

        {/* ✅ ACCIONES PREMIUM (Separadas visualmente) */}
        <div className="flex flex-col gap-4 w-full px-4 mt-8 pt-6 border-t border-white/5">
             {/* Botón Prime */}
             <button 
                onClick={() => setShowPrime(true)}
                className="w-full aspect-square flex items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 border border-yellow-500/30 text-yellow-400 hover:scale-110 transition-all group relative"
                title="Cuadralo Prime"
             >
                <Crown size={20} strokeWidth={2.5} />
                <div className="absolute inset-0 bg-yellow-500/20 blur-lg rounded-full opacity-0 group-hover:opacity-50 transition-opacity" />
             </button>

             {/* Botón Boost */}
             <button 
                onClick={() => setShowBoost(true)}
                className="w-full aspect-square flex items-center justify-center rounded-xl bg-white/5 text-cuadralo-pink hover:bg-white/10 hover:text-white transition-all"
                title="Activar Destello"
             >
                <Zap size={20} className="fill-current" />
             </button>
        </div>

        {/* BOTTOM ACTIONS (Upload & Logout) */}
        <div className="mt-auto flex flex-col gap-6 w-full px-4 mb-4">
             <button 
                onClick={() => setShowUpload(true)}
                className="w-10 h-10 rounded-xl bg-white/5 text-white flex items-center justify-center hover:bg-white/10 transition-all"
             >
                <div className="w-6 h-6 border-2 border-white rounded-md flex items-center justify-center">
                    <span className="text-lg font-bold leading-none">+</span>
                </div>
             </button>
             
             <button 
                onClick={() => { localStorage.removeItem("user"); window.location.href = "/login"; }}
                className="w-10 h-10 rounded-xl text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-all"
             >
                <LogOut size={20} />
             </button>
        </div>
      </div>

      {/* MODALES GLOBALES */}
      {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}
      {showNotifications && <NotificationModal onClose={() => setShowNotifications(false)} />}
      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
      
      {/* ✅ MODALES PREMIUM */}
      {showPrime && <PrimeModal onClose={() => setShowPrime(false)} />}
      {showBoost && <BoostModal onClose={() => setShowBoost(false)} />}
    </>
  );
}

function NavItem({ icon: Icon, href, active, onClick }) {
    if (onClick) {
        return (
            <button onClick={onClick} className={`w-full aspect-square flex items-center justify-center rounded-xl transition-all duration-300 ${active ? "bg-cuadralo-pink text-white shadow-lg shadow-purple-500/30" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}>
                <Icon size={22} strokeWidth={active ? 2.5 : 2} />
            </button>
        );
    }
    return (
        <Link href={href} className={`w-full aspect-square flex items-center justify-center rounded-xl transition-all duration-300 ${active ? "bg-cuadralo-pink text-white shadow-lg shadow-purple-500/30" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}>
            <Icon size={22} strokeWidth={active ? 2.5 : 2} />
        </Link>
    );
}