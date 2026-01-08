import "./globals.css"; 
import { Inter } from "next/font/google";
import { ToastProvider } from "@/context/ToastContext"; 
import { SocketProvider } from "@/context/SocketContext";
import { ConfirmProvider } from "@/context/ConfirmContext"; // <--- IMPORTAR

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
           <ConfirmProvider> {/* <--- AGREGAR AQUÍ (Orden: Toast > Confirm > Socket > Hijos) */}
             <SocketProvider>
                {children}
             </SocketProvider>
           </ConfirmProvider>
        </ToastProvider>
      </body>
    </html>
  );
}