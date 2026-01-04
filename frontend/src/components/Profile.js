"use client";

import { motion } from "framer-motion";
import { Settings, Edit2, LogOut, Camera, Star, Zap, Shield, ChevronRight } from "lucide-react";

export default function Profile() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      // Padding-bottom de 24 (pb-24) para que el menú inferior no tape el botón de cerrar sesión
      className="w-full h-full text-white pt-24 pb-28 px-6 overflow-y-auto max-w-4xl mx-auto"
    >
      {/* 1. Header Simple */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Mi Perfil</h2>
        <button className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
          <Settings className="text-gray-400 hover:text-white" size={24} />
        </button>
      </div>

      {/* 2. Foto y Datos */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative w-36 h-36 mb-4 group cursor-pointer">
          {/* Borde degradado animado */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cuadralo-pink to-cuadralo-purple animate-spin-slow blur-sm opacity-70 group-hover:opacity-100 transition-opacity" />
          
          <img 
            src="https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=600" 
            alt="Tu foto" 
            className="relative w-full h-full rounded-full object-cover border-4 border-black"
          />
          
          {/* Botón flotante de cámara */}
          <div className="absolute bottom-0 right-2 p-2.5 bg-cuadralo-pink rounded-full text-white border-4 border-black hover:scale-110 transition-transform shadow-lg z-10">
            <Camera size={18} />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-1">
          Víctor Hugo, 25 <Shield size={20} className="text-blue-400 fill-blue-400/20" />
        </h1>
        <p className="text-gray-400 font-medium">Diseñador & Desarrollador 💻</p>
      </div>

      {/* 3. Estadísticas (Stats) */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <StatCard icon={<Star size={20} className="text-yellow-400" />} number="4.9" label="Rating" />
        <StatCard icon={<Zap size={20} className="text-cuadralo-pink" />} number="1.2k" label="Matches" />
        <StatCard icon={<Shield size={20} className="text-green-400" />} number="98%" label="Completo" />
      </div>

      {/* 4. Banner Premium (Marketing) */}
      <div className="w-full p-6 bg-gradient-to-r from-cuadralo-purple to-cuadralo-pink rounded-3xl mb-8 relative overflow-hidden group cursor-pointer shadow-xl transform transition-transform hover:scale-[1.02]">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-10 -mt-10 blur-3xl group-hover:bg-white/20 transition-colors" />
        <div className="relative z-10">
            <h3 className="text-xl font-extrabold mb-1 flex items-center gap-2">
                Cuadralo Gold <span className="text-2xl">👑</span>
            </h3>
            <p className="text-white/90 text-sm font-medium mb-5 max-w-[80%]">
                Mira a quién le gustas, usa Swipes ilimitados y viaja a cualquier lugar.
            </p>
            <button className="bg-white text-cuadralo-pink font-bold py-2.5 px-6 rounded-full text-sm shadow-lg hover:shadow-xl transition-all">
                Ver Planes
            </button>
        </div>
      </div>

      {/* 5. Menú de Opciones */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-2">Ajustes</h3>
        <MenuItem icon={<Edit2 size={20} />} label="Editar Información Personal" />
        <MenuItem icon={<Settings size={20} />} label="Configuración de la App" />
        <div className="h-4"></div> {/* Espaciador */}
        <MenuItem icon={<LogOut size={20} />} label="Cerrar Sesión" color="text-red-500 hover:text-red-400" border="border-red-500/20" />
      </div>

    </motion.div>
  );
}

// Sub-componentes para ordenar el código
function StatCard({ icon, number, label }) {
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all cursor-default">
      <div className="mb-2 p-2 bg-black/20 rounded-full">{icon}</div>
      <span className="text-xl font-extrabold">{number}</span>
      <span className="text-xs text-gray-400 font-medium">{label}</span>
    </div>
  );
}

function MenuItem({ icon, label, color = "text-white", border = "border-white/5" }) {
  return (
    <button className={`w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl border ${border} hover:bg-white/10 transition-all group active:scale-[0.98]`}>
      <div className="flex items-center gap-4">
        <div className={`text-gray-400 group-hover:${color.replace('hover:', '')} transition-colors`}>{icon}</div>
        <span className={`font-medium ${color}`}>{label}</span>
      </div>
      <ChevronRight size={20} className="text-gray-600 group-hover:text-white transition-colors" />
    </button>
  );
}