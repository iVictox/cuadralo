"use client";

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

  return (
    <div className="w-full overflow-x-auto pb-4 pt-2 scrollbar-hide">
      <div className="flex gap-4 px-4">
        {stories.map((story) => (
          <div key={story.id} className="flex flex-col items-center min-w-[70px] cursor-pointer group">
            <div className="relative">
              {/* Borde Gradiente (Si no es 'tu historia' y no ha sido vista) */}
              <div 
                className={`w-[74px] h-[74px] rounded-full flex items-center justify-center 
                ${story.isMe ? "bg-transparent" : story.seen ? "bg-gray-600" : "bg-gradient-to-tr from-yellow-400 via-cuadralo-pink to-cuadralo-purple animate-spin-slow"}`}
              >
                <div className="w-[68px] h-[68px] rounded-full bg-black border-2 border-black overflow-hidden relative">
                    <img src={story.img} alt={story.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    
                    {/* Botón "+" para mi historia */}
                    {story.isMe && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <Plus className="text-white drop-shadow-lg" size={24} />
                        </div>
                    )}
                </div>
              </div>
              
              {/* Plus icon flotante para 'Tu Historia' */}
              {story.isMe && (
                <div className="absolute bottom-0 right-0 bg-cuadralo-pink rounded-full p-1 border-2 border-black">
                   <Plus size={12} className="text-white" />
                </div>
              )}
            </div>
            <span className="text-xs text-white mt-2 font-medium truncate w-16 text-center">
                {story.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}