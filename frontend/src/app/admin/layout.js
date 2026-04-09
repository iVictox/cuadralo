"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { api } from "@/utils/api";
import Link from "next/link";
import { Users, CreditCard, Settings, LayoutDashboard, LogOut, Menu, X, Crown, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminLayout({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const userStr = localStorage.getItem("user");
        if (!userStr) {
          router.push("/login");
          return;
        }

        const user = JSON.parse(userStr);
        if (user.role !== "admin") {
          router.push("/");
          return;
        }

        // Verify with backend
        await api.get("/admin/stats");
        setIsAdmin(true);
      } catch (error) {
        console.error(error);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };
    checkAdmin();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!isAdmin) return null;

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { name: "Usuarios", icon: Users, path: "/admin/users" },
    { name: "VIP", icon: Crown, path: "/admin/vip" },
    { name: "Pagos", icon: CreditCard, path: "/admin/payments" },
    { name: "Logs", icon: Activity, path: "/admin/logs" },
    { name: "Configuración", icon: Settings, path: "/admin/settings" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: isSidebarOpen ? 0 : window.innerWidth >= 768 ? 0 : -300 }}
        className={`fixed md:relative z-50 w-64 h-full bg-gray-800 border-r border-gray-700 flex flex-col transition-transform duration-300`}
      >
        <div className="p-4 flex justify-between items-center border-b border-gray-700">
          <span className="text-xl font-bold text-white tracking-wide">Panel Cuadralo</span>
          <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-2 px-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <li key={item.path}>
                  <Link href={item.path}>
                    <span
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? "bg-purple-600 text-white"
                          : "text-gray-400 hover:bg-gray-700 hover:text-white"
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon size={20} />
                      {item.name}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            Cerrar Sesión
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between md:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-400 hover:text-white">
            <Menu size={24} />
          </button>
          <span className="font-bold">Panel de Admin</span>
          <div className="w-6"></div> {/* Placeholder for balance */}
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
