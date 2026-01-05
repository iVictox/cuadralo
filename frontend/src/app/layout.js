import "./globals.css"; 
import { Inter } from "next/font/google";
import { ToastProvider } from "@/context/ToastContext"; 
// Asegúrate de NO importar MatchNotification aquí si no lo vamos a usar todavía

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
           {/* Eliminamos MatchNotification de aquí por ahora */}
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}