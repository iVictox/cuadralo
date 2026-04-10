"use client";
import { useState } from "react";
import { X, Flag, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/utils/api";

const REPORT_REASONS = [
  "Contenido inapropiado o explícito",
  "Acoso, odio o bullying",
  "Spam o fraude",
  "Perfil falso o suplantación",
  "Otro motivo"
];

export default function ReportModal({ targetType, targetId, onClose }) {
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    const finalReason = reason === "Otro motivo" ? customReason : reason;
    if (!finalReason.trim()) return;

    setLoading(true);
    try {
      await api.post("/reports", {
        target_type: targetType,
        target_id: Number(targetId),
        reason: finalReason
      });
      setSuccess(true);
      setTimeout(() => onClose(), 2000);
    } catch (error) {
      alert(error.response?.data?.error || "Error enviando el reporte.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-sm bg-[#121212] rounded-[2rem] border border-white/10 shadow-2xl p-6 relative overflow-hidden"
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 transition-colors"><X size={18} /></button>
        
        {success ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
                <CheckCircle2 size={64} className="text-green-500 mb-4 animate-bounce" />
                <h3 className="text-xl font-black text-white tracking-tight">Reporte Enviado</h3>
                <p className="text-sm text-gray-400 mt-2">El equipo de moderación lo revisará pronto.</p>
            </div>
        ) : (
            <>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20">
                        <Flag size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-white leading-tight">Reportar</h3>
                        <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Ayúdanos a mantenernos seguros</p>
                    </div>
                </div>

                <div className="space-y-2 mb-6">
                    {REPORT_REASONS.map(r => (
                        <label key={r} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${reason === r ? 'bg-orange-500/10 border-orange-500/50' : 'bg-black/20 border-white/5 hover:bg-white/5'}`}>
                            <input type="radio" name="report_reason" value={r} checked={reason === r} onChange={(e) => setReason(e.target.value)} className="hidden" />
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${reason === r ? 'border-orange-500' : 'border-gray-500'}`}>
                                {reason === r && <div className="w-2 h-2 bg-orange-500 rounded-full" />}
                            </div>
                            <span className={`text-sm font-semibold ${reason === r ? 'text-orange-400' : 'text-gray-300'}`}>{r}</span>
                        </label>
                    ))}

                    {reason === "Otro motivo" && (
                        <motion.textarea 
                            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                            placeholder="Describe el problema detalladamente..."
                            value={customReason}
                            onChange={e => setCustomReason(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-orange-500 resize-none h-24 mt-2"
                        />
                    )}
                </div>

                <button 
                    onClick={handleSubmit}
                    disabled={!reason || (reason === "Otro motivo" && !customReason.trim()) || loading}
                    className="w-full bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:grayscale text-white font-black uppercase tracking-widest text-sm py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : "Enviar a Moderación"}
                </button>
            </>
        )}
      </motion.div>
    </div>
  );
}