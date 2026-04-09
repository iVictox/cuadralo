"use client";
import { useEffect, useState } from "react";
import { api } from "@/utils/api";
import { Users, Crown, Image as ImageIcon, Heart } from "lucide-react";
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
    return <div className="text-center py-10">Cargando métricas...</div>;
  }

  const statCards = [
    { title: "Usuarios Totales", value: stats?.total_users || 0, icon: Users, color: "bg-cuadralo-purple/20 text-cuadralo-purpleLight" },
    { title: "Usuarios VIP", value: stats?.prime_users || 0, icon: Crown, color: "bg-yellow-500/20 text-yellow-400" },
    { title: "Publicaciones", value: stats?.total_posts || 0, icon: ImageIcon, color: "bg-cuadralo-pink/20 text-cuadralo-pinkLight" },
    { title: "Matches", value: stats?.total_matches || 0, icon: Heart, color: "bg-cuadralo-pinkDark/20 text-cuadralo-pink" },
  ];

  const userGrowthData = stats?.user_growth || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-cuadralo-cardDark p-6 rounded-xl border border-cuadralo-purple/30 flex items-center gap-4">
            <div className={`p-4 rounded-lg ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">{stat.title}</p>
              <h3 className="text-2xl font-bold">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-cuadralo-cardDark rounded-xl border border-cuadralo-purple/30 p-6 mt-8">
         <h2 className="text-xl font-bold mb-4">Crecimiento de Usuarios (Última Semana)</h2>
         <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#150A21', border: '1px solid #551CA6' }} />
                <Line type="monotone" dataKey="users" stroke="#F2138E" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
         </div>
      </div>

      <div className="bg-cuadralo-cardDark rounded-xl border border-cuadralo-purple/30 p-6 mt-8">
        <h2 className="text-xl font-bold mb-4">Actividad Reciente del Sistema</h2>
        <div className="space-y-4">
          {logs.length > 0 ? logs.map((log) => (
            <div key={log.id} className="flex items-center justify-between border-b border-cuadralo-purple/30 pb-3 last:border-0 last:pb-0">
              <div>
                <p className="font-medium text-gray-200">
                  {log.admin?.name || `Admin #${log.admin_id}`} <span className="text-gray-400 font-normal">realizó</span> {log.action}
                </p>
                <p className="text-sm text-gray-500">{log.details}</p>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(log.created_at).toLocaleString('es-ES')}
              </span>
            </div>
          )) : (
            <p className="text-gray-500">No hay actividad reciente registrada.</p>
          )}
        </div>
      </div>
    </div>
  );
}
