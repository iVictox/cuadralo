"use client";

import { useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { X, Heart, MapPin } from "lucide-react";

export default function CardStack() {
  // DATOS CORREGIDOS: Imágenes de Pexels que SI cargan
  const [cards, setCards] = useState([
    {
      id: 1,
      name: "Valeria",
      age: 22,
      bio: "Amante del café y los atardeceres en Valencia. ☕🌅",
      image: "https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=600", 
      distance: "2 km",
    },
    {
      id: 2,
      name: "Andrea",
      age: 24,
      bio: "Ingeniera de sistemas. Gamer de fin de semana. 🎮",
      image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600",
      distance: "5 km",
    },
    {
      id: 3,
      name: "Sofia",
      age: 20,
      bio: "Buscando alguien para ir a Morrocoy. 🏝️",
      image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=600",
      distance: "10 km",
    },
  ]);

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center text-white p-6">
        <div className="text-6xl mb-4">🌍</div>
        <h2 className="text-2xl font-bold mb-2">No hay nadie cerca</h2>
        <p className="text-gray-400">Intenta ampliar tu radio de búsqueda.</p>
        <button 
            onClick={() => window.location.reload()} 
            className="mt-6 px-6 py-2 bg-cuadralo-pink rounded-full font-bold shadow-lg hover:bg-cuadralo-pinkDark transition-colors">
            Recargar
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[600px] flex items-center justify-center mt-4">
      {cards.map((card, index) => {
        if (index > 1) return null; 
        const isFront = index === 0;
        return (
          <Card
            key={card.id}
            data={card}
            active={isFront}
            removeCard={() => setCards((prev) => prev.slice(1))}
          />
        );
      })}
    </div>
  );
}

function Card({ data, active, removeCard }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  // CORRECCIÓN IMPORTANTE: Usamos rgba(0,0,0,0) en vez de "transparent"
  const borderColor = useTransform(
    x,
    [-200, 0, 200],
    ["#ef4444", "rgba(0,0,0,0)", "#22c55e"]
  );

  const handleDragEnd = (event, info) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (offset > 100 || velocity > 500) {
      removeCard();
    } else if (offset < -100 || velocity < -500) {
      removeCard();
    }
  };

  return (
    <motion.div
      style={{
        x: active ? x : 0,
        rotate: active ? rotate : 0,
        opacity: active ? opacity : 1,
        scale: active ? 1 : 0.95,
        boxShadow: active ? "0 20px 50px rgba(0,0,0,0.5)" : "none",
        border: active ? "4px solid" : "none",
        borderColor: active ? borderColor : "rgba(0,0,0,0)",
        zIndex: active ? 10 : 0,
      }}
      drag={active ? "x" : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: active ? 1 : 0.95, opacity: 1, y: active ? 0 : -10 }}
      exit={{ x: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className={`absolute top-0 w-[90%] max-w-sm h-[550px] rounded-3xl overflow-hidden bg-gray-900 ${
        !active && "brightness-50"
      }`}
    >
      {/* Imagen de fondo */}
      <div 
        className="absolute inset-0 bg-cover bg-center pointer-events-none"
        style={{ backgroundImage: `url(${data.image})` }}
      />
      
      {/* Gradiente oscuro */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />

      {/* Textos */}
      <div className="absolute bottom-0 w-full p-6 text-white pointer-events-none select-none">
        <div className="flex items-baseline gap-2">
            <h2 className="text-4xl font-bold drop-shadow-md">{data.name}</h2>
            <span className="text-2xl font-medium opacity-90">{data.age}</span>
        </div>
        
        <div className="flex items-center gap-1 mt-1 text-sm font-semibold text-cuadralo-pink">
            <MapPin size={16} />
            <span>A {data.distance} de ti</span>
        </div>

        <p className="mt-3 text-base text-gray-200 line-clamp-2 drop-shadow-sm">
          {data.bio}
        </p>

        {/* Botones Falsos */}
        <div className="flex justify-center gap-6 mt-6">
            <div className="p-4 rounded-full border-2 border-red-500 text-red-500 bg-black/20 backdrop-blur-sm">
                <X size={32} />
            </div>
            <div className="p-4 rounded-full border-2 border-green-500 text-green-500 bg-black/20 backdrop-blur-sm">
                <Heart size={32} fill="currentColor" />
            </div>
        </div>
      </div>
    </motion.div>
  );
}