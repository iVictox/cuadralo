"use client";
import { useEffect, useState } from "react";
import { api } from "@/utils/api";
import { Users, Crown, Heart, CreditCard, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsData = await api.get("/admin/stats");
        setStats(statsData);

        const logsData = await api.get("/admin/logs");
        setLogs(logsData.slice(0, 6)); // Tomar solo los últimos 6 eventos
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
        {/* Gráfica Principal */}
        <div className="lg:col-span-2 bg-gray-900 rounded-3xl border border-gray-800 p-6 sm:p-8 shadow-2xl">
           <h2 className="text-lg font-black text-white mb-6 flex items-center gap-2">
             <Activity className="text-purple-500" size={20} /> Crecimiento de la Comunidad (Últimos 7 Días)
           </h2>
           <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats?.user_growth || []} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                  <XAxis dataKey="name" stroke="#6b7280" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} dy={10} />
                  <YAxis stroke="#6b7280" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #1f2937', borderRadius: '12px', color: '#fff', fontWeight: 'bold' }} 
                    itemStyle={{ color: '#a855f7' }}
                    cursor={{ stroke: '#374151', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    name="Nuevos Registros" 
                    stroke="#a855f7" 
                    strokeWidth={4} 
                    dot={{ r: 4, fill: '#0a0a0a', stroke: '#a855f7', strokeWidth: 2 }} 
                    activeDot={{ r: 6, fill: '#a855f7', stroke: '#fff', strokeWidth: 2 }} 
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
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