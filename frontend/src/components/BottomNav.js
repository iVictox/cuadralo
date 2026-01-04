import { Home, MessageCircle, User, Heart, Globe } from "lucide-react"; // <--- Importa Globe

export default function BottomNav({ activeTab, onTabChange }) {
  return (
    <div className="fixed bottom-0 left-0 w-full z-50 pb-6 pt-4 px-6 bg-black/90 backdrop-blur-xl border-t border-white/5">
      <div className="flex justify-between items-center w-full max-w-4xl mx-auto">
        
        {/* 1. HOME (Swipes) */}
        <NavItem 
            icon={<Home size={26} />} 
            isActive={activeTab === "home"} 
            onClick={() => onTabChange("home")} 
        />
        
        {/* 2. SOCIAL FEED (NUEVO) */}
        <NavItem 
            icon={<Globe size={26} />} 
            isActive={activeTab === "social"} 
            onClick={() => onTabChange("social")}
        />

        {/* 3. LIKES */}
        <NavItem 
            icon={<Heart size={26} />} 
            isActive={activeTab === "likes"} 
            onClick={() => onTabChange("likes")}
        />
        
        {/* 4. CHAT */}
        <NavItem 
            icon={<MessageCircle size={26} />} 
            isActive={activeTab === "chat"} 
            badge={2} 
            onClick={() => onTabChange("chat")}
        />
        
        {/* 5. PERFIL */}
        <NavItem 
            icon={<User size={26} />} 
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
      className={`relative p-4 transition-all duration-300 rounded-xl hover:bg-white/5 ${isActive ? "text-cuadralo-pink -translate-y-2 scale-110" : "text-gray-500 hover:text-white"}`}
    >
      {icon}
      {badge && (
        <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white border-2 border-black font-bold animate-pulse">
          {badge}
        </span>
      )}
      {isActive && (
        <span className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-cuadralo-pink rounded-full shadow-[0_0_15px_#F2138E]" />
      )}
    </button>
  );
}