"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
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
      { name: "Bandeja Principal", path: "/admin/reports" },
      { name: "Posts Reportados", path: "/admin/reports/posts" },
      { name: "Comentarios Reportados", path: "/admin/reports/comments" },
      { name: "Usuarios Reportados", path: "/admin/reports/users" },
      { name: "Reportes Resueltos", path: "/admin/reports/resolved" }
    ]
  },
  {
    title: "PAGOS",
    icon: CreditCard,
    items: [
      { name: "Verificación y Auditoría", path: "/admin/payments" }
    ]
  },
  {
    title: "CONFIGURACIÓN",
    icon: Settings,
    items: [
      { name: "Ajustes Globales", path: "/admin/settings" }
    ]
  },
  {
    title: "GESTIÓN DE ADMINS",
    icon: Crown,
    roles: ['superadmin'], 
    items: [
      { name: "Equipo y Solicitudes", path: "/admin/management" }
    ]
  },
  {
    title: "LOGS Y AUDITORÍA",
    icon: FileText,
    items: [
      { name: "Registro del Sistema", path: "/admin/logs" }
    ]
  }
];

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // Calcula la categoría activa instantáneamente basándose en la URL
  const initialCategory = useMemo(() => {
    if (pathname === "/admin") return "DASHBOARD";
    
    const foundCategory = menuCategories.find(cat => 
      cat.items.some(item => item.path !== "/admin" && (pathname === item.path || pathname.startsWith(item.path + '/')))
    );
    
    return foundCategory ? foundCategory.title : "DASHBOARD";
  }, [pathname]);

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
      
      {/* Overlay Oscuro para Móviles */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Fija (Estática en Desktop, Deslizable en Móvil) */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[280px] h-full bg-[#0a0a0a] border-r border-gray-800/60 flex flex-col transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
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

        {/* Menú Acordeón Minimalista */}
        <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar px-3 space-y-1">
          {menuCategories.map((category, idx) => {
            if (category.roles && !category.roles.includes(userRole)) return null;

            const isCategoryActive = category.title === initialCategory;
            const isOpen = openCategory === category.title;

            return (
              <div key={idx} className="mb-1.5">
                <button 
                  onClick={() => setOpenCategory(isOpen ? "" : category.title)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 text-[13px] font-bold tracking-wide ${
                    isCategoryActive
                      ? "bg-purple-600/10 text-purple-400 shadow-inner border border-purple-500/20"
                      : isOpen 
                        ? "bg-gray-900/80 text-white" 
                        : "text-gray-400 hover:bg-gray-900/40 hover:text-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <category.icon size={18} className={isCategoryActive ? "text-purple-500" : isOpen ? "text-gray-300" : "text-gray-500"} />
                    <span>{category.title}</span>
                  </div>
                  <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""} ${isCategoryActive ? "text-purple-500" : "text-gray-600"}`} />
                </button>

                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-[500px] opacity-100 mt-1" : "max-h-0 opacity-0"}`}>
                  <ul className="pl-10 pr-2 py-1 space-y-1 border-l border-gray-800/60 ml-6">
                    {category.items.map((item) => {
                      const isItemActive = pathname === item.path;
                      return (
                        <li key={item.path}>
                          <Link href={item.path}>
                            <span
                              className={`block px-3 py-2.5 rounded-lg transition-colors duration-150 text-[13px] font-semibold ${
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

        {/* Pie del Sidebar (Usuario Activo) */}
        <div className="p-4 border-t border-gray-800/60 bg-[#0a0a0a] shrink-0">
          <div className="flex items-center gap-3 px-3 py-3 mb-4 rounded-xl bg-gray-900/50 border border-gray-800/60 shadow-inner">
             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center font-black text-white text-base shadow-[0_0_15px_rgba(147,51,234,0.3)]">
                {userRole ? userRole.charAt(0).toUpperCase() : 'A'}
             </div>
             <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">Sesión Activa</p>
                <p className="text-[10px] text-purple-400 uppercase tracking-widest font-black truncate">{userRole}</p>
             </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-gray-400 font-bold bg-gray-900/50 hover:bg-red-500/10 hover:text-red-400 border border-gray-800/60 hover:border-red-500/20 rounded-xl transition-all"
          >
            <LogOut size={16} /> CERRAR SESIÓN
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#050505]">
        {/* Cabecera Móvil */}
        <header className="bg-[#0a0a0a]/90 backdrop-blur border-b border-gray-800 p-4 flex items-center justify-between lg:hidden sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-400 hover:text-white bg-gray-900 p-2.5 rounded-lg border border-gray-800">
            <Menu size={20} />
          </button>
          <span className="font-black text-white tracking-wide text-sm uppercase">Control Center</span>
          <div className="w-10"></div> 
        </header>

        {/* Área Renderizable */}
        <div className="flex-1 overflow-auto p-4 md:p-8 md:pt-10 custom-scrollbar">
          <div className="max-w-7xl mx-auto pb-10">
             {children}
          </div>
        </div>
      </main>
    </div>
  );
}