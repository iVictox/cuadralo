"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import Toast from "@/components/Toast";

// Inicializamos con null para detectar si falta el Provider
const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000); // Se quita solo tras 4s
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  
  // --- SEGURIDAD ANTI-CRASH ---
  if (!context) {
    console.warn("⚠️ useToast fue llamado fuera del ToastProvider. Verifica tu layout.js");
    // Devolvemos una función vacía para que la app NO se rompa
    return { showToast: (msg) => console.log("Toast (Sin UI):", msg) };
  }
  
  return context;
};