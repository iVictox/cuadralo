"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Edit2, LogOut, Camera, Zap, ChevronRight, Users, UserCheck, ShieldCheck, Loader2 } from "lucide-react";
import EditProfileModal from "./EditProfileModal"; 
import { api } from "@/utils/api"; // Importar API

export default function Profile() {
  const [showEdit, setShowEdit] = useState(false);
  
  // ESTADO PARA DATOS REALES
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar datos al montar
  useEffect(() => {
    const fetchProfile = async () => {
        try {
            const data = await api.get("/me");
            setUser(data);
        } catch (error) {
            console.error("Error cargando perfil:", error);
        } finally {
            setLoading(false);
        }
    };
    fetchProfile();
  }, []);

  if (loading) {
      return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-cuadralo-pink" size={40} /></div>;
  }

  if (!user) return null; // O redirigir a login

  // Usamos los datos reales o fallbacks
  const displayName = user.name || "Usuario";
  const displayAge = user.age || "?";
  const displayBio = user.bio || "Sin descripción";
  const displayPhoto = user.photo || "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=600";

  return (
    <>
        <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full h-full text-white pt-24 pb-28 px-4 overflow-y-auto max-w-4xl mx-auto"
        >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold tracking-tight">Mi Perfil</h2>
            <button className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
            <Settings className="text-gray-400 hover:text-white" size={24} />
            </button>
        </div>

        {/* FOTO Y DATOS REALES */}
        <div className="flex flex-col items-center mb-8">
            <div className="relative w-32 h-32 mb-4 group cursor-pointer">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cuadralo-pink to-cuadralo-purple animate-spin-slow blur-sm opacity-70 group-hover:opacity-100 transition-opacity" />
                <img src={displayPhoto} alt={displayName} className="relative w-full h-full rounded-full object-cover border-4 border-black"/>
            </div>
            
            <h1 className="text-2xl font-bold flex items-center gap-2 mb-1">
                {displayName}, {displayAge} 
                <ShieldCheck size={20} className="text-blue-400 fill-blue-400/20" />
            </h1>
            <p className="text-gray-400 font-medium text-sm max-w-xs text-center">{displayBio}</p>
        </div>

        {/* Stats (Aún estáticas por ahora, pero listas para conectar) */}
        <div className="grid grid-cols-4 gap-2 mb-8">
            <StatCard icon={<Users size={18} className="text-blue-400" />} number="0" label="Seguidores" />
            <StatCard icon={<UserCheck size={18} className="text-purple-400" />} number="0" label="Seguidos" />
            <StatCard icon={<Zap size={18} className="text-cuadralo-pink" />} number="0" label="Matchs" />
            <StatCard icon={<ShieldCheck size={18} className="text-green-400" />} number="10%" label="Verificación" />
        </div>

        {/* Banner */}
        <div className="w-full p-5 bg-gradient-to-r from-cuadralo-purple to-cuadralo-pink rounded-3xl mb-8 relative overflow-hidden group cursor-pointer shadow-xl transform transition-transform hover:scale-[1.01]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-8 -mt-8 blur-2xl group-hover:bg-white/20 transition-colors" />
            <div className="relative z-10">
                <h3 className="text-lg font-extrabold mb-1 flex items-center gap-2">Cuadralo Gold <span className="text-xl">👑</span></h3>
                <p className="text-white/90 text-xs font-medium mb-4 max-w-[85%] leading-relaxed">Descubre a quién le gustas y obtén Swipes ilimitados.</p>
                <button className="bg-white text-cuadralo-pink font-bold py-2 px-5 rounded-full text-xs shadow-md hover:shadow-lg transition-all">Ver Planes</button>
            </div>
        </div>

        {/* Menú */}
        <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-2">Ajustes</h3>
            <MenuItem 
                icon={<Edit2 size={18} />} 
                label="Editar Información" 
                onClick={() => setShowEdit(true)} 
            />
            <MenuItem icon={<Settings size={18} />} label="Configuración" />
            <div className="h-2"></div> 
            <MenuItem 
                icon={<LogOut size={18} />} 
                label="Cerrar Sesión" 
                color="text-red-500 hover:text-red-400" 
                border="border-red-500/20"
                onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    window.location.href = "/login";
                }} 
            />
        </div>

        </motion.div>

        <AnimatePresence>
            {showEdit && <EditProfileModal onClose={() => setShowEdit(false)} />}
        </AnimatePresence>
    </>
  );
}

// Sub-componentes (Igual que antes)
function StatCard({ icon, number, label }) {
  return (
    <div className="flex flex-col items-center justify-center py-3 px-1 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all cursor-default">
      <div className="mb-1.5 p-1.5 bg-black/20 rounded-full">{icon}</div>
      <span className="text-sm font-extrabold truncate w-full text-center">{number}</span>
      <span className="text-[10px] text-gray-400 font-medium truncate w-full text-center uppercase tracking-wide">{label}</span>
    </div>
  );
}

function MenuItem({ icon, label, onClick, color = "text-white", border = "border-white/5" }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center justify-between p-3.5 bg-white/5 rounded-2xl border ${border} hover:bg-white/10 transition-all group active:scale-[0.98]`}>
      <div className="flex items-center gap-3">
        <div className={`text-gray-400 group-hover:${color.replace('hover:', '')} transition-colors`}>{icon}</div>
        <span className={`text-sm font-medium ${color}`}>{label}</span>
      </div>
      <ChevronRight size={16} className="text-gray-600 group-hover:text-white transition-colors" />
    </button>
  );
}