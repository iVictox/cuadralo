"use client";
import { useEffect, useState } from "react";
import { api } from "@/utils/api";
import { Image as ImageIcon, Trash2 } from "lucide-react";

export default function AdminMedia() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/admin/moderation/media`);
      setPosts(data.media || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMedia(); }, []);

  const handleDeletePost = async (id) => {
    if (!confirm("Esto eliminará la foto y el post completo. ¿Continuar?")) return;
    try {
      await api.delete(`/admin/moderation/posts/${id}`);
      fetchMedia();
    } catch (error) {
      alert("Error al eliminar.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white flex items-center gap-3"><ImageIcon className="text-purple-500" /> Galería de Media Global</h1>
        <p className="text-gray-400 mt-1">Supervisa todas las imágenes públicas subidas por los usuarios al feed.</p>
      </div>

      {loading ? <div className="text-center py-10 text-white">Cargando imágenes...</div> : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {posts.flatMap(post => 
             post.images?.map((imgUrl, idx) => (
                <div key={`${post.id}-${idx}`} className="aspect-square bg-gray-900 border border-gray-800 rounded-xl overflow-hidden relative group">
                    <img src={imgUrl} alt="User Upload" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4">
                        <span className="text-xs font-bold text-white mb-2">@{post.user?.username}</span>
                        <button onClick={() => handleDeletePost(post.id)} className="bg-red-600 text-white p-2 rounded-full shadow-lg hover:bg-red-500"><Trash2 size={16}/></button>
                    </div>
                </div>
             ))
          )}
        </div>
      )}
    </div>
  );
}