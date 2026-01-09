"use client";

import { useState } from "react";
import { X, Lock, Trash2, ShieldAlert, Loader2, LogOut, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/utils/api";
import { useToast } from "@/context/ToastContext";
import { useRouter } from "next/navigation";

export default function SettingsModal({ onClose }) {
  const { showToast } = useToast();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState("security"); // 'security' | 'danger'
  const [isLoading, setIsLoading] = useState(false);

  // Estados Formulario Password
  const [passData, setPassData] = useState({ old: "", new: "", confirm: "" });

  // Estados Eliminar Cuenta
  const [deletePass, setDeletePass] = useState("");

  const handleLogout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/login");
  };

  const handleChangePassword = async (e) => {
      e.preventDefault();
      if (passData.new !== passData.confirm) return showToast("Las nuevas contraseñas no coinciden", "error");
      if (passData.new.length < 6) return showToast("Mínimo 6 caracteres", "error");

      setIsLoading(true);
      try {
          await api.put("/change-password", { 
              old_password: passData.old, 
              new_password: passData.new 
          });
          showToast("Contraseña actualizada correctamente");
          setPassData({ old: "", new: "", confirm: "" });
          onClose();
      } catch (error) {
          showToast(error.message || "Error al cambiar contraseña", "error");
      } finally {
          setIsLoading(false);
      }
  };

  const handleDeleteAccount = async () => {
      if (!deletePass) return showToast("Ingresa tu contraseña para confirmar", "error");
      
      setIsLoading(true);
      try {
          await api.delete("/me", { 
              data: { password: deletePass } // Axios envía body en 'data' para DELETE
          });
          
          showToast("Cuenta eliminada. Hasta luego.");
          localStorage.clear();
          router.push("/login");
      } catch (error) {
          showToast(error.message || "Contraseña incorrecta", "error");
          setIsLoading(false);
      }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        exit={{ scale: 0.9, opacity: 0 }} 
        className="bg-[#1a0b2e] w-full max-w-md rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#0f0518]">
            <h2 className="text-white font-bold flex items-center gap-2">
                <ShieldAlert size={20} className="text-cuadralo-pink"/> Ajustes de Cuenta
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white">
                <X size={20} />
            </button>
        </div>

        {/* Tabs */}
        <div className="flex p-2 gap-2 bg-[#0f0518]">
            <button 
                onClick={() => setActiveTab("security")}
                className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors ${activeTab === "security" ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"}`}
            >
                Seguridad
            </button>
            <button 
                onClick={() => setActiveTab("danger")}
                className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors ${activeTab === "danger" ? "bg-red-500/10 text-red-500" : "text-gray-500 hover:text-red-400"}`}
            >
                Zona de Peligro
            </button>
        </div>

        {/* Contenido */}
        <div className="p-6 flex-1 overflow-y-auto">
            
            {activeTab === "security" && (
                <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl mb-4">
                        <p className="text-xs text-blue-200 flex gap-2">
                            <Lock size={14} className="mt-0.5"/> 
                            Cambiar tu contraseña cerrará las sesiones en otros dispositivos.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <label className="text-xs text-gray-400 font-bold ml-1">Contraseña Actual</label>
                            <input 
                                type="password" 
                                value={passData.old}
                                onChange={e => setPassData({...passData, old: e.target.value})}
                                className="w-full bg-[#05020a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cuadralo-pink outline-none"
                                placeholder="••••••"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 font-bold ml-1">Nueva Contraseña</label>
                            <input 
                                type="password" 
                                value={passData.new}
                                onChange={e => setPassData({...passData, new: e.target.value})}
                                className="w-full bg-[#05020a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cuadralo-pink outline-none"
                                placeholder="••••••"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 font-bold ml-1">Confirmar Nueva</label>
                            <input 
                                type="password" 
                                value={passData.confirm}
                                onChange={e => setPassData({...passData, confirm: e.target.value})}
                                className="w-full bg-[#05020a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cuadralo-pink outline-none"
                                placeholder="••••••"
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading || !passData.old || !passData.new}
                        className="w-full py-3 bg-cuadralo-pink rounded-xl text-white font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex justify-center items-center gap-2 mt-4 disabled:opacity-50 disabled:scale-100"
                    >
                        {isLoading ? <Loader2 className="animate-spin"/> : <CheckCircle size={18}/>}
                        Actualizar Contraseña
                    </button>
                </form>
            )}

            {activeTab === "danger" && (
                <div className="space-y-6 text-center">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500 border border-red-500/20">
                        <Trash2 size={32} />
                    </div>
                    
                    <div>
                        <h3 className="text-white font-bold text-lg">Eliminar Cuenta</h3>
                        <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                            Esta acción es <span className="text-red-400 font-bold">irreversible</span>. 
                            Se borrarán todos tus datos, fotos, matches y mensajes permanentemente.
                        </p>
                    </div>

                    <div className="text-left bg-red-500/5 p-4 rounded-xl border border-red-500/10">
                        <label className="text-xs text-red-400 font-bold ml-1">Confirma tu contraseña</label>
                        <input 
                            type="password" 
                            value={deletePass}
                            onChange={e => setDeletePass(e.target.value)}
                            className="w-full bg-[#05020a] border border-red-500/30 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none mt-1"
                            placeholder="Tu contraseña actual"
                        />
                    </div>

                    <button 
                        onClick={handleDeleteAccount}
                        disabled={isLoading || !deletePass}
                        className="w-full py-3 bg-red-600 rounded-xl text-white font-bold shadow-lg hover:bg-red-500 transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 className="animate-spin"/> : <Trash2 size={18}/>}
                        Eliminar mi cuenta para siempre
                    </button>
                </div>
            )}

        </div>

        {/* Footer Logout */}
        <div className="p-4 border-t border-white/10 bg-[#0f0518]">
            <button 
                onClick={handleLogout}
                className="w-full py-3 border border-white/10 rounded-xl text-gray-300 font-bold hover:bg-white/5 transition-colors flex justify-center items-center gap-2"
            >
                <LogOut size={18} /> Cerrar Sesión
            </button>
        </div>
      </motion.div>
    </div>
  );
}