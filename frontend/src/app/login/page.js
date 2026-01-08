"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; 
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { api } from "@/utils/api"; 

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  
  // Estados para manejo de carga y errores
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
        // 1. Llamada al Backend
        const response = await api.post("/login", formData);
        
        console.log("Login exitoso:", response);

        // 2. Guardar Token y Usuario en LocalStorage
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));

        // 3. Redirigir al Home
        router.push("/");

    } catch (err) {
        console.error("Error login:", err);
        setError("Correo o contraseña incorrectos.");
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0f0518] flex items-center justify-center relative overflow-hidden">
      
      {/* Fondo Animado */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-cuadralo-purple/30 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-cuadralo-pink/20 rounded-full blur-[120px] animate-pulse delay-1000" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 relative z-10"
      >
        {/* Logo */}
        <div className="flex justify-center mb-10">
            <div className="relative w-48 h-16">
                 <Image src="/logo.svg" fill className="object-contain" alt="Cuadralo" priority />
            </div>
        </div>

        {/* Tarjeta de Login */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-3xl font-bold text-white mb-2 text-center">¡Hola de nuevo! 👋</h2>
            <p className="text-gray-400 text-center mb-8 text-sm">Ingresa tus credenciales para continuar.</p>

            <form onSubmit={handleLogin} className="space-y-5">
                
                {/* Email */}
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Correo Electrónico</label>
                    <div className="relative group">
                        <Mail className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-cuadralo-pink transition-colors" size={20} />
                        <input 
                            type="email" 
                            placeholder="ejemplo@cuadralo.com"
                            className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-cuadralo-pink transition-all"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            // --- PROPIEDADES PARA CORREGIR TECLADO MÓVIL ---
                            autoCapitalize="none"
                            autoCorrect="off"
                            spellCheck="false"
                        />
                    </div>
                </div>

                {/* Password */}
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Contraseña</label>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-cuadralo-pink transition-colors" size={20} />
                        <input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="••••••••"
                            className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-12 text-white placeholder-gray-600 focus:outline-none focus:border-cuadralo-pink transition-all"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            // --- PROPIEDADES PARA CORREGIR TECLADO MÓVIL ---
                            autoCapitalize="none"
                            autoCorrect="off"
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-3.5 text-gray-500 hover:text-white transition-colors"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>

                {/* Mensaje de Error */}
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: "auto" }}
                        className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl flex items-center gap-2 text-red-400 text-xs"
                    >
                        <AlertCircle size={16} />
                        {error}
                    </motion.div>
                )}

                {/* Olvidé contraseña */}
                <div className="flex justify-end">
                    <Link href="#" className="text-xs text-cuadralo-pink hover:text-white transition-colors">
                        ¿Olvidaste tu contraseña?
                    </Link>
                </div>

                {/* Botón Login */}
                <button 
                    type="submit"
                    disabled={isLoading}
                    className={`w-full bg-gradient-to-r from-cuadralo-pink to-cuadralo-purple py-3.5 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all ${isLoading ? 'opacity-70 cursor-wait' : 'hover:shadow-cuadralo-pink/50 hover:scale-[1.02]'}`}
                >
                    {isLoading ? (
                        <>Iniciando... <Loader2 size={20} className="animate-spin" /></>
                    ) : (
                        <>Iniciar Sesión <ArrowRight size={20} /></>
                    )}
                </button>

            </form>

            {/* Separador */}
            <div className="relative my-8">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                <div className="relative flex justify-center text-sm"><span className="px-2 bg-[#150a22] text-gray-500 rounded text-xs">O continúa con</span></div>
            </div>

            {/* Social Login (Simulado) */}
            <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center gap-2 py-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" className="w-5 h-5" alt="Google" />
                    <span className="text-sm font-medium text-white">Google</span>
                </button>
                <button className="flex items-center justify-center gap-2 py-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" className="w-5 h-5 invert" alt="Apple" />
                    <span className="text-sm font-medium text-white">Apple</span>
                </button>
            </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-8">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="text-white font-bold hover:text-cuadralo-pink transition-colors">
                Regístrate aquí
            </Link>
        </p>

      </motion.div>
    </div>
  );
}