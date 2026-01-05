"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Settings, Edit2, LogOut, Camera, Zap, ChevronRight, 
    Users, UserCheck, ShieldCheck, Loader2, Save, X,
    Music, Gamepad2, Plane, Coffee, Dumbbell, Film, Star,
    Palette, Book, Dog, Wine, Laptop, Mountain, Heart
} from "lucide-react";
import { api } from "@/utils/api";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";

// --- DICCIONARIO COMPLETO (Sincronizado con CardStack) ---
const AVAILABLE_INTERESTS = [
    { id: "music", label: "Música", icon: <Music size={16} /> },
    { id: "games", label: "Gaming", icon: <Gamepad2 size={16} /> },
    { id: "travel", label: "Viajes", icon: <Plane size={16} /> },
    { id: "coffee", label: "Café", icon: <Coffee size={16} /> },
    { id: "gym", label: "Fitness", icon: <Dumbbell size={16} /> },
    { id: "movies", label: "Cine", icon: <Film size={16} /> },
    { id: "art", label: "Arte", icon: <Palette size={16} /> },
    { id: "books", label: "Libros", icon: <Book size={16} /> },
    { id: "dogs", label: "Perros", icon: <Dog size={16} /> },
    { id: "cooking", label: "Cocina", icon: <Wine size={16} /> }, 
    { id: "wine", label: "Vino", icon: <Wine size={16} /> },
    { id: "photo", label: "Fotografía", icon: <Camera size={16} /> },
    { id: "tech", label: "Tecnología", icon: <Laptop size={16} /> },
    { id: "crypto", label: "Crypto", icon: <Laptop size={16} /> },
    { id: "hiking", label: "Senderismo", icon: <Mountain size={16} /> },
    { id: "health", label: "Salud", icon: <Heart size={16} /> },
    { id: "party", label: "Fiesta", icon: <Music size={16} /> },
    { id: "guitar", label: "Guitarra", icon: <Music size={16} /> },
];

const INTEREST_ICONS = AVAILABLE_INTERESTS.reduce((acc, item) => ({ ...acc, [item.id]: item.icon }), {});
const INTEREST_LABELS = AVAILABLE_INTERESTS.reduce((acc, item) => ({ ...acc, [item.id]: item.label }), {});

