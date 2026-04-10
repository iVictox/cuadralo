"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { api } from "@/utils/api";
import Link from "next/link";
import { 
  LayoutDashboard, Users, Shield, AlertTriangle, CreditCard,
  Settings, Crown, FileText, Server, LineChart, ChevronDown, 
  LogOut, Menu, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const menuCategories = [
  {
    title: "DASHBOARD",
    icon: LayoutDashboard,
    items: [
      { name: "Dashboard Principal", path: "/admin" }
    ]
  },
  {
    title: "USUARIOS",
    icon: Users,
    items: [
      { name: "Todos los Usuarios", path: "/admin/users" },
      { name: "Usuarios VIP", path: "/admin/vip" },
      { name: "Usuarios Suspendidos", path: "/admin/users/suspended" },
      { name: "Usuarios Eliminados", path: "/admin/users/deleted" }
    ]
  },
  {
    title: "MODERACIÓN",
    icon: Shield,
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
    title: "REPORTES",
    icon: AlertTriangle,
    items: [
      // ✅ FIX: Rutas directas a las pestañas del Dashboard Unificado
      { name: "Posts Reportados", path: "/admin/reports?tab=post" },
      { name: "Comentarios Reportados", path: "/admin/reports?tab=comment" },
      { name: "Usuarios Reportados", path: "/admin/reports?tab=user" },
      { name: "Mensajes Reportados", path: "/admin/reports?tab=message" },
      { name: "Reportes Resueltos", path: "/admin/reports?tab=resolved" }
    ]
  },
  {
    title: "PAGOS",
    icon: CreditCard,
    items: [
      { name: "Pagos Pendientes", path: "/admin/payments" },
      { name: "Pagos Aprobados", path: "/admin/payments/approved" },
      { name: "Pagos Rechazados", path: "/admin/payments/rejected" },
      { name: "Cola de Verificación", path: "/admin/payments/queue" }
    ]
  },
  {
    title: "CONFIGURACIÓN",
    icon: Settings,
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
    title: "GESTIÓN DE ADMINS",
    icon: Crown,
    roles: ['superadmin'], 
    items: [
      { name: "Roles de Administrador", path: "/admin/management" },
      { name: "Solicitudes Pendientes", path: "/admin/management/requests" },
      { name: "Log de Actividad Admin", path: "/admin/management/logs" },
      { name: "Configuración 2FA", path: "/admin/management/2fa" }
    ]
  },
  {
    title: "LOGS",
    icon: FileText,
    items: [
      { name: "Logs de Acción Admin", path: "/admin/logs/admins" },
      { name: "Logs de Actividad Usuario", path: "/admin/logs/users" },
      { name: "Logs del Sistema", path: "/admin/logs/system" },
      { name: "Exportar Logs", path: "/admin/logs/export" }
    ]
  },
  {
    title: "SISTEMA",
    icon: Server,
    items: [
      { name: "Backup de Base de Datos", path: "/admin/system/backup" },
      { name: "Gestión de Caché", path: "/admin/system/cache" },
      { name: "Estado de Cron Jobs", path: "/admin/system/cron" },
      { name: "Estado de API", path: "/admin/system/api" }
    ]
  },
  {
    title: "ANALÍTICAS",
    icon: LineChart,
    items: [
      { name: "Crecimiento de Usuarios", path: "/admin/analytics/growth" },
      { name: "Ingresos VIP", path: "/admin/analytics/revenue" },
      { name: "Retención de Usuarios", path: "/admin/analytics/retention" },
      { name: "Contenido Popular", path: "/admin/analytics/content" },
      { name: "Eficiencia de Moderación", path: "/admin/analytics/moderation" }
    ]
  }
];

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // Calcula la categoría activa considerando también los parámetros (tab)
  const initialCategory = useMemo(() => {
    if (pathname === "/admin") return "DASHBOARD";
    
    // Construir la URL virtual para comparar
    const currentTab = searchParams.get("tab");
    const virtualPath = currentTab ? `${pathname}?tab=${currentTab}` : pathname;

    const foundCategory = menuCategories.find(cat => 
      cat.items.some(item => 
          item.path !== "/admin" && 
          (virtualPath === item.path || pathname.startsWith(item.path.split('?')[0] + '/'))
      )
    );
    
    return foundCategory ? foundCategory.title : "DASHBOARD";
  }, [pathname, searchParams]);

  const [openCategory, setOpenCategory] = useState(initialCategory);

  useEffect(() => {
     setOpenCategory(initialCategory);
  }, [initialCategory]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="flex h-screen bg-[#050505] text-gray-200 overflow-hidden selection:bg-purple-500/30">
      
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 h-full bg-[#0a0a0a] border-r border-gray-800/60 flex flex-col transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="p-6 flex justify-between items-center border-b border-gray-800/60 shrink-0">
          <div className="flex flex-col">
              <span className="text-2xl font-black text-white tracking-tight">CUADRALO</span>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Control Center</span>
          </div>
          <button className="lg:hidden text-gray-400 hover:text-white bg-gray-900 p-2 rounded-lg border border-gray-800" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar px-4 space-y-1">
          {menuCategories.map((category, idx) => {
            if (category.roles && !category.roles.includes(userRole)) return null;

            const isCategoryActive = category.title === initialCategory;
            const isOpen = openCategory === category.title;

            return (
              <div key={idx} className="mb-1.5">
                <button 
                  onClick={() => setOpenCategory(isOpen ? "" : category.title)}
                  className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200 text-sm font-bold ${
                    isCategoryActive
                      ? "bg-purple-600/10 text-purple-400 shadow-inner border border-purple-500/20"
                      : isOpen 
                        ? "bg-gray-900/80 text-white" 
                        : "text-gray-400 hover:bg-gray-900/40 hover:text-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <category.icon size={18} className={isCategoryActive ? "text-purple-500" : isOpen ? "text-gray-300" : "text-gray-500"} />
                    <span className="tracking-wide">{category.title}</span>
                  </div>
                  <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""} ${isCategoryActive ? "text-purple-500" : "text-gray-600"}`} />
                </button>

                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-[500px] opacity-100 mt-1" : "max-h-0 opacity-0"}`}
                >
                  <ul className="pl-9 pr-2 py-1 space-y-1 border-l border-gray-800/60 ml-5">
                    {category.items.map((item) => {
                      
                      // Comparación exacta incluyendo parámetros
                      const currentTab = searchParams.get("tab");
                      const virtualPath = currentTab ? `${pathname}?tab=${currentTab}` : pathname;
                      const isItemActive = virtualPath === item.path;
                      
                      return (
                        <li key={item.path}>
                          <Link href={item.path}>
                            <span
                              className={`block px-3 py-2 rounded-lg transition-colors duration-150 text-[13px] font-semibold ${
                                isItemActive
                                  ? "bg-purple-500 text-white shadow-md border border-purple-400"
                                  : "text-gray-500 hover:text-gray-300 hover:bg-gray-900/50"
                              }`}
                              onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
                            >
                              {item.name}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800/60 bg-[#0a0a0a] shrink-0">
          <div className="flex items-center gap-3 px-3 py-3 mb-4 rounded-xl bg-gray-900/50 border border-gray-800/60">
             <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center font-black text-white text-sm shadow-md">
                {userRole ? userRole.charAt(0).toUpperCase() : 'A'}
             </div>
             <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">Sesión Activa</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black truncate">{userRole}</p>
             </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-gray-400 font-bold bg-gray-900/50 hover:bg-red-500/10 hover:text-red-400 border border-gray-800/60 hover:border-red-500/20 rounded-xl transition-all"
          >
            <LogOut size={16} /> CERRAR SESIÓN
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#050505]">
        <header className="bg-[#0a0a0a]/90 backdrop-blur border-b border-gray-800 p-4 flex items-center justify-between lg:hidden sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-400 hover:text-white bg-gray-900 p-2 rounded-lg border border-gray-800">
            <Menu size={20} />
          </button>
          <span className="font-bold text-white tracking-wide text-sm">Control Center</span>
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