"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { X, Heart, MapPin } from "lucide-react";
import Image from "next/image"; 
import { api } from "@/utils/api"; 

export default function CardStack() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar usuarios al iniciar
  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    try {
      setLoading(true);
      // El backend ahora devuelve solo gente según tus filtros
      const users = await api.get("/feed");
      
      const formattedCards = users.map(u => ({
          id: u.id,
          name: u.name,
          age: u.age,
          bio: u.bio || "Sin descripción...",
          // Usamos una imagen por defecto si no tienen foto
          img: u.photo || "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600",
          location: "Valencia, VE", 
          matchPercentage: Math.floor(Math.random() * (99 - 70) + 70)
      }));

      setCards(formattedCards);
    } catch (error) {
      console.error("Error cargando feed:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeCard = async (id, direction) => {
    // 1. Desaparecer carta visualmente
    setCards((prev) => prev.filter((card) => card.id !== id));

    // 2. Enviar acción al backend
    const action = direction === "right" ? "right" : "left";
    try {
        const response = await api.post("/swipe", {
            target_id: id,
            action: action
        });

        if (response.match) {
            alert("¡ES UN MATCH! (Aquí pondremos el modal bonito luego)");
        }
    } catch (error) {
        console.error("Error al dar swipe:", error);
    }
  };

  // --- UI DE CARGA ---
  if (loading) {
    return (
        <div className="flex h-[50vh] w-full items-center justify-center flex-col gap-4">
             <div className="animate-spin h-8 w-8 border-4 border-cuadralo-pink border-t-transparent rounded-full"/>
             <p className="text-white/50 text-xs font-medium animate-pulse">Buscando gente...</p>
        </div>
    );
  }

  // --- UI SIN USUARIOS ---
  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-6 animate-fade-in">
        <div className="relative w-48 h-48 mb-6 flex items-center justify-center">
            {/* Ondas decorativas */}
            <motion.div animate={{ scale: [1, 1.5, 2], opacity: [0.5, 0.2, 0] }} transition={{ duration: 3, repeat: Infinity }} className="absolute inset-0 bg-cuadralo-pink/20 rounded-full blur-xl"/>
            {/* Icono Planeta */}
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="relative w-32 h-32 z-10">
               <Image src="/globe.svg" fill alt="Buscando" className="object-contain opacity-80" />
            </motion.div>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">No hay nadie más</h3>
        <p className="text-gray-400 text-sm max-w-xs mx-auto">
          Intenta cambiar tus filtros en el Perfil para ver más personas.
        </p>
        <button onClick={() => window.location.reload()} className="mt-6 text-cuadralo-pink text-xs font-bold hover:underline">Recargar</button>
      </div>
    );
  }

  // --- UI TARJETAS ---
  return (
    <div className="relative w-full h-[60vh] flex justify-center items-center mt-6">
      <AnimatePresence>
        {cards.map((card, index) => {
          const isFront = index === cards.length - 1;
          return <Card key={card.id} data={card} isFront={isFront} onSwipe={removeCard} />;
        })}
      </AnimatePresence>

      {/* Botones Flotantes */}
      {cards.length > 0 && (
          <div className="absolute -bottom-24 flex gap-6 z-50">
            <button onClick={() => removeCard(cards[cards.length - 1].id, "left")} className="w-14 h-14 bg-[#1a1a1a] rounded-full flex items-center justify-center shadow-lg border border-white/10 hover:scale-110 transition-transform">
                <X size={28} className="text-red-500" />
            </button>
            <button onClick={() => removeCard(cards[cards.length - 1].id, "right")} className="w-14 h-14 bg-[#1a1a1a] rounded-full flex items-center justify-center shadow-lg border border-white/10 hover:scale-110 transition-transform">
                <Heart size={28} className="text-cuadralo-pink fill-cuadralo-pink" />
            </button>
          </div>
      )}
    </div>
  );
}

// Componente Carta Individual
function Card({ data, isFront, onSwipe }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

  return (
    <motion.div
      style={{ x, rotate, opacity, zIndex: isFront ? 100 : 0 }}
      drag={isFront ? "x" : false} 
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(e, i) => { 
          if (i.offset.x > 100) onSwipe(data.id, "right"); 
          else if (i.offset.x < -100) onSwipe(data.id, "left"); 
      }}
      initial={{ scale: 0.95, y: -20, opacity: 0 }} 
      animate={{ scale: 1, y: 0, opacity: 1 }}
      exit={{ x: x.get() < 0 ? -500 : 500, opacity: 0, transition: { duration: 0.4 } }}
      className={`absolute w-[90%] md:w-[350px] h-full bg-gray-900 rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 ${!isFront && 'pointer-events-none'}`}
    >
      <img src={data.img} alt={data.name} className="w-full h-full object-cover pointer-events-none" />
      
      {/* Información sobre la imagen */}
      <div className="absolute bottom-0 w-full bg-gradient-to-t from-black via-black/80 to-transparent pt-20 pb-8 px-6 text-white pointer-events-none">
        <h2 className="text-3xl font-extrabold flex items-end gap-2 mb-1">{data.name} <span className="text-xl text-gray-300 font-medium">{data.age}</span></h2>
        <div className="flex items-center gap-2 text-gray-300 text-xs mb-3"><MapPin size={14} className="text-cuadralo-pink" /> {data.location}</div>
        <p className="text-gray-200 text-xs leading-relaxed opacity-90">{data.bio}</p>
      </div>
    </motion.div>
  );
}