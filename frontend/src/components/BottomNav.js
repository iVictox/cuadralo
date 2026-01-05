import { Home, MessageCircle, User, Heart, Globe } from "lucide-react";

export default function BottomNav({ activeTab, onTabChange, chatBadge }) {
  return (
    <div className="fixed bottom-0 left-0 w-full z-50 pb-4 pt-3 px-6 bg-black/90 backdrop-blur-xl border-t border-white/5">
      <div className="flex justify-between items-center w-full max-w-2xl mx-auto">
        <NavItem icon={<Home size={22} />} isActive={activeTab === "home"} onClick={() => onTabChange("home")} />
        <NavItem icon={<Globe size={22} />} isActive={activeTab === "social"} onClick={() => onTabChange("social")} />
        <NavItem icon={<Heart size={22} />} isActive={activeTab === "likes"} onClick={() => onTabChange("likes")} />
        
        {/* BADGE AQUÍ */}
        <NavItem 
            icon={<MessageCircle size={22} />} 
            isActive={activeTab === "chat"} 
            badge={chatBadge} 
            onClick={() => onTabChange("chat")} 
        />
        
        <NavItem icon={<User size={22} />} isActive={activeTab === "profile"} onClick={() => onTabChange("profile")} />
      </div>
    </div>
  );
}

function NavItem({ icon, isActive, badge, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`relative p-3 transition-all duration-300 rounded-xl hover:bg-white/5 ${isActive ? "text-cuadralo-pink -translate-y-1 scale-105" : "text-gray-500 hover:text-white"}`}
    >
      {icon}
      {badge ? (
        <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] flex items-center justify-center text-white border-2 border-black font-bold animate-pulse">
          {badge > 9 ? "+9" : badge}
        </span>
      ) : null}
      {isActive && (
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-cuadralo-pink rounded-full shadow-[0_0_10px_#F2138E]" />
      )}
    </button>
  );
}