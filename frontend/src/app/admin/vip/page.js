"use client";
import { useEffect, useState } from "react";
import { api } from "@/utils/api";
import { Search, Crown, Clock, XCircle } from "lucide-react";

export default function AdminVIP() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVIPs();
  }, []);

  const fetchVIPs = async () => {
    try {
      const data = await api.get("/admin/users");
      setUsers(data.filter(u => u.is_prime));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (id) => {
    if (!confirm("¿Seguro que deseas revocar el VIP de este usuario?")) return;
    try {
      await api.put(`/admin/users/${id}/vip/revoke`);
      fetchVIPs();
    } catch (error) {
      console.error(error);
    }
  };

  const handleExtend = async (id) => {
    const days = prompt("¿Cuántos días extra deseas añadir al VIP?");
    if (!days || isNaN(days)) return;
    try {
      await api.put(`/admin/users/${id}/vip/extend`, { days: parseInt(days) });
      fetchVIPs();
    } catch (error) {
      console.error(error);
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Crown className="text-yellow-500" />
          Gestión de Usuarios VIP
        </h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar VIP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-yellow-500 w-64"
          />
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-900/50 text-gray-400">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="3" className="text-center py-8">Cargando VIPs...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan="3" className="text-center py-8">No hay usuarios VIP.</td></tr>
              ) : filteredUsers.map((user) => (
                <tr key={user.id} className="border-t border-gray-700 hover:bg-gray-700/50">
                  <td className="px-4 py-3">{user.id}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{user.name}</div>
                    <div className="text-xs text-gray-500">@{user.username}</div>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => handleExtend(user.id)}
                      className="text-gray-400 hover:text-green-400 p-1" title="Extender VIP">
                      <Clock size={18} />
                    </button>
                    <button
                      onClick={() => handleRevoke(user.id)}
                      className="text-gray-400 hover:text-red-400 p-1" title="Revocar VIP">
                      <XCircle size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
