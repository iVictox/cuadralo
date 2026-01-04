"use client"; // Obligatorio para animaciones en Next.js

import { useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { X, Heart, MapPin } from "lucide-react"; // Iconos

export default function CardStack() {
  // Datos simulados (luego vendrán de tu Base de Datos Go)
  const [cards, setCards] = useState([
    {
      id: 1,
      name: "Valeria",
      age: 22,
      bio: "Amante del café y los atardeceres en Valencia. ☕🌅",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000&auto=format&fit=crop",
      distance: "2 km",
    },
    {
      id: 2,
      name: "Andrea",
      age: 24,
      bio: "Ingeniera de sistemas. Gamer de fin de semana. 🎮",
      image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1000&auto=format&fit=crop",
      distance: "5 km",
    },
    {
      id: 3,
      name: "Sofia",
      age: 20,
      bio: "Buscando alguien para ir a Morrocoy. 🏝️",
      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1000&auto=format&fit=crop",
      distance: "10 km",
    },
  ]);

  // Si no hay más cartas
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
        // Solo renderizamos las 2 primeras para rendimiento (la actual y la de atrás)
        if (index > 1) return null; 
        
        const isFront = index === 0;
        return (
          <Card
            key={card.id}
            data={card}
            active={isFront}
            removeCard={() => {
              setCards((prev) => prev.slice(1)); // Elimina la primera carta
            }}
          />
        );
      })}
    </div>
  );
}

// Sub-componente de Tarjeta Individual
function Card({ data, active, removeCard }) {
  // Valores de movimiento
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]); // Rota al arrastrar
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]); // Desvanece si se va muy lejos

  // Color del borde según dirección (Rojo izq, Verde der)
  const borderColor = useTransform(
    x,
    [-200, 0, 200],
    ["#ef4444", "transparent", "#22c55e"]
  );

  // Manejador al soltar la carta
  const handleDragEnd = (event, info) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (offset > 100 || velocity > 500) {
      // Swipe Derecha (LIKE)
      console.log("LIKE a", data.name);
      removeCard();
    } else if (offset < -100 || velocity < -500) {
      // Swipe Izquierda (NOPE)
      console.log("NOPE a", data.name);
      removeCard();
    }
  };

  return (
    <motion.div
      style={{
        x: active ? x : 0,
        rotate: active ? rotate : 0,
        opacity: active ? opacity : 1,
        scale: active ? 1 : 0.95, // La carta de atrás es más pequeña
        boxShadow: active ? "0 20px 50px rgba(0,0,0,0.5)" : "none",
        border: active ? "2px solid" : "none",
        borderColor: active ? borderColor : "transparent",
        zIndex: active ? 10 : 0,
      }}
      drag={active ? "x" : false} // Solo se puede arrastrar si es la primera
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={handleDragEnd}
      // Animación inicial
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: active ? 1 : 0.95, opacity: 1, y: active ? 0 : -10 }}
      exit={{ x: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className={`absolute top-0 w-[90%] max-w-sm h-[550px] rounded-3xl overflow-hidden bg-gray-900 ${
        !active && "brightness-50" // Oscurece la carta de atrás
      }`}
    >
      {/* Imagen de fondo */}
      <div 
        className="absolute inset-0 bg-cover bg-center pointer-events-none"
        style={{ backgroundImage: `url(${data.image})` }}
      />
      
      {/* Gradiente para que se lea el texto */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />

      {/* Información del Usuario */}
      <div className="absolute bottom-0 w-full p-6 text-white pointer-events-none">
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

        {/* Botones de acción falsos (visuales) */}
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