"use client";
import { useEffect, useState } from "react";
import { api } from "@/utils/api";
import { Settings, Save, Server, DollarSign, ShieldAlert, Sparkles } from "lucide-react";

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    platform_name: "Cuadralo",
    maintenance_mode: "false",
    vip_price_usd: "5.00",
    bs_exchange_rate: "36.50",
    vip_duration_days: "30"
  });
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await api.get("/admin/settings");
        if (data && Object.keys(data).length > 0) {
          setSettings(prev => ({ ...prev, ...data }));
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    try {
      await api.put("/admin/settings", settings);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (error) {
      alert("Error guardando configuraciones");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <Settings className="text-purple-500" size={32} /> Configuración Global
        </h1>
        <p className="text-gray-400 mt-2">Los cambios aquí se reflejan inmediatamente en la aplicación frontend de todos los usuarios.</p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <div className="space-y-8">
            {/* Bloque: Identidad */}
            <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
            <div className="bg-gray-950 px-6 py-4 border-b border-gray-800 flex items-center gap-2">
                <Server className="text-purple-400" size={18} />
                <h2 className="text-lg font-bold text-white">Identidad del Servidor</h2>
            </div>
            <div className="p-6">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Nombre de la Plataforma</label>
                <input type="text" name="platform_name" value={settings.platform_name} onChange={handleChange} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none" />
            </div>
            </div>

            {/* Bloque: Seguridad */}
            <div className="bg-red-950/20 rounded-2xl border border-red-900/30 overflow-hidden shadow-2xl">
            <div className="bg-red-950/50 px-6 py-4 border-b border-red-900/30 flex items-center gap-2">
                <ShieldAlert className="text-red-500" size={18} />
                <h2 className="text-lg font-bold text-red-400">Zona de Emergencia</h2>
            </div>
            <div className="p-6">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Modo Mantenimiento</label>
                <select name="maintenance_mode" value={settings.maintenance_mode} onChange={handleChange} className={`w-full bg-gray-950 border rounded-xl px-4 py-3 text-white outline-none ${settings.maintenance_mode === 'true' ? 'border-red-500 text-red-400 font-bold' : 'border-gray-800'}`}>
                <option value="false">Desactivado (App Operativa)</option>
                <option value="true">Activado (Nadie puede entrar)</option>
                </select>
            </div>
            </div>
        </div>

        <div className="space-y-8">
            {/* Bloque: Economía VIP */}
            <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
            <div className="bg-gray-950 px-6 py-4 border-b border-gray-800 flex items-center gap-2">
                <Sparkles className="text-yellow-500" size={18} />
                <h2 className="text-lg font-bold text-white">Monetización y VIP</h2>
            </div>
            <div className="p-6 space-y-6">
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Precio USD</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                            <input type="number" step="0.01" name="vip_price_usd" value={settings.vip_price_usd} onChange={handleChange} className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-8 pr-4 py-3 text-green-400 font-mono font-bold outline-none" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Duración (Días)</label>
                        <input type="number" name="vip_duration_days" value={settings.vip_duration_days} onChange={handleChange} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white font-mono outline-none" />
                    </div>
                </div>

                <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2"><DollarSign size={14} className="text-green-500"/> Tasa de Cambio (VES)</label>
                    <div className="flex items-center gap-3">
                        <input type="number" step="0.01" name="bs_exchange_rate" value={settings.bs_exchange_rate} onChange={handleChange} className="w-1/2 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white font-mono outline-none" />
                        <div className="text-sm text-gray-400">
                            Precio final app: <span className="font-bold text-white">{(parseFloat(settings.vip_price_usd) * parseFloat(settings.bs_exchange_rate)).toFixed(2)} Bs</span>
                        </div>
                    </div>
                </div>

            </div>
            </div>

            {/* Acción Final */}
            <div className="flex flex-col gap-3 pt-4">
                {savedSuccess && <div className="bg-green-500/20 border border-green-500 text-green-400 p-3 rounded-xl text-center text-sm font-bold animate-pulse">¡Datos guardados en caché y BD!</div>}
                <button type="submit" disabled={saving} className="bg-purple-600 hover:bg-purple-500 text-white w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-all disabled:opacity-50">
                    {saving ? "Sincronizando..." : "Aplicar Cambios Globales"}
                </button>
            </div>
        </div>

      </form>
    </div>
  );
}