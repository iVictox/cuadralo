"use client";

import { motion } from "framer-motion";
import { Lock, Heart } from "lucide-react";

export default function MyLikes() {
  // Datos simulados: Algunos perfiles son 'locked' (bloqueados/borrosos)
  const likes = [
    { id: 1, name: "Sofia", age: 21, img: "https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=300", locked: false },
    { id: 2, name: "Carla", age: 24, img: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=300", locked: false },
    { id: 3, name: "???", age: 22, img: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=300", locked: true },
    { id: 4, name: "???", age: 25, img: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=300", locked: true },
    { id: 5, name: "???", age: 20, img: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=300", locked: true },
    { id: 6, name: "???", age: 23, img: "https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=300", locked: true },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-full text-white pt-20 pb-28 px-4 overflow-y-auto max-w-5xl mx-auto"
    >
      {/* 1. Header con Contador */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-1">Te quieren conocer 💖</h2>
        <p className="text-gray-400 text-sm">A <span className="text-cuadralo-pink font-bold">6 personas</span> les gustas</p>
      </div>

      {/* 2. Banner de Venta (Upsell) */}
      <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-800/20 border border-yellow-500/30 p-4 rounded-xl mb-6 flex items-center justify-between shadow-[0_0_15px_rgba(234,179,8,0.1)]">
        <div>
            <h3 className="font-bold text-yellow-500 text-sm">Descubre quiénes son</h3>
            <p className="text-xs text-yellow-200/70">Actualiza a Gold para ver todos los perfiles.</p>
        </div>
        <button className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs rounded-full shadow-lg transition-colors">
            Ver Gold
        </button>
      </div>

      {/* 3. Cuadrícula de Likes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {likes.map((user) => (
          <div 
            key={user.id} 
            className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-900 group cursor-pointer"
          >
            {/* Imagen de fondo */}
            <img 
              src={user.img} 
              alt="User" 
              className={`w-full h-full object-cover transition-all duration-500 ${user.locked ? "blur-md scale-110 opacity-50" : "group-hover:scale-105"}`} 
            />
            
            {/* Overlay Oscuro */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

            {/* CONTENIDO BLOQUEADO */}
            {user.locked ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                    <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-black shadow-lg mb-2 animate-bounce">
                        <Lock size={20} />
                    </div>
                    <span className="text-xs font-bold text-yellow-500 uppercase tracking-widest">Gold</span>
                </div>
            ) : (
                /* CONTENIDO VISIBLE */
                <div className="absolute bottom-3 left-3 z-10">
                    <h3 className="text-lg font-bold flex items-center gap-1">
                        {user.name}, {user.age}
                        <div className="w-2 h-2 bg-green-500 rounded-full inline-block ml-1" />
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-cuadralo-pink">
                        <Heart size={12} fill="currentColor" /> Reciente
                    </div>
                </div>
            )}
          </div>
        ))}
      </div>

    </motion.div>
  );
}