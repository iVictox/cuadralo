"use client";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, Info, X } from "lucide-react";

export default function ConfirmModal({ isOpen, title, message, confirmText, cancelText, variant, onConfirm, onCancel }) {
  if (!isOpen) return null;

  // Colores según la variante (danger, info, success)
  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return { 
          icon: <AlertTriangle size={28} className="text-red-500" />, 
          iconBg: "bg-red-500/10 border-red-500/20",
          btn: "bg-red-500 hover:bg-red-600 shadow-red-500/30 text-white" 
        };
      case "success":
        return { 
          icon: <CheckCircle size={28} className="text-green-500" />, 
          iconBg: "bg-green-500/10 border-green-500/20",
          btn: "bg-green-500 hover:bg-green-600 shadow-green-500/30 text-white" 
        };
      default:
        return { 
          icon: <Info size={28} className="text-cuadralo-pink" />, 
          iconBg: "bg-cuadralo-pink/10 border-cuadralo-pink/20",
          btn: "bg-cuadralo-pink hover:bg-pink-600 shadow-cuadralo-pink/30 text-white" 
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-sm overflow-hidden rounded-[2rem] bg-white/90 dark:bg-[#1a0b2e]/90 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-2xl dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)]"
      >
        <button 
          onClick={onCancel} 
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-all"
        >
          <X size={18} strokeWidth={3} />
        </button>

        <div className="p-8 text-center flex flex-col items-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-5 border shadow-inner ${styles.iconBg}`}>
            {styles.icon}
          </div>
          
          <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">{title}</h3>
          
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-8 leading-relaxed font-medium">
            {message}
          </p>

          <div className="flex gap-3 w-full">
            <button 
              onClick={onCancel}
              className="flex-1 py-3.5 rounded-2xl text-sm font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors border border-transparent"
            >
              {cancelText}
            </button>
            <button 
              onClick={onConfirm}
              className={`flex-1 py-3.5 rounded-2xl text-sm font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 ${styles.btn}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}