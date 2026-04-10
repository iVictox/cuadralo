"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/utils/api";
import { AlertTriangle, FileText, MessageCircle, Users, MessageSquare, CheckCircle, ChevronRight } from "lucide-react";

export default function AdminReportsOverview() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [reportCounts, setReportCounts] = useState({
      posts: 0,
      comments: 0,
      users: 0,
      messages: 0,
      resolved: 0
  });

  // Nota: Idealmente en un futuro agregarás un endpoint en Go que devuelva estas métricas agrupadas,
  // por ahora cargaremos la vista inicial de la interfaz base para simular la arquitectura.
  useEffect(() => {
     // Simulación de carga de la bandeja de entrada
     setTimeout(() => {
         setLoading(false);
     }, 600);
  }, []);

  const reportCategories = [
      {
          id: "posts",
          title: "Posts Reportados",
          desc: "Publicaciones del feed que los usuarios han denunciado como inapropiadas o spam.",
          icon: FileText,
          color: "text-blue-500",
          bg: "bg-blue-500/10",
          path: "/admin/reports/posts"
      },
      {
          id: "comments",
          title: "Comentarios Reportados",
          desc: "Respuestas y comentarios en publicaciones que infringen las normas.",
          icon: MessageCircle,
          color: "text-pink-500",
          bg: "bg-pink-500/10",
          path: "/admin/reports/comments"
      },
      {
          id: "users",
          title: "Usuarios Reportados",
          desc: "Perfiles que han sido denunciados por acoso, suplantación o comportamiento indebido.",
          icon: Users,
          color: "text-orange-500",
          bg: "bg-orange-500/10",
          path: "/admin/reports/users"
      },
      {
          id: "messages",
          title: "Mensajes Privados (DM)",
          desc: "Reportes originados desde conversaciones privadas entre usuarios.",
          icon: MessageSquare,
          color: "text-purple-500",
          bg: "bg-purple-500/10",
          path: "/admin/reports/messages"
      }
  ];

  if (loading) {
    return <div className="text-center py-20 text-red-500 font-black animate-pulse">Sincronizando Central de Denuncias...</div>;
  }

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <AlertTriangle className="text-red-500" size={36} strokeWidth={2.5}/> Central de Denuncias
        </h1>
        <p className="text-gray-400 mt-2 text-sm md:text-base">
            Bandeja de entrada de moderación. Revisa y toma acción sobre el contenido reportado por la comunidad.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reportCategories.map((cat) => (
              <div 
                  key={cat.id} 
                  onClick={() => router.push(cat.path)}
                  className="bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-xl hover:shadow-red-500/5 hover:border-gray-700 transition-all cursor-pointer group flex flex-col relative overflow-hidden"
              >
                  <div className="flex justify-between items-start mb-4">
                      <div className={`w-14 h-14 rounded-2xl ${cat.bg} flex items-center justify-center border border-gray-800 group-hover:scale-110 transition-transform`}>
                          <cat.icon size={28} className={cat.color} />
                      </div>
                      
                      {/* Badge dinámico de pendientes (Placeholder para conexión a BD) */}
                      <div className="bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-lg text-xs font-black tracking-widest uppercase shadow-inner">
                          Revisar
                      </div>
                  </div>

                  <h3 className="text-xl font-black text-white mb-2 group-hover:text-red-400 transition-colors">{cat.title}</h3>
                  <p className="text-gray-400 text-sm font-medium leading-relaxed mb-6 flex-1">
                      {cat.desc}
                  </p>

                  <div className="flex items-center text-xs font-bold uppercase tracking-widest text-gray-500 group-hover:text-white transition-colors mt-auto pt-4 border-t border-gray-800">
                      Abrir Bandeja <ChevronRight size={16} className="ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all"/>
                  </div>
              </div>
          ))}
      </div>

      <div 
          onClick={() => router.push('/admin/reports/resolved')}
          className="mt-8 bg-gray-900/50 border border-gray-800 border-dashed rounded-2xl p-6 flex items-center justify-between cursor-pointer hover:bg-gray-800/50 transition-colors group"
      >
          <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 border border-green-500/20 group-hover:scale-110 transition-transform">
                  <CheckCircle size={24} />
              </div>
              <div>
                  <h4 className="text-white font-bold text-lg">Historial de Reportes Resueltos</h4>
                  <p className="text-gray-500 text-sm">Visualiza las acciones tomadas anteriormente por el equipo de moderación.</p>
              </div>
          </div>
          <ChevronRight size={20} className="text-gray-600 group-hover:text-white transition-colors" />
      </div>

    </div>
  );
}