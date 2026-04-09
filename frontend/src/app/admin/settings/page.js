"use client";
import { useEffect, useState } from "react";
import { api } from "@/utils/api";

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    platform_name: "Cuadralo",
    maintenance_mode: "false",
    vip_price_usd: "5.00"
  });
  const [saving, setSaving] = useState(false);

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
    try {
      await api.put("/admin/settings", settings);
      alert("Configuraciones guardadas con éxito.");
    } catch (error) {
      console.error(error);
      alert("Error guardando configuraciones");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Configuración del Sistema</h1>

      <form onSubmit={handleSave} className="bg-cuadralo-cardDark p-6 rounded-xl border border-cuadralo-purple/30 space-y-6 shadow-glass-dark">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Nombre de la Plataforma</label>
          <input
            type="text"
            name="platform_name"
            value={settings.platform_name}
            onChange={handleChange}
            className="w-full bg-cuadralo-bgDark border border-cuadralo-purple/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cuadralo-pink focus:ring-1 focus:ring-cuadralo-pink transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Modo Mantenimiento</label>
          <select
            name="maintenance_mode"
            value={settings.maintenance_mode}
            onChange={handleChange}
            className="w-full bg-cuadralo-bgDark border border-cuadralo-purple/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cuadralo-pink focus:ring-1 focus:ring-cuadralo-pink transition-colors"
          >
            <option value="false">Desactivado</option>
            <option value="true">Activado</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Precio VIP Mensual (USD)</label>
          <input
            type="number"
            step="0.01"
            name="vip_price_usd"
            value={settings.vip_price_usd}
            onChange={handleChange}
            className="w-full bg-cuadralo-bgDark border border-cuadralo-purple/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cuadralo-pink focus:ring-1 focus:ring-cuadralo-pink transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-gradient-to-r from-cuadralo-purple to-cuadralo-pink hover:opacity-90 text-white py-3 rounded-lg font-medium transition-opacity disabled:opacity-50 mt-4"
        >
          {saving ? "Guardando..." : "Guardar Cambios"}
        </button>
      </form>
    </div>
  );
}
