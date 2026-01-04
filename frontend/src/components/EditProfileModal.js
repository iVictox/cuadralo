"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Check, Camera, User } from "lucide-react";

export default function EditProfileModal({ onClose }) {
  // Datos iniciales
  const [formData, setFormData] = useState({
      name: "Víctor Hugo",
      username: "@victox",
      bio: "Diseñador & Desarrollador 💻",
      website: "cuadralo.com"
  });

  // Bloqueo de scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => document.body.style.overflow = "auto";
  }, []);

  const handleChange = (e) => {
      setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSave = () => {
      // Aquí iría la lógica de guardado
      alert("¡Perfil actualizado con éxito!");
      onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-lg h-[90vh] sm:h-auto bg-[#0f0518] sm:rounded-3xl rounded-t-3xl border border-white/10 flex flex-col shadow-2xl overflow-hidden"
      >
          {/* Header */}
          <div className="flex justify-between items-center p-5 border-b border-white/5 bg-[#1a1a1a]">
              <button onClick={onClose} className="text-gray-400 hover:text-white">Cancelar</button>
              <h2 className="font-bold text-white">Editar Perfil</h2>
              <button onClick={handleSave} className="text-cuadralo-pink font-bold hover:text-white transition-colors">Guardar</button>
          </div>

          {/* Formulario */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
              
              {/* Cambio de Foto */}
              <div className="flex flex-col items-center">
                  <div className="relative w-24 h-24 mb-3">
                      <img src="https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150" className="w-full h-full rounded-full object-cover opacity-60" />
                      <div className="absolute inset-0 flex items-center justify-center">
                          <Camera size={24} className="text-white drop-shadow-md" />
                      </div>
                  </div>
                  <button className="text-cuadralo-pink text-sm font-bold hover:text-white transition-colors">Cambiar foto de perfil</button>
              </div>

              {/* Campos */}
              <div className="space-y-5">
                  <InputField label="Nombre" name="name" value={formData.name} onChange={handleChange} />
                  <InputField label="Nombre de usuario" name="username" value={formData.username} onChange={handleChange} />
                  <InputField label="Presentación" name="bio" value={formData.bio} onChange={handleChange} textarea />
                  <InputField label="Enlace" name="website" value={formData.website} onChange={handleChange} />
              </div>

              <div className="pt-4 border-t border-white/5">
                  <button className="text-blue-400 text-sm font-medium hover:text-blue-300">Cambiar a cuenta profesional</button>
                  <div className="h-4" />
                  <button className="text-sm font-medium text-white hover:text-gray-300">Configuración de información personal</button>
              </div>
          </div>
      </motion.div>
    </motion.div>
  );
}

function InputField({ label, name, value, onChange, textarea }) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-bold uppercase ml-1">{label}</label>
            {textarea ? (
                <textarea 
                    name={name}
                    value={value}
                    onChange={onChange}
                    className="w-full bg-white/5 border-b border-white/20 focus:border-cuadralo-pink text-white py-2 px-1 outline-none transition-colors resize-none h-20"
                />
            ) : (
                <input 
                    type="text"
                    name={name}
                    value={value}
                    onChange={onChange}
                    className="w-full bg-transparent border-b border-white/20 focus:border-cuadralo-pink text-white py-2 px-1 outline-none transition-colors"
                />
            )}
        </div>
    );
}