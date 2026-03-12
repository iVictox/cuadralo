"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { api } from "@/utils/api";
import FeedPost from "@/components/FeedPost";

// Importamos tus menús originales
import BottomNav from "@/components/BottomNav";
import Navbar from "@/components/Navbar";

export default function SinglePostPage() {
    const params = useParams();
    const router = useRouter();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const data = await api.get(`/social/posts/${params.id}`);
                setPost(data);
            } catch (error) {
                console.error("Error cargando el post:", error);
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchPost();
        }
    }, [params.id]);

    // Función que simula el cambio de pestaña enviando al usuario al Home con el tab seleccionado
    const handleTabChange = (tab) => {
        router.push(`/?tab=${tab}`);
    };

    return (
        <div className="min-h-screen w-full bg-cuadralo-bgLight dark:bg-cuadralo-bgDark text-cuadralo-textLight dark:text-cuadralo-textDark transition-colors duration-300 relative flex flex-col md:pl-20">
            
            {/* ✅ NAVBAR LATERAL (Escritorio) - Usando tu Navbar original */}
            <div className="hidden md:block">
                <Navbar onFilterClick={null} />
            </div>

            {/* ✅ ÁREA DE CONTENIDO */}
            <div className="flex-1 w-full h-full relative pt-0 pb-20 md:pb-0">
                
                {/* HEADER SUPERIOR (Con botón de retroceso) */}
                <div className="sticky top-0 z-40 bg-white/90 dark:bg-[#0f0518]/90 backdrop-blur-xl border-b border-black/5 dark:border-white/5 h-16 flex items-center px-4">
                    <div className="w-full max-w-[600px] mx-auto flex items-center gap-4">
                        <button 
                            onClick={() => router.back()} 
                            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <h1 className="text-lg font-black tracking-tight">Publicación</h1>
                    </div>
                </div>

                {/* CONTENIDO DEL POST */}
                <div className="max-w-[600px] mx-auto px-4 pt-6">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="animate-spin text-cuadralo-pink" size={40} />
                        </div>
                    ) : post ? (
                        // Reutilizamos tu componente FeedPost
                        <FeedPost 
                            post={post} 
                            onDelete={() => router.push("/")} 
                            onViewStory={() => {}} 
                        />
                    ) : (
                        <div className="text-center py-20">
                            <div className="w-16 h-16 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
                                <span className="text-2xl font-black">?</span>
                            </div>
                            <p className="text-gray-500 font-bold">Publicación no encontrada</p>
                            <p className="text-sm text-gray-400 mt-1">Es posible que haya sido eliminada.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ✅ MENÚ INFERIOR (Móviles) - Usando tu BottomNav original */}
            <BottomNav 
                activeTab={null} // No marcamos ninguno como activo porque estamos en una vista interna
                onTabChange={handleTabChange} 
                chatBadge={0} // Opcional: podrías pasar el estado global aquí si lo extraes al Layout
            />

        </div>
    );
}