"use client";
import { useEffect, useState, useCallback } from "react";
import { api } from "@/utils/api";
import { Search, Trash2, MessageCircle } from "lucide-react";
import { useDebounce } from 'use-debounce';

export default function AdminComments() {
  const [comments, setComments] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get(`/admin/moderation/comments?search=${debouncedSearch}`);
      setComments(data.comments || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este comentario?")) return;
    try {
      await api.delete(`/admin/moderation/comments/${id}`);
      fetchComments();
    } catch (error) {
      alert("Error al eliminar.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3"><MessageCircle className="text-purple-500" /> Moderación de Comentarios</h1>
          <p className="text-gray-400 mt-1">Controla lo que los usuarios comentan en los posts.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input type="text" placeholder="Buscar insultos, palabras..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-sm text-white focus:border-purple-500 outline-none" />
        </div>
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-gray-950 text-gray-400 font-bold border-b border-gray-800 uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Autor</th>
              <th className="px-6 py-4 w-1/2">Comentario</th>
              <th className="px-6 py-4">ID Post Destino</th>
              <th className="px-6 py-4 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {loading ? <tr><td colSpan="4" className="text-center py-10">Cargando...</td></tr> : comments.map((c) => (
              <tr key={c.id} className="hover:bg-gray-800/30">
                <td className="px-6 py-4 font-bold text-white">@{c.user?.username}</td>
                <td className="px-6 py-4 font-medium">{c.content}</td>
                <td className="px-6 py-4 font-mono text-xs text-gray-500">Post #{c.post_id}</td>
                <td className="px-6 py-4 text-right">
                   <button onClick={() => handleDelete(c.id)} className="text-red-400 hover:bg-red-500/20 px-3 py-1.5 rounded-lg border border-red-900/50 font-bold text-xs uppercase tracking-widest">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}