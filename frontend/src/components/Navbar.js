import Image from "next/image";
import { SlidersHorizontal } from "lucide-react";

// Este Navbar es exclusivo para la vista de SWIPE
export default function Navbar({ onFilterClick }) {
  return (
    <div className="fixed top-0 left-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-gradient-to-b from-cuadralo-dark/90 to-transparent pointer-events-none">
      
      {/* Logo */}
      <div className="relative h-12 w-32 pointer-events-auto">
        <Image 
          src="/logo.svg" 
          alt="Logo Cuadralo" 
          fill
          className="object-contain object-left"
          priority
        />
      </div>

      {/* Solo botón de Filtros (Sin búsqueda) */}
      <div className="flex gap-3 pointer-events-auto">
        <button 
            onClick={onFilterClick}
            className="p-3 rounded-full bg-white/5 text-white backdrop-blur-md border border-white/10 hover:bg-cuadralo-pink hover:scale-105 transition-all shadow-lg"
        >
          <SlidersHorizontal size={20} />
        </button>
      </div>
    </div>
  );
}