"use client";

import { useState, useRef } from "react";
import { Plus } from "lucide-react";

export default function StoriesBar() {
  const stories = [
    { id: 1, name: "Tu Historia", img: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150", isMe: true },
    { id: 2, name: "Valeria", img: "https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=150", seen: false },
    { id: 3, name: "Andrea", img: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150", seen: false },
    { id: 4, name: "Sofia", img: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150", seen: true },
    { id: 5, name: "Carlos", img: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150", seen: false },
    { id: 6, name: "Luisa", img: "https://images.pexels.com/photos/1310522/pexels-photo-1310522.jpeg?auto=compress&cs=tinysrgb&w=150", seen: false },
  ];

  const sliderRef = useRef(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e) => {
    setIsDown(true);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDown(false);
  };

  const handleMouseUp = () => {
    setIsDown(false);
  };

  const handleMouseMove = (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    // CAMBIO 1: Velocidad natural (1 en vez de 2) para que el movimiento sea exacto al del mouse
    const walk = (x - startX) * 1; 
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div 
      ref={sliderRef}
      // CAMBIO 2: Lógica condicional en el className.
      // Si 'isDown' es true (estás arrastrando), quitamos 'snap-x' y 'snap-mandatory'.
      // Esto permite que el movimiento sea libre y suave, sin "peleas".
      // Al soltar (isDown false), el snap vuelve y acomoda la historia automáticamente.
      className={`w-full flex gap-4 px-4 overflow-x-auto overflow-y-hidden pb-4 pt-2 no-scrollbar scroll-pl-4 
        ${isDown ? 'cursor-grabbing' : 'cursor-grab snap-x snap-mandatory'}`}
      
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
    >
      {stories.map((story) => (
        <div 
          key={story.id} 
          className="flex flex-col items-center min-w-[70px] cursor-pointer group snap-start select-none"
        >
          <div className="relative">
            <div 
              className={`w-[74px] h-[74px] rounded-full flex items-center justify-center 
              ${story.isMe ? "bg-transparent" : story.seen ? "bg-gray-600" : "bg-gradient-to-tr from-yellow-400 via-cuadralo-pink to-cuadralo-purple animate-spin-slow"}`}
            >
              <div className="w-[68px] h-[68px] rounded-full bg-black border-2 border-black overflow-hidden relative pointer-events-none">
                  <img src={story.img} alt={story.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  
                  {story.isMe && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Plus className="text-white drop-shadow-lg" size={24} />
                      </div>
                  )}
              </div>
            </div>
            
            {story.isMe && (
              <div className="absolute bottom-0 right-0 bg-cuadralo-pink rounded-full p-1 border-2 border-black">
                 <Plus size={12} className="text-white" />
              </div>
            )}
          </div>
          <span className="text-xs text-white mt-2 font-medium truncate w-16 text-center pointer-events-none">
              {story.name}
          </span>
        </div>
      ))}
    </div>
  );
}