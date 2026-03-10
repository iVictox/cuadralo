"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import FeedPost from "./FeedPost";

export default function PostModal({ post, onClose, onDelete }) {
  const stopPropagation = (e) => e.stopPropagation();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-cuadralo-bgLight/80 dark:bg-black/80 backdrop-blur-md p-4 transition-colors duration-500" onClick={onClose}>
      <button onClick={onClose} className="absolute top-6 right-6 p-4 bg-cuadralo-pink text-white rounded-2xl shadow-xl z-50 hover:scale-110 active:scale-95 transition-all"><X size={24} /></button>
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="w-full max-w-md max-h-[90vh] overflow-y-auto no-scrollbar rounded-[2.5rem] shadow-2xl" onClick={stopPropagation}>
        <FeedPost post={post} onDelete={onDelete} isModal={true} />
      </motion.div>
    </div>
  );
}