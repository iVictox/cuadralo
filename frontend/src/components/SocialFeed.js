"use client";

import { Camera, Bell } from "lucide-react";
import StoriesBar from "./StoriesBar";
import FeedPost from "./FeedPost";

export default function SocialFeed() {
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
    <div className="w-full h-full flex flex-col pt-4 pb-24 overflow-y-auto">
      {/* Header del Feed */}
      <div className="flex justify-between items-center px-6 mb-2">
        <h1 className="text-2xl font-bold font-serif italic tracking-wide">Cuadralo Social</h1>
        <div className="flex gap-4">
            <button className="relative">
                <Bell size={24} />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <button>
                <Camera size={24} />
            </button>
        </div>
      </div>

      {/* Historias */}
      <StoriesBar />

      <div className="w-full h-[1px] bg-white/10 my-2" />

      {/* Posts */}
      <div className="flex flex-col gap-2">
        {posts.map(post => <FeedPost key={post.id} post={post} />)}
      </div>

      {/* Botón Flotante para Subir (Opcional) */}
      <button className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-r from-cuadralo-pink to-cuadralo-purple rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30 hover:scale-110 transition-transform z-40">
        <Camera size={28} className="text-white" />
      </button>
    </div>
  );
}