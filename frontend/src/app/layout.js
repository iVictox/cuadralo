import "./globals.css"; 
import { Inter } from "next/font/google";
import { ToastProvider } from "@/context/ToastContext";
import MatchNotification from "@/components/MatchNotification"; // <--- Importamos el componente de sockets

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Cuadralo",
  description: "Citas y encuentros en Venezuela",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="scrollbar-hide">
      <body className={`${inter.className} bg-[#0f0518] antialiased`}>
        <ToastProvider>
          {/* Este componente se mantiene escuchando eventos de socket.io 
            sin importar en qué página navegue el usuario 
          */}
          <MatchNotification />
          
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}