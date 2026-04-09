"use client";
import { useEffect, useState } from "react";
import { api } from "@/utils/api";
import { ShieldCheck, ShieldAlert, CheckCircle, XCircle } from "lucide-react";

export default function AdminManagement() {
  const [requests, setRequests] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reqData, staffData] = await Promise.all([
        api.get("/admin/requests"),
        api.get("/admin/staff")
      ]);
      setRequests(reqData || []);
      setStaff(staffData || []);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || "Error cargando datos de seguridad");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleRequest = async (id, action) => {
    let reason = "Aprobado";
    if (action === 'deny') {
      reason = prompt("Motivo del rechazo:");
      if (!reason) return;
    } else {
      if (!confirm("¿Otorgar credenciales administrativas a este usuario de forma definitiva?")) return;
    }

    try {
      await api.put(`/admin/requests/${id}`, { action, reason });
      fetchData();
    } catch (error) {
      alert("Error al procesar solicitud");
    }
  };

  const handleRevoke = async (id) => {
    const confirmText = prompt("Escribe 'REVOCAR' para degradar a este administrador a usuario normal:");
    if (confirmText !== 'REVOCAR') return;

    try {
      await api.put(`/admin/staff/${id}/revoke`);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.error || "Error al revocar");
    }
  };

  if (loading) return <div className="text-purple-500 animate-pulse p-10">Auditoria de seguridad en progreso...</div>;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <ShieldCheck className="text-purple-500" size={32} /> Gestión de Credenciales
        </h1>
        <p className="text-gray-400 mt-2">Área restringida para SuperAdministradores. Controla el acceso al panel administrativo.</p>
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6 border-b border-gray-800 pb-4">Solicitudes Pendientes de Escalada</h2>
        {requests.length === 0 ? (
          <p className="text-gray-500 italic text-sm">No hay peticiones de administración pendientes.</p>
        ) : (
          <div className="space-y-4">
            {requests.map(req => (
              <div key={req.id} className="bg-gray-950 border border-purple-900/30 p-5 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-white font-bold">{req.user.name} <span className="text-gray-500 text-xs font-normal">@{req.user.username}</span></p>
                  <p className="text-sm text-purple-400 font-bold uppercase tracking-widest mt-1">Solicita: {req.requested_role}</p>
                  <p className="text-gray-400 text-sm mt-2">Motivo: "{req.reason}"</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => handleRequest(req.id, 'approve')} className="flex items-center gap-2 bg-green-600/20 text-green-400 hover:bg-green-600 hover:text-white px-4 py-2 rounded-lg font-bold transition-colors border border-green-500/30">
                    <CheckCircle size={18}/> Aprobar
                  </button>
                  <button onClick={() => handleRequest(req.id, 'deny')} className="flex items-center gap-2 bg-red-900/30 text-red-400 hover:bg-red-600 hover:text-white px-4 py-2 rounded-lg font-bold transition-colors border border-red-500/30">
                    <XCircle size={18}/> Denegar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
        <div className="bg-gray-950 px-6 py-4 border-b border-gray-800 flex items-center gap-2">
            <ShieldAlert className="text-red-500" size={18} />
            <h2 className="text-lg font-bold text-white">Equipo Oficial (Staff)</h2>
        </div>
        <table className="w-full text-left text-sm text-gray-300">
          <tbody className="divide-y divide-gray-800/50">
            {staff.map(user => (
              <tr key={user.id} className="hover:bg-gray-800/30">
                <td className="px-6 py-4 font-bold text-white">{user.name} <span className="text-gray-500 font-normal">@{user.username}</span></td>
                <td className="px-6 py-4"><span className="bg-purple-900 text-purple-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">{user.role}</span></td>
                <td className="px-6 py-4 text-right">
                  {user.role !== 'superadmin' && (
                    <button onClick={() => handleRevoke(user.id)} className="text-red-400 hover:text-red-300 hover:underline text-xs font-bold uppercase tracking-widest">
                      Revocar Acceso
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}