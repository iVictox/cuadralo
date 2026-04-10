"use client";
import { useEffect, useState } from "react";
import { api } from "@/utils/api";
import { AlertTriangle, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function AdminFlagged() {
  const [data, setData] = useState({ posts: [], comments: [] });
  const [loading, setLoading] = useState(true);

  const fetchFlagged = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/moderation/flagged`);
      setData(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFlagged(); }, []);

  const deleteItem = async (type, id) => {
      if (!confirm(`¿Eliminar este ${type}?`)) return;
      await api.delete(`/admin/moderation/${type}s/${id}`);
      fetchFlagged();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-red-500 flex items-center gap-3"><AlertTriangle /> Contenido Marcado Automáticamente</h1>
        <p className="text-gray-400 mt-1">El sistema ha detectado lenguaje ofensivo en el siguiente contenido.</p>
      </div>

      {loading ? <div className="text-white font-medium animate-pulse text-red-500">Escaneando base de datos...</div> : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              <div className="bg-gray-900 rounded-2xl border border-red-900/30 p-6 shadow-2xl">
                  <h2 className="text-lg font-bold text-white mb-4 border-b border-gray-800 pb-2">Posts Detectados</h2>
                  <div className="space-y-4">
                      {data.posts?.length === 0 ? <p className="text-gray-500 text-sm">Limpio.</p> : data.posts.map(post => (
                          <div key={post.id} className="bg-gray-950 p-5 rounded-xl border border-gray-800 shadow-inner">
                              <p className="text-sm font-bold text-gray-400">@{post.user?.username}</p>
                              <p className="text-white my-3 text-base">{post.caption || post.content}</p>
                              
                              <div className="flex gap-4 mt-4 pt-4 border-t border-gray-800/60">
                                  <Link 
                                      href={`/post/${post.id}`} 
                                      target="_blank" 
                                      className="text-blue-400 text-xs font-bold uppercase tracking-widest hover:text-blue-300 flex items-center gap-1.5 transition-colors"
                                  >
                                      <ExternalLink size={14}/> Ver Contexto
                                  </Link>
                                  <button 
                                      onClick={() => deleteItem('post', post.id)} 
                                      className="text-red-500 text-xs font-bold uppercase tracking-widest hover:text-red-400 flex items-center gap-1.5 transition-colors"
                                  >
                                      <Trash2 size={14}/> Eliminar Post
                                  </button>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>

              <div className="bg-gray-900 rounded-2xl border border-red-900/30 p-6 shadow-2xl">
                  <h2 className="text-lg font-bold text-white mb-4 border-b border-gray-800 pb-2">Comentarios Detectados</h2>
                  <div className="space-y-4">
                      {data.comments?.length === 0 ? <p className="text-gray-500 text-sm">Limpio.</p> : data.comments.map(c => (
                          <div key={c.id} className="bg-gray-950 p-5 rounded-xl border border-gray-800 shadow-inner">
                              <p className="text-sm font-bold text-gray-400">@{c.user?.username}</p>
                              <p className="text-white my-3 text-base">{c.content}</p>
                              
                              <div className="flex gap-4 mt-4 pt-4 border-t border-gray-800/60">
                                  <Link 
                                      href={`/post/${c.post_id}`} 
                                      target="_blank" 
                                      className="text-blue-400 text-xs font-bold uppercase tracking-widest hover:text-blue-300 flex items-center gap-1.5 transition-colors"
                                  >
                                      <ExternalLink size={14}/> Ver Post Original
                                  </Link>
                                  <button 
                                      onClick={() => deleteItem('comment', c.id)} 
                                      className="text-red-500 text-xs font-bold uppercase tracking-widest hover:text-red-400 flex items-center gap-1.5 transition-colors"
                                  >
                                      <Trash2 size={14}/> Eliminar Comentario
                                  </button>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>

          </div>
      )}
    </div>
  );
}