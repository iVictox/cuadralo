"use client";

import { useState, useEffect } from "react";
import { X, Lock, Trash2, Loader2, LogOut, Palette, Moon, Sun, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/utils/api";
import { useToast } from "@/context/ToastContext";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";

export default function SettingsModal({ onClose }) {
  const { showToast } = useToast();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState("appearance");
  const [isLoading, setIsLoading] = useState(false);
  const [currentTheme, setCurrentTheme] = useState("dark");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("theme") || "dark";
    setCurrentTheme(saved);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const toggleTheme = (themeName) => {
    setCurrentTheme(themeName);
    localStorage.setItem("theme", themeName);
    document.documentElement.className = themeName;
    showToast(`Modo ${themeName === 'dark' ? 'Oscuro' : 'Claro'} activado`);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return showToast("Las contraseñas no coinciden", "error");
    setIsLoading(true);
    try {
      await api.put("/change-password", { old_password: oldPassword, new_password: newPassword });
      showToast("¡Contraseña cambiada!");
      setTimeout(() => handleLogout(), 2000);
    } catch (error) {
      showToast(error.message || "Error", "error");
    } finally { setIsLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-cuadralo-cardLight dark:bg-cuadralo-cardDark w-full max-w-md rounded-[2.5rem] border border-black/5 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col h-[550px]">
        
        <div className="p-5 border-b border-black/5 dark:border-white/10 flex justify-between items-center">
            <h2 className="text-cuadralo-textLight dark:text-white font-black uppercase tracking-widest text-sm flex items-center gap-2">
                <Palette size={18} className="text-cuadralo-pink"/> Ajustes
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full text-cuadralo-textMutedLight dark:text-gray-400 transition-all"><X size={20} /></button>
        </div>

        <div className="flex p-2 gap-1 bg-cuadralo-bgLight dark:bg-black/20">
            {['appearance', 'security', 'danger'].map((t) => (
                <button key={t} onClick={() => setActiveTab(t)} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-cuadralo-pink text-white shadow-md' : 'text-cuadralo-textMutedLight dark:text-gray-500 hover:text-cuadralo-pink'}`}>
                    {t === 'appearance' ? 'Tema' : t === 'security' ? 'Seguridad' : 'Peligro'}
                </button>
            ))}
        </div>

        <div className="p-8 flex-1 overflow-y-auto no-scrollbar">
            {activeTab === "appearance" && (
                <div className="space-y-6">
                    <h3 className="text-sm font-bold text-center text-cuadralo-textLight dark:text-white">Estilo de la Interfaz</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => toggleTheme("light")} className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all ${currentTheme === 'light' ? 'border-cuadralo-pink bg-cuadralo-pink/5' : 'border-black/5 dark:border-white/5 bg-cuadralo-bgLight dark:bg-white/5'}`}>
                            <Sun size={32} className={currentTheme === 'light' ? 'text-cuadralo-pink' : 'text-gray-400'} />
                            <span className="text-[10px] font-black uppercase text-cuadralo-textLight dark:text-white">Claro</span>
                        </button>
                        <button onClick={() => toggleTheme("dark")} className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all ${currentTheme === 'dark' ? 'border-cuadralo-pink bg-cuadralo-pink/5' : 'border-black/5 dark:border-white/5 bg-cuadralo-bgLight dark:bg-white/5'}`}>
                            <Moon size={32} className={currentTheme === 'dark' ? 'text-cuadralo-pink' : 'text-gray-400'} />
                            <span className="text-[10px] font-black uppercase text-cuadralo-textLight dark:text-white">Oscuro</span>
                        </button>
                    </div>
                </div>
            )}

            {activeTab === "security" && (
                <form onSubmit={handleChangePassword} className="space-y-4">
                    <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} className="w-full bg-cuadralo-bgLight dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-2xl p-4 text-sm text-cuadralo-textLight dark:text-white outline-none focus:ring-2 focus:ring-cuadralo-pink" placeholder="Contraseña Actual" />
                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-cuadralo-bgLight dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-2xl p-4 text-sm text-cuadralo-textLight dark:text-white outline-none focus:ring-2 focus:ring-cuadralo-pink" placeholder="Nueva Contraseña" />
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full bg-cuadralo-bgLight dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-2xl p-4 text-sm text-cuadralo-textLight dark:text-white outline-none focus:ring-2 focus:ring-cuadralo-pink" placeholder="Confirmar" />
                    <button type="submit" disabled={isLoading} className="w-full py-4 bg-cuadralo-pink text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest shadow-lg active:scale-95 transition-all">
                        {isLoading ? <Loader size="sm" /> : "Actualizar"}
                    </button>
                </form>
            )}

            {activeTab === "danger" && (
                <div className="space-y-6 text-center">
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500"><Trash2 size={40}/></div>
                    <p className="text-xs text-cuadralo-textMutedLight dark:text-gray-400 uppercase font-black tracking-tighter leading-relaxed">¿Eliminar cuenta? Perderás tus mensajes, fotos y matches para siempre.</p>
                    <button onClick={() => alert("Función de borrado activada")} className="w-full py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all">Borrar Cuenta</button>
                </div>
            )}
        </div>

        <div className="p-4 border-t border-black/5 dark:border-white/5 text-center">
            <button onClick={handleLogout} className="text-[10px] font-black uppercase text-cuadralo-textMutedLight dark:text-gray-500 hover:text-red-500 transition-colors flex items-center justify-center gap-2 w-full"><LogOut size={14}/> Cerrar Sesión</button>
        </div>
      </motion.div>
    </div>
  );
}