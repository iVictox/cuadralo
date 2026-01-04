"use client";

import { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, useAnimation } from "framer-motion";
import { X, Heart, MapPin } from "lucide-react";

export default function CardStack() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const [cards, setCards] = useState([
    {
      id: 1,
      name: "Valeria",
      age: 22,
      bio: "Amante del café y los atardeceres en Valencia. ☕🌅",
      image: "https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=1200", // Imagen más grande
      distance: "2 km",
    },
    {
      id: 2,
      name: "Andrea",
      age: 24,
      bio: "Ingeniera de sistemas. Gamer de fin de semana. 🎮",
      image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1200",
      distance: "5 km",
    },
    {
      id: 3,
      name: "Sofia",
      age: 20,
      bio: "Buscando alguien para ir a Morrocoy. 🏝️",
      image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=1200",
      distance: "10 km",
    },
  ]);

  if (!isMounted) return null;

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center text-white p-6 animate-fade-in">
        <div className="text-8xl mb-6 animate-bounce">🌍</div>
        <h2 className="text-3xl font-bold mb-2">No hay nadie cerca</h2>
        <p className="text-gray-400 mb-8">Intenta ampliar tu radio de búsqueda.</p>
        <button 
            onClick={() => window.location.reload()} 
            className="px-10 py-4 bg-cuadralo-pink rounded-full font-bold shadow-lg hover:bg-cuadralo-pinkDark hover:scale-105 transition-all">
            Recargar Búsqueda
        </button>
      </div>
    );
  }

  return (
    // CAMBIO: Altura adaptable (75% del alto de pantalla)
    <div className="relative w-full h-[75vh] flex items-center justify-center mt-4">
      {cards.map((card, index) => {
        if (index > 1) return null; 
        return (
          <Card
            key={card.id}
            data={card}
            active={index === 0}
            removeCard={() => setCards((prev) => prev.slice(1))}
          />
        );
      })}
    </div>
  );
}

function Card({ data, active, removeCard }) {
  const x = useMotionValue(0);
  const controls = useAnimation();
  
  const rotate = useTransform(x, [-200, 200], [-10, 10]); // Rotación más suave en pantallas grandes
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  const borderColor = useTransform(x, [-200, 0, 200], ["#ef4444", "rgba(0,0,0,0)", "#22c55e"]);

  const triggerSwipe = async (direction) => {
    if (direction === "right") {
      await controls.start({ x: 500, opacity: 0, transition: { duration: 0.4 } });
    } else {
      await controls.start({ x: -500, opacity: 0, transition: { duration: 0.4 } });
    }
    removeCard();
  };

  return (
    <motion.div
      drag={active ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      animate={controls}
      style={{
        x,
        rotate,
        opacity: active ? opacity : 1,
        scale: active ? 1 : 0.95,
        zIndex: active ? 10 : 0,
        border: active ? "4px solid" : "none",
        borderColor: active ? borderColor : "rgba(0,0,0,0)",
        boxShadow: active ? "0 20px 50px rgba(0,0,0,0.5)" : "none",
      }}
      onDragEnd={(_, info) => {
        if (info.offset.x > 100) triggerSwipe("right");
        else if (info.offset.x < -100) triggerSwipe("left");
      }}
      // CAMBIO CLAVE: Ancho Responsivo
      // w-[90%] en móvil, pero max-w-xl (576px) o max-w-2xl en PC para que sean grandes pero no gigantes
      className={`absolute w-[90%] md:w-[600px] lg:w-[30%] h-full max-h-[700px] rounded-3xl overflow-hidden bg-gray-900 cursor-grab active:cursor-grabbing ${!active && "brightness-50"}`}
    >
      <div 
        className="absolute inset-0 bg-cover bg-center pointer-events-none"
        style={{ backgroundImage: `url(${data.image})` }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />

      <div className="absolute bottom-0 w-full p-8 text-white pointer-events-none select-none">
        <div className="flex items-baseline gap-3">
            <h2 className="text-5xl font-bold drop-shadow-md">{data.name}</h2>
            <span className="text-3xl font-medium opacity-90">{data.age}</span>
        </div>
        
        <div className="flex items-center gap-2 mt-2 text-lg font-semibold text-cuadralo-pink">
            <MapPin size={20} />
            <span>A {data.distance} de ti</span>
        </div>

        <p className="mt-4 text-lg text-gray-200 line-clamp-2 drop-shadow-sm">
          {data.bio}
        </p>

        <div className="flex justify-center gap-8 mt-8 pointer-events-auto">
            <button 
                onClick={(e) => { e.stopPropagation(); triggerSwipe("left"); }}
                className="p-5 rounded-full border-2 border-red-500 text-red-500 bg-black/40 backdrop-blur-sm hover:bg-red-500 hover:text-white transition-all active:scale-90"
            >
                <X size={36} />
            </button>
            <button 
                onClick={(e) => { e.stopPropagation(); triggerSwipe("right"); }}
                className="p-5 rounded-full border-2 border-green-500 text-green-500 bg-black/40 backdrop-blur-sm hover:bg-green-500 hover:text-white transition-all active:scale-90"
            >
                <Heart size={36} fill="currentColor" />
            </button>
        </div>
      </div>
    </motion.div>
  );
}