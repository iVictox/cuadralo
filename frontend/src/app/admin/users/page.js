"use client";
import { useEffect, useState, useCallback } from "react";
import { api } from "@/utils/api";
import { Search, ShieldAlert, Trash2, Ban, Eye, CheckCircle2 } from "lucide-react";
import { useDebounce } from 'use-debounce';
import UserDetailModal from "./UserDetailModal";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(20);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page,
        limit: limit,
        search: debouncedSearch
      });
      const data = await api.get(`/admin/users?${query}`);
      setUsers(data.users);
      setTotalPages(Math.ceil(data.total / limit));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSuspend = async (id, currentStatus) => {
    if (!confirm(`¿Estás seguro de ${currentStatus ? 'restaurar' : 'suspender'} a este usuario?`)) return;
    try {
      await api.put(`/admin/users/${id}/suspend`, { is_suspended: !currentStatus });
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("⚠️ ATENCIÓN: Esta acción borrará al usuario permanentemente. ¿Deseas continuar?")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  const handleRoleChange = async (id, newRole) => {
    if (!confirm(`¿Cambiar el rol de este usuario a ${newRole.toUpperCase()}?`)) return;
    try {
      await api.put(`/admin/users/${id}/role`, { role: newRole });
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestión de Usuarios</h1>
          <p className="text-sm text-gray-400">Administra las cuentas registradas en Cuadralo.</p>
        </div>
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar ID, nombre, @usuario..."
            value={search}
            onChange={(e) => {setSearch(e.target.value); setPage(1);}}
            className="pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 w-full md:w-72 transition-all"
          />
        </div>
      </div>

      <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-900 text-gray-400 font-semibold border-b border-gray-700">
              <tr>
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Contacto</th>
                <th className="px-6 py-4">Rol / Nivel</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-12 text-purple-400 animate-pulse">Cargando base de datos...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-12 text-gray-500">No se encontraron usuarios.</td></tr>
              ) : users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden shrink-0 border border-gray-600">
                        {user.photo ? <img src={user.photo} alt={user.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-800" />}
                      </div>
                      <div>
                        <div className="font-bold text-white">{user.name} <span className="text-xs text-gray-500 font-normal ml-1">#{user.id}</span></div>
                        <div className="text-xs text-purple-400">@{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">{user.email}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${user.role === 'admin' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'}`}>
                        {user.role}
                      </span>
                      {user.is_prime && (
                        <span className="px-2 py-1 rounded text-xs font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                          VIP
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.is_suspended ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                        <Ban size={12}/> Suspendido
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                        <CheckCircle2 size={12}/> Activo
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setSelectedUser(user)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors" title="Perfil Detallado">
                        <Eye size={18} />
                      </button>
                      <button onClick={() => handleRoleChange(user.id, user.role === 'admin' ? 'user' : 'admin')} className={`p-2 rounded-lg transition-colors ${user.role === 'admin' ? 'text-purple-400 hover:bg-purple-500/10' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`} title="Alternar Permisos de Admin">
                        <ShieldAlert size={18} />
                      </button>
                      <button onClick={() => handleSuspend(user.id, user.is_suspended)} className={`p-2 rounded-lg transition-colors ${user.is_suspended ? 'text-green-400 hover:bg-green-500/10' : 'text-yellow-500 hover:bg-yellow-500/10'}`} title={user.is_suspended ? "Quitar Suspensión" : "Suspender Cuenta"}>
                        <Ban size={18} />
                      </button>
                      <button onClick={() => handleDelete(user.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Eliminar Definitivamente">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="flex flex-col sm:flex-row justify-between items-center p-4 bg-gray-900/50 border-t border-gray-700 text-sm gap-4">
            <div className="text-gray-400">
                Página <span className="font-bold text-white">{page}</span> de <span className="font-bold text-white">{totalPages || 1}</span>
            </div>
            <div className="flex items-center gap-2">
                <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors text-white">
                    Anterior
                </button>
                <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors text-white">
                    Siguiente
                </button>
                <select value={limit} onChange={(e) => {setLimit(Number(e.target.value)); setPage(1);}} className="ml-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 cursor-pointer">
                    <option value={20}>20 filas</option>
                    <option value={50}>50 filas</option>
                    <option value={100}>100 filas</option>
                </select>
            </div>
        </div>
      </div>

      {selectedUser && (
        <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
}