import Image from "next/image";
import { SlidersHorizontal, Search } from "lucide-react";

// Recibimos la función onFilterClick como prop
export default function Navbar({ onFilterClick, onSearchClick }) {
  return (
    <div className="fixed top-0 left-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-gradient-to-b from-cuadralo-dark/90 to-transparent pointer-events-none">
      
      {/* Logo (pointer-events-auto para que sea clickeable si quieres ir al home) */}
      <div className="relative h-12 w-40 pointer-events-auto">
        <Image 
          src="/logo.svg" 
          alt="Logo Cuadralo" 
          fill
          className="object-contain object-left"
          priority
        />
      </div>

      {/* Botones de Acción (pointer-events-auto activado) */}
      <div className="flex gap-3 pointer-events-auto">
        <button 
            onClick={onSearchClick}
            className="p-3 rounded-full bg-white/5 text-white backdrop-blur-md border border-white/10 hover:bg-cuadralo-purple hover:scale-105 transition-all shadow-lg"
        >
          <Search size={20} />
        </button>
        
        {/* Este botón ahora abre el modal */}
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