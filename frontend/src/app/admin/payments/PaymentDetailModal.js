import { X, CheckCircle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PaymentDetailModal({ payment, onClose, onAction }) {
  if (!payment) return null;

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
          className="bg-gray-800 rounded-xl max-w-2xl w-full border border-gray-700 overflow-hidden relative flex flex-col md:flex-row"
        >
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-400 hover:text-white z-10 bg-gray-900/50 rounded-full p-1"
          >
            <X size={24} />
          </button>

          <div className="w-full md:w-1/2 bg-gray-900 flex flex-col items-center justify-center min-h-[300px] border-b md:border-b-0 md:border-r border-gray-700 p-4">
             {payment.receipt ? (
                 <a href={payment.receipt} target="_blank" rel="noreferrer" className="w-full h-full block">
                    <img src={payment.receipt} alt="Comprobante" className="max-w-full max-h-full object-contain mx-auto" />
                 </a>
             ) : (
                 <p className="text-gray-500">Sin comprobante</p>
             )}
          </div>

          <div className="w-full md:w-1/2 p-6 flex flex-col">
            <h3 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">Detalles del Pago</h3>

            <div className="space-y-3 flex-1 text-sm">
                <p className="flex justify-between"><span className="text-gray-400">ID Pago:</span> <span className="font-medium">#{payment.id}</span></p>
                <p className="flex justify-between"><span className="text-gray-400">Usuario ID:</span> <span>#{payment.user_id}</span></p>
                <p className="flex justify-between"><span className="text-gray-400">Producto:</span> <span className="uppercase text-purple-400 font-bold">{payment.item_type}</span></p>
                <p className="flex justify-between"><span className="text-gray-400">Monto:</span> <span className="text-green-400 font-bold">${payment.amount_usd}</span></p>
                <p className="flex justify-between"><span className="text-gray-400">Equivalente:</span> <span>{payment.amount_ves} Bs</span></p>
                <p className="flex justify-between"><span className="text-gray-400">Tasa:</span> <span>{payment.rate} Bs/$</span></p>
                <div className="pt-2 border-t border-gray-700 mt-2">
                    <p className="flex justify-between mt-2"><span className="text-gray-400">Referencia:</span> <span className="font-mono bg-gray-900 px-2 py-0.5 rounded">{payment.reference}</span></p>
                    <p className="flex justify-between mt-2"><span className="text-gray-400">Banco:</span> <span>{payment.bank}</span></p>
                    <p className="flex justify-between mt-2"><span className="text-gray-400">Teléfono:</span> <span>{payment.phone}</span></p>
                </div>
            </div>

            {payment.status === 'pending' && (
                <div className="flex gap-3 mt-6 pt-4 border-t border-gray-700">
                    <button
                        onClick={() => { onAction(payment.id, 'verify'); onClose(); }}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium flex justify-center items-center gap-2"
                    >
                        <CheckCircle size={18}/> Aprobar
                    </button>
                    <button
                        onClick={() => { onAction(payment.id, 'reject'); onClose(); }}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium flex justify-center items-center gap-2"
                    >
                        <XCircle size={18}/> Rechazar
                    </button>
                </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
