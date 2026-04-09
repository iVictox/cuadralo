"use client";
import { useEffect, useState } from "react";
import { api } from "@/utils/api";
import { MessageCircle, Trash2, ShieldAlert } from "lucide-react";

export default function AdminConversations() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchConvs = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/admin/moderation/conversations`);
      setConversations(data.conversations || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchConvs(); }, []);

  const handleDelete = async (u1, u2) => {
    if (!confirm("⚠️ ¿Estás seguro de eliminar TODOS los mensajes entre estos dos usuarios de forma permanente?")) return;
    try {
      await api.delete(`/admin/moderation/conversations?u1=${u1}&u2=${u2}`);
      fetchConvs();
    } catch (error) {
      alert("Error al eliminar la conversación.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
              <MessageCircle className="text-purple-500" /> Conversaciones Activas
          </h1>
          <p className="text-gray-400 mt-1">Visualiza los chats activos. (Agrupados por remitente y destinatario).</p>
        </div>
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-gray-950 text-gray-400 font-bold border-b border-gray-800 uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Usuario A</th>
              <th className="px-6 py-4">Usuario B</th>
              <th className="px-6 py-4 w-1/2">Último Mensaje Detectado</th>
              <th className="px-6 py-4 text-right">Moderación</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {loading ? <tr><td colSpan="4" className="text-center py-10 font-medium animate-pulse text-purple-400">Escaneando chats...</td></tr> : conversations.length === 0 ? <tr><td colSpan="4" className="text-center py-10 text-gray-500">No hay conversaciones activas.</td></tr> : conversations.map((conv, idx) => (
              <tr key={idx} className="hover:bg-gray-800/30 transition-colors">
                <td className="px-6 py-4 font-bold text-purple-400">@{conv.user1_name}</td>
                <td className="px-6 py-4 font-bold text-pink-400">@{conv.user2_name}</td>
                <td className="px-6 py-4">
                    <span className="text-gray-300 font-medium">"{conv.last_message || "Mensaje Multimedia"}"</span>
                    <div className="text-[10px] text-gray-500 mt-1 font-mono">{new Date(conv.date).toLocaleString()}</div>
                </td>
                <td className="px-6 py-4 text-right">
                   <button 
                       onClick={() => handleDelete(conv.user1_id, conv.user2_id)} 
                       className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/50 px-3 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2 ml-auto"
                   >
                       <ShieldAlert size={14}/> Purgar Chat
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}