"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import FeedPost from "./FeedPost";

export default function PostModal({ post, onClose, onDelete }) {
  // Evitar que un click dentro del modal lo cierre
  const stopPropagation = (e) => e.stopPropagation();

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <button 
        onClick={onClose} 
        className="absolute top-6 right-6 md:top-10 md:right-10 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all z-50"
      >
        <X size={24} />
      </button>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-md max-h-[90vh] overflow-y-auto no-scrollbar rounded-3xl"
        onClick={stopPropagation}
      >
        {/* Reutilizamos tu componente original de FeedPost, pero le indicamos que está en un modal */}
        <FeedPost post={post} onDelete={onDelete} isModal={true} />
      </motion.div>
    </div>
  );
}