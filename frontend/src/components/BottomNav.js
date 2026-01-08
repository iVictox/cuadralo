import { Home, MessageCircle, User, Heart, Flame } from "lucide-react";

export default function BottomNav({ activeTab, onTabChange, chatBadge }) {
  return (
    <div className="fixed bottom-0 left-0 w-full z-50 pb-4 pt-3 px-6 bg-[#0f0518]/95 backdrop-blur-xl border-t border-white/5">
      <div className="flex justify-between items-center w-full max-w-2xl mx-auto">
        
        {/* 1. SOCIAL FEED (Ahora es la Principal - Icono Home) */}
        <NavItem 
            icon={<Home size={24} />} 
            isActive={activeTab === "social"} 
            onClick={() => onTabChange("social")} 
        />

        {/* 2. SWIPE / CITAS (Ahora es Secundaria - Icono Flame) */}
        <NavItem 
            icon={<Flame size={24} />} 
            isActive={activeTab === "home"} 
            onClick={() => onTabChange("home")} 
        />

        {/* 3. LIKES */}
        <NavItem 
            icon={<Heart size={24} />} 
            isActive={activeTab === "likes"} 
            onClick={() => onTabChange("likes")} 
        />
        
        {/* 4. CHAT (Con Badge) */}
        <NavItem 
            icon={<MessageCircle size={24} />} 
            isActive={activeTab === "chat"} 
            badge={chatBadge} 
            onClick={() => onTabChange("chat")} 
        />
        
        {/* 5. PERFIL */}
        <NavItem 
            icon={<User size={24} />} 
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
      className={`relative p-3 transition-all duration-300 rounded-2xl group ${
        isActive 
          ? "text-white bg-white/10 shadow-[0_0_15px_rgba(242,19,142,0.3)] scale-110" 
          : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
      }`}
    >
      {icon}
      
      {/* Badge de notificaciones */}
      {badge ? (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-cuadralo-pink rounded-full text-[9px] flex items-center justify-center text-white border-2 border-[#0f0518] font-bold animate-bounce">
          {badge > 9 ? "+9" : badge}
        </span>
      ) : null}

      {/* Indicador inferior (Puntito) */}
      {isActive && (
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-cuadralo-pink rounded-full shadow-[0_0_5px_#F2138E]" />
      )}
    </button>
  );
}