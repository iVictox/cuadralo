"use client";

import { createContext, useContext, useState, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import ConfirmModal from "@/components/ConfirmModal";

const ConfirmContext = createContext();

export function ConfirmProvider({ children }) {
  const [state, setState] = useState({ isOpen: false, title: "", message: "", variant: "info" });
  const fn = useRef(null); // Aquí guardaremos la promesa (resolve)

  const confirm = ({ 
    title = "¿Estás seguro?", 
    message = "Esta acción no se puede deshacer.", 
    confirmText = "Confirmar", 
    cancelText = "Cancelar", 
    variant = "danger" 
  }) => {
    return new Promise((resolve) => {
      setState({ isOpen: true, title, message, confirmText, cancelText, variant });
      fn.current = resolve;
    });
  };

  const handleConfirm = () => {
    setState((prev) => ({ ...prev, isOpen: false }));
    if (fn.current) fn.current(true); // Resuelve TRUE
  };

  const handleCancel = () => {
    setState((prev) => ({ ...prev, isOpen: false }));
    if (fn.current) fn.current(false); // Resuelve FALSE
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <AnimatePresence>
        {state.isOpen && (
          <ConfirmModal 
            {...state} 
            onConfirm={handleConfirm} 
            onCancel={handleCancel} 
          />
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
}

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error("useConfirm debe usarse dentro de ConfirmProvider");
  return context;
};