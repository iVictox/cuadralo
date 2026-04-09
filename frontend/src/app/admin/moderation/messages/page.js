"use client";
import { useEffect, useState, useCallback } from "react";
import { api } from "@/utils/api";
import { Search, Trash2, MessageSquare, AlertCircle } from "lucide-react";
import { useDebounce } from 'use-debounce';

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get(`/admin/moderation/messages?search=${debouncedSearch}`);
      setMessages(data.messages || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este mensaje permanentemente?")) return;
    try {
      await api.delete(`/admin/moderation/messages/${id}`);
      fetchMessages();
    } catch (error) {
      alert("Error al eliminar.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3"><MessageSquare className="text-purple-500" /> Auditoría de Mensajes</h1>
          <p className="text-gray-400 mt-1">Supervisa las conversaciones privadas entre usuarios.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input type="text" placeholder="Buscar palabras clave..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-sm text-white focus:border-purple-500 outline-none" />
        </div>
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-gray-950 text-gray-400 font-bold border-b border-gray-800 uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Remitente</th>
              <th className="px-6 py-4">Destinatario</th>
              <th className="px-6 py-4 w-1/2">Contenido del Mensaje</th>
              <th className="px-6 py-4 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {loading ? <tr><td colSpan="4" className="text-center py-10">Cargando...</td></tr> : messages.map((msg) => (
              <tr key={msg.id} className="hover:bg-gray-800/30">
                <td className="px-6 py-4 font-bold text-purple-400">@{msg.sender?.username}</td>
                <td className="px-6 py-4 font-bold text-pink-400">@{msg.receiver?.username}</td>
                <td className="px-6 py-4">
                    {msg.image_url && <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded mr-2 border border-blue-500/30">[IMAGEN]</span>}
                    {msg.content}
                    <div className="text-[10px] text-gray-500 mt-1">{new Date(msg.created_at).toLocaleString()}</div>
                </td>
                <td className="px-6 py-4 text-right">
                   <button onClick={() => handleDelete(msg.id)} className="text-red-400 hover:text-red-300 p-2"><Trash2 size={18}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}