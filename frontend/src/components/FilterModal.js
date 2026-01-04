"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Check } from "lucide-react";

export default function FilterModal({ onClose }) {
  // Estados locales para los filtros (luego se enviarán al backend)
  const [distance, setDistance] = useState(10);
  const [ageRange, setAgeRange] = useState([18, 30]);
  const [gender, setGender] = useState("todos"); // "todos", "hombres", "mujeres"

  return (
    // 1. Fondo Oscuro (Overlay)
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center"
    >
      {/* 2. El Modal en sí */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()} // Evita cerrar si clickeas dentro
        className="w-full max-w-md bg-gray-900 border-t border-white/10 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl relative overflow-hidden"
      >
        {/* Decoración de fondo */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cuadralo-pink opacity-10 blur-[50px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-cuadralo-purple opacity-10 blur-[50px] pointer-events-none" />

        {/* Header del Modal */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-white">Filtros</h2>
          <button 
            onClick={onClose}
            className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* SECCIÓN 1: Interés (Género) */}
        <div className="mb-8">
          <label className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-3 block">
            Me interesan
          </label>
          <div className="grid grid-cols-3 gap-3">
            {["Hombres", "Mujeres", "Todos"].map((option) => {
              const value = option.toLowerCase();
              const isActive = gender === value;
              return (
                <button
                  key={value}
                  onClick={() => setGender(value)}
                  className={`py-3 rounded-xl font-medium text-sm transition-all border ${
                    isActive
                      ? "bg-cuadralo-pink border-cuadralo-pink text-white shadow-[0_0_15px_rgba(242,19,142,0.4)]"
                      : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        {/* SECCIÓN 2: Distancia Máxima */}
        <div className="mb-8">
          <div className="flex justify-between mb-3">
            <label className="text-gray-400 text-sm font-semibold uppercase tracking-wider">
              Distancia máxima
            </label>
            <span className="text-white font-bold">{distance} km</span>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cuadralo-purple hover:accent-cuadralo-pink transition-all"
          />
        </div>

        {/* SECCIÓN 3: Rango de Edad */}
        <div className="mb-10">
          <div className="flex justify-between mb-3">
            <label className="text-gray-400 text-sm font-semibold uppercase tracking-wider">
              Rango de edad
            </label>
            <span className="text-white font-bold">{ageRange[0]} - {ageRange[1]} años</span>
          </div>
          {/* Slider doble simulado (Simple por ahora) */}
          <div className="flex gap-4 items-center">
             <input
                type="number"
                value={ageRange[0]}
                onChange={(e) => setAgeRange([parseInt(e.target.value), ageRange[1]])}
                className="w-20 bg-gray-800 border border-gray-700 rounded-lg p-2 text-center text-white focus:border-cuadralo-pink outline-none"
             />
             <span className="text-gray-500">-</span>
             <input
                type="number"
                value={ageRange[1]}
                onChange={(e) => setAgeRange([ageRange[0], parseInt(e.target.value)])}
                className="w-20 bg-gray-800 border border-gray-700 rounded-lg p-2 text-center text-white focus:border-cuadralo-pink outline-none"
             />
          </div>
        </div>

        {/* Botón Aplicar */}
        <button 
            onClick={onClose}
            className="w-full py-4 bg-gradient-to-r from-cuadralo-purple to-cuadralo-pink rounded-xl font-bold text-white shadow-lg text-lg flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-transform"
        >
            Aplicar Filtros <Check size={20} />
        </button>

      </motion.div>
    </motion.div>
  );
}