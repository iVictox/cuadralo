"use client";
import { useEffect, useState } from "react";
import { api } from "@/utils/api";
import { MessageCircle, CheckCircle, Trash2, ExternalLink, User, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function AdminReportedComments() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/admin/reports/comments`);
      setReports(data.reports || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const handleAction = async (id, action) => {
    const isDismiss = action === 'dismiss';
    if (!confirm(`¿Estás seguro de ${isDismiss ? 'IGNORAR' : 'ELIMINAR'} esta denuncia? ${!isDismiss ? 'El comentario desaparecerá permanentemente.' : ''}`)) return;

    try {
      await api.put(`/admin/reports/${id}/resolve`, { action });
      fetchReports();
    } catch (error) {
      alert("Ocurrió un error al procesar el reporte.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
             <AlertTriangle className="text-pink-500" size={32} /> Comentarios Denunciados
          </h1>
          <p className="text-gray-400 mt-1">Bandeja de respuestas que la comunidad considera ofensivas o spam.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
            <div className="col-span-2 text-center py-20 text-pink-500 font-black animate-pulse">Sincronizando denuncias de comentarios...</div>
        ) : reports.length === 0 ? (
            <div className="col-span-2 text-center py-20 text-gray-500 font-medium bg-gray-900 rounded-3xl border border-gray-800">
                La bandeja está limpia. No hay denuncias de comentarios pendientes.
            </div>
        ) : reports.map((rep) => (
          <div key={rep.id} className="bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-2xl flex flex-col relative overflow-hidden group">
             
             {/* Cabecera de la denuncia */}
             <div className="flex justify-between items-start mb-6 border-b border-gray-800 pb-4">
                 <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-1 block">Motivo de Denuncia:</span>
                    <span className="text-lg font-black text-white">{rep.reason || "Violación de Normas"}</span>
                 </div>
                 <div className="text-right">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 block">Denunciado Por:</span>
                    <span className="text-sm font-bold text-purple-400">@{rep.reporter?.username}</span>
                 </div>
             </div>

             {/* El Comentario Original */}
             <div className="bg-gray-950 p-4 rounded-2xl border border-gray-800/50 mb-6 shadow-inner">
                 <div className="flex items-center gap-3 mb-3 border-b border-gray-800/50 pb-3">
                     <div className="w-8 h-8 rounded-full bg-gray-800 overflow-hidden border border-gray-700">
                         {rep.comment?.user?.photo ? <img src={rep.comment.user.photo} className="w-full h-full object-cover"/> : <User size={16} className="m-auto h-full text-gray-500"/>}
                     </div>
                     <div>
                         <p className="text-xs font-bold text-gray-400">Autor del Comentario</p>
                         <p className="text-sm font-bold text-white leading-none">@{rep.comment?.user?.username || "Desconocido"}</p>
                     </div>
                 </div>
                 
                 <div className="bg-pink-500/10 border-l-2 border-pink-500 p-3 rounded-r-lg mb-2">
                     <p className="text-gray-300 text-sm font-medium leading-relaxed">
                        "{rep.comment?.content || "Sin texto"}"
                     </p>
                 </div>
             </div>

             {/* Controles del Moderador */}
             <div className="mt-auto grid grid-cols-2 gap-3">
                 <button 
                     onClick={() => handleAction(rep.id, 'dismiss')}
                     className="bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs uppercase tracking-widest py-3 rounded-xl transition-colors border border-gray-700 flex items-center justify-center gap-2"
                 >
                     <CheckCircle size={16} className="text-green-500"/> Ignorar (Falsa)
                 </button>
                 <button 
                     onClick={() => handleAction(rep.id, 'delete')}
                     className="bg-red-950/50 hover:bg-red-600 text-red-500 hover:text-white border border-red-900/50 hover:border-red-500 font-bold text-xs uppercase tracking-widest py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                 >
                     <Trash2 size={16} /> Purgar Comentario
                 </button>
             </div>
             
             {rep.comment?.post_id && (
                 <Link 
                     href={`/post/${rep.comment.post_id}`}
                     target="_blank"
                     className="mt-4 pt-4 border-t border-gray-800 text-center text-blue-400 hover:text-blue-300 text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                 >
                     <ExternalLink size={12}/> Ver el Post donde ocurrió esto
                 </Link>
             )}
          </div>
        ))}
      </div>
    </div>
  );
}