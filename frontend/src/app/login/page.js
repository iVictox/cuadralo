"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; 
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { api } from "@/utils/api"; 

// ✅ Importaciones para los logins sociales
import { useGoogleLogin } from '@react-oauth/google';
import AppleSignin from 'react-apple-signin-auth';

// ⚠️ RECUERDA: Este ID de Apple debe ser el tuyo real de desarrollador
const APPLE_CLIENT_ID = "com.tuempresa.cuadralo.web"; 

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // --- LÓGICA DE LOGIN NORMAL ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
        const response = await api.post("/login", formData);
        
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));

        router.push("/");
    } catch (err) {
        console.error("Error login:", err);
        setError("Correo o contraseña incorrectos.");
        setIsLoading(false);
    }
  };

  // --- LÓGICA DE LOGIN CON GOOGLE ---
  const loginWithGoogle = useGoogleLogin({
    onSuccess: (codeResponse) => {
        setIsLoading(true);
        setError("");
        
        fetch(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${codeResponse.access_token}`, {
            headers: { Authorization: `Bearer ${codeResponse.access_token}`, Accept: 'application/json' }
        })
        .then(res => res.json())
        .then(async (data) => {
            try {
                // Enviamos el correo a la ruta que creamos para buscar el usuario y loguearlo
                const response = await api.post("/login/google", { email: data.email });
                
                localStorage.setItem("token", response.token);
                localStorage.setItem("user", JSON.stringify(response.user));

                router.push("/");
            } catch (err) {
                console.error("No existe la cuenta:", err);
                setError("No encontramos una cuenta con este Google. Por favor, regístrate.");
                setIsLoading(false);
            }
        })
        .catch(err => {
            console.error("Error de fetch a Google:", err);
            setError("Error al obtener datos de Google.");
            setIsLoading(false);
        });
    },
    onError: (error) => {
        console.error('Login Failed:', error);
        setError("Error al conectar con Google.");
    }
  });

  // --- LÓGICA DE LOGIN CON APPLE ---
  const handleAppleResponse = async (response) => {
      if (!response.authorization) {
          setError("Error al conectar con Apple");
          return;
      }
      try {
          setIsLoading(true);
          setError("");

          // Decodificamos el JWT manualmente
          const base64Url = response.authorization.id_token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          const decoded = JSON.parse(jsonPayload);

          // Reutilizamos nuestra ruta social para validar el email y entrar directo
          const apiResponse = await api.post("/login/google", { email: decoded.email });
          
          localStorage.setItem("token", apiResponse.token);
          localStorage.setItem("user", JSON.stringify(apiResponse.user));

          router.push("/");
      } catch (err) {
          console.error("Error logueando con Apple:", err);
          setError("No encontramos una cuenta vinculada a este Apple ID. Regístrate primero.");
          setIsLoading(false);
      }
  };

  return (
    <div className="min-h-screen w-full flex bg-cuadralo-bgLight dark:bg-[#0f0518] overflow-hidden text-cuadralo-textLight dark:text-white transition-colors duration-500">
      
      {/* PANEL IZQUIERDO (Branding - Solo Escritorio) */}
      <div className="hidden lg:flex w-[45%] relative bg-black items-center justify-center p-16 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cuadralo-pink/20 via-[#0f0518] to-purple-900/40 z-0" />
          <div className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] bg-cuadralo-pink/30 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute -bottom-[20%] -right-[10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse delay-1000" />
          
          <div className="relative z-10 w-full max-w-md">
             <div className="w-48 h-12 relative mb-16">
                 <Image src="/logo.svg" fill className="object-contain dark:invert-0 invert" alt="Cuadralo" priority />
             </div>
             
             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                 <h1 className="text-5xl xl:text-6xl font-black text-white tracking-tighter mb-6 leading-[1.1]">
                    Bienvenido de nuevo.
                 </h1>
                 <p className="text-gray-400 text-lg font-medium leading-relaxed">
                    Ingresa tus credenciales y vuelve a conectar con tu comunidad en Cuadralo.
                 </p>
             </motion.div>
          </div>

          <div className="absolute bottom-12 left-16 text-white/30 text-sm font-bold tracking-widest uppercase">
              © {new Date().getFullYear()} Cuadralo App
          </div>
      </div>

      {/* PANEL DERECHO (Formulario) */}
      <div className="w-full lg:w-[55%] flex flex-col items-center justify-center p-6 sm:p-12 md:p-20 relative z-10">
          
          <div className="absolute top-8 left-8 lg:hidden w-32 h-8 relative">
               <Image src="/logo.svg" fill className="object-contain dark:invert-0 invert" alt="Cuadralo" priority />
          </div>

          <div className="w-full max-w-md mt-16 lg:mt-0">
              <AnimatePresence mode="wait">
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                      
                      <h2 className="text-3xl font-black mb-8 lg:hidden">¡Hola de nuevo! 👋</h2>
                      
                      <form onSubmit={handleLogin} className="space-y-5">
                          
                          <FloatingInput 
                              label="Correo electrónico" 
                              icon={<Mail size={20}/>} 
                              type="email" 
                              value={formData.email} 
                              onChange={(v) => setFormData({...formData, email: v.toLowerCase().replace(/\s+/g, '')})} 
                          />
                          
                          <FloatingPasswordInput 
                              label="Contraseña"
                              icon={<Lock size={20}/>}
                              value={formData.password}
                              onChange={(v) => setFormData({...formData, password: v})}
                              showPassword={showPassword}
                              setShowPassword={setShowPassword}
                          />

                          {error && <ErrorMessage msg={error} />}

                          <div className="flex justify-end mt-2">
                              <Link href="#" className="text-[10px] font-black text-gray-500 hover:text-cuadralo-pink transition-colors uppercase tracking-widest">
                                  ¿Olvidaste tu contraseña?
                              </Link>
                          </div>

                          <button 
                              type="submit" 
                              disabled={isLoading}
                              className={`w-full py-5 bg-cuadralo-textLight dark:bg-white text-cuadralo-bgLight dark:text-black rounded-2xl font-black text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all mt-4 flex items-center justify-center gap-3 ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
                          >
                              {isLoading ? <Loader2 size={24} className="animate-spin" /> : <>Iniciar Sesión <ArrowRight size={24} /></>}
                          </button>
                      </form>
                      
                      {/* Separador */}
                      <div className="relative my-10">
                          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-black/10 dark:border-white/10"></div></div>
                          <div className="relative flex justify-center text-sm">
                              <span className="px-4 bg-cuadralo-bgLight dark:bg-[#0f0518] text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                                  O continúa con
                              </span>
                          </div>
                      </div>

                      {/* BOTONES SOCIALES FUNCIONALES */}
                      <div className="grid grid-cols-2 gap-4 mb-10">
                          {/* Google */}
                          <button 
                              type="button" 
                              onClick={() => loginWithGoogle()}
                              disabled={isLoading}
                              className="flex items-center justify-center gap-2 py-4 bg-black/5 dark:bg-white/5 border border-transparent hover:border-black/10 dark:hover:border-white/10 rounded-2xl transition-all hover:scale-[1.02] active:scale-95"
                          >
                              <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" className="w-5 h-5" alt="Google" />
                              <span className="text-sm font-bold text-cuadralo-textLight dark:text-white">Google</span>
                          </button>

                          {/* Apple */}
                          <AppleSignin
                              authOptions={{
                                  clientId: APPLE_CLIENT_ID,
                                  scope: 'email name',
                                  redirectURI: 'https://tusitio.com/login', // Ojo: Apple requiere HTTPS
                                  state: 'login',
                                  usePopup: true 
                              }}
                              uiType="dark"
                              className="w-full"
                              noDefaultStyle={false}
                              onSuccess={handleAppleResponse}
                              onError={(err) => console.error("Apple Error:", err)}
                              render={(props) => (
                                  <button 
                                      type="button" 
                                      onClick={props.onClick}
                                      disabled={isLoading}
                                      className="flex w-full items-center justify-center gap-2 py-4 bg-black/5 dark:bg-white/5 border border-transparent hover:border-black/10 dark:hover:border-white/10 rounded-2xl transition-all hover:scale-[1.02] active:scale-95"
                                  >
                                      <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" className="w-5 h-5 dark:invert opacity-80 dark:opacity-100" alt="Apple" />
                                      <span className="text-sm font-bold text-cuadralo-textLight dark:text-white">Apple</span>
                                  </button>
                              )}
                          />
                      </div>
                      
                      <p className="text-center text-gray-500 font-medium mt-8">
                          ¿No tienes cuenta?{' '}
                          <Link href="/register" className="text-cuadralo-pink font-bold hover:underline">
                              Regístrate aquí
                          </Link>
                      </p>

                  </motion.div>
              </AnimatePresence>
          </div>
      </div>
    </div>
  );
}

// ✅ COMPONENTES DE INPUTS FLOTANTES
function FloatingInput({ icon, label, type = "text", value, onChange }) {
    return (
        <div className="relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cuadralo-pink transition-colors z-10 pointer-events-none">
                {icon}
            </div>
            <div className="relative">
                <input
                    type={type}
                    className="peer w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-cuadralo-pink/50 rounded-2xl pt-7 pb-3 pl-14 pr-5 text-base font-bold text-cuadralo-textLight dark:text-white outline-none transition-all"
                    placeholder=" "
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    required
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                />
                <label className={`absolute left-14 text-gray-500 font-black uppercase tracking-widest transition-all duration-200 pointer-events-none ${value ? 'top-2.5 text-[9px]' : 'top-1/2 -translate-y-1/2 text-xs peer-focus:top-2.5 peer-focus:text-[9px] peer-focus:text-cuadralo-pink'}`}>
                    {label}
                </label>
            </div>
        </div>
    );
}

function FloatingPasswordInput({ icon, label, value, onChange, showPassword, setShowPassword }) {
    return (
        <div className="relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cuadralo-pink transition-colors z-10 pointer-events-none">
                {icon}
            </div>
            <div className="relative">
                <input
                    type={showPassword ? "text" : "password"}
                    className="peer w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-cuadralo-pink/50 rounded-2xl pt-7 pb-3 pl-14 pr-12 text-base font-bold text-cuadralo-textLight dark:text-white outline-none transition-all"
                    placeholder=" "
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    required
                    autoCapitalize="none"
                    autoCorrect="off"
                />
                <label className={`absolute left-14 text-gray-500 font-black uppercase tracking-widest transition-all duration-200 pointer-events-none ${value ? 'top-2.5 text-[9px]' : 'top-1/2 -translate-y-1/2 text-xs peer-focus:top-2.5 peer-focus:text-[9px] peer-focus:text-cuadralo-pink'}`}>
                    {label}
                </label>
                <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cuadralo-pink transition-colors z-10"
                >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>
        </div>
    );
}

function ErrorMessage({ msg }) {
    return (
        <div className="w-full bg-red-500/10 border border-red-500/30 p-4 rounded-2xl flex items-center gap-3 text-red-500 text-sm font-bold mb-6">
            <AlertCircle size={18} />{msg}
        </div>
    );
}