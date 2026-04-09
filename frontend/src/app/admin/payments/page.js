"use client";
import { useEffect, useState } from "react";
import { api } from "@/utils/api";
import { CheckCircle, XCircle, Clock, Eye } from "lucide-react";
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
    if (!confirm(`¿Estás seguro de marcar este pago como ${action}?`)) return;
    try {
      await api.put(`/admin/payments/${id}/verify`, { action, grant_vip: grantVip });
      fetchPayments();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Verificación de Pagos</h1>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-900/50 text-gray-400">
              <tr>
                <th className="px-4 py-3">ID / Fecha</th>
                <th className="px-4 py-3">Usuario (ID)</th>
                <th className="px-4 py-3">Monto / Ref</th>
                <th className="px-4 py-3">Comprobante</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center py-8">Cargando pagos...</td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-8">No hay pagos reportados.</td></tr>
              ) : payments.map((p) => (
                <tr key={p.id} className="border-t border-gray-700 hover:bg-gray-700/50">
                  <td className="px-4 py-3">
                    <div className="font-medium">#{p.id}</div>
                    <div className="text-xs text-gray-500">{new Date(p.created_at).toLocaleDateString()}</div>
                  </td>
                  <td className="px-4 py-3">User #{p.user_id}</td>
                  <td className="px-4 py-3">
                    <div className="text-white">${p.amount_usd} ({p.amount_ves} Bs)</div>
                    <div className="text-xs text-gray-500">Ref: {p.reference} - {p.bank}</div>
                  </td>
                  <td className="px-4 py-3">
                    {p.receipt ? (
                      <a href={p.receipt} target="_blank" rel="noreferrer" className="text-purple-400 hover:underline text-xs">Ver imagen</a>
                    ) : "N/A"}
                  </td>
                  <td className="px-4 py-3">
                    {p.status === 'pending' && <span className="text-yellow-400 flex items-center gap-1 text-xs"><Clock size={12}/> Pendiente</span>}
                    {p.status === 'approved' && <span className="text-green-400 flex items-center gap-1 text-xs"><CheckCircle size={12}/> Aprobado</span>}
                    {p.status === 'rejected' && <span className="text-red-400 flex items-center gap-1 text-xs"><XCircle size={12}/> Rechazado</span>}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => setSelectedPayment(p)} className="text-gray-400 hover:text-blue-400 p-1" title="Ver Detalles">
                       <Eye size={18} />
                    </button>
                    {p.status === 'pending' && (
                      <>
                        <button onClick={() => handleAction(p.id, 'verify')} className="text-gray-400 hover:text-green-400 p-1" title="Aprobar">
                          <CheckCircle size={18} />
                        </button>
                        <button onClick={() => handleAction(p.id, 'reject')} className="text-gray-400 hover:text-red-400 p-1" title="Rechazar">
                          <XCircle size={18} />
                        </button>
                      </>
                    )}
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
