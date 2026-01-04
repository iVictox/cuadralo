import { Home, MessageCircle, User, Heart, Globe } from "lucide-react";

export default function BottomNav({ activeTab, onTabChange }) {
  return (
    // CAMBIOS:
    // 1. pb-4 pt-3 (Antes pb-6 pt-4): Menos altura total.
    // 2. border-t border-white/5: Mantenemos el borde sutil.
    <div className="fixed bottom-0 left-0 w-full z-50 pb-4 pt-3 px-6 bg-black/90 backdrop-blur-xl border-t border-white/5">
      <div className="flex justify-between items-center w-full max-w-2xl mx-auto"> {/* max-w-2xl para juntar un poco más los iconos en PC */}
        
        {/* 1. HOME */}
        <NavItem 
            icon={<Home size={22} />} // Reducido a 22px
            isActive={activeTab === "home"} 
            onClick={() => onTabChange("home")} 
        />
        
        {/* 2. SOCIAL */}
        <NavItem 
            icon={<Globe size={22} />} 
            isActive={activeTab === "social"} 
            onClick={() => onTabChange("social")}
        />

        {/* 3. LIKES */}
        <NavItem 
            icon={<Heart size={22} />} 
            isActive={activeTab === "likes"} 
            onClick={() => onTabChange("likes")}
        />
        
        {/* 4. CHAT */}
        <NavItem 
            icon={<MessageCircle size={22} />} 
            isActive={activeTab === "chat"} 
            badge={2} 
            onClick={() => onTabChange("chat")}
        />
        
        {/* 5. PERFIL */}
        <NavItem 
            icon={<User size={22} />} 
            isActive={activeTab === "profile"} 
            onClick={() => onTabChange("profile")}
        />
        
      </div>
    </div>
  );
}

function NavItem({ icon, isActive, badge, onClick }) {
  return (
    <button
      onClick={onClick}
      // CAMBIOS:
      // p-3 (Antes p-4): Botón más compacto.
      // -translate-y-1 (Antes -translate-y-2): La animación de subida es más sutil.
      className={`relative p-3 transition-all duration-300 rounded-xl hover:bg-white/5 ${isActive ? "text-cuadralo-pink -translate-y-1 scale-105" : "text-gray-500 hover:text-white"}`}
    >
      {icon}
      {badge && (
        <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-red-500 rounded-full text-[9px] flex items-center justify-center text-white border-2 border-black font-bold animate-pulse">
          {badge}
        </span>
      )}
      {isActive && (
        // Punto indicador más pequeño y pegado al icono
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-cuadralo-pink rounded-full shadow-[0_0_10px_#F2138E]" />
      )}
    </button>
  );
}