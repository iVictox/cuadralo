"use client";
import { useEffect, useState, useCallback } from "react";
import { api } from "@/utils/api";
import { Search, Trash2, FileText, Image as ImageIcon } from "lucide-react";
import { useDebounce } from 'use-debounce';

export default function AdminPosts() {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get(`/admin/moderation/posts?search=${debouncedSearch}`);
      setPosts(data.posts || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este post y todos sus comentarios?")) return;
    try {
      await api.delete(`/admin/moderation/posts/${id}`);
      fetchPosts();
    } catch (error) {
      alert("Error al eliminar.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3"><FileText className="text-purple-500" /> Moderación de Posts</h1>
          <p className="text-gray-400 mt-1">Revisa las publicaciones públicas del feed.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input type="text" placeholder="Buscar texto del post..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-sm text-white focus:border-purple-500 outline-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? <div className="col-span-3 text-center py-10">Cargando...</div> : posts.map((post) => (
          <div key={post.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-lg flex flex-col">
            <div className="flex justify-between items-start mb-3">
               <div className="font-bold text-white text-sm">@{post.user?.username}</div>
               <button onClick={() => handleDelete(post.id)} className="text-red-400 hover:bg-red-500/20 p-1.5 rounded-lg"><Trash2 size={16}/></button>
            </div>
            <p className="text-gray-300 text-sm mb-4 flex-1">{post.content}</p>
            {post.images && post.images.length > 0 && (
                <div className="h-32 w-full bg-gray-800 rounded-xl mb-4 overflow-hidden border border-gray-700 relative">
                    <img src={post.images[0]} alt="Post" className="w-full h-full object-cover opacity-80" />
                    <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs text-white flex items-center gap-1"><ImageIcon size={12}/> {post.images.length}</div>
                </div>
            )}
            <div className="text-[10px] text-gray-500 uppercase tracking-widest border-t border-gray-800 pt-3 flex justify-between">
                <span>{post.likes_count} Likes</span>
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}