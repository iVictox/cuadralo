import "./globals.css"; 
import { Inter } from "next/font/google";
import { ToastProvider } from "@/context/ToastContext"; 
import { SocketProvider } from "@/context/SocketContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Cuadralo",
  description: "Citas y encuentros en Venezuela",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
         <SocketProvider>
            {/* ... resto de providers */}
            {children}
         </SocketProvider>
      </body>
    </html>
  );
}