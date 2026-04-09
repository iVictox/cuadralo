"use client";
import { useEffect, useState, useCallback } from "react";
import { api } from "@/utils/api";
import { Search, Trash2, Ban, Eye, CheckCircle2, AlertOctagon } from "lucide-react";
import { useDebounce } from 'use-debounce';
import UserDetailModal from "./UserDetailModal";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Suspension State
  const [suspendModal, setSuspendModal] = useState(null);
  const [suspendDays, setSuspendDays] = useState(7);
  const [suspendReason, setSuspendReason] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get(`/admin/users?page=${page}&limit=${limit}&search=${debouncedSearch}`);
      setUsers(data.users);
      setTotalPages(Math.ceil(data.total / limit));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const executeSuspension = async () => {
    if (!suspendModal) return;
    try {
      await api.put(`/admin/users/${suspendModal.id}/suspend`, { 
        is_suspended: true,
        days: parseInt(suspendDays),
        reason: suspendReason
      });
      setSuspendModal(null);
      setSuspendReason("");
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.error || "Error al suspender.");
    }
  };

  const liftSuspension = async (id) => {
    if (!confirm(`¿Estás seguro de levantar la suspensión de este usuario?`)) return;
    try {
      await api.put(`/admin/users/${id}/suspend`, { is_suspended: false, days: 0, reason: "" });
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("⚠️ ACCIÓN DESTRUCTIVA: Borrará al usuario y sus datos. ¿Continuar?")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.error || "Error al eliminar");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Gestión de Comunidad</h1>
          <p className="text-gray-400 mt-1">Busca, audita y modera todas las cuentas registradas.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Buscar por ID, nombre o @usuario..."
            value={search}
            onChange={(e) => {setSearch(e.target.value); setPage(1);}}
            className="w-full pl-11 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all shadow-inner"
          />
        </div>
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-950 text-gray-400 font-bold border-b border-gray-800 uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Contacto</th>
                <th className="px-6 py-4">Jerarquía</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Moderación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-16 text-purple-500 animate-pulse font-medium">Sincronizando base de datos...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-16 text-gray-500">Ningún usuario coincide con la búsqueda.</td></tr>
              ) : users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gray-800 overflow-hidden shrink-0 border border-gray-700">
                        {user.photo ? <img src={user.photo} alt={user.name} className="w-full h-full object-cover" /> : <div className="w-full h-full" />}
                      </div>
                      <div>
                        <div className="font-black text-white text-base">{user.name}</div>
                        <div className="text-xs text-purple-400 font-medium">@{user.username} <span className="text-gray-600 ml-1">ID:{user.id}</span></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${['admin', 'superadmin', 'moderator', 'support'].includes(user.role) ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.is_suspended ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/20">
                        <Ban size={12}/> {user.suspended_until ? 'Suspendido' : 'Baneado'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-green-500/10 text-green-400 border border-green-500/20">
                        <CheckCircle2 size={12}/> Activo
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setSelectedUser(user)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors" title="Ver Expediente">
                        <Eye size={18} />
                      </button>
                      {user.is_suspended ? (
                         <button onClick={() => liftSuspension(user.id)} className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors" title="Restaurar Cuenta">
                            <CheckCircle2 size={18} />
                         </button>
                      ) : (
                         <button onClick={() => setSuspendModal(user)} className="p-2 text-yellow-500 hover:bg-yellow-500/20 rounded-lg transition-colors" title="Suspender">
                            <Ban size={18} />
                         </button>
                      )}
                      <button onClick={() => handleDelete(user.id)} className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Purgar">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Suspensión Segura */}
      {suspendModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400 mb-4">
               <AlertOctagon size={28} />
               <h3 className="text-xl font-black text-white">Sancionar Usuario</h3>
            </div>
            <p className="text-gray-400 text-sm mb-6">Vas a suspender la cuenta de <span className="font-bold text-white">@{suspendModal.username}</span>. Perderá acceso inmediato a la plataforma.</p>
            
            <div className="space-y-4">
              <div>
                 <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Duración del Castigo</label>
                 <select value={suspendDays} onChange={e => setSuspendDays(e.target.value)} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none">
                    <option value={1}>1 Día (Advertencia)</option>
                    <option value={3}>3 Días</option>
                    <option value={7}>7 Días (Falta Grave)</option>
                    <option value={30}>30 Días</option>
                    <option value={0}>PERMANENTE (Ban Definitivo)</option>
                 </select>
              </div>
              <div>
                 <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Motivo Oficial (Visible para el usuario)</label>
                 <textarea value={suspendReason} onChange={e => setSuspendReason(e.target.value)} placeholder="Ej: Comportamiento inapropiado en el chat..." rows={3} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none resize-none"></textarea>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
               <button onClick={() => setSuspendModal(null)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl font-bold transition-colors">Cancelar</button>
               <button onClick={executeSuspension} disabled={!suspendReason} className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white py-3 rounded-xl font-bold transition-colors">Ejecutar Sanción</button>
            </div>
          </div>
        </div>
      )}

      {selectedUser && (
        <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
}