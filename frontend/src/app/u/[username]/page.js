"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MoreVertical, MapPin, Grid, Users, UserPlus, UserCheck, MessageCircle, Settings, Loader2 } from "lucide-react";
import { api } from "@/utils/api";
import { useToast } from "@/context/ToastContext";
import BottomNav from "@/components/BottomNav"; // Para mantener la nav
import FeedPost from "@/components/FeedPost"; // Reutilizamos para ver posts en detalle (opcional)

export default function UserProfile() {
  const { username } = useParams();
  const router = useRouter();
  const { showToast } = useToast();

  const [profile, setProfile] = useState(null); // { user, posts }
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const myUser = JSON.parse(localStorage.getItem("user"));
        setCurrentUser(myUser);

        // Llamada al endpoint nuevo
        const data = await api.get(`/u/${decodeURIComponent(username)}`);
        setProfile(data);
        setIsFollowing(data.user.is_following);
      } catch (error) {
        console.error("Error loading profile", error);
        showToast("Usuario no encontrado", "error");
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  const handleFollow = async () => {
    // Optimistic UI
    const previousState = isFollowing;
    setIsFollowing(!isFollowing);
    
    // Ajustar contador visualmente
    setProfile(prev => ({
        ...prev,
        user: {
            ...prev.user,
            followers_count: !previousState ? prev.user.followers_count + 1 : prev.user.followers_count - 1
        }
    }));

    try {
        await api.post(`/users/${profile.user.id}/follow`, {});
    } catch (error) {
        setIsFollowing(previousState); // Revertir
        showToast("Error al seguir", "error");
    }
  };

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-[#0f0518]"><Loader2 className="animate-spin text-cuadralo-pink" size={40} /></div>;
  if (!profile) return null;

  const { user, posts } = profile;
  const isMe = currentUser?.id === user.id;

  return (
    <div className="min-h-screen bg-[#0f0518] pb-24 relative">
      
      {/* HEADER NAVBAR FLOTANTE */}
      <div className="fixed top-0 left-0 w-full z-40 px-4 py-3 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
        <button onClick={() => router.back()} className="p-2 rounded-full bg-black/20 backdrop-blur-md text-white border border-white/10">
            <ArrowLeft size={20} />
        </button>
        <button className="p-2 rounded-full bg-black/20 backdrop-blur-md text-white border border-white/10">
            <MoreVertical size={20} />
        </button>
      </div>

      {/* PORTADA / BACKGROUND BLUR */}
      <div className="relative w-full h-48 bg-[#1a0b2e] overflow-hidden">
        {/* Usamos la misma foto de perfil como portada borrosa, estilo moderno */}
        <img src={user.photo} className="w-full h-full object-cover opacity-50 blur-xl scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0518] via-transparent to-transparent" />
      </div>

      {/* INFO DEL PERFIL */}
      <div className="px-5 -mt-16 relative z-10">
        <div className="flex justify-between items-end">
             {/* AVATAR */}
            <div className="relative">
                <div className={`w-28 h-28 rounded-full p-[3px] bg-[#0f0518] ${user.has_story ? "bg-gradient-to-tr from-yellow-400 via-cuadralo-pink to-purple-600" : ""}`}>
                    <img src={user.photo} className="w-full h-full rounded-full object-cover border-4 border-[#0f0518]" />
                </div>
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div className="flex gap-2 mb-4">
                {isMe ? (
                    <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-white text-xs font-bold hover:bg-white/10 transition-colors flex items-center gap-2">
                        <Settings size={14} /> Editar
                    </button>
                ) : (
                    <>
                        <button 
                            onClick={handleFollow}
                            className={`px-6 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all ${
                                isFollowing 
                                ? "bg-transparent border border-white/20 text-white" 
                                : "bg-gradient-to-r from-cuadralo-pink to-purple-600 text-white shadow-[0_0_15px_rgba(242,19,142,0.4)]"
                            }`}
                        >
                            {isFollowing ? <><UserCheck size={14}/> Siguiendo</> : <><UserPlus size={14}/> Seguir</>}
                        </button>
                        <button className="p-2 bg-white/5 border border-white/10 rounded-full text-white hover:bg-white/10">
                            <MessageCircle size={18} />
                        </button>
                    </>
                )}
            </div>
        </div>

        {/* NOMBRE Y BIO */}
        <div className="mt-4">
            <h1 className="text-2xl font-bold text-white flex items-center gap-1">
                {user.name} 
                <span className="text-sm font-normal text-gray-400 ml-1">@{user.username || "usuario"}</span>
            </h1>
            {user.location && (
                 <div className="flex items-center gap-1 text-gray-400 text-xs mt-1">
                    <MapPin size={12} /> {user.location || "Venezuela"}
                 </div>
            )}
            
            <p className="text-gray-300 text-sm mt-3 leading-relaxed max-w-md">
                {user.bio || "Sin biografía aún."}
            </p>
        </div>

        {/* ESTADÍSTICAS */}
        <div className="flex items-center gap-8 mt-6 border-y border-white/5 py-4">
            <div className="text-center">
                <span className="block text-lg font-bold text-white">{posts.length}</span>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Posts</span>
            </div>
            <div className="text-center cursor-pointer hover:opacity-80">
                <span className="block text-lg font-bold text-white">{user.followers_count}</span>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Seguidores</span>
            </div>
            <div className="text-center cursor-pointer hover:opacity-80">
                <span className="block text-lg font-bold text-white">{user.following_count}</span>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Seguidos</span>
            </div>
        </div>

        {/* GRID DE POSTS */}
        <div className="mt-6">
            <div className="flex items-center gap-2 mb-4">
                <Grid size={18} className="text-cuadralo-pink" />
                <h3 className="text-sm font-bold text-white">Publicaciones</h3>
            </div>

            {posts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                    <Grid size={40} strokeWidth={1} className="mb-2 opacity-50" />
                    <p className="text-sm">Aún no hay publicaciones</p>
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-1">
                    {posts.map(post => (
                        <div key={post.id} className="relative aspect-square bg-[#1a0b2e] overflow-hidden cursor-pointer group">
                            <img src={post.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-white font-bold text-sm">
                                <HeartFilled /> {post.likes_count}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>

      {/* Navegación Inferior (Reutilizada) */}
      <BottomNav activeTab="profile" />
    </div>
  );
}

// Icono auxiliar
const HeartFilled = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
    </svg>
);