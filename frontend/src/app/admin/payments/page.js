"use client";
import { useEffect, useState } from "react";
import { api } from "@/utils/api";
import { CheckCircle, XCircle, Clock, Eye, Receipt, User } from "lucide-react";
import PaymentDetailModal from "./PaymentDetailModal";

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const data = await api.get("/admin/payments");
      setPayments(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action, grantVip = false) => {
    if (!confirm(`¿Estás seguro de procesar este pago como: ${action.toUpperCase()}?`)) return;
    try {
      await api.put(`/admin/payments/${id}/verify`, { action, grant_vip: grantVip });
      fetchPayments();
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error al procesar el pago.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Receipt className="text-green-500" /> Verificación de Pagos
          </h1>
          <p className="text-sm text-gray-400">Revisa los reportes de transferencias y pagos móviles enviados por los usuarios.</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-900 text-gray-400 font-semibold border-b border-gray-700">
              <tr>
                <th className="px-6 py-4">Ref. Sistema</th>
                <th className="px-6 py-4">Usuario Emisor</th>
                <th className="px-6 py-4">Monto / Datos del Banco</th>
                <th className="px-6 py-4">Capture</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Auditoría</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-12 text-purple-400 animate-pulse">Consultando transacciones...</td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-12 text-gray-500">Bandeja limpia. No hay pagos pendientes.</td></tr>
              ) : payments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-mono text-white text-base">#{p.id}</div>
                    <div className="text-xs text-gray-500">{new Date(p.created_at).toLocaleString()}</div>
                  </td>
                  
                  {/* ✅ COLUMNA DE USUARIO MEJORADA */}
                  <td className="px-6 py-4">
                    {p.user ? (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden shrink-0 border border-gray-600">
                                {p.user.photo ? (
                                    <img src={p.user.photo} alt={p.user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-500"><User size={20}/></div>
                                )}
                            </div>
                            <div>
                                <div className="font-bold text-white text-sm leading-tight">{p.user.name}</div>
                                <div className="text-xs text-purple-400 font-medium">@{p.user.username}</div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-gray-500 text-xs italic">Usuario Eliminado (ID: {p.user_id})</div>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <div className="text-green-400 font-bold text-base">€{p.amount_usd} <span className="text-gray-400 text-xs font-normal">({p.amount_ves} Bs)</span></div>
                    <div className="text-xs text-gray-400 mt-1">Ref: <span className="font-mono text-white">{p.reference}</span></div>
                    <div className="text-[10px] text-gray-500 uppercase">{p.bank}</div>
                  </td>
                  <td className="px-6 py-4">
                    {p.receipt ? (
                      <button onClick={() => setSelectedPayment(p)} className="flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors text-xs font-medium bg-purple-500/10 px-3 py-1.5 rounded-lg border border-purple-500/20">
                        <Eye size={14}/> Ver Capture
                      </button>
                    ) : (
                      <span className="text-gray-600 text-xs italic">Sin imagen</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {p.status === 'pending' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"><Clock size={12}/> Pendiente</span>}
                    {p.status === 'approved' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20"><CheckCircle size={12}/> Aprobado</span>}
                    {p.status === 'rejected' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20"><XCircle size={12}/> Rechazado</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => setSelectedPayment(p)} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
                      Gestionar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {selectedPayment && (
        <PaymentDetailModal payment={selectedPayment} onClose={() => setSelectedPayment(null)} onAction={handleAction} />
      )}
    </div>
  );
}