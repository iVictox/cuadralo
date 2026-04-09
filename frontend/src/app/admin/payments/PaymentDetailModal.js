import { useState } from "react";
import { X, CheckCircle, XCircle, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PaymentDetailModal({ payment, onClose, onAction }) {
  // Por defecto, sugerimos dar VIP si el producto original que quería el usuario era 'vip' o 'prime'
  const [grantVip, setGrantVip] = useState(payment.item_type === 'vip' || payment.item_type === 'prime');

  if (!payment) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-gray-900 rounded-2xl max-w-4xl w-full border border-gray-700 shadow-2xl overflow-hidden relative flex flex-col md:flex-row"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white z-10 bg-black/50 backdrop-blur rounded-full p-2"
          >
            <X size={20} />
          </button>

          {/* Visor del Comprobante */}
          <div className="w-full md:w-[55%] bg-black/50 flex flex-col items-center justify-center min-h-[400px] border-b md:border-b-0 md:border-r border-gray-800 p-6 relative">
             <div className="absolute top-4 left-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Evidencia Adjunta</div>
             {payment.receipt ? (
                 <a href={payment.receipt} target="_blank" rel="noreferrer" className="w-full h-full flex items-center justify-center">
                    <img src={payment.receipt} alt="Comprobante" className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg border border-gray-700" />
                 </a>
             ) : (
                 <div className="text-gray-600 flex flex-col items-center">
                    <XCircle size={48} className="mb-2 opacity-20" />
                    <p>El usuario no adjuntó comprobante</p>
                 </div>
             )}
          </div>

          {/* Panel de Datos y Acciones */}
          <div className="w-full md:w-[45%] p-8 flex flex-col bg-gray-900">
            <h3 className="text-2xl font-black text-white mb-6 border-b border-gray-800 pb-4">Auditoría de Pago</h3>

            <div className="space-y-4 flex-1 text-sm bg-gray-800/50 p-5 rounded-xl border border-gray-800">
                <div className="flex justify-between items-center"><span className="text-gray-500">Producto Solicitado:</span> <span className="uppercase bg-purple-600 text-white px-2 py-0.5 rounded text-xs font-bold">{payment.item_type}</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-500">Monto Reportado:</span> <span className="text-green-400 font-bold text-xl">${payment.amount_usd}</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-500">Depositado:</span> <span className="text-white font-medium">{payment.amount_ves} Bs</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-500">Tasa de Cambio:</span> <span className="font-mono text-gray-400">{payment.rate} Bs/$</span></div>
                
                <hr className="border-gray-700 my-2" />
                
                <div className="flex justify-between items-center"><span className="text-gray-500">Banco Origen:</span> <span className="text-white font-medium">{payment.bank}</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-500">Teléfono Origen:</span> <span className="text-white font-medium">{payment.phone}</span></div>
                <div className="flex flex-col mt-2">
                    <span className="text-gray-500 mb-1">Referencia Bancaria:</span> 
                    <span className="font-mono bg-black px-3 py-2 rounded-lg text-green-400 border border-green-900 text-center tracking-widest text-lg">{payment.reference}</span>
                </div>
            </div>

            {payment.status === 'pending' ? (
                <div className="mt-6 space-y-4">
                    {/* Opcion Explicita solicitada en el prompt */}
                    <div className="bg-purple-900/20 border border-purple-500/30 p-4 rounded-xl">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={grantVip}
                                onChange={(e) => setGrantVip(e.target.checked)}
                                className="mt-1 w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
                            />
                            <div>
                                <span className="block text-white font-bold flex items-center gap-2">
                                    Otorgar membresía VIP <ShieldCheck size={16} className="text-yellow-500"/>
                                </span>
                                <span className="block text-xs text-gray-400 mt-0.5">Al aprobar este pago, se le asignará el rango Prime al usuario automáticamente por 30 días.</span>
                            </div>
                        </label>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={() => { onAction(payment.id, 'verify', grantVip); onClose(); }}
                            className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 transition-colors shadow-[0_0_15px_rgba(22,163,74,0.4)]"
                        >
                            <CheckCircle size={20}/> Aprobar
                        </button>
                        <button
                            onClick={() => { onAction(payment.id, 'reject', false); onClose(); }}
                            className="flex-1 bg-red-900/80 hover:bg-red-600 text-red-200 hover:text-white border border-red-800 hover:border-red-600 py-3 rounded-xl font-bold flex justify-center items-center gap-2 transition-all"
                        >
                            <XCircle size={20}/> Rechazar
                        </button>
                    </div>
                </div>
            ) : (
                <div className="mt-6 text-center p-4 bg-gray-800 rounded-xl border border-gray-700">
                    <p className="text-gray-400 text-sm">Este pago ya fue procesado y su estado es:</p>
                    <p className={`text-xl font-bold mt-1 uppercase tracking-widest ${payment.status === 'approved' ? 'text-green-500' : 'text-red-500'}`}>
                        {payment.status === 'approved' ? 'Aprobado' : 'Rechazado'}
                    </p>
                </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}