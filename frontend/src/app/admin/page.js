"use client";
import { useEffect, useState } from "react";
import { api } from "@/utils/api";
import { Users, Crown, Heart, CreditCard, Activity } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsData = await api.get("/admin/stats");
        setStats(statsData);

        const logsData = await api.get("/admin/logs");
        setLogs(logsData.slice(0, 6)); 
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-purple-500 font-bold animate-pulse">
        Cargando métricas del sistema...
      </div>
    );
  }

  const statCards = [
    { title: "Usuarios Totales", value: stats?.total_users || 0, icon: Users, color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
    { title: "Suscripciones VIP", value: stats?.prime_users || 0, icon: Crown, color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
    { title: "Pagos Pendientes", value: stats?.total_payments || 0, icon: CreditCard, color: "bg-green-500/10 text-green-400 border-green-500/20" },
    { title: "Matches Activos", value: stats?.total_matches || 0, icon: Heart, color: "bg-pink-500/10 text-pink-400 border-pink-500/20" },
  ];

  // Calcular el máximo para la gráfica nativa
  const maxUsers = stats?.user_growth ? Math.max(...stats.user_growth.map(d => d.users), 10) : 10;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Dashboard General</h1>
        <p className="text-gray-400 mt-2 text-sm md:text-base">Monitorea el estado de Cuadralo en tiempo real.</p>
      </div>

      {/* Tarjetas de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className={`bg-gray-900 p-6 rounded-3xl border ${stat.color} flex items-center gap-5 shadow-2xl relative overflow-hidden group`}>
            <div className={`absolute -right-4 -top-4 w-20 h-20 bg-current opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`}></div>
            <div className={`p-4 rounded-2xl bg-gray-950 shadow-inner z-10 border border-gray-800`}>
              <stat.icon size={28} />
            </div>
            <div className="z-10">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">{stat.title}</p>
              <h3 className="text-3xl font-black text-white">{stat.value.toLocaleString()}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Gráfica NATIVA Tailwind (Libre de errores) */}
        <div className="lg:col-span-2 bg-gray-900 rounded-3xl border border-gray-800 p-6 sm:p-8 shadow-2xl flex flex-col">
           <h2 className="text-lg font-black text-white mb-2 flex items-center gap-2">
             <Activity className="text-purple-500" size={20} /> Crecimiento de la Comunidad
           </h2>
           <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-6">Últimos 7 días</p>
           
           <div className="flex-1 flex items-end gap-2 md:gap-4 mt-auto pt-10">
              {stats?.user_growth?.map((d, idx) => {
                 const heightPercent = Math.max((d.users / maxUsers) * 100, 5);
                 return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-3 group">
                        <div className="relative w-full flex justify-center h-48 items-end">
                            {/* Tooltip Hover */}
                            <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-lg border border-gray-700 whitespace-nowrap z-10 pointer-events-none">
                                {d.users} Registros
                            </div>
                            {/* Barra */}
                            <div 
                                className="w-full md:w-3/4 bg-gradient-to-t from-purple-900 to-purple-500 rounded-t-md transition-all duration-1000 ease-out group-hover:brightness-125" 
                                style={{ height: `${heightPercent}%` }}
                            ></div>
                        </div>
                        <span className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-wider">{d.name}</span>
                    </div>
                 );
              })}
           </div>
        </div>

        {/* Historial Rápido */}
        <div className="bg-gray-900 rounded-3xl border border-gray-800 p-6 sm:p-8 shadow-2xl flex flex-col">
          <h2 className="text-lg font-black text-white mb-6 border-b border-gray-800 pb-4">Log de Actividad Reciente</h2>
          <div className="space-y-5 flex-1 overflow-y-auto custom-scrollbar pr-2">
            {logs.length > 0 ? logs.map((log) => (
              <div key={log.id} className="relative pl-5 border-l-2 border-purple-600/30 pb-2 group">
                <div className="absolute w-2.5 h-2.5 bg-purple-500 rounded-full -left-[6px] top-1.5 shadow-[0_0_8px_#a855f7] group-hover:scale-125 transition-transform"></div>
                <p className="text-xs font-black text-gray-300">
                  <span className="text-purple-400">Admin #{log.admin_id}</span> • <span className="uppercase">{log.action.replace(/_/g, ' ')}</span>
                </p>
                <p className="text-sm text-gray-400 mt-1 font-medium leading-snug">{log.details}</p>
                <span className="text-[10px] font-mono text-gray-600 mt-2 block">
                  {new Date(log.created_at).toLocaleString('es-VE')}
                </span>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-2">
                 <Activity size={32} className="opacity-20"/>
                 <p className="text-sm font-medium">No hay actividad reciente.</p>
              </div>
            )}
          </div>
          <button onClick={() => router.push('/admin/logs')} className="w-full mt-4 bg-gray-950 hover:bg-purple-600/10 text-purple-400 border border-gray-800 hover:border-purple-500/30 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-colors">
             Ver Registro Completo
          </button>
        </div>
      </div>
    </div>
  );
}