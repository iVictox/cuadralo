"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
    User, Mail, Lock, Calendar, ArrowRight, ArrowLeft, 
    Camera, Check, Heart, Music, Gamepad2, Plane, Coffee, 
    Dumbbell, Film, ChevronRight, AlertCircle, Loader2,
    Palette, Book, Dog, Wine, Laptop, Mountain
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { api } from "@/utils/api"; 

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0); 
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false); 
  
  const [formData, setFormData] = useState({
      name: "", email: "", password: "", confirmPassword: "",
      birthDate: "", gender: "", photo: "", 
      bio: "", interests: [], preferences: { ageRange: [18, 30], distance: 50, show: "Todos" }
  });

  const interestsList = [
      { id: "music", label: "Música", icon: <Music size={18} /> },
      { id: "games", label: "Gaming", icon: <Gamepad2 size={18} /> },
      { id: "travel", label: "Viajes", icon: <Plane size={18} /> },
      { id: "coffee", label: "Café", icon: <Coffee size={18} /> },
      { id: "gym", label: "Fitness", icon: <Dumbbell size={18} /> },
      { id: "movies", label: "Cine", icon: <Film size={18} /> },
      { id: "art", label: "Arte", icon: <Palette size={18} /> },
      { id: "books", label: "Libros", icon: <Book size={18} /> },
      { id: "dogs", label: "Perros", icon: <Dog size={18} /> },
      { id: "cooking", label: "Cocina", icon: <Wine size={18} /> }, 
      { id: "wine", label: "Vino", icon: <Wine size={18} /> },
      { id: "photo", label: "Fotografía", icon: <Camera size={18} /> },
      { id: "tech", label: "Tecnología", icon: <Laptop size={18} /> },
      { id: "crypto", label: "Crypto", icon: <Laptop size={18} /> },
      { id: "hiking", label: "Senderismo", icon: <Mountain size={18} /> },
      { id: "health", label: "Salud", icon: <Heart size={18} /> },
      { id: "party", label: "Fiesta", icon: <Music size={18} /> },
      { id: "guitar", label: "Guitarra", icon: <Music size={18} /> },
  ];

  const nextStep = () => { setError(""); setStep(prev => prev + 1); };
  const prevStep = () => { setError(""); setStep(prev => prev - 1); };

  const handleRegisterStart = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
        setError("Las contraseñas no coinciden");
        return;
    }
    if (formData.password.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres");
        return;
    }
    nextStep(); 
  };

  const handlePhotoUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      setIsUploading(true);
      setError("");

      try {
          const serverUrl = await api.upload(file);
          handleChange("photo", serverUrl);
      } catch (err) {
          console.error("Error subiendo foto:", err);
          setError("Error subiendo la imagen. Intenta con otra.");
      } finally {
          setIsUploading(false);
      }
  };

  const handleFinalSubmit = async () => {
      setIsLoading(true);
      setError("");

      try {
          // ✅ CORRECCIÓN: Convertir 'distance' a entero y limpiar payload
          const payload = { 
              ...formData,
              preferences: {
                  ...formData.preferences,
                  distance: parseInt(formData.preferences.distance, 10) // Aseguramos que sea INT
              }
          };
          
          // Eliminamos confirmPassword ya que el backend no lo espera
          delete payload.confirmPassword;

          const response = await api.post("/register", payload);
          
          setTimeout(() => {
             router.push("/login");
          }, 1000);

      } catch (err) {
          console.error("Error registrando:", err);
          setError(err.message || "Hubo un problema al conectar con el servidor.");
          setIsLoading(false); 
      }
  };

  const handleChange = (field, value) => {
      setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleInterest = (id) => {
      setFormData(prev => {
          const exists = prev.interests.includes(id);
          if (exists) {
              return { ...prev, interests: prev.interests.filter(i => i !== id) };
          } else {
              if (prev.interests.length >= 5) return prev; 
              return { ...prev, interests: [...prev.interests, id] };
          }
      });
  };

  const progress = Math.min(((step) / 5) * 100, 100);

  return (
    <div className="min-h-screen w-full bg-[#0f0518] flex items-center justify-center relative overflow-hidden py-10">
      
      <div className="absolute top-[10%] right-[20%] w-[400px] h-[400px] bg-cuadralo-pink/20 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-[10%] left-[20%] w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px] animate-pulse delay-700" />

      <motion.div layout className="w-full max-w-md relative z-10">
        {step === 0 && (
            <div className="flex justify-center mb-6">
                <div className="relative w-40 h-12">
                    <Image src="/logo.svg" fill className="object-contain" alt="Cuadralo" priority />
                </div>
            </div>
        )}

        {step > 0 && (
            <div className="mb-6 px-4">
                <div className="flex justify-between text-xs text-gray-400 mb-2 font-bold uppercase tracking-wider">
                    <span>Configurando tu perfil</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-cuadralo-pink to-purple-600"
                    />
                </div>
            </div>
        )}

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden min-h-[550px] flex flex-col">
            
            {step > 0 && !isLoading && (
                <button onClick={prevStep} className="absolute top-6 left-6 text-gray-400 hover:text-white transition-colors z-20">
                    <ArrowLeft size={24} />
                </button>
            )}

            <AnimatePresence mode="wait">
                {step === 0 && (
                    <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full">
                        <h2 className="text-2xl font-bold text-white mb-2 text-center">Únete a Cuadralo 🚀</h2>
                        <p className="text-gray-400 text-center mb-6 text-sm">Crea tu cuenta y empieza a conectar.</p>
                        
                        <form onSubmit={handleRegisterStart} className="space-y-4 flex-1">
                            <InputGroup icon={<User size={20} />} placeholder="Nombre completo" value={formData.name} onChange={(v) => handleChange("name", v)} />
                            <InputGroup icon={<Mail size={20} />} type="email" placeholder="Correo electrónico" value={formData.email} onChange={(v) => handleChange("email", v)} />
                            <InputGroup icon={<Lock size={20} />} type="password" placeholder="Contraseña" value={formData.password} onChange={(v) => handleChange("password", v)} />
                            <InputGroup icon={<Lock size={20} />} type="password" placeholder="Confirmar contraseña" value={formData.confirmPassword} onChange={(v) => handleChange("confirmPassword", v)} />

                            {error && <ErrorMessage msg={error} />}

                            <button type="submit" className="w-full bg-white text-black py-3.5 rounded-xl font-bold text-lg shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2 mt-4">
                                Crear Cuenta
                            </button>
                        </form>
                        
                        <p className="text-center text-gray-500 text-sm mt-4">
                            ¿Ya tienes cuenta? <Link href="/login" className="text-cuadralo-pink font-bold hover:text-white">Inicia sesión</Link>
                        </p>
                    </motion.div>
                )}

                {step === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="flex flex-col h-full items-center text-center justify-center">
                        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 mb-4 animate-bounce">
                            <Calendar size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">¿Cuándo naciste?</h2>
                        <p className="text-gray-400 text-sm mb-8">Necesitamos confirmar tu edad para mostrarte perfiles adecuados.</p>

                        <input type="date" className="w-full bg-black/30 border border-white/20 rounded-xl p-4 text-white text-center text-lg focus:border-cuadralo-pink outline-none mb-6" value={formData.birthDate} onChange={(e) => handleChange("birthDate", e.target.value)} />

                        <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Soy...</h3>
                        <div className="flex gap-4 w-full mb-8">
                            {['Hombre', 'Mujer', 'Otro'].map((g) => (
                                <button key={g} onClick={() => handleChange("gender", g)} className={`flex-1 py-3 rounded-xl border transition-all ${formData.gender === g ? 'bg-cuadralo-pink border-cuadralo-pink text-white' : 'border-white/10 hover:bg-white/5 text-gray-400'}`}>{g}</button>
                            ))}
                        </div>
                        <NextButton onClick={nextStep} disabled={!formData.birthDate || !formData.gender} />
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="flex flex-col h-full items-center text-center justify-center">
                        <h2 className="text-2xl font-bold text-white mb-2">¡Sonríe! 📸</h2>
                        <p className="text-gray-400 text-sm mb-8">Agrega una foto para que los demás te reconozcan.</p>

                        <div className="relative w-48 h-48 mb-8 group cursor-pointer">
                            <input type="file" accept="image/*" onChange={handlePhotoUpload} disabled={isUploading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                            <div className={`w-full h-full rounded-full border-4 flex items-center justify-center overflow-hidden transition-all relative ${formData.photo ? 'border-cuadralo-pink' : 'border-dashed border-white/20 hover:border-white/50 bg-black/20'}`}>
                                {isUploading ? <Loader2 size={48} className="text-cuadralo-pink animate-spin" /> : formData.photo ? <img src={formData.photo} className="w-full h-full object-cover" /> : <Camera size={48} className="text-gray-500" />}
                            </div>
                        </div>
                        <NextButton onClick={nextStep} disabled={!formData.photo || isUploading} />
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div key="step3" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="flex flex-col h-full items-center text-center justify-center">
                        <h2 className="text-2xl font-bold text-white mb-2">Sobre ti ✍️</h2>
                        <p className="text-gray-400 text-sm mb-6">Escribe una breve descripción para romper el hielo.</p>
                        <textarea placeholder="Me gusta el café, los gatos y..." className="w-full h-32 bg-black/30 border border-white/20 rounded-xl p-4 text-white focus:border-cuadralo-pink outline-none resize-none mb-2" value={formData.bio} onChange={(e) => handleChange("bio", e.target.value)} />
                        <p className="w-full text-right text-xs text-gray-500 mb-8">{formData.bio.length}/150</p>
                        <NextButton onClick={nextStep} />
                    </motion.div>
                )}

                {step === 4 && (
                    <motion.div key="step4" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="flex flex-col h-full items-center text-center justify-center">
                        <h2 className="text-2xl font-bold text-white mb-2">Tus Intereses 🔥</h2>
                        <p className="text-gray-400 text-sm mb-8">Selecciona al menos 3 temas que te gusten.</p>
                        <div className="grid grid-cols-2 gap-3 w-full mb-8 max-h-[300px] overflow-y-auto scrollbar-hide pr-2">
                            {interestsList.map((interest) => {
                                const active = formData.interests.includes(interest.id);
                                return (
                                    <button key={interest.id} onClick={() => toggleInterest(interest.id)} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${active ? 'bg-cuadralo-pink/20 border-cuadralo-pink text-white' : 'bg-black/20 border-white/10 text-gray-400 hover:bg-white/5'}`}>
                                        <div className={active ? "text-cuadralo-pink" : "text-gray-500"}>{interest.icon}</div>
                                        <span className="text-sm font-medium">{interest.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                        <NextButton onClick={nextStep} disabled={formData.interests.length < 1} text="Continuar" />
                    </motion.div>
                )}

                {step === 5 && (
                    <motion.div key="step5" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="flex flex-col h-full items-center text-center justify-center">
                        <div className="w-16 h-16 bg-gradient-to-tr from-cuadralo-pink to-purple-600 rounded-full flex items-center justify-center text-white mb-4 shadow-lg shadow-purple-500/30"><Heart size={32} fill="currentColor" /></div>
                        <h2 className="text-2xl font-bold text-white mb-2">Todo listo ✨</h2>
                        <p className="text-gray-400 text-sm mb-8">Configura tus preferencias finales para empezar.</p>
                        
                        <div className="w-full mb-6 text-left">
                            <div className="flex justify-between mb-2"><label className="text-sm font-bold text-gray-400">Distancia Máxima</label><span className="text-sm font-bold text-white">{formData.preferences.distance} km</span></div>
                            <input type="range" min="1" max="100" value={formData.preferences.distance} onChange={(e) => handleChange("preferences", {...formData.preferences, distance: e.target.value})} className="w-full accent-cuadralo-pink h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                        </div>

                        <div className="w-full mb-8 text-left">
                            <label className="text-sm font-bold text-gray-400 mb-2 block">Quiero ver...</label>
                            <div className="flex bg-black/30 p-1 rounded-xl">
                                {['Hombres', 'Mujeres', 'Todos'].map((opt) => (
                                    <button key={opt} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${formData.preferences.show === opt ? 'bg-gray-700 text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`} onClick={() => handleChange("preferences", {...formData.preferences, show: opt})}>{opt}</button>
                                ))}
                            </div>
                        </div>

                        {error && <ErrorMessage msg={error} />}

                        <button onClick={handleFinalSubmit} disabled={isLoading} className={`w-full bg-gradient-to-r from-cuadralo-pink to-cuadralo-purple py-4 rounded-xl font-bold text-white text-lg shadow-xl flex items-center justify-center gap-2 transition-all ${isLoading ? 'opacity-70 cursor-wait' : 'hover:scale-[1.02]'}`}>
                            {isLoading ? "Creando perfil..." : <>Comenzar Aventura <ArrowRight size={20} /></>}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

function InputGroup({ icon, type = "text", placeholder, value, onChange }) {
    return <div className="relative group"><div className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-cuadralo-pink transition-colors">{icon}</div><input type={type} placeholder={placeholder} className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-cuadralo-pink transition-all" value={value} onChange={(e) => onChange(e.target.value)} /></div>;
}
function ErrorMessage({ msg }) {
    return <div className="w-full bg-red-500/10 border border-red-500/30 p-3 rounded-xl flex items-center gap-2 text-red-400 text-xs mb-4"><AlertCircle size={16} />{msg}</div>;
}
function NextButton({ onClick, disabled, text = "Siguiente" }) {
    return <button onClick={onClick} disabled={disabled} className="w-full bg-white text-black py-3 rounded-xl font-bold text-lg shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100">{text} <ChevronRight size={20} /></button>;
}