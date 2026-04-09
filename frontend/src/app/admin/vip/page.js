"use client";
import { useEffect, useState, useCallback } from "react";
import { api } from "@/utils/api";
import { Search, Crown, User, CalendarDays, Zap, Clock } from "lucide-react";
import { useDebounce } from 'use-debounce';
import VipManageModal from "./VipManageModal";

export default function AdminVip() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchVipUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get(`/admin/vip-users?page=${page}&limit=${limit}&search=${debouncedSearch}`);
      setUsers(data.users || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch]);

  useEffect(() => { fetchVipUsers(); }, [fetchVipUsers]);

  const formatDate = (dateStr) => {
      if (!dateStr) return "N/A";
      return new Date(dateStr).toLocaleString('es-VE', {
          day: '2-digit', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
      });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
             <Crown className="text-yellow-500" size={32} /> Gestión de Membresías
          </h1>
          <p className="text-gray-400 mt-1">Controla los accesos, duraciones y beneficios de los usuarios VIP.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Buscar cualquier usuario..."
            value={search}
            onChange={(e) => {setSearch(e.target.value); setPage(1);}}
            className="w-full pl-11 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-sm text-white focus:border-yellow-500 outline-none shadow-inner transition-colors"
          />
        </div>
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-950 text-gray-400 font-bold border-b border-gray-800 uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Estatus VIP</th>
                <th className="px-6 py-4">Trazabilidad (Fechas)</th>
                <th className="px-6 py-4 text-right">Herramientas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {loading ? (
                <tr><td colSpan="4" className="text-center py-16 text-yellow-500 animate-pulse font-medium">Buscando registros VIP...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-16 text-gray-500">Ningún usuario coincide con la búsqueda.</td></tr>
              ) : users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gray-800 overflow-hidden shrink-0 border border-gray-700">
                        {u.photo ? <img src={u.photo} alt={u.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-500"><User size={20}/></div>}
                      </div>
                      <div>
                        <div className="font-black text-white text-base">{u.name}</div>
                        <div className="text-xs text-purple-400 font-medium">@{u.username} <span className="text-gray-600 ml-1">ID:{u.id}</span></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     {u.is_prime ? (
                         <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.1)]">
                             <Crown size={14}/> VIP Activo
                         </span>
                     ) : (
                         <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest bg-gray-800 text-gray-500 border border-gray-700">
                             Estándar
                         </span>
                     )}
                  </td>
                  <td className="px-6 py-4">
                     {u.is_prime ? (
                         <div className="space-y-1.5 text-xs">
                             <div className="flex items-center gap-2"><span className="text-gray-500 w-16">Compró:</span> <span className="text-gray-300">{u.purchase_date ? formatDate(u.purchase_date) : "N/A (Carga Manual)"}</span></div>
                             <div className="flex items-center gap-2"><span className="text-gray-500 w-16">Aprobado:</span> <span className="text-gray-300 font-bold">{u.approval_date ? formatDate(u.approval_date) : "N/A"}</span></div>
                             <div className="flex items-center gap-2 mt-1 pt-1 border-t border-gray-700/50"><span className="text-red-400/80 w-16 font-bold">Vence:</span> <span className="text-red-400 font-bold">{formatDate(u.prime_expires_at)}</span></div>
                         </div>
                     ) : (
                         <span className="text-gray-600 text-xs italic">Sin registros activos</span>
                     )}
                  </td>
                  <td className="px-6 py-4 text-right">
                     <button 
                         onClick={() => setSelectedUser(u)} 
                         className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm flex items-center gap-2 ml-auto"
                     >
                         <Zap size={16}/> Gestionar
                     </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUser && (
         <VipManageModal 
            user={selectedUser} 
            onClose={() => setSelectedUser(null)} 
            onSuccess={() => { setSelectedUser(null); fetchVipUsers(); }} 
         />
      )}
    </div>
  );
}