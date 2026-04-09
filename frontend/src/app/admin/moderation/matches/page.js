"use client";
import { useEffect, useState, useCallback } from "react";
import { api } from "@/utils/api";
import { Heart, HeartCrack, User } from "lucide-react";

export default function AdminMatches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get(`/admin/moderation/matches`);
      setMatches(data.matches || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMatches(); }, [fetchMatches]);

  const handleDelete = async (id) => {
    if (!confirm("⚠️ ¿Estás seguro de deshacer este Match? Ambos usuarios dejarán de estar conectados y su chat desaparecerá.")) return;
    try {
      await api.delete(`/admin/moderation/matches/${id}`);
      fetchMatches();
    } catch (error) {
      alert("Error al deshacer el match.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
              <Heart className="text-pink-500 fill-pink-500/20" /> Conexiones (Matches)
          </h1>
          <p className="text-gray-400 mt-1">Supervisa y audita las parejas formadas dentro de la app.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? <div className="col-span-3 text-center py-10 font-medium animate-pulse text-pink-400">Analizando conexiones...</div> : matches.length === 0 ? <div className="col-span-3 text-center py-10 text-gray-500">Aún no hay conexiones.</div> : matches.map((m) => (
            <div key={m.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl flex flex-col relative overflow-hidden group">
                
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-950 p-2 rounded-full border border-gray-800 z-10 shadow-lg">
                    <Heart size={20} className="text-pink-500 fill-pink-500/50" />
                </div>

                <div className="flex justify-between items-center relative z-0">
                    {/* Usuario 1 */}
                    <div className="flex flex-col items-center w-1/2 pr-2">
                        <div className="w-16 h-16 rounded-full bg-gray-800 border-2 border-gray-700 overflow-hidden mb-2">
                            {m.user1?.photo ? <img src={m.user1.photo} className="w-full h-full object-cover" alt="U1"/> : <User size={24} className="m-auto h-full text-gray-500" />}
                        </div>
                        <span className="font-bold text-white text-sm text-center truncate w-full">{m.user1?.name}</span>
                        <span className="text-xs text-gray-500">@{m.user1?.username}</span>
                    </div>

                    {/* Usuario 2 */}
                    <div className="flex flex-col items-center w-1/2 pl-2">
                        <div className="w-16 h-16 rounded-full bg-gray-800 border-2 border-gray-700 overflow-hidden mb-2">
                            {m.user2?.photo ? <img src={m.user2.photo} className="w-full h-full object-cover" alt="U2"/> : <User size={24} className="m-auto h-full text-gray-500" />}
                        </div>
                        <span className="font-bold text-white text-sm text-center truncate w-full">{m.user2?.name}</span>
                        <span className="text-xs text-gray-500">@{m.user2?.username}</span>
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-800 flex justify-between items-center">
                    <span className="text-[10px] font-mono text-gray-500">{new Date(m.created_at).toLocaleDateString('es-VE')}</span>
                    <button 
                        onClick={() => handleDelete(m.id)}
                        className="bg-gray-800 hover:bg-red-500/10 text-gray-400 hover:text-red-400 p-2 rounded-lg transition-colors border border-transparent hover:border-red-500/20 flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
                    >
                        <HeartCrack size={14} /> Separar
                    </button>
                </div>
            </div>
          ))}
      </div>
    </div>
  );
}