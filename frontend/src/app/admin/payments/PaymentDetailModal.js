import { useState } from "react";
import { X, CheckCircle, XCircle, ShieldCheck, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PaymentDetailModal({ payment, onClose, onAction }) {
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
          className="bg-gray-900 rounded-2xl max-w-5xl w-full border border-gray-700 shadow-2xl overflow-hidden relative flex flex-col md:flex-row max-h-[90vh] md:max-h-full"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white z-10 bg-black/50 backdrop-blur rounded-full p-2 border border-gray-700 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400 transition-all"
          >
            <X size={20} />
          </button>

          {/* Visor del Comprobante */}
          <div className="w-full md:w-[55%] bg-black/80 flex flex-col items-center justify-center min-h-[300px] border-b md:border-b-0 md:border-r border-gray-800 p-6 relative overflow-hidden">
             <div className="absolute top-4 left-4 text-xs font-bold text-gray-500 uppercase tracking-widest bg-black/50 px-3 py-1.5 rounded-lg backdrop-blur">Evidencia Adjunta</div>
             {payment.receipt ? (
                 <a href={payment.receipt} target="_blank" rel="noreferrer" className="w-full h-full flex items-center justify-center">
                    <img src={payment.receipt} alt="Comprobante" className="max-w-full max-h-[80vh] md:max-h-[70vh] object-contain rounded-xl shadow-2xl transition-transform hover:scale-[1.02]" />
                 </a>
             ) : (
                 <div className="text-gray-600 flex flex-col items-center">
                    <XCircle size={48} className="mb-3 opacity-20" />
                    <p className="font-medium">El usuario no adjuntó comprobante</p>
                 </div>
             )}
          </div>

          {/* Panel de Datos y Acciones */}
          <div className="w-full md:w-[45%] p-6 md:p-8 flex flex-col bg-gray-900 overflow-y-auto custom-scrollbar">
            <h3 className="text-2xl font-black text-white mb-6 border-b border-gray-800 pb-4">Auditoría de Pago</h3>

            {/* ✅ TARJETA DE PERFIL DEL USUARIO */}
            <div className="flex items-center gap-4 bg-gray-800/60 p-4 rounded-2xl border border-gray-700/50 mb-6 shadow-inner">
                <div className="w-14 h-14 rounded-full bg-gray-800 overflow-hidden shrink-0 border-2 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                    {payment.user?.photo ? (
                        <img src={payment.user.photo} alt={payment.user.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500"><User size={24} /></div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-bold text-white leading-tight truncate">{payment.user?.name || "Usuario Desconocido"}</h4>
                    <p className="text-sm text-purple-400 font-medium truncate">@{payment.user?.username || "eliminado"}</p>
                </div>
                <div className="text-right shrink-0">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block mb-1">ID Cliente</span>
                    <span className="font-mono text-gray-300 bg-gray-950 px-2.5 py-1 rounded-lg text-xs border border-gray-800">#{payment.user_id}</span>
                </div>
            </div>

            {/* Detalles de la Transacción */}
            <div className="space-y-3 flex-1 text-sm bg-gray-950 p-5 rounded-2xl border border-gray-800 shadow-inner mb-6">
                <div className="flex justify-between items-center"><span className="text-gray-500 font-medium">Producto Solicitado:</span> <span className="uppercase bg-purple-600/20 border border-purple-500/30 text-purple-400 px-2.5 py-1 rounded text-xs font-bold tracking-wider">{payment.item_type}</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-500 font-medium">Monto Reportado:</span> <span className="text-green-400 font-black text-xl">€{payment.amount_usd}</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-500 font-medium">Depositado:</span> <span className="text-white font-bold">{payment.amount_ves} Bs</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-500 font-medium">Tasa Euro:</span> <span className="font-mono text-gray-400">{payment.rate} Bs/€</span></div>
                
                <hr className="border-gray-800 my-4" />
                
                <div className="flex justify-between items-center"><span className="text-gray-500 font-medium">Banco Origen:</span> <span className="text-white font-bold text-right">{payment.bank}</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-500 font-medium">Tlf Origen:</span> <span className="text-white font-bold font-mono">{payment.phone}</span></div>
                
                <div className="flex flex-col mt-4 pt-2">
                    <span className="text-gray-500 mb-1.5 text-xs font-bold uppercase tracking-widest text-center">Referencia Bancaria</span> 
                    <span className="font-mono bg-black px-4 py-3 rounded-xl text-green-400 border border-green-900/50 text-center tracking-widest text-xl font-black shadow-inner">{payment.reference}</span>
                </div>
            </div>

            {/* Controles de Decisión */}
            {payment.status === 'pending' ? (
                <div className="space-y-4">
                    <div className="bg-purple-900/10 border border-purple-500/20 p-4 rounded-xl cursor-pointer hover:bg-purple-900/20 transition-colors" onClick={() => setGrantVip(!grantVip)}>
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={grantVip}
                                onChange={(e) => setGrantVip(e.target.checked)}
                                className="mt-1 w-4 h-4 text-purple-600 bg-gray-900 border-gray-600 rounded focus:ring-purple-500 pointer-events-none"
                            />
                            <div>
                                <span className="block text-white font-bold flex items-center gap-2">
                                    Otorgar membresía VIP <ShieldCheck size={16} className="text-yellow-500"/>
                                </span>
                                <span className="block text-xs text-gray-400 mt-1 leading-relaxed">Al aprobar este pago, se le asignará el rango Prime al usuario automáticamente por 30 días.</span>
                            </div>
                        </label>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={() => { onAction(payment.id, 'verify', grantVip); onClose(); }}
                            className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3.5 rounded-xl font-black flex justify-center items-center gap-2 transition-all shadow-[0_0_20px_rgba(22,163,74,0.3)] hover:scale-[1.02] active:scale-95"
                        >
                            <CheckCircle size={20}/> APROBAR
                        </button>
                        <button
                            onClick={() => { onAction(payment.id, 'reject', false); onClose(); }}
                            className="flex-1 bg-red-950/50 hover:bg-red-600 text-red-400 hover:text-white border border-red-900/50 hover:border-red-600 py-3.5 rounded-xl font-bold flex justify-center items-center gap-2 transition-all active:scale-95"
                        >
                            <XCircle size={20}/> Rechazar
                        </button>
                    </div>
                </div>
            ) : (
                <div className="mt-2 text-center p-5 bg-gray-950 rounded-2xl border border-gray-800 shadow-inner">
                    <p className="text-gray-400 text-sm font-medium">Este pago ya fue procesado y su estado definitivo es:</p>
                    <div className={`inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-xl border ${payment.status === 'approved' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                        {payment.status === 'approved' ? <CheckCircle size={18}/> : <XCircle size={18}/>}
                        <span className="text-lg font-black uppercase tracking-widest">
                            {payment.status === 'approved' ? 'Aprobado' : 'Rechazado'}
                        </span>
                    </div>
                </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}