"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { 
    X, Heart, MapPin, Info, RotateCcw, ChevronDown,
    Music, Gamepad2, Plane, Coffee, Dumbbell, Film, Star,
    Palette, Book, Dog, Wine, Camera, Laptop, Mountain
} from "lucide-react";
import Image from "next/image"; 
import { api } from "@/utils/api"; 

// --- DICCIONARIO DE INTERESES COMPLETO ---
const AVAILABLE_INTERESTS = [
    { id: "music", label: "Música", icon: <Music size={12} /> },
    { id: "games", label: "Gaming", icon: <Gamepad2 size={12} /> },
    { id: "travel", label: "Viajes", icon: <Plane size={12} /> },
    { id: "coffee", label: "Café", icon: <Coffee size={12} /> },
    { id: "gym", label: "Fitness", icon: <Dumbbell size={12} /> },
    { id: "movies", label: "Cine", icon: <Film size={12} /> },
    { id: "art", label: "Arte", icon: <Palette size={12} /> },
    { id: "books", label: "Libros", icon: <Book size={12} /> },
    { id: "dogs", label: "Perros", icon: <Dog size={12} /> },
    { id: "cooking", label: "Cocina", icon: <Wine size={12} /> }, 
    { id: "wine", label: "Vino", icon: <Wine size={12} /> },
    { id: "photo", label: "Fotografía", icon: <Camera size={12} /> },
    { id: "tech", label: "Tecnología", icon: <Laptop size={12} /> },
    { id: "crypto", label: "Crypto", icon: <Laptop size={12} /> },
    { id: "hiking", label: "Senderismo", icon: <Mountain size={12} /> },
    { id: "health", label: "Salud", icon: <Heart size={12} /> },
    { id: "party", label: "Fiesta", icon: <Music size={12} /> },
    { id: "guitar", label: "Guitarra", icon: <Music size={12} /> },
];

// Mapas rápidos
const INTEREST_LABELS = AVAILABLE_INTERESTS.reduce((acc, item) => ({ ...acc, [item.id]: item.label }), {});
const INTEREST_ICONS = AVAILABLE_INTERESTS.reduce((acc, item) => ({ ...acc, [item.id]: item.icon }), {});

