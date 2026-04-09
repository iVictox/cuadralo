import { useState } from "react";
import { X, Crown, User, CalendarPlus, Clock, AlertTriangle, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/utils/api";

export default function VipManageModal({ user, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [customDays, setCustomDays] = useState(30);

  if (!user) return null;

  const formatDate = (dateStr) => {
      return new Date(dateStr).toLocaleString('es-VE', {
          day: '2-digit', month: 'long', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
      });
  };

  const handleAction = async (endpoint, payload, confirmMsg) => {
      if (confirmMsg && !confirm(confirmMsg)) return;
      
      setLoading(true);
      try {
          await api.put(`/admin/users/${user.id}/${endpoint}`, payload);
          onSuccess();
      } catch (error) {
          alert(error.response?.data?.error || "Error al modificar la membresía");
      } finally {
          setLoading(false);
      }
  };

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
          className="bg-gray-900 rounded-2xl max-w-xl w-full border border-gray-700 shadow-2xl overflow-hidden relative flex flex-col"
        >
          <div className="bg-gray-950 px-6 py-5 border-b border-gray-800 flex justify-between items-center">
             <h3 className="text-xl font-black text-white flex items-center gap-2">
                 <Crown className="text-yellow-500" /> Panel de Control VIP
             </h3>
             <button onClick={onClose} className="text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 p-2 rounded-full transition-colors">
                 <X size={20} />
             </button>
          </div>

          <div className="p-6 md:p-8">
             {/* Cabecera Usuario */}
             <div className="flex items-center gap-4 bg-gray-800/50 p-4 rounded-2xl border border-gray-700/50 mb-8 shadow-inner">
                <div className="w-16 h-16 rounded-full bg-gray-800 overflow-hidden shrink-0 border-2 border-gray-600">
                    {user.photo ? (
                        <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500"><User size={24} /></div>
                    )}
                </div>
                <div>
                    <h4 className="text-xl font-bold text-white leading-tight">{user.name}</h4>
                    <p className="text-sm text-purple-400 font-medium">@{user.username}</p>
                </div>
             </div>

             {/* Modos de Control Dependiendo del Estado */}
             {user.is_prime ? (
                 <div className="space-y-6">
                     <div className="bg-yellow-500/10 border border-yellow-500/20 p-5 rounded-2xl text-center shadow-inner">
                         <span className="text-yellow-500 font-black uppercase tracking-widest text-xs block mb-1">Membresía Activa Hasta</span>
                         <span className="text-2xl font-black text-white tracking-tight">{formatDate(user.prime_expires_at)}</span>
                     </div>

                     <div className="grid grid-cols-2 gap-3">
                         <button disabled={loading} onClick={() => handleAction('vip/extend', { days: 7 })} className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl border border-gray-700 transition-colors flex items-center justify-center gap-2">
                            <CalendarPlus size={18} className="text-green-400"/> +7 Días
                         </button>
                         <button disabled={loading} onClick={() => handleAction('vip/extend', { days: 30 })} className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl border border-gray-700 transition-colors flex items-center justify-center gap-2">
                            <CalendarPlus size={18} className="text-green-400"/> +30 Días
                         </button>
                         <button disabled={loading} onClick={() => handleAction('vip/extend', { days: -7 }, "¿Seguro de restar 7 días al VIP?")} className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl border border-gray-700 transition-colors flex items-center justify-center gap-2">
                            <Clock size={18} className="text-orange-400"/> -7 Días
                         </button>
                         <button disabled={loading} onClick={() => handleAction('vip/extend', { days: -30 }, "¿Seguro de restar 30 días al VIP?")} className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl border border-gray-700 transition-colors flex items-center justify-center gap-2">
                            <Clock size={18} className="text-orange-400"/> -30 Días
                         </button>
                     </div>

                     <button disabled={loading} onClick={() => handleAction('vip/revoke', {}, "⚠️ ¿Estás seguro de ELIMINAR POR COMPLETO el VIP de este usuario de manera inmediata?")} className="w-full bg-red-950/50 hover:bg-red-600 text-red-400 hover:text-white border border-red-900/50 hover:border-red-500 font-black uppercase tracking-widest text-sm py-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-4">
                         <ShieldAlert size={18}/> Revocar Membresía Totalmente
                     </button>
                 </div>
             ) : (
                 <div className="space-y-6">
                     <div className="bg-gray-950 border border-gray-800 p-5 rounded-2xl text-center shadow-inner">
                         <AlertTriangle size={32} className="text-gray-600 mx-auto mb-2" />
                         <span className="text-gray-400 font-bold block">El usuario NO posee rango VIP en este momento.</span>
                     </div>

                     <div className="space-y-4">
                         <button disabled={loading} onClick={() => handleAction('vip/grant', { days: 30 })} className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase tracking-widest text-sm py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                             Otorgar VIP (Mes Completo)
                         </button>

                         <div className="flex gap-3 bg-gray-800 p-2 rounded-xl border border-gray-700">
                             <input 
                                 type="number" 
                                 min="1" 
                                 value={customDays} 
                                 onChange={(e) => setCustomDays(e.target.value)}
                                 className="w-24 bg-gray-950 text-white text-center font-bold rounded-lg border border-gray-700 outline-none focus:border-yellow-500"
                             />
                             <button disabled={loading} onClick={() => handleAction('vip/grant', { days: parseInt(customDays) })} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition-colors">
                                 Otorgar Días Personalizados
                             </button>
                         </div>
                     </div>
                 </div>
             )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}