"use client";

import Image from "next/image";
import { Plus, Bell, Search } from "lucide-react"; // Usamos Plus en lugar de Camera
import StoriesBar from "./StoriesBar";
import FeedPost from "./FeedPost";

// Recibimos onUploadClick en lugar de onCameraClick
export default function SocialFeed({ onSearchClick, onNotificationClick, onUploadClick }) {
  
  const posts = [
    {
        id: 1,
        userName: "Valeria",
        userImg: "https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=150",
        postImg: "https://images.pexels.com/photos/3225528/pexels-photo-3225528.jpeg?auto=compress&cs=tinysrgb&w=800",
        location: "Valencia, Carabobo",
        caption: "Domingo de relax ✨🌴 #lifestyle",
        likes: 124,
        time: "2 HORAS"
    },
    {
        id: 2,
        userName: "Andrea",
        userImg: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150",
        postImg: "https://images.pexels.com/photos/4969838/pexels-photo-4969838.jpeg?auto=compress&cs=tinysrgb&w=800",
        location: "Gimnasio SmartFit",
        caption: "No pain no gain 💪🔥",
        likes: 89,
        time: "5 HORAS"
    }
  ];

  return (
    <div className="w-full h-full flex flex-col pt-24 pb-24 overflow-y-auto no-scrollbar relative">
      
      {/* Header Fijo */}
      <div className="fixed top-0 left-0 w-full z-40 px-6 py-4 flex justify-between items-center bg-gradient-to-b from-cuadralo-dark/90 to-transparent">
          
          {/* Logo */}
          <div className="relative h-12 w-40">
            <Image 
              src="/logo.svg" 
              alt="Logo Cuadralo" 
              fill
              className="object-contain object-left"
              priority
            />
          </div>

          {/* Botones Header */}
          <div className="flex gap-3">
            <button 
                onClick={onSearchClick}
                className="p-3 rounded-full bg-white/5 text-white backdrop-blur-md border border-white/10 hover:bg-cuadralo-purple hover:scale-105 transition-all shadow-lg"
            >
              <Search size={20} />
            </button>
            
            <button 
                onClick={onNotificationClick}
                className="relative p-3 rounded-full bg-white/5 text-white backdrop-blur-md border border-white/10 hover:bg-cuadralo-pink hover:scale-105 transition-all shadow-lg"
            >
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </button>
          </div>
      </div>

      <StoriesBar />

      <div className="w-full h-[1px] bg-white/10 my-2" />

      <div className="flex flex-col gap-2">
        {posts.map(post => <FeedPost key={post.id} post={post} />)}
      </div>

      {/* BOTÓN FLOTANTE "NUEVO POST" (+) */}
      <button 
        onClick={onUploadClick} // Abre el nuevo modal
        className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-r from-cuadralo-pink to-cuadralo-purple rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30 hover:scale-110 transition-transform z-40"
      >
        <Plus size={32} className="text-white" />
      </button>
    </div>
  );
}