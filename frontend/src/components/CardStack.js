"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { X, Heart, MapPin, Info, RotateCcw, Zap, Crown, User, ChevronLeft, ChevronRight } from "lucide-react"; // ✅ Añadimos User y Chevrons
import Image from "next/image"; 
import { api } from "@/utils/api"; 
import MatchModal from "@/components/MatchModal"; 
import ProfileDetailsModal from "@/components/ProfileDetailsModal";
import PrimeModal from "@/components/PrimeModal"; 
import BoostModal from "@/components/BoostModal"; 
import { getInterestInfo } from "@/utils/interests";

export default function CardStack() {
  const [cards, setCards] = useState([]);
  const [history, setHistory] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  const [selectedProfile, setSelectedProfile] = useState(null); 
  const [matchData, setMatchData] = useState(null); 
  
  const [showPrime, setShowPrime] = useState(false);
  const [showBoost, setShowBoost] = useState(false);

  const [isPrime, setIsPrime] = useState(false); 
  const [myPhoto, setMyPhoto] = useState(null);

  useEffect(() => {
    fetchFeed();
    fetchMyData();
  }, []);

  const fetchMyData = async () => {
      try {
          const status = await api.get("/premium/status");
          setIsPrime(status.is_prime);
          
          const me = await api.get("/me");
          setMyPhoto(me.photo || "https://via.placeholder.com/150");
      } catch (e) {}
  };

  const fetchFeed = async () => {
    try {
      setLoading(true);
      const users = await api.get("/feed");
      
      const formattedCards = users.map(u => ({
          id: u.id,
          name: u.name,
          age: u.age,
          gender: u.gender, // ✅ Capturamos el género
          bio: u.bio || "Sin descripción...",
          interests: typeof u.interests === 'string' ? JSON.parse(u.interests || "[]") : u.interests || [],
          img: u.photo || "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600",
          // ✅ Aseguramos que 'photos' sea un array válido para el carrusel
          photos: Array.isArray(u.photos) ? u.photos.filter(p => p && p.trim() !== "") : [u.photo].filter(p => p && p.trim() !== ""),
          location: "Valencia, Carabobo", 
          is_prime: u.is_prime 
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
            setMatchData(cardToRemove);
        }
    } catch (error) { console.error(error); }
  };

  const handleRewind = () => {
    if (!isPrime) {
        setShowPrime(true);
        return;
    }
    if (history.length === 0) return;
    const lastCard = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1)); 
    setCards(prev => [...prev, lastCard]); 
  };

  if (loading) return (
    <div className="flex h-full w-full items-center justify-center flex-col gap-4">
        <div className="animate-spin h-10 w-10 border-4 border-cuadralo-pink border-t-transparent rounded-full"/>
        <p className="text-cuadralo-textMutedLight dark:text-cuadralo-textMutedDark text-sm font-medium animate-pulse">Buscando perfiles cerca de ti...</p>
    </div>
  );

  return (
    <div className="relative w-full h-[65vh] max-h-[600px] flex justify-center items-center mt-6">
      
      {cards.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center px-6 animate-fade-in absolute inset-0 z-0 bg-transparent">
          <div className="relative w-48 h-48 mb-6 flex items-center justify-center">
              <motion.div animate={{ scale: [1, 1.5, 2], opacity: [0.4, 0.1, 0] }} transition={{ duration: 3, repeat: Infinity }} className="absolute inset-0 bg-cuadralo-pink/30 rounded-full blur-2xl"/>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="relative w-32 h-32 z-10">
                 <Image src="/globe.svg" fill alt="Buscando" className="object-contain opacity-80 dark:invert-0 invert" />
              </motion.div>
          </div>
          <h3 className="text-2xl font-bold text-cuadralo-textLight dark:text-cuadralo-textDark mb-2">No hay nadie más cerca</h3>
          <p className="text-cuadralo-textMutedLight dark:text-cuadralo-textMutedDark text-sm mb-8 max-w-xs mx-auto leading-relaxed">
              Hemos agotado los perfiles en tu área. Usa un Destello para expandir tu alcance.
          </p>
          
          <button 
              onClick={() => setShowBoost(true)}
              className="px-8 py-3.5 bg-cuadralo-textLight dark:bg-white text-cuadralo-bgLight dark:text-black rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_0_20px_rgba(255,255,255,0.3)] animate-pulse"
          >
              <Zap size={20} className="fill-current" />
              Usar Destello
          </button>

          <button onClick={() => window.location.reload()} className="mt-8 text-cuadralo-pink text-sm font-semibold hover:underline transition-all">
              Volver a buscar
          </button>
        </div>
      ) : (
        <>
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

          <div className="absolute -bottom-24 flex items-center gap-6 z-50">
              <button onClick={() => removeCard(cards[cards.length - 1].id, "left")} className="w-16 h-16 bg-white/70 dark:bg-[#1a1a1a]/80 backdrop-blur-xl rounded-full flex items-center justify-center shadow-glass-light dark:shadow-glass-dark border border-gray-200/50 dark:border-white/10 hover:scale-110 hover:bg-white dark:hover:bg-[#2a2a2a] active:scale-95 transition-all group">
                  <X size={32} className="text-red-500 group-hover:text-red-600 dark:group-hover:text-red-400" strokeWidth={2.5} />
              </button>
              
              <button 
                  onClick={handleRewind} 
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-glass-light dark:shadow-glass-dark backdrop-blur-xl border transition-all ${ (history.length === 0 && isPrime) ? 'bg-gray-200/50 dark:bg-gray-800/50 opacity-50 border-transparent cursor-not-allowed' : 'bg-white/70 dark:bg-[#1a1a1a]/80 border-gray-200/50 dark:border-white/10 hover:bg-yellow-50 dark:hover:bg-yellow-500/20 hover:border-yellow-400 cursor-pointer'}`}
              >
                  <RotateCcw size={22} className="text-yellow-500" strokeWidth={2.5} />
              </button>

              <button onClick={() => removeCard(cards[cards.length - 1].id, "right")} className="w-16 h-16 bg-white/70 dark:bg-[#1a1a1a]/80 backdrop-blur-xl rounded-full flex items-center justify-center shadow-glass-light dark:shadow-glass-dark border border-gray-200/50 dark:border-white/10 hover:scale-110 hover:bg-white dark:hover:bg-[#2a2a2a] active:scale-95 transition-all group">
                  <Heart size={32} className="text-cuadralo-pink fill-current group-hover:scale-110 transition-transform" strokeWidth={2} />
              </button>
          </div>
          
          <button 
              onClick={() => setShowBoost(true)}
              className="absolute -top-12 right-2 md:right-4 p-2.5 bg-white/70 dark:bg-white/10 backdrop-blur-xl rounded-full shadow-glass-light dark:shadow-glass-dark border border-gray-200/50 dark:border-white/10 hover:scale-110 transition-all z-40 group"
              title="Ser más visible"
          >
              <Zap size={20} className="text-cuadralo-pink fill-current group-hover:animate-pulse" />
          </button>
        </>
      )}

      <AnimatePresence>
        {selectedProfile && (
            <ProfileDetailsModal profile={selectedProfile} onClose={() => setSelectedProfile(null)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPrime && <PrimeModal onClose={() => setShowPrime(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {showBoost && <BoostModal onClose={() => setShowBoost(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {matchData && (
            <MatchModal 
                key="match-modal-premium"
                myPhoto={myPhoto} 
                matchedUser={matchData} 
                onClose={() => setMatchData(null)} 
            />
        )}
      </AnimatePresence>

    </div>
  );
}

function Card({ data, isFront, onSwipe, onInfo }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

  // ✅ ESTADO MÁGICO: Controla qué foto estamos viendo en la tarjeta
  const [activePhoto, setActivePhoto] = useState(0);

  const nextPhoto = (e) => {
    e.stopPropagation(); // Evitamos que el clic se entienda como 'swipe'
    if (activePhoto < data.photos.length - 1) setActivePhoto(activePhoto + 1);
  };

  const prevPhoto = (e) => {
    e.stopPropagation(); // Evitamos que el clic se entienda como 'swipe'
    if (activePhoto > 0) setActivePhoto(activePhoto - 1);
  };

  return (
    <motion.div
      style={{ x, rotate, opacity, zIndex: isFront ? 20 : 0 }}
      drag={isFront ? "x" : false} dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(e, i) => { if (i.offset.x > 100) onSwipe(data.id, "right"); else if (i.offset.x < -100) onSwipe(data.id, "left"); }}
      className={`absolute w-[92%] md:w-[380px] h-full bg-cuadralo-cardLight dark:bg-cuadralo-cardDark rounded-[2.5rem] overflow-hidden shadow-glass-light dark:shadow-glass-dark border border-gray-200 dark:border-white/10 ${!isFront && 'pointer-events-none'} cursor-grab active:cursor-grabbing`}
    >
      {/* ✅ CARRUSEL DE FOTOS DENTRO DE LA TARJETA */}
      <img src={data.photos[activePhoto]} alt={data.name} className="w-full h-full object-cover pointer-events-none" />
      
      {/* ✅ BARRA DE INDICADORES DE FOTOS (ESTILO HISTORIAS) */}
      {data.photos.length > 1 && (
          <div className="absolute top-4 inset-x-12 flex gap-1 z-20">
              {data.photos.map((_, i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i === activePhoto ? 'bg-white shadow-[0_0_5px_rgba(255,255,255,0.8)]' : 'bg-white/30 backdrop-blur-md'}`} />
              ))}
          </div>
      )}

      {/* ✅ CONTROLES INVISIBLES PARA TOCAR LADOS DE LA FOTO */}
      {data.photos.length > 1 && (
        <div className="absolute inset-0 flex z-10 pt-16">
          <div className="w-1/2 h-full cursor-pointer flex items-center justify-start px-2 opacity-0 hover:opacity-100 transition-opacity" onClick={prevPhoto}>
            {activePhoto > 0 && <div className="bg-black/30 p-2 rounded-full backdrop-blur-md"><ChevronLeft className="text-white" /></div>}
          </div>
          <div className="w-1/2 h-full cursor-pointer flex items-center justify-end px-2 opacity-0 hover:opacity-100 transition-opacity" onClick={nextPhoto}>
            {activePhoto < data.photos.length - 1 && <div className="bg-black/30 p-2 rounded-full backdrop-blur-md"><ChevronRight className="text-white" /></div>}
          </div>
        </div>
      )}

      {/* Botón Info */}
      <button onClick={(e) => { e.stopPropagation(); onInfo(); }} className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center bg-black/30 backdrop-blur-md rounded-full text-white hover:bg-black/50 transition-colors z-20 shadow-sm border border-white/20">
        <Info size={22} />
      </button>

      {/* GRADIENTE INFERIOR Y TEXTO */}
      <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/95 via-black/60 to-transparent pt-32 pb-8 px-6 text-white pointer-events-none">
        
        {/* ✅ BADGE DE GÉNERO */}
        {data.gender && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] uppercase tracking-widest font-bold text-gray-100 shadow-inner w-max mb-3 border border-white/5">
                <User size={12} className="text-cuadralo-pink" />
                <span>{data.gender}</span>
            </div>
        )}

        <h2 className="text-3xl font-extrabold flex items-end gap-2 mb-1 drop-shadow-md">
            {data.name} <span className="text-2xl text-white/90 font-medium">{data.age}</span>
        </h2>
        
        {data.is_prime && (
            <div className="flex items-center gap-1.5 text-yellow-400 mb-2 drop-shadow-sm">
                <Crown size={16} fill="currentColor"/> 
                <span className="text-xs font-bold uppercase tracking-wider">Prime Member</span>
            </div>
        )}
        
        <div className="flex items-center gap-2 text-white/95 text-sm mb-3 drop-shadow-sm font-medium">
            <MapPin size={16} className="text-cuadralo-pink" fill="currentColor" /> {data.location}
        </div>
        
        <p className="text-white/80 text-sm leading-relaxed line-clamp-2 drop-shadow-sm mb-4">
            {data.bio}
        </p>
        
        <div className="flex gap-2 flex-wrap">
            {data.interests.slice(0, 3).map(id => {
                const info = getInterestInfo(id);
                return (
                    <span key={id} className="flex items-center gap-1.5 text-xs px-3.5 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-white border border-white/30 shadow-sm">
                        <span className="text-white drop-shadow-sm">{info.icon}</span>
                        <span className="font-semibold tracking-wide drop-shadow-sm uppercase">{info.name}</span>
                    </span>
                );
            })}
        </div>
      </div>
    </motion.div>
  );
}