export default function CardStack() {
  const [cards, setCards] = useState([]);
  const [history, setHistory] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState(null); 

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    try {
      setLoading(true);
      const users = await api.get("/feed");
      
      const formattedCards = users.map(u => ({
          id: u.id,
          name: u.name,
          age: u.age,
          bio: u.bio || "Sin descripción...",
          interests: typeof u.interests === 'string' ? JSON.parse(u.interests || "[]") : u.interests || [],
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
    const cardToRemove = cards.find(c => c.id === id);
    setHistory(prev => [...prev, cardToRemove]);
    setCards((prev) => prev.filter((card) => card.id !== id));

    const action = direction === "right" ? "right" : "left";
    try {
        const response = await api.post("/swipe", { target_id: id, action: action });
        if (response.match) {
            alert(`¡Match con ${cardToRemove.name}! 💘`);
        }
    } catch (error) { console.error(error); }
  };

  const handleRewind = () => {
    if (history.length === 0) return;
    const lastCard = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1)); 
    setCards(prev => [...prev, lastCard]); 
  };

  if (loading) return <div className="flex h-full w-full items-center justify-center flex-col gap-4"><div className="animate-spin h-8 w-8 border-4 border-cuadralo-pink border-t-transparent rounded-full"/><p className="text-white/50 text-xs font-medium animate-pulse">Buscando gente...</p></div>;

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6 animate-fade-in">
        <div className="relative w-48 h-48 mb-6 flex items-center justify-center">
            <motion.div animate={{ scale: [1, 1.5, 2], opacity: [0.5, 0.2, 0] }} transition={{ duration: 3, repeat: Infinity }} className="absolute inset-0 bg-cuadralo-pink/20 rounded-full blur-xl"/>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="relative w-32 h-32 z-10">
               <Image src="/globe.svg" fill alt="Buscando" className="object-contain opacity-80" />
            </motion.div>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">No hay nadie más</h3>
        <button onClick={() => window.location.reload()} className="mt-4 text-cuadralo-pink text-xs font-bold hover:underline">Recargar</button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[65vh] flex justify-center items-center mt-4">
      <AnimatePresence>
        {cards.map((card, index) => {
          const isFront = index === cards.length - 1;
          return (
            <Card 
                key={card.id} 
                data={card} 
                isFront={isFront} 
                onSwipe={removeCard} 
                onInfo={() => setSelectedProfile(card)} 
            />
          );
        })}
      </AnimatePresence>

      {/* BOTONES FLOTANTES */}
      {cards.length > 0 && (
          <div className="absolute -bottom-20 flex items-center gap-6 z-50">
            <button onClick={() => removeCard(cards[cards.length - 1].id, "left")} className="w-14 h-14 bg-[#1a1a1a]/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.3)] border border-white/10 hover:scale-110 active:scale-95 transition-all group">
                <X size={28} className="text-red-500 group-hover:text-red-400" />
            </button>
            
            <button 
                onClick={handleRewind} 
                disabled={history.length === 0}
                className={`w-10 h-10 rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.3)] border border-white/10 transition-all ${history.length === 0 ? 'bg-gray-800 opacity-50' : 'bg-[#1a1a1a]/80 hover:bg-yellow-500/20 hover:border-yellow-500'}`}
            >
                <RotateCcw size={18} className={history.length === 0 ? 'text-gray-500' : 'text-yellow-500'} />
            </button>

            <button onClick={() => removeCard(cards[cards.length - 1].id, "right")} className="w-14 h-14 bg-[#1a1a1a]/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.3)] border border-white/10 hover:scale-110 active:scale-95 transition-all group">
                <Heart size={28} className="text-cuadralo-pink fill-current group-hover:text-white group-hover:fill-white" />
            </button>
          </div>
      )}

      <AnimatePresence>
        {selectedProfile && (
            <ProfileDetailsModal profile={selectedProfile} onClose={() => setSelectedProfile(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- COMPONENTE CARTA ---
function Card({ data, isFront, onSwipe, onInfo }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

  return (
    <motion.div
      style={{ x, rotate, opacity, zIndex: isFront ? 100 : 0 }}
      drag={isFront ? "x" : false} dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(e, i) => { if (i.offset.x > 100) onSwipe(data.id, "right"); else if (i.offset.x < -100) onSwipe(data.id, "left"); }}
      // CAMBIO: Sombra reducida drásticamente (antes 50px de blur, ahora 25px) y menos opacidad
      className={`absolute w-[90%] md:w-[360px] h-full bg-gray-900 rounded-[2rem] overflow-hidden shadow-[0_10px_25px_-5px_rgba(0,0,0,0.4)] border border-white/10 ${!isFront && 'pointer-events-none'}`}
    >
      <img src={data.img} alt={data.name} className="w-full h-full object-cover pointer-events-none" />
      
      <button onClick={(e) => { e.stopPropagation(); onInfo(); }} className="absolute top-4 right-4 p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-colors z-20">
        <Info size={20} />
      </button>

      <div className="absolute bottom-0 w-full bg-gradient-to-t from-black via-black/80 to-transparent pt-32 pb-24 px-6 text-white pointer-events-none">
        <h2 className="text-3xl font-extrabold flex items-end gap-2 mb-1">{data.name} <span className="text-xl text-gray-300 font-medium">{data.age}</span></h2>
        <div className="flex items-center gap-2 text-gray-300 text-xs mb-2"><MapPin size={14} className="text-cuadralo-pink" /> {data.location}</div>
        <p className="text-gray-200 text-xs leading-relaxed line-clamp-2 opacity-90">{data.bio}</p>
        
        {/* INTERESES CON ICONOS (Restaurados) */}
        <div className="flex gap-1.5 mt-3 flex-wrap">
            {data.interests.slice(0, 3).map(id => (
                <span key={id} className="flex items-center gap-1 text-[10px] px-2.5 py-1 bg-white/10 backdrop-blur-md rounded-full text-gray-200 border border-white/10">
                    {INTEREST_ICONS[id] && <span className="text-cuadralo-pink/80">{INTEREST_ICONS[id]}</span>}
                    <span className="font-medium">{INTEREST_LABELS[id] || id}</span>
                </span>
            ))}
            {data.interests.length > 3 && (
                <span className="text-[10px] px-2 py-1 bg-white/5 rounded-full text-gray-400 border border-white/5">
                    +{data.interests.length - 3}
                </span>
            )}
        </div>
      </div>
    </motion.div>
  );
}

// --- MODAL DE DETALLES DEL PERFIL ---
function ProfileDetailsModal({ profile, onClose }) {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
        >
            <div className="bg-[#1a0b2e] w-full max-w-md h-[85vh] rounded-3xl overflow-y-auto relative scrollbar-hide border border-white/10 shadow-2xl">
                <div className="relative h-96 w-full">
                    <img src={profile.img} className="w-full h-full object-cover" />
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/40 rounded-full text-white hover:bg-black/60"><ChevronDown size={24}/></button>
                    <div className="absolute bottom-0 w-full bg-gradient-to-t from-[#1a0b2e] to-transparent h-32"/>
                </div>

                <div className="px-6 pb-8 relative -mt-10">
                    <h2 className="text-3xl font-extrabold text-white mb-1">{profile.name}, {profile.age}</h2>
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-6"><MapPin size={16} className="text-cuadralo-pink" /> {profile.location}</div>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Sobre mí</h3>
                            <p className="text-gray-300 text-sm leading-relaxed">{profile.bio}</p>
                        </div>

                        {profile.interests && profile.interests.length > 0 && (
                            <div>
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Intereses</h3>
                                <div className="flex flex-wrap gap-2">
                                    {profile.interests.map(id => (
                                        <div key={id} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-gray-300">
                                            {INTEREST_ICONS[id] || <Star size={14} />}
                                            <span>{INTEREST_LABELS[id] || id}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}