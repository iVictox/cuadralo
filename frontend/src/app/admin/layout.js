"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { api } from "@/utils/api";
import Link from "next/link";
import { 
  Users, CreditCard, Settings, LayoutDashboard, LogOut, Menu, X, 
  ShieldAlert, Activity, MessageSquare, AlertTriangle, ChevronDown, ChevronRight, BarChart3, Database, ShieldCheck, Crown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminLayout({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState(null);
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
        const validRoles = ['superadmin', 'admin', 'moderator', 'support'];
        
        if (!validRoles.includes(user.role)) {
          router.push("/");
          return;
        }

        await api.get("/admin/stats"); 
        setIsAdmin(true);
        setUserRole(user.role);
      } catch (error) {
        console.error(error);
        if (error.response?.status === 403) {
            alert(error.response.data.error || "Acceso denegado");
        }
        router.push("/");
      } finally {
        setLoading(false);
      }
    };
    checkAdmin();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const menuCategories = [
    {
      title: "General",
      items: [
        { name: "Dashboard", icon: LayoutDashboard, path: "/admin" },
        { name: "Analíticas", icon: BarChart3, path: "/admin/analytics" },
      ]
    },
    {
      title: "Comunidad",
      items: [
        { name: "Usuarios", icon: Users, path: "/admin/users" },
        { name: "Pagos", icon: CreditCard, path: "/admin/payments" },
        { name: "Gestión VIP", icon: Crown, path: "/admin/vip" }, // ✅ SEPARADO AQUÍ
      ]
    },
    {
      title: "Seguridad",
      items: [
        { name: "Moderación", icon: MessageSquare, path: "/admin/moderation" },
        { name: "Reportes", icon: AlertTriangle, path: "/admin/reports" },
      ]
    },
    {
      title: "Sistema",
      items: [
        { name: "Configuración", icon: Settings, path: "/admin/settings" },
        { name: "Gestión de Admins", icon: ShieldCheck, path: "/admin/management", roles: ['superadmin'] }, 
        { name: "Auditoría (Logs)", icon: Activity, path: "/admin/logs" },
        { name: "Estado del Sistema", icon: Database, path: "/admin/system" },
      ]
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="flex h-screen bg-gray-950 text-gray-200 overflow-hidden selection:bg-purple-500/30">
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={{ x: -300 }} animate={{ x: isSidebarOpen ? 0 : window.innerWidth >= 1024 ? 0 : -300 }}
        className={`fixed lg:relative z-50 w-72 h-full bg-gray-900 border-r border-gray-800 flex flex-col transition-transform duration-300 shadow-2xl`}
      >
        <div className="p-6 flex justify-between items-center border-b border-gray-800 bg-gray-900/50">
          <div className="flex flex-col">
              <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 tracking-tight">CUADRALO</span>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-0.5">Control Center</span>
          </div>
          <button className="lg:hidden text-gray-400 hover:text-white bg-gray-800 p-2 rounded-lg" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 custom-scrollbar px-4 space-y-8">
          {menuCategories.map((category, idx) => (
             <div key={idx}>
                <h3 className="px-3 text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">{category.title}</h3>
                <ul className="space-y-1.5">
                  {category.items.map((item) => {
                    if (item.roles && !item.roles.includes(userRole)) return null;

                    const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
                    return (
                      <li key={item.path}>
                        <Link href={item.path}>
                          <span
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-medium ${
                              isActive
                                ? "bg-purple-600/10 text-purple-400 border border-purple-500/20 shadow-inner"
                                : "text-gray-400 hover:bg-gray-800/80 hover:text-gray-200 border border-transparent"
                            }`}
                            onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
                          >
                            <item.icon size={18} className={isActive ? "text-purple-500" : "text-gray-500"} />
                            {item.name}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
             </div>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800 bg-gray-900/80">
          <div className="flex items-center gap-3 px-3 py-3 mb-4 rounded-xl bg-gray-800/50 border border-gray-700/50">
             <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold text-white shadow-lg">A</div>
             <div>
                <p className="text-sm font-bold text-white">Sesión Activa</p>
                <p className="text-xs text-purple-400 uppercase tracking-wider font-semibold">{userRole}</p>
             </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-red-400 font-bold bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-colors"
          >
            <LogOut size={18} /> CERRAR SESIÓN
          </button>
        </div>
      </motion.aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#0a0a0a]">
        <header className="bg-gray-900/80 backdrop-blur border-b border-gray-800 p-4 flex items-center justify-between lg:hidden sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-400 hover:text-white bg-gray-800 p-2 rounded-lg border border-gray-700">
            <Menu size={20} />
          </button>
          <span className="font-bold text-white tracking-wide">Panel Administrativo</span>
          <div className="w-9"></div> 
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
             {children}
          </div>
        </div>
      </main>
    </div>
  );
}