import { useState } from "react";
import { X, CheckCircle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PaymentDetailModal({ payment, onClose, onAction }) {
  const [grantVIP, setGrantVIP] = useState(true);

  if (!payment) return null;

  const isVIPPayment = payment.item_type === 'vip' || payment.item_type === 'prime';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-cuadralo-cardDark rounded-xl max-w-2xl w-full border border-cuadralo-purple/30 overflow-hidden relative flex flex-col md:flex-row shadow-glass-dark"
        >
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-400 hover:text-white z-10 bg-cuadralo-bgDark/50 rounded-full p-1"
          >
            <X size={24} />
          </button>

          <div className="w-full md:w-1/2 bg-cuadralo-bgDark flex flex-col items-center justify-center min-h-[300px] border-b md:border-b-0 md:border-r border-cuadralo-purple/30 p-4">
             {payment.receipt ? (
                 <a href={payment.receipt} target="_blank" rel="noreferrer" className="w-full h-full flex items-center justify-center overflow-hidden">
                    <img src={payment.receipt} alt="Comprobante" className="max-w-full max-h-[400px] object-contain mx-auto rounded" />
                 </a>
             ) : (
                 <p className="text-gray-500">Sin comprobante</p>
             )}
          </div>

          <div className="w-full md:w-1/2 p-6 flex flex-col">
            <h3 className="text-xl font-bold mb-4 border-b border-cuadralo-purple/30 pb-2 text-white">Detalles del Pago</h3>

            <div className="space-y-3 flex-1 text-sm text-gray-300">
                <p className="flex justify-between"><span className="text-gray-400">ID Pago:</span> <span className="font-medium text-white">#{payment.id}</span></p>
                <p className="flex justify-between"><span className="text-gray-400">Usuario ID:</span> <span>#{payment.user_id}</span></p>
                <p className="flex justify-between"><span className="text-gray-400">Producto:</span> <span className="uppercase text-cuadralo-pink font-bold">{payment.item_type}</span></p>
                <p className="flex justify-between"><span className="text-gray-400">Monto:</span> <span className="text-green-400 font-bold">${payment.amount_usd}</span></p>
                <p className="flex justify-between"><span className="text-gray-400">Equivalente:</span> <span>{payment.amount_ves} Bs</span></p>
                <p className="flex justify-between"><span className="text-gray-400">Tasa:</span> <span>{payment.rate} Bs/$</span></p>
                <div className="pt-2 border-t border-cuadralo-purple/30 mt-2">
                    <p className="flex justify-between mt-2"><span className="text-gray-400">Referencia:</span> <span className="font-mono bg-cuadralo-bgDark px-2 py-0.5 rounded text-white">{payment.reference}</span></p>
                    <p className="flex justify-between mt-2"><span className="text-gray-400">Banco:</span> <span>{payment.bank}</span></p>
                    <p className="flex justify-between mt-2"><span className="text-gray-400">Teléfono:</span> <span>{payment.phone}</span></p>
                </div>
            </div>

            {payment.status === 'pending' && (
                <div className="mt-6 pt-4 border-t border-cuadralo-purple/30">
                    {isVIPPayment && (
                        <label className="flex items-center gap-2 mb-4 text-sm text-gray-300 cursor-pointer bg-cuadralo-bgDark p-2 rounded border border-cuadralo-purple/10">
                            <input
                                type="checkbox"
                                checked={grantVIP}
                                onChange={(e) => setGrantVIP(e.target.checked)}
                                className="rounded text-cuadralo-pink focus:ring-cuadralo-pink bg-gray-900 border-gray-700 w-4 h-4"
                            />
                            ¿Otorgar VIP tras aprobar?
                        </label>
                    )}
                    <div className="flex gap-3">
                        <button
                            onClick={() => { onAction(payment.id, 'verify', grantVIP); onClose(); }}
                            className="flex-1 bg-gradient-to-r from-cuadralo-purple to-cuadralo-pink hover:opacity-90 text-white py-2 rounded-lg font-medium flex justify-center items-center gap-2 transition-opacity"
                        >
                            <CheckCircle size={18}/> Aprobar
                        </button>
                        <button
                            onClick={() => { onAction(payment.id, 'reject', false); onClose(); }}
                            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-medium flex justify-center items-center gap-2 transition-colors"
                        >
                            <XCircle size={18}/> Rechazar
                        </button>
                    </div>
                </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
