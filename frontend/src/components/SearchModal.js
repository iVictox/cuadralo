"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, ChevronRight, User } from "lucide-react";

export default function SearchModal({ onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  
  // Datos simulados (mock)
  const mockUsers = [
    { id: 1, name: "Valeria", bio: "Amante del sushi 🍣", image: "https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=200" },
    { id: 2, name: "Valentina", bio: "Gym rat 🏋️‍♀️", image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200" },
    { id: 3, name: "Vanessa", bio: "Ingeniera 👷‍♀️", image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200" },
    { id: 4, name: "Carlos", bio: "Gamer 🎮", image: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200" },
  ];

  // Buscador en tiempo real simulado
  useEffect(() => {
    if (query.length > 1) {
      const filtered = mockUsers.filter(user => 
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.bio.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
    } else {
      setResults([]);
    }
  }, [query]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed inset-0 z-[60] bg-cuadralo-dark/95 backdrop-blur-xl flex flex-col"
    >
      {/* 1. Barra Superior */}
      <div className="flex items-center gap-3 p-4 border-b border-white/10">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            autoFocus
            type="text" 
            placeholder="Buscar personas o intereses..." 
            className="w-full bg-gray-800/50 border border-gray-700 rounded-full py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-cuadralo-pink transition-colors"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button 
          onClick={onClose}
          className="p-3 text-white font-medium hover:text-cuadralo-pink transition-colors"
        >
          Cancelar
        </button>
      </div>

      {/* 2. Contenido Dinámico */}
      <div className="flex-1 overflow-y-auto p-4">
        
        {/* Caso A: No ha escrito nada -> Mostrar Sugerencias */}
        {query === "" && (
          <div className="animate-fade-in">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4">Tendencias</h3>
            <div className="flex flex-wrap gap-2 mb-8">
              {["Anime 🍥", "Gym 💪", "Playa 🏖️", "Cine 🍿", "Café ☕", "Música 🎵"].map(tag => (
                <button 
                  key={tag}
                  onClick={() => setQuery(tag.split(" ")[0])}
                  className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-cuadralo-purple hover:text-white transition-all"
                >
                  {tag}
                </button>
              ))}
            </div>

            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4">Recientes</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-300 hover:text-white cursor-pointer group">
                <div className="p-2 bg-gray-800 rounded-full group-hover:bg-gray-700"><User size={16}/></div>
                <span>Valeria</span>
                <ChevronRight className="ml-auto opacity-50" size={16} />
              </div>
            </div>
          </div>
        )}

        {/* Caso B: Resultados de Búsqueda */}
        {results.length > 0 && (
          <div className="space-y-4">
            {results.map(user => (
              <motion.div 
                key={user.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-transparent hover:border-cuadralo-pink/30"
              >
                <img src={user.image} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <h4 className="font-bold text-white">{user.name}</h4>
                  <p className="text-sm text-gray-400">{user.bio}</p>
                </div>
                <button className="ml-auto px-3 py-1 text-xs font-bold text-cuadralo-pink bg-cuadralo-pink/10 rounded-full">
                  Ver Perfil
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Caso C: Sin resultados */}
        {query.length > 1 && results.length === 0 && (
          <div className="text-center text-gray-500 mt-20">
            <p>No encontramos a nadie con "{query}" 😢</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}