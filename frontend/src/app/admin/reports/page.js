"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/utils/api";
import { AlertTriangle, FileText, MessageCircle, Users, MessageSquare, CheckCircle, Check, Trash2, ExternalLink, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const TABS = [
  { id: "post", name: "Posts", icon: FileText },
  { id: "comment", name: "Comentarios", icon: MessageCircle },
  { id: "user", name: "Usuarios", icon: Users },
  { id: "message", name: "Mensajes", icon: MessageSquare },
  { id: "resolved", name: "Resueltos", icon: CheckCircle }
];

export default function AdminReports() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const defaultTab = searchParams.get("tab") || "post";
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync state con URL para que el menú lateral funcione perfecto
  useEffect(() => {
      const tab = searchParams.get("tab");
      if (tab) setActiveTab(tab);
  }, [searchParams]);

  useEffect(() => {
      const fetchReports = async () => {
          setLoading(true);
          try {
              const data = await api.get(`/admin/reports?type=${activeTab}`);
              setReports(data || []);
          } catch (error) { console.error(error); } 
          finally { setLoading(false); }
      };
      fetchReports();
  }, [activeTab]);

  const handleResolve = async (id, action) => {
      const isDelete = action === 'delete_content';
      if (isDelete && !confirm("⚠️ ¿Eliminar el contenido infractor y aplicar castigos de forma irreversible?")) return;
      
      try {
          await api.put(`/admin/reports/${id}/resolve`, { 
              action, 
              admin_notes: isDelete ? "Infracción confirmada. Contenido removido." : "Reporte descartado. Falsa alarma." 
          });
          setReports(prev => prev.filter(r => r.id !== id));
      } catch (error) {
          alert("Error al procesar el reporte.");
      }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <AlertTriangle className="text-orange-500" /> Central de Reportes
        </h1>
        <p className="text-gray-400 mt-1">Supervisa y sanciona el contenido denunciado por la comunidad.</p>
      </div>

      <div className="flex gap-2 bg-gray-900 p-1.5 rounded-xl border border-gray-800 shadow-inner overflow-x-auto no-scrollbar">
          {TABS.map(tab => (
              <button 
                  key={tab.id}
                  onClick={() => router.push(`/admin/reports?tab=${tab.id}`)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-orange-600 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
              >
                  <tab.icon size={16} /> {tab.name}
              </button>
          ))}
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
          <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-gray-950 text-gray-400 font-bold border-b border-gray-800 uppercase tracking-widest text-[10px]">
                  <tr>
                      <th className="px-6 py-4">Denunciante</th>
                      <th className="px-6 py-4 w-1/3">Evidencia (Acusado)</th>
                      <th className="px-6 py-4">Motivo del Reporte</th>
                      <th className="px-6 py-4 text-right">Acción</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                  {loading ? (
                      <tr><td colSpan="4" className="text-center py-16 text-orange-500 animate-pulse font-bold">Analizando denuncias...</td></tr>
                  ) : reports.length === 0 ? (
                      <tr><td colSpan="4" className="text-center py-16 text-gray-500">Bandeja limpia. No hay denuncias en esta categoría.</td></tr>
                  ) : reports.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-800/30 transition-colors group">
                          
                          <td className="px-6 py-4 font-bold text-gray-400">
                              @{r.reporter}
                              <div className="text-[9px] font-mono mt-1 text-gray-600">{new Date(r.created_at).toLocaleString()}</div>
                          </td>
                          
                          <td className="px-6 py-4">
                              <span className="text-orange-400 font-bold text-xs uppercase tracking-widest block mb-1">@{r.target_user}</span>
                              <div className="bg-gray-950 p-3 rounded-xl border border-gray-800 relative">
                                  {r.target_image && (
                                      <img src={r.target_image} className="w-full max-h-24 object-cover rounded-lg mb-2 opacity-80" />
                                  )}
                                  <p className="font-medium text-gray-200 line-clamp-2 italic">"{r.target_preview}"</p>
                              </div>
                          </td>

                          <td className="px-6 py-4">
                              <span className="inline-block bg-orange-500/10 text-orange-400 border border-orange-500/20 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">
                                  {r.reason}
                              </span>
                          </td>

                          <td className="px-6 py-4 text-right">
                              {activeTab === 'resolved' ? (
                                  <span className="text-gray-500 font-bold text-xs uppercase tracking-widest border border-gray-700 px-3 py-1.5 rounded-lg">Cerrado</span>
                              ) : (
                                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button 
                                          onClick={() => handleResolve(r.id, 'dismiss')}
                                          title="Descartar (Falsa alarma)"
                                          className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-colors"
                                      >
                                          <Check size={16} />
                                      </button>
                                      
                                      {/* Link dinámico dependiendo del tipo */}
                                      {(r.target_type === 'post' || r.target_type === 'comment') && (
                                          <Link href={`/post/${r.target_type === 'comment' ? r.parent_post_id : r.target_id}`} target="_blank" className="p-2 bg-blue-900/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-900/50 rounded-lg transition-colors"><ExternalLink size={16}/></Link>
                                      )}
                                      {r.target_type === 'user' && (
                                          <Link href={`/u/${r.target_user}`} target="_blank" className="p-2 bg-blue-900/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-900/50 rounded-lg transition-colors"><ExternalLink size={16}/></Link>
                                      )}

                                      <button 
                                          onClick={() => handleResolve(r.id, 'delete_content')}
                                          title="Aplicar Castigo Severo"
                                          className="p-2 bg-red-950/50 hover:bg-red-600 text-red-500 hover:text-white border border-red-900 hover:border-red-600 rounded-lg transition-colors"
                                      >
                                          {r.target_type === 'user' ? <ShieldAlert size={16}/> : <Trash2 size={16} />}
                                      </button>
                                  </div>
                              )}
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>
    </div>
  );
}