export default function Profile() {
  const router = useRouter();
  const { showToast } = useToast();
  
  const [showEdit, setShowEdit] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const [user, setUser] = useState(null);
  const [matchCount, setMatchCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
        const data = await api.get("/me");
        setUser(data);
        setMatchCount(data.match_count || 0);
    } catch (error) {
        console.error("Error cargando perfil:", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-cuadralo-pink" size={40} /></div>;
  if (!user) return null;

  const displayName = user.name || "Usuario";
  const displayAge = user.age || "?";
  const displayBio = user.bio || "Sin descripción";
  const displayPhoto = user.photo || "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=600";
  
  let userInterests = [];
  try { userInterests = JSON.parse(user.interests || "[]"); } catch (e) { }

  return (
    <>
        <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full h-full text-white pt-24 pb-28 px-4 overflow-y-auto max-w-4xl mx-auto scrollbar-hide [&::-webkit-scrollbar]:hidden"
        >
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold tracking-tight">Mi Perfil</h2>
                <button onClick={() => setShowSettings(true)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                    <Settings className="text-gray-400 hover:text-white" size={24} />
                </button>
            </div>

            <div className="flex flex-col items-center mb-6">
                <div className="relative w-32 h-32 mb-4 group cursor-pointer">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cuadralo-pink to-cuadralo-purple animate-spin-slow blur-sm opacity-70 group-hover:opacity-100 transition-opacity" />
                    <img src={displayPhoto} alt={displayName} className="relative w-full h-full rounded-full object-cover border-4 border-black"/>
                </div>
                <h1 className="text-2xl font-bold flex items-center gap-2 mb-1">
                    {displayName}, {displayAge} 
                    <ShieldCheck size={20} className="text-blue-400 fill-blue-400/20" />
                </h1>
                <p className="text-gray-400 font-medium text-sm max-w-xs text-center">{displayBio}</p>
            </div>

            {userInterests.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mb-8 max-w-xs mx-auto">
                    {userInterests.map((interest) => (
                        <div key={interest} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-gray-300">
                            {INTEREST_ICONS[interest] || <Star size={14} />}
                            <span>{INTEREST_LABELS[interest] || interest}</span>
                        </div>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-4 gap-2 mb-8">
                <StatCard icon={<Users size={18} className="text-blue-400" />} number="0" label="Seguidores" />
                <StatCard icon={<UserCheck size={18} className="text-purple-400" />} number="0" label="Seguidos" />
                <StatCard icon={<Zap size={18} className="text-cuadralo-pink" />} number={matchCount} label="Matches" />
                <StatCard icon={<ShieldCheck size={18} className="text-green-400" />} number="10%" label="Nivel" />
            </div>

            <div className="w-full p-5 bg-gradient-to-r from-cuadralo-purple to-cuadralo-pink rounded-3xl mb-8 relative overflow-hidden group cursor-pointer shadow-xl transform transition-transform hover:scale-[1.01]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-8 -mt-8 blur-2xl group-hover:bg-white/20 transition-colors" />
                <div className="relative z-10">
                    <h3 className="text-lg font-extrabold mb-1 flex items-center gap-2">Cuadralo Gold <span className="text-xl">👑</span></h3>
                    <p className="text-white/90 text-xs font-medium mb-4 max-w-[85%] leading-relaxed">Descubre a quién le gustas y obtén Swipes ilimitados.</p>
                    <button className="bg-white text-cuadralo-pink font-bold py-2 px-5 rounded-full text-xs shadow-md hover:shadow-lg transition-all">Ver Planes</button>
                </div>
            </div>

            <div className="space-y-2">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-2">Ajustes</h3>
                <MenuItem icon={<Edit2 size={18} />} label="Editar Perfil" onClick={() => setShowEdit(true)} />
                <MenuItem icon={<Settings size={18} />} label="Configuración" onClick={() => setShowSettings(true)} />
                <div className="h-2"></div> 
                <MenuItem icon={<LogOut size={18} />} label="Cerrar Sesión" color="text-red-500 hover:text-red-400" border="border-red-500/20"
                    onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("user"); router.push("/login"); }} 
                />
            </div>
        </motion.div>

        <AnimatePresence>
            {showEdit && (
                <EditProfileModal 
                    user={user} 
                    onClose={() => setShowEdit(false)} 
                    onSave={() => { fetchProfile(); showToast("Perfil actualizado ✨"); setShowEdit(false); }} 
                />
            )}
        </AnimatePresence>

        <AnimatePresence>
            {showSettings && (
                <SettingsModal 
                    user={user} 
                    onClose={() => { setShowSettings(false); fetchProfile(); }} 
                />
            )}
        </AnimatePresence>
    </>
  );
}

// --- SUB-COMPONENTES VISUALES ---
function StatCard({ icon, number, label }) {
  return (
    <div className="flex flex-col items-center justify-center py-3 px-1 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all cursor-default">
      <div className="mb-1.5 p-1.5 bg-black/20 rounded-full">{icon}</div>
      <span className="text-sm font-extrabold truncate w-full text-center">{number}</span>
      <span className="text-[10px] text-gray-400 font-medium truncate w-full text-center uppercase tracking-wide">{label}</span>
    </div>
  );
}

function MenuItem({ icon, label, onClick, color = "text-white", border = "border-white/5" }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center justify-between p-3.5 bg-white/5 rounded-2xl border ${border} hover:bg-white/10 transition-all group active:scale-[0.98]`}>
      <div className="flex items-center gap-3">
        <div className={`text-gray-400 group-hover:${color.replace('hover:', '')} transition-colors`}>{icon}</div>
        <span className={`text-sm font-medium ${color}`}>{label}</span>
      </div>
      <ChevronRight size={16} className="text-gray-600 group-hover:text-white transition-colors" />
    </button>
  );
}

function EditProfileModal({ user, onClose, onSave }) {
    const { showToast } = useToast();
    const [formData, setFormData] = useState({ name: user.name, bio: user.bio || "", photo: user.photo, interests: [] });
    useEffect(() => { try { const parsed = JSON.parse(user.interests || "[]"); setFormData(prev => ({ ...prev, interests: parsed })); } catch (e) {} }, [user.interests]);
    const [isSaving, setIsSaving] = useState(false);
    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try { 
            const newUrl = await api.upload(file); 
            setFormData(prev => ({ ...prev, photo: newUrl })); 
            showToast("Foto cargada correctamente");
        } catch (error) { showToast("Error al subir imagen", "error"); }
    };
    const toggleInterest = (id) => { setFormData(prev => { const current = prev.interests; return current.includes(id) ? { ...prev, interests: current.filter(i => i !== id) } : { ...prev, interests: [...current, id] }; }); };
    const handleSave = async () => {
        setIsSaving(true);
        try { await api.put("/me", formData); onSave(); } catch (error) { showToast("Error guardando cambios", "error"); } 
        finally { setIsSaving(false); }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center">
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="w-full max-w-md bg-[#1a0b2e] rounded-t-3xl sm:rounded-3xl p-6 border-t border-white/10 shadow-2xl h-[85vh] overflow-y-auto scrollbar-hide [&::-webkit-scrollbar]:hidden">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">Editar Perfil</h3>
                    <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"><X size={20} className="text-gray-400" /></button>
                </div>
                <div className="flex flex-col items-center mb-8">
                    <label className="relative w-32 h-32 group cursor-pointer">
                        <img src={formData.photo} className="w-full h-full rounded-full object-cover border-4 border-cuadralo-pink opacity-80 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 flex items-center justify-center"><Camera size={32} className="text-white drop-shadow-lg" /></div>
                        <input type="file" className="hidden" onChange={handlePhotoChange} accept="image/*" />
                    </label>
                    <p className="text-xs text-gray-400 mt-2 font-medium">Toca para cambiar foto</p>
                </div>
                <div className="space-y-6">
                    <div className="space-y-4">
                        <div><label className="text-[10px] font-bold text-gray-500 uppercase ml-2">Nombre</label><input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-cuadralo-pink outline-none mt-1"/></div>
                        <div><label className="text-[10px] font-bold text-gray-500 uppercase ml-2">Bio</label><textarea value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-cuadralo-pink outline-none mt-1 resize-none" placeholder="Cuéntanos algo sobre ti..."/></div>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase ml-2 mb-2 block">Tus Intereses</label>
                        <div className="grid grid-cols-2 gap-2">
                            {AVAILABLE_INTERESTS.map((item) => { 
                                const isActive = formData.interests.includes(item.id); 
                                return (
                                    <button key={item.id} onClick={() => toggleInterest(item.id)} className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${isActive ? 'bg-cuadralo-pink/20 border-cuadralo-pink text-white' : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'}`}>
                                        <div className={isActive ? "text-cuadralo-pink" : "text-gray-500"}>{item.icon}</div>
                                        <span className="text-sm font-medium">{item.label}</span>
                                    </button>
                                ); 
                            })}
                        </div>
                    </div>
                </div>
                <button onClick={handleSave} disabled={isSaving} className="w-full mt-8 bg-cuadralo-pink py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform disabled:opacity-50 mb-6">{isSaving ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Guardar Cambios</>}</button>
            </motion.div>
        </motion.div>
    );
}

