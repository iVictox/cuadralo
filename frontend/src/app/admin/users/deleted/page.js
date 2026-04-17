"use client";
import { useEffect, useState, useCallback } from "react";
import { api } from "@/utils/api";
import { Search, Trash2, User, RefreshCw, AlertOctagon } from "lucide-react";
import { useDebounce } from 'use-debounce';
import { useConfirm } from "@/context/ConfirmContext";

export default function AdminDeletedUsers() {
  const { confirm } = useConfirm();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const fetchDeleted = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get(`/admin/users/deleted?page=${page}&limit=${limit}&search=${debouncedSearch}`);
      setUsers(data.users || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch]);

  useEffect(() => { fetchDeleted(); }, [fetchDeleted]);

  const formatDate = (dateStr) => {
      if (!dateStr) return "N/A";
      return new Date(dateStr).toLocaleString('es-VE', {
          day: '2-digit', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
      });
  };

  const handleRestore = async (id) => {
    const isConfirmed = await confirm({
      title: "Restaurar usuario",
      message: "¿Seguro que deseas sacar a este usuario de la papelera? Su cuenta volverá a la normalidad.",
      confirmText: "Sí, restaurar",
      cancelText: "Cancelar",
      variant: "info"
    });
    if (!isConfirmed) return;
    try {
      await api.put(`/admin/users/${id}/restore`);
      fetchDeleted(); 
    } catch (error) {
      alert("Error al restaurar.");
    }
  };

  const handleForceDelete = async (id) => {
    const confirmation = prompt(`⚠️ ATENCIÓN: Estás a punto de PURGAR PERMANENTEMENTE a este usuario de la base de datos.\nEsta acción destruirá sus fotos, mensajes y todo su registro irrecuperablemente.\n\nPara confirmar, escribe "PURGAR" a continuación:`);
    if (confirmation !== "PURGAR") return;

    try {
      await api.delete(`/admin/users/${id}/force`);
      alert("Usuario purgado con éxito.");
      fetchDeleted(); 
    } catch (error) {
      alert(error.response?.data?.error || "Error al purgar.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
             <Trash2 className="text-red-500" size={32} /> Papelera de Usuarios
          </h1>
          <p className="text-gray-400 mt-1">Cuentas eliminadas lógicamente del sistema. Aquí puedes restaurarlas o purgarlas.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Buscar en la papelera..."
            value={search}
            onChange={(e) => {setSearch(e.target.value); setPage(1);}}
            className="w-full pl-11 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-sm text-white focus:border-red-500 outline-none shadow-inner"
          />
        </div>
      </div>

      <div className="bg-gray-900 rounded-2xl border border-red-900/30 shadow-2xl overflow-hidden relative">
        {/* Adorno visual */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-red-900"></div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-950 text-gray-400 font-bold border-b border-gray-800 uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4">Cuenta Eliminada</th>
                <th className="px-6 py-4">Fecha de Borrado</th>
                <th className="px-6 py-4 text-right">Gestión de Datos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {loading ? (
                <tr><td colSpan="3" className="text-center py-16 text-red-500 animate-pulse font-medium">Buscando registros muertos...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="3" className="text-center py-16 text-gray-500 flex flex-col items-center justify-center gap-3"><Trash2 size={32} className="opacity-20"/> La papelera está vacía.</td></tr>
              ) : users.map((u) => (
                <tr key={u.id} className="hover:bg-red-900/10 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-950 overflow-hidden shrink-0 border border-red-900/50 flex items-center justify-center text-red-900">
                         <User size={18}/>
                      </div>
                      <div>
                        <div className="font-bold text-gray-400 text-sm line-through decoration-red-500/50">{u.name}</div>
                        <div className="text-xs text-red-400/50 font-mono">@{u.username} <span className="ml-1 text-gray-600">ID:{u.id}</span></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">
                     {formatDate(u.deleted_at)}
                  </td>
                  <td className="px-6 py-4 text-right">
                     <div className="flex items-center justify-end gap-3">
                         <button 
                             onClick={() => handleRestore(u.id)} 
                             className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
                         >
                             <RefreshCw size={14}/> Restaurar
                         </button>
                         <button 
                             onClick={() => handleForceDelete(u.id)} 
                             className="bg-red-950/50 hover:bg-red-600 text-red-400 hover:text-white border border-red-900/50 hover:border-red-500 px-3 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2"
                         >
                             <AlertOctagon size={14}/> Purgar
                         </button>
                     </div>
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