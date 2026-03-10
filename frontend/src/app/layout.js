"use client";

import "./globals.css";
import { Inter } from "next/font/google";
import { ToastProvider } from "@/context/ToastContext";
import { SocketProvider } from "@/context/SocketContext";
import { ConfirmProvider } from "@/context/ConfirmContext";
import { useEffect, useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  return (
    <html lang="es" className={theme}>
      <body className={`${inter.className} bg-cuadralo-bgLight dark:bg-cuadralo-bgDark text-cuadralo-textLight dark:text-cuadralo-textDark transition-colors duration-300 antialiased`}>
        <ToastProvider>
          <ConfirmProvider>
            <SocketProvider>
              {children}
            </SocketProvider>
          </ConfirmProvider>
        </ToastProvider>
      </body>
    </html>
  );
}