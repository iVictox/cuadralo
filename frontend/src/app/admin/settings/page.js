"use client";
import { useEffect, useState } from "react";
import { api } from "@/utils/api";
import { Settings, Save, Server, DollarSign, ShieldAlert } from "lucide-react";

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    platform_name: "Cuadralo",
    maintenance_mode: "false",
    vip_price_usd: "5.00"
  });
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await api.get("/admin/settings");
        if (Object.keys(data).length > 0) {
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
      console.error(error);
      alert("Error crítico guardando las configuraciones del servidor.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <Settings className="text-purple-500" size={32} /> Ajustes del Sistema
        </h1>
        <p className="text-gray-400 mt-2 text-sm">Modifica las variables globales de la plataforma. Los cambios aplicados aquí afectan directamente la base de datos y la aplicación en vivo.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Bloque: Identidad */}
        <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden shadow-lg">
          <div className="bg-gray-900 px-6 py-4 border-b border-gray-700 flex items-center gap-2">
            <Server className="text-purple-400" size={18} />
            <h2 className="text-lg font-bold text-white">Identidad del Servidor</h2>
          </div>
          <div className="p-6">
            <label className="block text-sm font-bold text-gray-300 mb-2">Nombre de la Plataforma</label>
            <input
              type="text"
              name="platform_name"
              value={settings.platform_name}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
            />
            <p className="text-xs text-gray-500 mt-2">Este nombre se mostrará en metadatos y correos automáticos.</p>
          </div>
        </div>

        {/* Bloque: Economía */}
        <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden shadow-lg">
          <div className="bg-gray-900 px-6 py-4 border-b border-gray-700 flex items-center gap-2">
            <DollarSign className="text-green-400" size={18} />
            <h2 className="text-lg font-bold text-white">Economía y Monetización</h2>
          </div>
          <div className="p-6">
            <label className="block text-sm font-bold text-gray-300 mb-2">Precio de Suscripción VIP (USD)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
              <input
                type="number"
                step="0.01"
                name="vip_price_usd"
                value={settings.vip_price_usd}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-600 rounded-xl pl-8 pr-4 py-3 text-green-400 font-mono font-bold text-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">Define el valor del producto principal mostrado a los usuarios.</p>
          </div>
        </div>

        {/* Bloque: Seguridad */}
        <div className="bg-red-900/10 rounded-2xl border border-red-900/30 overflow-hidden shadow-lg">
          <div className="bg-red-900/20 px-6 py-4 border-b border-red-900/30 flex items-center gap-2">
            <ShieldAlert className="text-red-500" size={18} />
            <h2 className="text-lg font-bold text-red-400">Zona de Riesgo (Seguridad)</h2>
          </div>
          <div className="p-6">
            <label className="block text-sm font-bold text-gray-300 mb-2">Estado del Servidor</label>
            <select
              name="maintenance_mode"
              value={settings.maintenance_mode}
              onChange={handleChange}
              className={`w-full bg-gray-900 border rounded-xl px-4 py-3 text-white focus:outline-none transition-all ${settings.maintenance_mode === 'true' ? 'border-red-500 text-red-400 font-bold' : 'border-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'}`}
            >
              <option value="false">🟢 Sistema en Línea (Operativo)</option>
              <option value="true">🔴 Activar Modo Mantenimiento</option>
            </select>
            <p className="text-xs text-red-400/70 mt-2">Al activar el modo mantenimiento, ningún usuario normal podrá entrar a la aplicación.</p>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-800">
          {savedSuccess && <span className="text-green-400 text-sm font-medium animate-pulse">¡Datos guardados correctamente!</span>}
          <button
            type="submit"
            disabled={saving}
            className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_0_rgba(168,85,247,0.39)] hover:shadow-[0_6px_20px_rgba(168,85,247,0.23)]"
          >
            {saving ? (
              <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Aplicando...</span>
            ) : (
              <><Save size={20} /> Guardar Configuración Global</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}