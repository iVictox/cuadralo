"use client";

import "./globals.css";
import { Inter } from "next/font/google";
import { ToastProvider } from "@/context/ToastContext";
import { SocketProvider } from "@/context/SocketContext";
import { ConfirmProvider } from "@/context/ConfirmContext";
import { useEffect, useState } from "react";
// ✅ IMPORTACIÓN NUEVA
import { GoogleOAuthProvider } from '@react-oauth/google';

const inter = Inter({ subsets: ["latin"] });

// ⚠️ REEMPLAZA ESTO CON TU CLIENT ID REAL DE GOOGLE CLOUD CONSOLE
const GOOGLE_CLIENT_ID = "TU_CLIENT_ID_AQUI.apps.googleusercontent.com";

export default function RootLayout({ children }) {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") setTheme("light");
  }, []);

  return (
    <html lang="es" className={theme}>
      <head>
        <meta name="theme-color" content={theme === "dark" ? "#0f0518" : "#ffffff"} />
      </head>
      <body className={`${inter.className} min-h-[100dvh] overflow-x-hidden antialiased bg-cuadralo-bgLight dark:bg-[#0f0518] text-cuadralo-textLight dark:text-cuadralo-textDark selection:bg-cuadralo-pink selection:text-white transition-colors duration-500`}>
        {/* ✅ ENVOLVEMOS TODA LA APP EN EL GOOGLE PROVIDER */}
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