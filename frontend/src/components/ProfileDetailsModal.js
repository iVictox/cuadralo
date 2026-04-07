"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    ChevronDown, MapPin, Quote, Loader2, Crown, ChevronLeft, ChevronRight, User, Calendar, Heart, MessageCircle
} from "lucide-react";
import { api } from "@/utils/api";
import { getInterestInfo } from "@/utils/interests"; 
import ChatWindow from "@/components/ChatWindow"; 

export default function ProfileDetailsModal({ profile, onClose }) {
    const [fullProfile, setFullProfile] = useState(profile);
    const [loading, setLoading] = useState(false);
    const [activePhoto, setActivePhoto] = useState(0);
    
    const [showDirectChat, setShowDirectChat] = useState(false);

    useEffect(() => {
        const fetchFullDetails = async () => {
            setLoading(true);
            try {
                const data = await api.get(`/users/${profile.id}`);
                
                let processedInterests = [];
                if (data.interestsList && data.interestsList.length > 0) {
                    processedInterests = data.interestsList;
                } else if (data.interests && data.interests.length > 0) {
                    processedInterests = data.interests.map(i => i.slug || i.id || i);
                }

                setFullProfile({ ...data, interests: processedInterests });
            } catch (error) {
                console.error("Error cargando perfil completo:", error);
            } finally {
                setLoading(false);
            }
        };

        if (profile.id) {
            fetchFullDetails();
        }
    }, [profile]);

    const interests = Array.isArray(fullProfile.interests) ? fullProfile.interests : [];
    
    const getValidPhotos = () => {
        let valid = [];
        if (fullProfile.photos && Array.isArray(fullProfile.photos)) {
            valid = fullProfile.photos.filter(p => typeof p === 'string' && p.trim() !== "");
        }
        if (valid.length === 0 && fullProfile.photo && typeof fullProfile.photo === 'string' && fullProfile.photo.trim() !== "") {
            valid = [fullProfile.photo];
        }
        if (valid.length === 0 && fullProfile.img) {
            valid = [fullProfile.img];
        }
        if (valid.length === 0) {
            valid = ["https://via.placeholder.com/600x800"];
        }
        return valid;
    };

    const photos = getValidPhotos();

    const nextPhoto = (e) => {
        e.stopPropagation();
        if (activePhoto < photos.length - 1) setActivePhoto(activePhoto + 1);
    };

    const prevPhoto = (e) => {
        e.stopPropagation();
        if (activePhoto > 0) setActivePhoto(activePhoto - 1);
    };

    const bio = fullProfile.bio || "Aún no ha escrito nada sobre sí mismo. ¡Averígualo chateando!";
    
    let ageDisplay = fullProfile.age || "";
    if (!ageDisplay && fullProfile.birth_date) {
        ageDisplay = new Date().getFullYear() - new Date(fullProfile.birth_date).getFullYear();
    }

    return (
        <>
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
                onClick={onClose}
            >
                <motion.div 
                    initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className={`bg-[#140520] w-full max-w-md h-[90vh] sm:h-[85vh] rounded-t-3xl sm:rounded-[2.5rem] overflow-y-auto no-scrollbar border border-white/10 shadow-2xl relative flex flex-col ${fullProfile.is_prime ? 'ring-2 ring-yellow-500/50' : ''}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* 📸 CARRUSEL DE FOTOS */}
                    <div className="relative w-full aspect-[4/5] sm:aspect-square flex-shrink-0 bg-black">
                        
                        {fullProfile.is_prime && (
                            <div className="absolute top-5 left-5 z-30 bg-gradient-to-r from-yellow-400 to-yellow-600 p-2 rounded-xl shadow-lg border border-yellow-300">
                                <Crown size={18} className="text-white fill-white animate-pulse" />
                            </div>
                        )}

                        <AnimatePresence mode="wait">
                            <motion.img 
                                key={activePhoto}
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                                src={photos[activePhoto]} 
                                className="w-full h-full object-cover" 
                                alt={fullProfile.name} 
                            />
                        </AnimatePresence>

                        <button onClick={onClose} className="absolute top-4 right-4 p-3 bg-black/30 backdrop-blur-md rounded-full text-white hover:bg-black/50 transition-colors z-20 border border-white/10 shadow-lg">
                            <ChevronDown size={24}/>
                        </button>

                        {photos.length > 1 && (
                            <div className="absolute top-4 inset-x-20 flex gap-1.5 z-20">
                                {photos.map((_, i) => (
                                    <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i === activePhoto ? 'bg-white shadow-[0_0_5px_rgba(255,255,255,0.8)]' : 'bg-white/30 backdrop-blur-md'}`} />
                                ))}
                            </div>
                        )}

                        <div className="absolute inset-0 flex z-10 pt-16">
                            <div className="w-1/2 h-full cursor-pointer flex items-center justify-start px-4 opacity-0 hover:opacity-100 transition-opacity" onClick={prevPhoto}>
                                {activePhoto > 0 && <div className="bg-black/30 p-2 rounded-full backdrop-blur-md"><ChevronLeft className="text-white" /></div>}
                            </div>
                            <div className="w-1/2 h-full cursor-pointer flex items-center justify-end px-4 opacity-0 hover:opacity-100 transition-opacity" onClick={nextPhoto}>
                                {activePhoto < photos.length - 1 && <div className="bg-black/30 p-2 rounded-full backdrop-blur-md"><ChevronRight className="text-white" /></div>}
                            </div>
                        </div>

                        <div className="absolute bottom-0 w-full h-48 bg-gradient-to-t from-[#140520] via-[#140520]/80 to-transparent pointer-events-none"/>
                    </div>

                    {/* 📄 INFO DEL PERFIL INFERIOR */}
                    <div className="px-6 pb-10 relative -mt-16 z-10 flex-1">
                        
                        {/* ✅ BOTÓN DE CHAT DIRECTO FLOTANTE */}
                        <button 
                            onClick={() => setShowDirectChat(true)}
                            className="absolute -top-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white shadow-[0_10px_20px_rgba(59,130,246,0.5)] hover:scale-110 active:scale-95 transition-all z-40 border-2 border-[#140520]"
                        >
                            <MessageCircle size={26} fill="currentColor" />
                        </button>
                        
                        <div className="mb-6 pr-16">
                            <h2 className="text-4xl font-black text-white flex items-end gap-3 drop-shadow-md tracking-tighter uppercase">
                                {fullProfile.name}
                                {ageDisplay && <span className="text-3xl font-light text-cuadralo-pink mb-[2px]">{ageDisplay}</span>}
                            </h2>
                            
                            <div className="flex items-center gap-2 text-gray-300 text-xs font-bold uppercase tracking-[0.2em] mt-2">
                                <MapPin size={16} className="text-cuadralo-pink" /> 
                                {fullProfile.location || "Ubicación desconocida"}
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mt-4">
                                {fullProfile.gender && (
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] uppercase tracking-widest font-bold text-gray-300 shadow-sm">
                                        <User size={12} className="text-cuadralo-pink" />
                                        <span>{fullProfile.gender}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] uppercase tracking-widest font-bold text-gray-300 shadow-sm">
                                    <Calendar size={12} className="text-blue-400" />
                                    <span>Se unió en {new Date(fullProfile.created_at || Date.now()).getFullYear()}</span>
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-cuadralo-pink" size={32} /></div>
                        ) : (
                            <div className="space-y-8 mt-6">
                                <div>
                                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
                                        <Quote size={14} className="text-cuadralo-pink"/> Sobre mí
                                    </h3>
                                    <div className="bg-white/5 border border-white/5 p-6 rounded-3xl shadow-inner">
                                        <p className="text-gray-300 text-sm leading-relaxed italic">
                                            "{bio}"
                                        </p>
                                    </div>
                                </div>

                                {interests.length > 0 && (
                                    <div>
                                        <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] mb-4 ml-1 flex items-center gap-2">
                                            <Heart size={14} className="text-cuadralo-pink"/> Intereses
                                        </h3>
                                        <div className="flex flex-wrap gap-2.5">
                                            {interests.map(slug => {
                                                const info = getInterestInfo(slug);
                                                return (
                                                    <div 
                                                        key={slug} 
                                                        className="flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold tracking-widest uppercase text-white shadow-sm"
                                                    >
                                                        <span className="text-cuadralo-pink">{info.icon}</span>
                                                        {info.name}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {(fullProfile.followers_count > 0 || fullProfile.following_count > 0) && (
                                    <div className="flex gap-4 pt-4 border-t border-white/10">
                                        <div className="flex-1 bg-white/5 p-4 rounded-2xl text-center border border-white/5">
                                            <span className="block text-2xl font-black text-white">{fullProfile.followers_count || 0}</span>
                                            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500">Seguidores</span>
                                        </div>
                                        <div className="flex-1 bg-white/5 p-4 rounded-2xl text-center border border-white/5">
                                            <span className="block text-2xl font-black text-white">{fullProfile.following_count || 0}</span>
                                            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500">Seguidos</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>

            {/* ✅ CORRECCIÓN: VENTANA DE CHAT AHORA VERIFICA SI ES MATCH */}
            <AnimatePresence>
                {showDirectChat && (
                    <div className="fixed inset-0 z-[400] bg-black/90">
                        <ChatWindow 
                            chat={{ 
                                id: fullProfile.id, 
                                name: fullProfile.name, 
                                photo: photos[0],
                                // ✅ Si es match, no será Rompehielo, será gratis.
                                isDirect: !fullProfile.is_match 
                            }} 
                            onBack={() => setShowDirectChat(false)} 
                        />
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}