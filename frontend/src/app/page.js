"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Loader2, LogOut, User } from "lucide-react";
import { motion } from "framer-motion";

// 1. LA SOLUCIÓN: Separar el contenido que usa "useSearchParams" en un componente hijo
function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams(); // Esto es lo que causaba el error de Next.js
  
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificamos si hay un usuario logueado en el localStorage
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      // Si no hay sesión, lo enviamos al login
      router.push("/login");
    } else {
      setUser(JSON.parse(storedUser));
      setIsLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cuadralo-bgLight dark:bg-[#0f0518] text-cuadralo-pink">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="font-bold text-gray-500 tracking-widest uppercase text-sm">Cargando tu mundo...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cuadralo-bgLight dark:bg-[#0f0518] text-cuadralo-textLight dark:text-white transition-colors duration-500 overflow-hidden relative">
      {/* Fondos animados */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cuadralo-pink/20 rounded-full blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse delay-1000 pointer-events-none" />

      {/* Menú de Navegación superior */}
      <nav className="w-full p-6 flex justify-between items-center relative z-10 border-b border-black/5 dark:border-white/5 bg-white/50 dark:bg-black/20 backdrop-blur-md">
        <div className="w-32 h-8 relative">
           <Image src="/logo.svg" fill className="object-contain dark:invert-0 invert" alt="Cuadralo" priority />
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-black/5 dark:bg-white/5 px-4 py-2 rounded-full border border-black/5 dark:border-white/10">
            <div className="w-8 h-8 rounded-full bg-cuadralo-pink flex items-center justify-center text-white font-black overflow-hidden relative">
               {user?.photos?.length > 0 ? (
                 <img src={user.photos[0]} alt="Perfil" className="w-full h-full object-cover" />
               ) : (
                 <User size={16} />
               )}
            </div>
            <span className="font-bold text-sm hidden sm:block">@{user?.username}</span>
          </div>
          
          <button 
            onClick={handleLogout}
            className="p-2.5 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all"
            title="Cerrar Sesión"
          >
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      {/* Contenido Principal */}
      <main className="max-w-4xl mx-auto p-6 md:p-12 relative z-10 mt-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter">
            ¡Hola, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cuadralo-pink to-purple-500">{user?.name?.split(' ')[0]}</span>!
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg md:text-xl font-medium">
            Bienvenido a tu panel principal. Aquí empieza la magia.
          </p>
        </motion.div>

        {/* Tarjetas de ejemplo para tu Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="bg-white/60 dark:bg-[#1a0b2e]/60 backdrop-blur-xl p-8 rounded-3xl border border-black/5 dark:border-white/10 hover:border-cuadralo-pink/50 transition-colors group cursor-pointer"
          >
            <div className="w-14 h-14 bg-cuadralo-pink/20 text-cuadralo-pink rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <User size={28} />
            </div>
            <h3 className="text-2xl font-black mb-2">Mi Perfil</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Actualiza tus fotos, cambia tu biografía y ajusta tus intereses.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
            className="bg-white/60 dark:bg-[#1a0b2e]/60 backdrop-blur-xl p-8 rounded-3xl border border-black/5 dark:border-white/10 hover:border-purple-500/50 transition-colors group cursor-pointer"
          >
            <div className="w-14 h-14 bg-purple-500/20 text-purple-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
            </div>
            <h3 className="text-2xl font-black mb-2">Comunidad</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Descubre nuevas personas cerca de ti que comparten tus mismos gustos.</p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

// 2. EXPORTACIÓN PRINCIPAL: Aquí usamos <Suspense>
export default function HomePage() {
  return (
    // Envolvemos todo en Suspense. Mientras se evalúan las URLs o hooks asíncronos, Next.js muestra esto:
    <Suspense 
      fallback={
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-cuadralo-bgLight dark:bg-[#0f0518]">
          <Loader2 className="animate-spin text-cuadralo-pink" size={48} />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}