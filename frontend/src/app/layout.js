"use client";

import "./globals.css";
import { Inter } from "next/font/google";
import { ToastProvider } from "@/context/ToastContext";
import { SocketProvider } from "@/context/SocketContext";
import { ConfirmProvider } from "@/context/ConfirmContext";
import { useEffect, useState } from "react";
import { GoogleOAuthProvider } from '@react-oauth/google';

const inter = Inter({ subsets: ["latin"] });

// ⚠️ REEMPLAZA ESTO CON TU CLIENT ID REAL DE GOOGLE CLOUD CONSOLE
const GOOGLE_CLIENT_ID = "TU_CLIENT_ID_AQUI.apps.googleusercontent.com";

export default function RootLayout({ children }) {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") setTheme("light");

    // =================================================================
    // 🛡️ SOLUCIÓN DEFINITIVA ANTI-ZOOM PARA IOS/SAFARI Y ANDROID
    // =================================================================
    
    // 1. Bloquea el "pellizco" (pinch-to-zoom) con dos dedos
    const handleTouchMove = (e) => {
      if (e.touches.length > 1) {
        e.preventDefault(); 
      }
    };

    // 2. Bloquea el "doble toque" rápido (double-tap to zoom)
    let lastTouchEnd = 0;
    const handleTouchEnd = (e) => {
      const now = (new Date()).getTime();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };

    // 3. Bloquea los gestos de trackpad/pantalla exclusivos de Apple
    const handleGesture = (e) => {
        e.preventDefault();
    };

    // Aplicamos los bloqueadores (usamos passive: false para que nos deje cancelar el evento)
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });
    document.addEventListener('gesturestart', handleGesture, { passive: false });
    document.addEventListener('gesturechange', handleGesture, { passive: false });

    // Limpiamos los eventos al desmontar
    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('gesturestart', handleGesture);
      document.removeEventListener('gesturechange', handleGesture);
    };
  }, []);

  return (
    <html lang="es" className={theme} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content={theme === "dark" ? "#0f0518" : "#ffffff"} />
        {/* viewport-fit=cover ayuda a las pantallas con "notch" (isla) en iPhone */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover" />
      </head>
      {/* ✅ Agregadas las clases 'touch-pan-x touch-pan-y overscroll-none' para forzar comportamiento nativo desde CSS */}
      <body className={`${inter.className} min-h-[100dvh] overflow-x-hidden antialiased bg-cuadralo-bgLight dark:bg-[#0f0518] text-cuadralo-textLight dark:text-cuadralo-textDark selection:bg-cuadralo-pink selection:text-white transition-colors duration-500 touch-pan-x touch-pan-y overscroll-none`}>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <ToastProvider>
                <ConfirmProvider>
                    <SocketProvider>
                        {children}
                    </SocketProvider>
                </ConfirmProvider>
            </ToastProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}