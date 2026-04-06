"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
    User, Mail, Lock, Calendar, ArrowRight, ArrowLeft, 
    Plus, Trash2, ChevronRight, AlertCircle, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { api } from "@/utils/api"; 
import { INTERESTS_LIST } from "@/utils/interests";

import { useGoogleLogin } from '@react-oauth/google';
import AppleSignin from 'react-apple-signin-auth';

const APPLE_CLIENT_ID = "com.tuempresa.cuadralo.web"; 

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0); 
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false); 
  
  const [formData, setFormData] = useState({
      name: "", username: "", email: "", password: "", confirmPassword: "",
      birthDate: "", gender: "", 
      photos: [], 
      bio: "", interests: [], preferences: { ageRange: [18, 30], distance: 50, show: "Todos" }
  });

  const nextStep = () => { setError(""); setStep(prev => prev + 1); };
  const prevStep = () => { setError(""); setStep(prev => prev - 1); };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: (codeResponse) => {
        setIsLoading(true);
        fetch(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${codeResponse.access_token}`, {
            headers: { Authorization: `Bearer ${codeResponse.access_token}`, Accept: 'application/json' }
        })
        .then((res) => res.json())
        .then((data) => {
            setFormData(prev => ({
                ...prev,
                name: data.name,
                email: data.email,
                photos: data.picture ? [data.picture] : [], 
                username: data.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') + Math.floor(Math.random() * 100),
                password: Math.random().toString(36).slice(-12) + "A1!", 
                confirmPassword: ""
            }));
            setStep(1);
            setIsLoading(false);
        })
        .catch((err) => {
            console.error(err);
            setError("Error al obtener los datos de Google");
            setIsLoading(false);
        });
    },
    onError: (error) => {
        console.error('Login Failed:', error);
        setError("Error al conectar con Google");
    }
  });

  const handleAppleResponse = (response) => {
      if (!response.authorization) {
          setError("Error al conectar con Apple");
          return;
      }
      try {
          setIsLoading(true);
          const base64Url = response.authorization.id_token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          const decoded = JSON.parse(jsonPayload);
          
          let fullName = "Usuario Apple";
          if (response.user && response.user.name) {
              fullName = `${response.user.name.firstName || ""} ${response.user.name.lastName || ""}`.trim();
          } else if (decoded.email) {
              fullName = decoded.email.split('@')[0];
          }

          setFormData(prev => ({
              ...prev,
              name: fullName,
              email: decoded.email,
              photos: [], 
              username: decoded.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') + Math.floor(Math.random() * 100),
              password: Math.random().toString(36).slice(-12) + "A1!", 
              confirmPassword: ""
          }));
          
          setStep(1); 
          setIsLoading(false);
      } catch (err) {
          console.error("Error decodificando Apple token:", err);
          setError("Error procesando los datos de Apple");
          setIsLoading(false);
      }
  };

  const handleRegisterStart = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return setError("Las contraseñas no coinciden");
    if (formData.password.length < 6) return setError("La contraseña debe tener al menos 6 caracteres");
    nextStep(); 
  };

  const handlePhotoUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (formData.photos.length >= 6) return setError("Máximo 6 fotos permitidas.");

      setIsUploading(true);
      setError("");

      try {
          const serverUrl = await api.upload(file);
          setFormData(prev => ({ ...prev, photos: [...prev.photos, serverUrl] }));
      } catch (err) {
          setError("Error subiendo la imagen. Intenta con otra.");
      } finally {
          setIsUploading(false);
      }
  };

  const removePhoto = (index) => {
      setFormData(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }));
  };

  const handleFinalSubmit = async () => {
      setIsLoading(true);
      setError("");

      if (!("geolocation" in navigator)) {
          setError("Tu navegador no soporta geolocalización.");
          setIsLoading(false);
          return;
      }

      navigator.geolocation.getCurrentPosition(
          async (position) => {
              try {
                  const lat = position.coords.latitude;
                  const lon = position.coords.longitude;
                  
                  // ✅ TRADUCIR COORDENADAS A CIUDAD Y PAÍS (Geocodificación Inversa)
                  let locationString = "Ubicación Desconocida";
                  try {
                      const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=es`);
                      const geoData = await geoRes.json();
                      const city = geoData.city || geoData.locality || "Ciudad";
                      const country = geoData.countryName || "País";
                      locationString = `${city} (${country})`; // Ej: "Valencia (Venezuela)"
                  } catch (e) {
                      console.error("Error obteniendo ubicación:", e);
                  }

                  const payload = { 
                      ...formData,
                      latitude: lat,
                      longitude: lon,
                      location: locationString, // <- Se envía el texto generado automáticamente
                      photo: formData.photos.length > 0 ? formData.photos[0] : "", 
                      preferences: {
                          ...formData.preferences,
                          distance: parseInt(formData.preferences.distance, 10) 
                      }
                  };
                  delete payload.confirmPassword;

                  await api.post("/register", payload);
                  setTimeout(() => router.push("/login"), 1000);
              } catch (err) {
                  setError(err.message || "Hubo un problema al conectar con el servidor.");
                  setIsLoading(false); 
              }
          },
          (error) => {
              setError("Para usar Cuadralo necesitamos tu ubicación para mostrarte personas cerca.");
              setIsLoading(false);
          },
          { enableHighAccuracy: true }
      );
  };

  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const toggleInterest = (id) => {
      setFormData(prev => {
          const exists = prev.interests.includes(id);
          if (exists) return { ...prev, interests: prev.interests.filter(i => i !== id) };
          if (prev.interests.length >= 10) return prev; 
          return { ...prev, interests: [...prev.interests, id] };
      });
  };

  const stepContent = [
      { title: "Comienza tu historia.", desc: "Crea tu cuenta en segundos y únete a la comunidad de Cuadralo." },
      { title: "Detalles básicos.", desc: "Queremos saber un poco más de ti para mostrarte a las personas correctas." },
      { title: "Muestra tu mejor lado.", desc: "Sube hasta 6 fotos. Las personas con más fotos consiguen hasta un 80% más de matches." },
      { title: "Tu carta de presentación.", desc: "Una buena biografía rompe el hielo al instante. Sé auténtico." },
      { title: "¿Qué te apasiona?", desc: "Elige tus intereses. Es la mejor forma de conectar de verdad con otros." },
      { title: "Casi listos.", desc: "Ajusta tus preferencias de búsqueda y prepárate para empezar a cuadrar." },
  ];

  return (
    <div className="min-h-screen w-full flex bg-cuadralo-bgLight dark:bg-[#0f0518] overflow-hidden text-cuadralo-textLight dark:text-white transition-colors duration-500 relative">
      
      <div className="hidden lg:flex w-[45%] relative bg-black items-center justify-center p-16 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cuadralo-pink/20 via-[#0f0518] to-purple-900/40 z-0" />
          <div className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] bg-cuadralo-pink/30 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute -bottom-[20%] -right-[10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse delay-1000" />
          
          <div className="relative z-10 w-full max-w-md">
             <div className="w-72 h-20 relative mb-12">
                 <Image src="/logo.svg" fill className="object-contain dark:invert-0 invert" alt="Cuadralo" priority />
             </div>
             
             <AnimatePresence mode="wait">
                 <motion.div 
                    key={step} 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}
                 >
                     <h1 className="text-5xl xl:text-6xl font-black text-white tracking-tighter mb-6 leading-[1.1]">
                        {stepContent[step].title}
                     </h1>
                     <p className="text-gray-400 text-lg font-medium leading-relaxed">
                        {stepContent[step].desc}
                     </p>
                 </motion.div>
             </AnimatePresence>
          </div>

          <div className="absolute bottom-12 left-16 text-white/30 text-sm font-bold tracking-widest uppercase">
              © {new Date().getFullYear()} Cuadralo App
          </div>
      </div>

      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none lg:hidden z-0">
          <div className="absolute top-[-10%] -left-[20%] w-[400px] h-[400px] bg-cuadralo-pink/20 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-[-10%] -right-[20%] w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[100px] animate-pulse delay-1000" />
      </div>

      <div className="w-full lg:w-[55%] flex flex-col items-center justify-center p-6 sm:p-12 md:p-20 relative z-10 bg-white/40 dark:bg-black/10 lg:bg-transparent backdrop-blur-sm lg:backdrop-blur-none">
          
          {step > 0 && !isLoading && (
              <button onClick={prevStep} className="absolute top-6 left-6 lg:top-12 lg:left-12 w-12 h-12 z-20 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors shadow-md">
                  <ArrowLeft size={24} />
              </button>
          )}

          <div className="w-full max-w-md mt-10 lg:mt-0">
              <div className="flex justify-center mb-10 lg:hidden relative z-10">
                  <div className="w-56 h-16 relative">
                      <Image src="/logo.svg" fill className="object-contain dark:invert-0 invert" alt="Cuadralo" priority />
                  </div>
              </div>

              <div className="mb-8 lg:hidden">
                 <AnimatePresence mode="wait">
                     <motion.div 
                        key={step} 
                        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}
                     >
                         <h2 className="text-3xl sm:text-4xl font-black text-cuadralo-textLight dark:text-white tracking-tighter mb-3 leading-[1.1]">
                            {stepContent[step].title}
                         </h2>
                         <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base font-medium leading-relaxed">
                            {stepContent[step].desc}
                         </p>
                     </motion.div>
                 </AnimatePresence>
              </div>
              
              {step > 0 && (
                  <div className="flex gap-2 mb-12">
                     {[1,2,3,4,5].map(i => (
                         <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-cuadralo-pink shadow-[0_0_10px_rgba(242,19,142,0.5)]' : 'bg-black/5 dark:bg-white/10'}`} />
                     ))}
                  </div>
              )}

              <AnimatePresence mode="wait">
                  {step === 0 && (
                      <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                          
                          <form onSubmit={handleRegisterStart} className="space-y-5">
                              <FloatingInput label="Nombre completo" icon={<User size={20}/>} value={formData.name} onChange={(v) => handleChange("name", v)} />
                              <FloatingInput label="Usuario (@)" icon={<span className="font-black text-lg text-cuadralo-pink">@</span>} value={formData.username} onChange={(v) => handleChange("username", v.toLowerCase().replace(/\s+/g, ''))} isLower />
                              <FloatingInput label="Correo electrónico" icon={<Mail size={20}/>} type="email" value={formData.email} onChange={(v) => handleChange("email", v)} />
                              <div className="grid grid-cols-2 gap-4">
                                  <FloatingInput label="Contraseña" icon={<Lock size={20}/>} type="password" value={formData.password} onChange={(v) => handleChange("password", v)} />
                                  <FloatingInput label="Confirmar" icon={<Lock size={20}/>} type="password" value={formData.confirmPassword} onChange={(v) => handleChange("confirmPassword", v)} />
                              </div>

                              {error && <ErrorMessage msg={error} />}

                              <button type="submit" className="w-full py-5 bg-cuadralo-textLight dark:bg-white text-cuadralo-bgLight dark:text-black rounded-2xl font-black text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all mt-4">
                                  Crear Cuenta
                              </button>
                          </form>
                          
                          <div className="relative my-8">
                              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-black/10 dark:border-white/10"></div></div>
                              <div className="relative flex justify-center text-sm">
                                  <span className="px-4 bg-transparent text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                                      O regístrate con
                                  </span>
                              </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-2">
                              <button 
                                type="button" 
                                onClick={() => loginWithGoogle()}
                                disabled={isLoading}
                                className="flex items-center justify-center gap-2 py-4 bg-black/5 dark:bg-white/5 border border-transparent hover:border-black/10 dark:hover:border-white/10 rounded-2xl transition-all hover:scale-[1.02] active:scale-95"
                              >
                                  <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" className="w-5 h-5" alt="Google" />
                                  <span className="text-sm font-bold text-cuadralo-textLight dark:text-white">Google</span>
                              </button>
                              
                              <AppleSignin
                                authOptions={{
                                    clientId: APPLE_CLIENT_ID,
                                    scope: 'email name',
                                    redirectURI: 'https://tusitio.com/register', 
                                    state: 'registro',
                                    usePopup: true 
                                }}
                                uiType="dark"
                                className="w-full"
                                noDefaultStyle={false}
                                onSuccess={handleAppleResponse}
                                onError={(error) => console.error("Apple Error:", error)}
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
                              ¿Ya tienes cuenta? <Link href="/login" className="text-cuadralo-pink font-bold hover:underline">Inicia sesión aquí</Link>
                          </p>
                      </motion.div>
                  )}

                  {step === 1 && (
                      <motion.div key="s1" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
                          <div className="mb-10">
                              <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 block ml-2">Fecha de Nacimiento</label>
                              <input type="date" className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-cuadralo-pink rounded-3xl p-6 text-xl font-bold dark:text-white outline-none transition-all cursor-pointer" value={formData.birthDate} onChange={(e) => handleChange("birthDate", e.target.value)} />
                          </div>

                          <div className="mb-10">
                              <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 block ml-2">Soy...</label>
                              <div className="grid grid-cols-3 gap-3">
                                  {['Hombre', 'Mujer', 'Otro'].map((g) => (
                                      <button key={g} onClick={() => handleChange("gender", g)} className={`py-5 rounded-2xl font-black transition-all border-2 ${formData.gender === g ? 'bg-cuadralo-pink border-cuadralo-pink text-white shadow-lg shadow-cuadralo-pink/30 scale-105' : 'bg-transparent border-black/5 dark:border-white/5 text-gray-500 hover:border-cuadralo-pink/50'}`}>
                                          {g}
                                      </button>
                                  ))}
                              </div>
                          </div>
                          
                          <NextButton onClick={nextStep} disabled={!formData.birthDate || !formData.gender} />
                      </motion.div>
                  )}

                  {step === 2 && (
                      <motion.div key="s2" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
                          <div className="flex justify-between items-end mb-6 ml-2">
                              <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Tus Fotos</label>
                              <span className="text-xs font-bold text-cuadralo-pink">{formData.photos.length}/6</span>
                          </div>

                          <div className="grid grid-cols-3 gap-3 mb-10">
                              {formData.photos.map((url, i) => (
                                  <div key={i} className={`relative aspect-[3/4] rounded-2xl overflow-hidden group border-2 border-transparent bg-black/5 dark:bg-white/5 ${i === 0 ? 'ring-2 ring-cuadralo-pink ring-offset-2 dark:ring-offset-[#0f0518]' : ''}`}>
                                      <img src={url} className="w-full h-full object-cover" alt={`Upload ${i}`} />
                                      <button onClick={() => removePhoto(i)} className="absolute top-2 right-2 bg-red-500/90 backdrop-blur-md text-white p-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"><Trash2 size={16}/></button>
                                      {i === 0 && <div className="absolute bottom-0 w-full bg-cuadralo-pink text-white text-[9px] font-black uppercase tracking-widest text-center py-1.5">Principal</div>}
                                  </div>
                              ))}
                              
                              {formData.photos.length < 6 && (
                                  <label className={`relative aspect-[3/4] bg-black/5 dark:bg-white/5 border-2 border-dashed border-black/10 dark:border-white/20 rounded-2xl flex flex-col items-center justify-center transition-all group ${isUploading ? 'opacity-50 cursor-wait' : 'cursor-pointer hover:border-cuadralo-pink/50 hover:bg-black/10 dark:hover:bg-white/10'}`}>
                                      <input type="file" accept="image/*" onChange={handlePhotoUpload} disabled={isUploading} className="hidden" />
                                      {isUploading ? <Loader2 className="animate-spin text-cuadralo-pink" size={28} /> : <Plus className="text-gray-400 group-hover:text-cuadralo-pink transition-colors" size={28} />}
                                  </label>
                              )}
                          </div>

                          {error && <ErrorMessage msg={error} />}
                          <NextButton onClick={nextStep} disabled={formData.photos.length === 0 || isUploading} />
                      </motion.div>
                  )}

                  {step === 3 && (
                      <motion.div key="s3" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
                          <div className="relative mb-8">
                              <textarea 
                                  placeholder="¿Qué te hace único?..." 
                                  className="w-full h-56 bg-black/5 dark:bg-white/5 border border-transparent focus:border-cuadralo-pink rounded-3xl p-6 text-lg dark:text-white outline-none resize-none transition-all leading-relaxed" 
                                  value={formData.bio} onChange={(e) => handleChange("bio", e.target.value)} maxLength={150}
                              />
                              <div className="absolute bottom-6 right-6 text-xs font-black text-gray-400 bg-white/10 px-3 py-1 rounded-full backdrop-blur-md">
                                  {formData.bio.length}/150
                              </div>
                          </div>
                          <NextButton onClick={nextStep} />
                      </motion.div>
                  )}

                  {step === 4 && (
                      <motion.div key="s4" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
                          <div className="flex justify-between items-end mb-6 ml-2">
                              <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Intereses</label>
                              <span className="text-xs font-bold text-cuadralo-pink">{formData.interests.length}/10</span>
                          </div>
                          
                          <div className="flex flex-wrap gap-2.5 max-h-[45vh] overflow-y-auto no-scrollbar pb-8 content-start">
                              {INTERESTS_LIST.map((interest) => {
                                  const active = formData.interests.includes(interest.slug);
                                  return (
                                      <button 
                                          key={interest.slug} onClick={() => toggleInterest(interest.slug)} 
                                          className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl transition-all border-2 text-sm font-bold tracking-wide ${active ? 'bg-cuadralo-pink border-cuadralo-pink text-white shadow-xl shadow-cuadralo-pink/30 scale-[1.02]' : 'bg-transparent border-black/5 dark:border-white/5 text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 hover:border-cuadralo-pink/50'}`}
                                      >
                                          <span className={active ? "text-white" : "text-gray-500"}>{interest.icon}</span>
                                          {interest.name}
                                      </button>
                                  );
                              })}
                          </div>
                          <NextButton onClick={nextStep} disabled={formData.interests.length < 3} text="Continuar" className="mt-2" />
                      </motion.div>
                  )}

                  {step === 5 && (
                      <motion.div key="s5" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
                          
                          <div className="mb-12 bg-black/5 dark:bg-white/5 p-8 rounded-3xl border border-black/5 dark:border-white/5">
                              <div className="flex justify-between mb-6">
                                  <label className="text-xs font-black text-gray-500 uppercase tracking-[0.2em]">Distancia</label>
                                  <span className="font-black text-cuadralo-pink text-lg leading-none">{formData.preferences.distance} km</span>
                              </div>
                              <input type="range" min="1" max="100" value={formData.preferences.distance} onChange={(e) => handleChange("preferences", {...formData.preferences, distance: e.target.value})} className="w-full accent-cuadralo-pink h-2.5 bg-gray-200 dark:bg-white/10 rounded-full appearance-none cursor-pointer mb-2" />
                          </div>

                          <div className="mb-12">
                              <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 block ml-2">Me interesa ver...</label>
                              <div className="flex bg-black/5 dark:bg-white/5 p-1.5 rounded-2xl">
                                  {['Hombres', 'Mujeres', 'Todos'].map((opt) => (
                                      <button key={opt} className={`flex-1 py-4 text-sm font-black rounded-xl transition-all ${formData.preferences.show === opt ? 'bg-white dark:bg-[#1a0b2e] text-cuadralo-pink shadow-md' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`} onClick={() => handleChange("preferences", {...formData.preferences, show: opt})}>{opt}</button>
                                  ))}
                              </div>
                          </div>

                          {error && <ErrorMessage msg={error} />}

                          <button onClick={handleFinalSubmit} disabled={isLoading} className={`w-full py-5 bg-gradient-to-r from-cuadralo-pink to-purple-600 rounded-2xl font-black text-white text-lg shadow-xl shadow-cuadralo-pink/30 flex items-center justify-center gap-3 transition-all ${isLoading ? 'opacity-70 cursor-wait' : 'hover:scale-[1.02] active:scale-95'}`}>
                              {isLoading ? <Loader2 className="animate-spin" size={24} /> : <>Entrar a Cuadralo <ArrowRight size={24} /></>}
                          </button>
                      </motion.div>
                  )}
              </AnimatePresence>
          </div>
      </div>
    </div>
  );
}

function FloatingInput({ icon, label, type = "text", value, onChange, isLower }) {
    return (
        <div className="relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cuadralo-pink transition-colors z-10 pointer-events-none">
                {icon}
            </div>
            <div className="relative">
                <input
                    type={type}
                    className={`peer w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-cuadralo-pink/50 rounded-2xl pt-7 pb-3 pl-14 pr-5 text-base font-bold text-cuadralo-textLight dark:text-white outline-none transition-all ${isLower ? 'lowercase' : ''}`}
                    placeholder=" "
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    required
                />
                <label className={`absolute left-14 text-gray-500 font-black uppercase tracking-widest transition-all duration-200 pointer-events-none ${value ? 'top-2.5 text-[9px]' : 'top-1/2 -translate-y-1/2 text-xs peer-focus:top-2.5 peer-focus:text-[9px] peer-focus:text-cuadralo-pink'}`}>
                    {label}
                </label>
            </div>
        </div>
    );
}

function ErrorMessage({ msg }) {
    return <div className="w-full bg-red-500/10 border border-red-500/30 p-4 rounded-2xl flex items-center gap-3 text-red-500 text-sm font-bold mb-6"><AlertCircle size={18} />{msg}</div>;
}

function NextButton({ onClick, disabled, text = "Continuar", className="" }) {
    return <button onClick={onClick} disabled={disabled} className={`w-full bg-cuadralo-textLight dark:bg-white text-cuadralo-bgLight dark:text-black py-5 rounded-2xl font-black text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed ${className}`}>{text} <ChevronRight size={24} /></button>;
}