"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

export default function Toast({ message, type = "success", onClose }) {
  const icons = {
    success: <CheckCircle className="text-green-400" size={20} />,
    error: <AlertCircle className="text-red-400" size={20} />,
    info: <Info className="text-blue-400" size={20} />,
  };

  const colors = {
    success: "border-green-500/20 bg-green-500/10",
    error: "border-red-500/20 bg-red-500/10",
    info: "border-blue-500/20 bg-blue-500/10",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[1000] min-w-[300px] flex items-center justify-between gap-4 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl ${colors[type]}`}
    >
      <div className="flex items-center gap-3">
        {icons[type]}
        <p className="text-sm font-medium text-white/90">{message}</p>
      </div>
      <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
        <X size={16} className="text-gray-400" />
      </button>
    </motion.div>
  );
}