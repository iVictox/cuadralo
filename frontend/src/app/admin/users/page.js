"use client";
import { useEffect, useState, useCallback } from "react";
import { api } from "@/utils/api";
import { Search, MoreVertical, ShieldAlert, Trash2, Ban, Eye } from "lucide-react";
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
    if (!confirm("¿ESTÁS SEGURO? Esta acción borrará al usuario permanentemente.")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  const handleRoleChange = async (id, newRole) => {
    if (!confirm(`¿Cambiar rol a ${newRole}?`)) return;
    try {
      await api.put(`/admin/users/${id}/role`, { role: newRole });
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre, ID..."
            value={search}
            onChange={(e) => {setSearch(e.target.value); setPage(1);}}
            className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-purple-500 w-64"
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
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center py-8">Cargando usuarios...</td></tr>
              ) : users.map((user) => (
                <tr key={user.id} className="border-t border-gray-700 hover:bg-gray-700/50">
                  <td className="px-4 py-3">{user.id}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{user.name}</div>
                    <div className="text-xs text-gray-500">@{user.username}</div>
                  </td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-600 text-gray-300'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {user.is_suspended ? (
                      <span className="text-red-400 text-xs flex items-center gap-1"><Ban size={12}/> Suspendido</span>
                    ) : (
                      <span className="text-green-400 text-xs">Activo</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="text-gray-400 hover:text-blue-400 p-1" title="Ver Detalles">
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => handleRoleChange(user.id, user.role === 'admin' ? 'user' : 'admin')}
                      className="text-gray-400 hover:text-white p-1" title="Cambiar Rol">
                      <ShieldAlert size={18} />
                    </button>
                    <button
                      onClick={() => handleSuspend(user.id, user.is_suspended)}
                      className="text-gray-400 hover:text-yellow-400 p-1" title={user.is_suspended ? "Restaurar" : "Suspender"}>
                      <Ban size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-gray-400 hover:text-red-400 p-1" title="Eliminar">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-between items-center p-4 border-t border-gray-700 text-sm">
            <div>
                Mostrando página {page} de {totalPages || 1}
            </div>
            <div className="flex gap-2">
                <button
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50"
                >
                    Anterior
                </button>
                <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50"
                >
                    Siguiente
                </button>

                <select
                    value={limit}
                    onChange={(e) => {setLimit(Number(e.target.value)); setPage(1);}}
                    className="ml-4 bg-gray-700 rounded px-2 py-1"
                >
                    <option value={20}>20 por página</option>
                    <option value={50}>50 por página</option>
                    <option value={100}>100 por página</option>
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
