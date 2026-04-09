"use client";

import { Search, Bell } from "lucide-react";
import { motion } from "framer-motion";

export default function SocialHeader({ unreadCount = 0, onSearchClick, onNotifClick }) {
    return (
        <div className="fixed top-0 left-0 md:left-20 right-0 h-16 z-50 bg-cuadralo-bgLight/80 dark:bg-cuadralo-bgDark/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5 transition-colors duration-300">
            <div className="flex items-center justify-between w-full h-full px-4 max-w-[600px] mx-auto">

                {/* IZQUIERDA: Logo */}
                <div className="flex items-center gap-2">
                    <div className="relative flex items-center justify-center">
                        <img
                            src="/logo.svg"
                            className="object-contain dark:invert-0 invert max-w-[250px] w-full h-auto"
                            alt="Cuadralo"
                        />
                    </div>
                </div>

                {/* DERECHA: Acciones */}
                <div className="flex items-center gap-1.5">
                    {/* Botón Buscar */}
                    <button
                        onClick={onSearchClick}
                        className="p-2.5 rounded-full text-cuadralo-textMutedLight dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-cuadralo-textLight dark:hover:text-white transition-all active:scale-95"
                    >
                        <Search size={22} strokeWidth={2.5} />
                    </button>

                    {/* Botón Notificaciones */}
                    <button
                        onClick={onNotifClick}
                        className="relative p-2.5 rounded-full text-cuadralo-textMutedLight dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-cuadralo-textLight dark:hover:text-white transition-all active:scale-95"
                    >
                        <Bell size={22} strokeWidth={2.5} />

                        {/* Globo de notificaciones no leídas */}
                        {unreadCount > 0 && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-cuadralo-pink rounded-full border-2 border-cuadralo-bgLight dark:border-cuadralo-bgDark"
                            />
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
}