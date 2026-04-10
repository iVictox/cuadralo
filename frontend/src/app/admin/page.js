"use client";
import { useEffect, useState } from "react";
import { api } from "@/utils/api";
import { Users, Crown, Image as ImageIcon, Heart, CreditCard } from "lucide-react";
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
        setLogs(logsData.slice(0, 5));
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
      <div className="flex h-full items-center justify-center text-purple-400">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const statCards = [
    { title: "Usuarios Totales", value: stats?.total_users || 0, icon: Users, color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
    { title: "Usuarios VIP", value: stats?.prime_users || 0, icon: Crown, color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
    { title: "Pagos Procesados", value: stats?.total_payments || 0, icon: CreditCard, color: "bg-green-500/20 text-green-400 border-green-500/30" },
    { title: "Matches Activos", value: stats?.total_matches || 0, icon: Heart, color: "bg-pink-500/20 text-pink-400 border-pink-500/30" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Dashboard General</h1>
        <p className="text-gray-400 mt-1">Métricas y estadísticas reales de Cuadralo en tiempo real.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className={`bg-gray-800 p-6 rounded-2xl border ${stat.color} flex items-center gap-5 shadow-lg`}>
            <div className={`p-4 rounded-xl bg-gray-900 shadow-inner`}>
              <stat.icon size={28} />
            </div>
            <div>
              <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
              <h3 className="text-3xl font-black text-white">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-800 rounded-2xl border border-gray-700 p-6 shadow-lg">
           <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
             <Users className="text-purple-500" size={20} /> Crecimiento de Usuarios (Últimos 7 Días)
           </h2>
           <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats?.user_growth || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                  <XAxis dataKey="name" stroke="#9ca3af" axisLine={false} tickLine={false} />
                  <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} 
                    itemStyle={{ color: '#c084fc' }}
                  />
                  <Line type="monotone" dataKey="users" name="Nuevos Usuarios" stroke="#a855f7" strokeWidth={4} dot={{ r: 4, fill: '#a855f7' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 shadow-lg">
          <h2 className="text-xl font-bold text-white mb-6">Actividad Reciente</h2>
          <div className="space-y-5">
            {logs.length > 0 ? logs.map((log) => (
              <div key={log.id} className="relative pl-4 border-l-2 border-purple-600/50 pb-2">
                <div className="absolute w-2 h-2 bg-purple-500 rounded-full -left-[5px] top-1.5 shadow-[0_0_8px_#a855f7]"></div>
                <p className="text-sm font-medium text-gray-200">
                  <span className="text-purple-400">{log.admin?.name || `Admin #${log.admin_id}`}</span> {log.action}
                </p>
                <p className="text-xs text-gray-500 mt-1">{log.details}</p>
                <span className="text-[10px] font-mono text-gray-600 mt-2 block">
                  {new Date(log.created_at).toLocaleString('es-ES')}
                </span>
              </div>
            )) : (
              <p className="text-gray-500 text-sm italic">No hay actividad reciente registrada.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}