"use client";
import { useEffect, useState } from "react";
import { api } from "@/utils/api";

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const data = await api.get("/admin/logs");
      setLogs(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Historial de Actividad (Logs)</h1>
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-gray-900/50 text-gray-400">
            <tr>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Admin</th>
              <th className="px-4 py-3">Acción</th>
              <th className="px-4 py-3">Detalles</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="text-center py-8">Cargando logs...</td></tr>
            ) : logs.map((log) => (
              <tr key={log.id} className="border-t border-gray-700 hover:bg-gray-700/50">
                <td className="px-4 py-3 text-xs text-gray-500">{new Date(log.created_at).toLocaleString('es-ES')}</td>
                <td className="px-4 py-3">{log.admin?.name || `Admin #${log.admin_id}`}</td>
                <td className="px-4 py-3 text-purple-400 font-medium">{log.action}</td>
                <td className="px-4 py-3 text-gray-400">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
