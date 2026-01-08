"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
    ChevronDown, MapPin, Star, Music, Gamepad2, Plane, Coffee, Dumbbell, Film, 
    Palette, Book, Dog, Wine, Camera, Laptop, Mountain, Heart, ShieldCheck, Quote, Loader2 
} from "lucide-react";
import { api } from "@/utils/api";

const ICONS = {
    music: <Music size={14} />, games: <Gamepad2 size={14} />, travel: <Plane size={14} />,
    coffee: <Coffee size={14} />, gym: <Dumbbell size={14} />, movies: <Film size={14} />,
    art: <Palette size={14} />, books: <Book size={14} />, dogs: <Dog size={14} />,
    cooking: <Wine size={14} />, wine: <Wine size={14} />, photo: <Camera size={14} />,
    tech: <Laptop size={14} />, crypto: <Laptop size={14} />, hiking: <Mountain size={14} />,
    health: <Heart size={14} />, party: <Music size={14} />, guitar: <Music size={14} />
};

export default function ProfileDetailsModal({ profile, onClose }) {
    const [fullProfile, setFullProfile] = useState(profile);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchFullDetails = async () => {
            // Si falta info crítica (bio o intereses), la pedimos al backend
            if (profile.bio || (profile.interests && profile.interests.length > 0)) {
                return;
            }

            setLoading(true);
            try {
                const data = await api.get(`/users/${profile.id}`);
                setFullProfile(data);
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
    const img = fullProfile.photo || fullProfile.img || "https://via.placeholder.com/400";
    const bio = fullProfile.bio || "Sin descripción";
    const age = fullProfile.age ? `, ${fullProfile.age}` : "";

    return (
        <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={onClose}
        >
            <motion.div 
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-[#140520] w-full max-w-md h-[90vh] sm:h-[85vh] rounded-t-3xl sm:rounded-3xl overflow-y-auto scrollbar-hide border border-white/10 shadow-2xl relative"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative h-[50%] w-full">
                    <img src={img} className="w-full h-full object-cover" alt={fullProfile.name} />
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/30 backdrop-blur-md rounded-full text-white hover:bg-black/50 transition-colors z-20 border border-white/10">
                        <ChevronDown size={24}/>
                    </button>
                    <div className="absolute bottom-0 w-full h-40 bg-gradient-to-t from-[#140520] via-[#140520]/90 to-transparent"/>
                </div>

                <div className="px-6 pb-10 relative -mt-16 z-10">
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <h2 className="text-4xl font-extrabold text-white flex items-center gap-2">
                                {fullProfile.name}<span className="text-2xl font-medium text-gray-400">{age}</span>
                                {fullProfile.is_verified && <ShieldCheck size={24} className="text-blue-400 fill-blue-400/20" />}
                            </h2>
                            <div className="flex items-center gap-2 text-cuadralo-pink text-sm font-medium mt-1">
                                <MapPin size={16} fill="currentColor" /> <span>Valencia, Venezuela</span>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-cuadralo-pink" size={32} /></div>
                    ) : (
                        <div className="space-y-8">
                            <div className="relative bg-white/5 border border-white/10 p-6 rounded-2xl">
                                <Quote size={20} className="absolute top-4 left-4 text-white/20 rotate-180" />
                                <p className="text-gray-200 text-base leading-relaxed text-center italic pt-2 px-2 font-medium">"{bio}"</p>
                                <Quote size={20} className="absolute bottom-4 right-4 text-white/20" />
                            </div>

                            {interests.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 ml-1">Intereses</h3>
                                    <div className="flex flex-wrap gap-2.5">
                                        {interests.map(id => (
                                            <div key={id} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm font-medium text-gray-200 shadow-sm">
                                                <span className="text-cuadralo-pink">{ICONS[id] || <Star size={14} />}</span>
                                                <span className="capitalize">{id}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}