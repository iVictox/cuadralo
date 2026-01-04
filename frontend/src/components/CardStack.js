"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Info, MapPin } from "lucide-react";
import { api } from "@/utils/api"; 

export default function CardStack() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar usuarios del Backend al iniciar
  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const users = await api.get("/feed");
        
        // Transformamos los datos del backend al formato visual de las cartas
        const formattedCards = users.map(u => ({
            id: u.id,
            name: u.name,
            age: u.age,
            bio: u.bio || "Sin descripción...",
            // Si no tiene foto, ponemos una genérica de Pexels
            img: u.photo || "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600",
            location: "Valencia, VE", // (Aquí pondríamos la ubicación real más adelante)
            isVerified: false // (Aquí pondríamos el estado real más adelante)
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

  // Función para eliminar carta tras swipe (izquierda o derecha)
  const removeCard = (id, direction) => {
    // Aquí conectaríamos con la API para dar Like/Dislike en el futuro
    console.log(`Swipe ${direction} al usuario ID: ${id}`);
    
    // Eliminamos la carta del array localmente
    setCards((prev) => prev.filter((card) => card.id !== id));
  };

  // Estado de Carga
  if (loading) {
    return (
        <div className="flex h-[60vh] w-full items-center justify-center text-gray-500 flex-col gap-4">
            <div className="w-8 h-8 border-4 border-cuadralo-pink border-t-transparent rounded-full animate-spin"></div>
            <p>Buscando personas cercanas...</p>
        </div>
    );
  }

  // Estado Sin Cartas
  if (cards.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center px-6">
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4 animate-pulse">
                <Info size={40} className="text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No hay nadie más cerca</h3>
            <p className="text-gray-400">¡Has visto todos los perfiles disponibles! Vuelve más tarde.</p>
        </div>
    );
  }

  // Renderizado del Stack
  return (
    <div className="relative w-full h-[70vh] max-h-[600px] flex justify-center items-center mt-4">
      <AnimatePresence>
        {cards.map((card, index) => {
          // Solo la última carta del array es la que está "encima" (Front)
          const isFront = index === cards.length - 1;
          return (
            <Card
              key={card.id}
              data={card}
              isFront={isFront}
              onSwipe={removeCard}
            />
          );
        })}
      </AnimatePresence>
      
      {/* Botones de Acción (Solo visibles si hay cartas) */}
      {cards.length > 0 && (
          <div className="absolute -bottom-24 flex gap-6 z-20">
            <button 
                onClick={() => removeCard(cards[cards.length - 1].id, "left")}
                className="w-16 h-16 bg-[#1a1a1a] rounded-full flex items-center justify-center shadow-lg border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white hover:scale-110 transition-all active:scale-95"
            >
                <X size={32} />
            </button>
            <button 
                onClick={() => removeCard(cards[cards.length - 1].id, "right")}
                className="w-16 h-16 bg-[#1a1a1a] rounded-full flex items-center justify-center shadow-lg border border-cuadralo-pink/20 text-cuadralo-pink hover:bg-cuadralo-pink hover:text-white hover:scale-110 transition-all active:scale-95"
            >
                <Heart size={32} fill="currentColor" />
            </button>
          </div>
      )}
    </div>
  );
}

// Sub-componente Card Completo
function Card({ data, isFront, onSwipe }) {
  return (
    <motion.div
      layout
      drag={isFront ? "x" : false} // Solo se puede arrastrar si está al frente
      dragConstraints={{ left: 0, right: 0 }}
      // Detectar fin del arrastre
      onDragEnd={(e, info) => {
        if (info.offset.x > 100) {
            onSwipe(data.id, "right"); // Swipe derecha
        } else if (info.offset.x < -100) {
            onSwipe(data.id, "left");  // Swipe izquierda
        }
      }}
      // Animaciones de entrada/salida
      initial={{ scale: 0.95, y: 10, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      exit={{ 
          x: Math.random() < 0.5 ? -300 : 300, // Sale volando a un lado
          opacity: 0, 
          rotate: 20,
          transition: { duration: 0.2 } 
      }}
      className="absolute w-[90%] max-w-sm h-full bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10 select-none cursor-grab active:cursor-grabbing"
      style={{ zIndex: isFront ? 10 : 0 }}
    >
      {/* Imagen */}
      <img 
        src={data.img} 
        alt={data.name} 
        className="w-full h-full object-cover pointer-events-none" 
      />
      
      {/* Degradado y Texto */}
      <div className="absolute bottom-0 w-full bg-gradient-to-t from-black via-black/60 to-transparent pt-20 pb-6 px-5">
        <h2 className="text-3xl font-bold text-white flex items-end gap-2 shadow-black drop-shadow-lg">
            {data.name}, {data.age}
            {data.isVerified && (
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-xs" title="Verificado">✓</div>
            )}
        </h2>
        
        <div className="flex items-center gap-1 text-gray-300 text-sm mt-1 mb-2 drop-shadow-md">
            <MapPin size={14} /> {data.location}
        </div>

        <p className="text-gray-200 text-sm line-clamp-2 drop-shadow-md leading-relaxed">
            {data.bio}
        </p>
      </div>
    </motion.div>
  );
}