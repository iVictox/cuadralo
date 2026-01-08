"use client";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle, Info, X } from "lucide-react";

export default function ConfirmModal({ isOpen, title, message, confirmText, cancelText, variant, onConfirm, onCancel }) {
  if (!isOpen) return null;

  // Colores según la variante (danger, info, success)
  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return { icon: <AlertTriangle size={24} className="text-red-500" />, btn: "bg-red-500 hover:bg-red-600" };
      case "success":
        return { icon: <CheckCircle size={24} className="text-green-500" />, btn: "bg-green-600 hover:bg-green-700" };
      default:
        return { icon: <Info size={24} className="text-blue-500" />, btn: "bg-blue-600 hover:bg-blue-700" };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="relative bg-[#1a0b2e] border border-white/10 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 text-center">
          <div className="mx-auto w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
            {styles.icon}
          </div>
          
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            {message}
          </p>

          <div className="flex gap-3">
            <button 
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
            >
              {cancelText}
            </button>
            <button 
              onClick={onConfirm}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium text-white shadow-lg transition-all transform active:scale-95 ${styles.btn}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}