"use client";
import { useEffect, useState } from "react";
import { api } from "@/utils/api";
import { CheckCircle, FileText, MessageCircle, Users, AlertTriangle } from "lucide-react";

export default function AdminResolvedReports() {
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users");

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [postsRes, commentsRes, usersRes] = await Promise.all([
        api.get(`/admin/reports/posts/resolved`).catch(() => ({ reports: [] })),
        api.get(`/admin/reports/comments/resolved`).catch(() => ({ reports: [] })),
        api.get(`/admin/reports/users/resolved`).catch(() => ({ reports: [] }))
      ]);
      setPosts(postsRes.reports || []);
      setComments(commentsRes.reports || []);
      setUsers(usersRes.reports || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const items = activeTab === "posts" ? posts : activeTab === "comments" ? comments : users;
  const icons = { posts: FileText, comments: MessageCircle, users: Users };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
           <CheckCircle className="text-green-500" size={32} /> Historial de Resueltos
        </h1>
        <p className="text-gray-400 mt-1">Registros de acciones tomadas por moderación.</p>
      </div>

      <div className="flex gap-2 border-b border-gray-800 pb-2 overflow-x-auto">
        {["users", "posts", "comments"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-wider transition-colors whitespace-nowrap ${
              activeTab === tab 
                ? "bg-green-500/20 text-green-500 border border-green-500/30" 
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {tab === "users" ? "Usuarios" : tab === "posts" ? "Posts" : "Comentarios"} 
            <span className="ml-2 opacity-60">({tab === "users" ? users.length : tab === "posts" ? posts.length : comments.length})</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-green-500 font-black animate-pulse">Cargando historial...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-gray-500 bg-gray-900 rounded-3xl border border-gray-800">
          No hay registros en esta categoría.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const Icon = icons[activeTab];
            return (
              <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 shrink-0">
                    <Icon size={20} />
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="text-white font-bold truncate">
                      {activeTab === "users" 
                        ? `@${item.reported_user?.username}` 
                        : activeTab === "posts" 
                          ? item.post?.caption?.substring(0, 50) || "Post sin texto"
                          : item.comment?.content?.substring(0, 50) || "Comentario"}
                    </p>
                    <p className="text-gray-500 text-sm truncate">
                      Razón: {item.reason}
                    </p>
                 </div>
                 <div className="text-right shrink-0">
                    <span className={`text-xs font-bold uppercase tracking-widest px-2 py-1 rounded ${
                      item.status === "resolved" 
                        ? "bg-green-500/20 text-green-500" 
                        : "bg-gray-700 text-gray-400"
                    }`}>
                      {item.status}
                    </span>
                    <p className="text-gray-600 text-xs mt-1">
                      {new Date(item.updated_at || item.created_at).toLocaleDateString("es")}
                    </p>
                 </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}