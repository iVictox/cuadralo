"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { X, Heart, MapPin } from "lucide-react";
import Image from "next/image"; 
import { api } from "@/utils/api"; 

export default function CardStack() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- CARGAR FEED FILTRADO DEL BACKEND ---
  useEffect(() => {
    const fetchFeed = async () => {
      try {
        setLoading(true);
        // El backend ahora devuelve usuarios según tus preferencias de configuración
        const users = await api.get("/feed");
        
        const formattedCards = users.map(u => ({
            id: u.id,
            name: u.name,
            age: u.age,
            bio: u.bio || "Sin descripción...",
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

    fetchFeed();
  }, []);

  // --- LÓGICA DE SWIPE ---
  const removeCard = async (id, direction) => {
    const action = direction === "right" ? "right" : "left";
    try {
        const response = await api.post("/swipe", {
            target_id: id,
            action: action
        });

        // Si hay match, la lógica del modal de match se dispara aquí
        if (response.match) {
            console.log("¡Es un Match!");
        }
    } catch (error) {
        console.error("Error al procesar swipe:", error);
    }
    setCards((prev) => prev.filter((card) => card.id !== id));
  };

  // --- PANTALLA DE CARGA ---
  if (loading) {
    return (
        <div className="flex h-[50vh] w-full items-center justify-center flex-col gap-4">
             <div className="relative w-12 h-12">
                <div className="absolute inset-0 border-4 border-white/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-cuadralo-pink border-t-transparent rounded-full animate-spin"></div>
             </div>
             <p className="text-white/50 text-xs font-medium animate-pulse">Buscando personas cerca...</p>
        </div>
    );
  }

  // --- PANTALLA VACÍA (ANIMACIÓN DEL PLANETA) ---
  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-6 animate-fade-in">
        <div className="relative w-48 h-48 mb-6 flex items-center justify-center">
            {/* Ondas de radar */}
            <motion.div animate={{ scale: [1, 1.5, 2], opacity: [0.5, 0.2, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }} className="absolute inset-0 bg-cuadralo-pink/20 rounded-full blur-xl"/>
            <motion.div animate={{ scale: [1, 1.5, 2], opacity: [0.5, 0.2, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 1 }} className="absolute inset-0 bg-cuadralo-purple/20 rounded-full blur-xl"/>
            
            {/* Planeta girando */}
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="relative w-32 h-32 z-10">
               <Image src="/globe.svg" fill alt="Buscando" className="object-contain opacity-90 drop-shadow-[0_0_30px_rgba(236,72,153,0.3)]" priority />
            </motion.div>
            
            <div className="absolute z-20 bg-[#0f0518] p-2 rounded-full border border-white/10 shadow-xl">
                 <MapPin className="text-cuadralo-pink animate-bounce" size={20} />
            </div>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">No hay nadie más cerca</h3>
        <p className="text-gray-400 text-sm">Ajusta tus filtros o vuelve más tarde para ver gente nueva. 🚀</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[55vh] md:h-[60vh] max-h-[500px] flex justify-center items-center mt-2 md:mt-6 perspective-1000">
      <AnimatePresence>
        {cards.map((card, index) => {
          const isFront = index === cards.length - 1;
          return <Card key={card.id} data={card} isFront={isFront} onSwipe={removeCard} />;
        })}
      </AnimatePresence>

      {/* BOTONES FLOTANTES PREMIUM */}
      {cards.length > 0 && (
          <div className="absolute -bottom-20 md:-bottom-24 flex gap-6 z-50">
            <button 
                onClick={() => removeCard(cards[cards.length - 1].id, "left")}
                className="group w-14 h-14 bg-[#1a1a1a]/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-white/10 transition-transform hover:scale-110 active:scale-95"
            >
                <X size={28} className="text-red-500 group-hover:text-red-400" />
            </button>

            <button 
                onClick={() => removeCard(cards[cards.length - 1].id, "right")}
                className="group w-14 h-14 bg-[#1a1a1a]/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-white/10 transition-transform hover:scale-110 active:scale-95"
            >
                <Heart size={28} className="text-cuadralo-pink group-hover:text-white fill-current group-hover:fill-white" />
            </button>
          </div>
      )}
    </div>
  );
}

// --- COMPONENTE INDIVIDUAL DE CARTA ---
function Card({ data, isFront, onSwipe }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);
  const bgLike = useTransform(x, [0, 150], ["rgba(0,0,0,0)", "rgba(34, 197, 94, 0.2)"]);
  const bgNope = useTransform(x, [-150, 0], ["rgba(239, 68, 68, 0.2)", "rgba(0,0,0,0)"]);

  return (
    <motion.div
      style={{ x, rotate, opacity, zIndex: isFront ? 100 : 0 }}
      drag={isFront ? "x" : false} dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(e, i) => { if (i.offset.x > 100) onSwipe(data.id, "right"); else if (i.offset.x < -100) onSwipe(data.id, "left"); }}
      initial={{ scale: 0.95, y: -20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
      exit={{ x: x.get() < 0 ? -500 : 500, opacity: 0, rotate: x.get() < 0 ? -20 : 20, transition: { duration: 0.4 } }}
      whileHover={{ scale: isFront ? 1.02 : 1 }} whileTap={{ cursor: "grabbing" }}
      className={`absolute w-[90%] md:w-[350px] h-full bg-gray-900 rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 origin-bottom cursor-grab ${!isFront ? 'pointer-events-none' : ''}`}
    >
      <img src={data.img} alt={data.name} className="w-full h-full object-cover pointer-events-none" />
      {isFront && <><motion.div style={{ backgroundColor: bgLike }} className="absolute inset-0 z-10"/><motion.div style={{ backgroundColor: bgNope }} className="absolute inset-0 z-10"/></>}
      <div className="absolute top-0 w-full h-32 bg-gradient-to-b from-black/60 to-transparent p-6 pointer-events-none text-white">
          <div className="bg-black/30 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 inline-flex items-center gap-1">
              <span className="text-cuadralo-pink font-bold text-xs">{data.matchPercentage}%</span>
              <span className="text-[10px]">Match</span>
          </div>
      </div>
      <div className="absolute bottom-0 w-full bg-gradient-to-t from-black via-black/80 to-transparent pt-24 pb-8 px-6 pointer-events-none text-white">
        <h2 className="text-3xl font-extrabold flex items-end gap-2 mb-1 drop-shadow-lg">{data.name} <span className="text-xl text-gray-300 font-medium">{data.age}</span></h2>
        <div className="flex items-center gap-2 text-gray-300 text-xs mb-2"><MapPin size={14} className="text-cuadralo-pink" /> {data.location}</div>
        <p className="text-gray-200 text-xs leading-relaxed line-clamp-2 opacity-90">{data.bio}</p>
      </div>
    </motion.div>
  );
}