"use client";
import { useEffect, useState, useCallback } from "react";
import { api } from "@/utils/api";
import { Search, Ban, User, CheckCircle2, ShieldAlert } from "lucide-react";
import { useDebounce } from 'use-debounce';
import UserDetailModal from "../UserDetailModal";
import { useConfirm } from "@/context/ConfirmContext";

export default function AdminSuspendedUsers() {
  const { confirm } = useConfirm();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchSuspended = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get(`/admin/users/suspended?page=${page}&limit=${limit}&search=${debouncedSearch}`);
      setUsers(data.users || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch]);

  useEffect(() => { fetchSuspended(); }, [fetchSuspended]);

  const formatDate = (dateStr) => {
      if (!dateStr) return "Permanente";
      return new Date(dateStr).toLocaleString('es-VE', {
          day: '2-digit', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
      });
  };

  const liftSuspension = async (id) => {
    const isConfirmed = await confirm({
      title: "Restaurar cuenta",
      message: "¿Estás seguro de levantar la suspensión de este usuario inmediatamente?",
      confirmText: "Sí, restaurar",
      cancelText: "Cancelar",
      variant: "success"
    });
    if (!isConfirmed) return;
    try {
      await api.put(`/admin/users/${id}/suspend`, { is_suspended: false, days: 0, reason: "" });
      fetchSuspended(); // Recargar lista
    } catch (error) {
      alert("Error al restaurar cuenta.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
             <ShieldAlert className="text-orange-500" size={32} /> Cuentas Suspendidas
          </h1>
          <p className="text-gray-400 mt-1">Usuarios que actualmente tienen el acceso bloqueado a la plataforma.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre o ID..."
            value={search}
            onChange={(e) => {setSearch(e.target.value); setPage(1);}}
            className="w-full pl-11 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-sm text-white focus:border-orange-500 outline-none shadow-inner"
          />
        </div>
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-950 text-gray-400 font-bold border-b border-gray-800 uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4">Usuario Infractor</th>
                <th className="px-6 py-4">Motivo de Suspensión</th>
                <th className="px-6 py-4">Expiración del Castigo</th>
                <th className="px-6 py-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {loading ? (
                <tr><td colSpan="4" className="text-center py-16 text-orange-500 animate-pulse font-medium">Cargando infractores...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-16 text-gray-500">No hay cuentas suspendidas en este momento.</td></tr>
              ) : users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4 cursor-pointer" onClick={() => setSelectedUser(u)}>
                      <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden shrink-0 border border-gray-700">
                        {u.photo ? <img src={u.photo} alt={u.name} className="w-full h-full object-cover opacity-50 grayscale" /> : <div className="w-full h-full flex items-center justify-center text-gray-500"><User size={18}/></div>}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm hover:text-orange-400 transition-colors">{u.name}</div>
                        <div className="text-xs text-gray-500">@{u.username} <span className="ml-1">ID:{u.id}</span></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-300 font-medium">{u.suspension_reason || "Sin especificar"}</span>
                  </td>
                  <td className="px-6 py-4">
                     <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest bg-orange-500/10 text-orange-400 border border-orange-500/20">
                        <Ban size={14}/> {formatDate(u.suspended_until)}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                     <button 
                         onClick={() => liftSuspension(u.id)} 
                         className="bg-gray-800 hover:bg-green-600/20 text-white hover:text-green-400 hover:border-green-500/50 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors border border-gray-700 flex items-center gap-2 ml-auto"
                     >
                         <CheckCircle2 size={16}/> Restaurar
                     </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUser && (
         <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
}