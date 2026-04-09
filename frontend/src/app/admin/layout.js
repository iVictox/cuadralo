"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { api } from "@/utils/api";
import Link from "next/link";
import { 
  LayoutDashboard, Users, MessageSquare, AlertTriangle, CreditCard,
  Settings, ShieldCheck, Activity, Database, BarChart3, ChevronDown, 
  LogOut, Menu, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminLayout({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [openCategory, setOpenCategory] = useState("📊 DASHBOARD"); // Estado del Acordeón
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

  // ✅ EL MENÚ MAESTRO COMPLETO EXACTAMENTE COMO LO PEDISTE
  const menuCategories = [
    {
      title: "📊 DASHBOARD",
      items: [
        { name: "Dashboard Principal", path: "/admin" }
      ]
    },
    {
      title: "👥 USUARIOS",
      items: [
        { name: "Todos los Usuarios", path: "/admin/users" },
        { name: "Usuarios VIP", path: "/admin/vip" },
        { name: "Usuarios Suspendidos", path: "/admin/users/suspended" },
        { name: "Usuarios Eliminados", path: "/admin/users/deleted" }
      ]
    },
    {
      title: "💬 MODERACIÓN",
      items: [
        { name: "Conversaciones", path: "/admin/moderation/conversations" },
        { name: "Mensajes", path: "/admin/moderation/messages" },
        { name: "Fotos y Media", path: "/admin/moderation/media" },
        { name: "Matches", path: "/admin/moderation/matches" },
        { name: "Comentarios", path: "/admin/moderation/comments" },
        { name: "Posts", path: "/admin/moderation/posts" },
        { name: "Contenido Marcado", path: "/admin/moderation/flagged" }
      ]
    },
    {
      title: "📋 REPORTES",
      items: [
        { name: "Posts Reportados", path: "/admin/reports/posts" },
        { name: "Comentarios Reportados", path: "/admin/reports/comments" },
        { name: "Usuarios Reportados", path: "/admin/reports/users" },
        { name: "Mensajes Reportados", path: "/admin/reports/messages" },
        { name: "Reportes Resueltos", path: "/admin/reports/resolved" }
      ]
    },
    {
      title: "💰 PAGOS",
      items: [
        { name: "Pagos Pendientes", path: "/admin/payments" },
        { name: "Pagos Aprobados", path: "/admin/payments/approved" },
        { name: "Pagos Rechazados", path: "/admin/payments/rejected" },
        { name: "Cola de Verificación", path: "/admin/payments/queue" }
      ]
    },
    {
      title: "⚙️ CONFIGURACIÓN",
      items: [
        { name: "Ajustes Generales", path: "/admin/settings" },
        { name: "Ajustes VIP", path: "/admin/settings/vip" },
        { name: "Monedas y Tasas", path: "/admin/settings/rates" },
        { name: "Ajustes de Moderación", path: "/admin/settings/moderation" },
        { name: "Activar/Desactivar Funciones", path: "/admin/settings/features" },
        { name: "Apariencia", path: "/admin/settings/appearance" }
      ]
    },
    {
      title: "👑 GESTIÓN DE ADMINS",
      roles: ['superadmin'], // Solo Superadmin puede ver esto
      items: [
        { name: "Roles de Administrador", path: "/admin/management" },
        { name: "Solicitudes Pendientes", path: "/admin/management/requests" },
        { name: "Log de Actividad Admin", path: "/admin/management/logs" },
        { name: "Configuración 2FA", path: "/admin/management/2fa" }
      ]
    },
    {
      title: "📜 LOGS",
      items: [
        { name: "Logs de Acción Admin", path: "/admin/logs/admins" },
        { name: "Logs de Actividad Usuario", path: "/admin/logs/users" },
        { name: "Logs del Sistema", path: "/admin/logs/system" },
        { name: "Exportar Logs", path: "/admin/logs/export" }
      ]
    },
    {
      title: "🔧 SISTEMA",
      items: [
        { name: "Backup de Base de Datos", path: "/admin/system/backup" },
        { name: "Gestión de Caché", path: "/admin/system/cache" },
        { name: "Estado de Cron Jobs", path: "/admin/system/cron" },
        { name: "Estado de API", path: "/admin/system/api" }
      ]
    },
    {
      title: "📈 ANALÍTICAS",
      items: [
        { name: "Crecimiento de Usuarios", path: "/admin/analytics/growth" },
        { name: "Ingresos VIP", path: "/admin/analytics/revenue" },
        { name: "Retención de Usuarios", path: "/admin/analytics/retention" },
        { name: "Contenido Popular", path: "/admin/analytics/content" },
        { name: "Eficiencia de Moderación", path: "/admin/analytics/moderation" }
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
        <div className="p-6 flex justify-between items-center border-b border-gray-800 bg-gray-900/50 shrink-0">
          <div className="flex flex-col">
              <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 tracking-tight">CUADRALO</span>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-0.5">Control Center</span>
          </div>
          <button className="lg:hidden text-gray-400 hover:text-white bg-gray-800 p-2 rounded-lg" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Menú Acordeón */}
        <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar px-3 space-y-1">
          {menuCategories.map((category, idx) => {
            // Bloqueo de seguridad si no tiene el rol
            if (category.roles && !category.roles.includes(userRole)) return null;

            const isOpen = openCategory === category.title;
            const isActiveCategory = category.items.some(i => pathname === i.path || pathname.startsWith(i.path + '/'));

            return (
              <div key={idx} className="mb-2">
                <button 
                  onClick={() => setOpenCategory(isOpen ? "" : category.title)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 font-black tracking-wide text-xs md:text-sm ${
                    isOpen || isActiveCategory
                      ? "bg-purple-600/10 text-purple-400 border border-purple-500/20"
                      : "text-gray-400 hover:bg-gray-800/80 hover:text-gray-200 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {category.title}
                  </div>
                  <ChevronDown size={16} className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.ul 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden ml-4 mt-1 space-y-1 border-l-2 border-gray-800 pl-3"
                    >
                      {category.items.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                          <li key={item.path}>
                            <Link href={item.path}>
                              <span
                                className={`block px-4 py-2.5 rounded-lg transition-all duration-200 text-xs font-bold tracking-wide ${
                                  isActive
                                    ? "bg-purple-500/20 text-white shadow-inner border border-purple-500/20"
                                    : "text-gray-500 hover:bg-gray-800 hover:text-gray-300"
                                }`}
                                onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
                              >
                                {item.name}
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800 bg-gray-900/80 shrink-0">
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
          <div className="max-w-7xl mx-auto pb-10">
             {children}
          </div>
        </div>
      </main>
    </div>
  );
}