function SettingsModal({ user, onClose }) {
    const { showToast } = useToast();
    const [view, setView] = useState("main");
    const [prefs, setPrefs] = useState({ distance: 50, show: "Todos" });
    const [passData, setPassData] = useState({ old: "", new: "", confirm: "" });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        try { if (user.preferences) {
            const parsed = JSON.parse(user.preferences);
            setPrefs(prev => ({ ...prev, ...parsed }));
        } } catch (e) {}
    }, [user]);

    const handleSavePrefs = async () => {
        setLoading(true);
        try {
            await api.put("/me", { preferences: prefs });
            showToast("Configuración guardada ⚙️");
            onClose();
        } catch (e) { showToast("Error al guardar", "error"); } 
        finally { setLoading(false); }
    };

    const handleChangePassword = async () => {
        if (passData.new !== passData.confirm) {
            showToast("Las contraseñas no coinciden", "error");
            return;
        }
        setLoading(true);
        try {
            await api.put("/change-password", { old_password: passData.old, new_password: passData.new });
            showToast("Contraseña actualizada 🔐");
            setView("main");
            setPassData({ old: "", new: "", confirm: "" });
        } catch (error) { 
            showToast(error.message || "Error al cambiar contraseña", "error"); 
        } finally { setLoading(false); }
    };

    const deleteAccount = async () => {
        if (!confirm("¿ESTÁS SEGURO?")) return;
        try { 
            await api.delete("/me"); 
            showToast("Cuenta eliminada");
            window.location.href = "/login"; 
        } catch (e) { showToast("Error al eliminar cuenta", "error"); }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center">
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="w-full max-w-md bg-[#1a0b2e] rounded-t-3xl sm:rounded-3xl p-6 border-t border-white/10 shadow-2xl h-[85vh] overflow-y-auto scrollbar-hide [&::-webkit-scrollbar]:hidden flex flex-col">
                <div className="flex justify-between items-center mb-8">
                    {view === "password" ? (
                         <button onClick={() => setView("main")} className="p-2 -ml-2 text-gray-400 hover:text-white bg-white/5 rounded-full transition-colors"><ChevronLeft size={20}/></button>
                    ) : (
                         <h3 className="text-2xl font-extrabold text-white">Configuración</h3>
                    )}
                    {view === "password" && <h3 className="text-lg font-bold">Cambiar contraseña</h3>}
                    <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"><X size={20} className="text-gray-400" /></button>
                </div>

                <div className="flex-1">
                    {view === "main" ? (
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Búsqueda</h4>
                                <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                                    <div className="flex justify-between mb-3"><span className="text-sm font-medium text-gray-300">Distancia</span><span className="text-sm font-bold text-cuadralo-pink">{prefs.distance} km</span></div>
                                    <input type="range" min="1" max="100" value={prefs.distance} onChange={(e) => setPrefs({...prefs, distance: parseInt(e.target.value)})} className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cuadralo-pink"/>
                                </div>
                                <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                                    <span className="text-sm font-medium block mb-4 text-gray-300">Mostrarme</span>
                                    <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5">
                                        {['Hombres', 'Mujeres', 'Todos'].map((opt) => (
                                            <button key={opt} onClick={() => setPrefs({...prefs, show: opt})} className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${prefs.show === opt ? 'bg-gradient-to-r from-cuadralo-pink to-purple-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}>{opt}</button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 mt-6">Seguridad</h4>
                                <button onClick={() => setView("password")} className="w-full p-5 bg-white/5 rounded-2xl border border-white/10 flex justify-between items-center group hover:bg-white/10 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400"><Lock size={18}/></div>
                                        <span className="font-bold text-sm">Cambiar contraseña</span>
                                    </div>
                                    <ChevronRight size={18} className="text-gray-600 group-hover:text-white transition-all"/>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-fade-in">
                            <div><label className="text-[10px] font-bold text-gray-500 uppercase ml-4 mb-1 block">Contraseña Actual</label><input type="password" value={passData.old} onChange={(e) => setPassData({...passData, old: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-cuadralo-pink outline-none transition-all placeholder:text-gray-700" placeholder="••••••••" /></div>
                            <div><label className="text-[10px] font-bold text-gray-500 uppercase ml-4 mb-1 block">Nueva Contraseña</label><input type="password" value={passData.new} onChange={(e) => setPassData({...passData, new: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-cuadralo-pink outline-none transition-all placeholder:text-gray-700" placeholder="Mínimo 6 caracteres" /></div>
                            <div><label className="text-[10px] font-bold text-gray-500 uppercase ml-4 mb-1 block">Confirmar</label><input type="password" value={passData.confirm} onChange={(e) => setPassData({...passData, confirm: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-cuadralo-pink outline-none transition-all placeholder:text-gray-700" placeholder="Repite contraseña" /></div>
                            <button onClick={handleChangePassword} disabled={loading} className="w-full mt-6 bg-gradient-to-r from-cuadralo-pink to-purple-600 py-4 rounded-2xl font-bold text-white shadow-lg shadow-pink-500/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">{loading ? <Loader2 className="animate-spin" size={20}/> : "Actualizar Contraseña"}</button>
                        </div>
                    )}
                </div>

                {view === "main" && (
                    <div className="pt-6 pb-4">
                        <button 
                            onClick={handleSavePrefs} 
                            disabled={loading} 
                            className="w-full py-4 rounded-2xl bg-gradient-to-r from-cuadralo-pink to-purple-600 text-white font-bold text-sm shadow-lg shadow-pink-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18}/> : <><Save size={18}/> Guardar configuración</>}
                        </button>
                        <button onClick={deleteAccount} className="w-full mt-4 py-2 text-gray-600 text-xs font-medium hover:text-red-400 transition-colors">Eliminar Cuenta</button>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}