"use client";
import { useEffect, useState } from "react";
import { api } from "@/utils/api";
import { Users, CheckCircle, Ban, AlertTriangle, X, Eye, Image, Calendar, MessageCircle } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminReportedUsers() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/admin/reports/users`);
      setReports(data.reports || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const handleAction = async (id, action, reason = "") => {
    const isDismiss = action === 'dismiss';
    const isBan = action === 'ban';
    
    if (isDismiss) {
      if (!confirm("¿Ignorar esta denuncia? El reporte será marcado como falso.")) return;
    } else if (isBan) {
      if (!confirm("¿BANEAR este usuario? El usuario quedará suspendido permanentemente.")) return;
    }

    try {
      await api.put(`/admin/reports/${id}/resolve`, { action, reason });
      fetchReports();
    } catch (error) {
      alert("Ocurrió un error al procesar el reporte.");
    }
  };

  const openDetail = (report) => {
    setSelectedUser(report);
    setShowDetail(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
             <Users className="text-orange-500" size={32} /> Usuarios Denunciados
          </h1>
          <p className="text-gray-400 mt-1">Perfiles que la comunidad ha reportado por comportamiento indebido.</p>
        </div>
      </div>

      {loading ? (
          <div className="text-center py-20 text-orange-500 font-black animate-pulse">Sincronizando denuncias...</div>
      ) : reports.length === 0 ? (
          <div className="text-center py-20 text-gray-500 font-medium bg-gray-900 rounded-3xl border border-gray-800">
              La bandeja está limpia. No hay usuarios denunciados pendientes.
          </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {reports.map((rep) => (
            <div key={rep.id} className="bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-2xl flex flex-col relative overflow-hidden group">
               
               <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-bl-3xl -mr-10 -mt-10"></div>
               
               <div className="flex justify-between items-start mb-4">
                   <div>
                     <span className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-1 block">Motivo:</span>
                     <span className="text-sm font-bold text-white line-clamp-2">{rep.reason}</span>
                   </div>
                   <button 
                    onClick={() => openDetail(rep)}
                    className="text-gray-500 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
                   >
                     <Eye size={18} />
                   </button>
               </div>

               <div className="flex items-center gap-4 mb-4 p-3 bg-gray-950 rounded-2xl border border-gray-800/50">
                   <div className="w-14 h-14 rounded-full bg-gray-800 overflow-hidden border-2 border-gray-700 shrink-0">
                       {rep.reported_user?.photo ? (
                           <img src={rep.reported_user.photo} className="w-full h-full object-cover" />
                       ) : (
                           <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500">
                               <Users size={24} />
                           </div>
                       )}
                   </div>
                   <div className="min-w-0 flex-1">
                       <p className="text-lg font-black text-white truncate">@{rep.reported_user?.username || "Unknown"}</p>
                       <p className="text-sm text-gray-400 truncate">{rep.reported_user?.name || "Sin nombre"}</p>
                   </div>
               </div>

               <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                   <div className="bg-gray-950/50 p-2 rounded-xl border border-gray-800/50">
                       <span className="text-gray-500 block text-[10px] uppercase tracking-widest font-black">Denunciado Por</span>
                       <span className="text-purple-400 font-bold truncate block">@{rep.reporter?.username}</span>
                   </div>
                   <div className="bg-gray-950/50 p-2 rounded-xl border border-gray-800/50">
                       <span className="text-gray-500 block text-[10px] uppercase tracking-widest font-black">Fecha</span>
                       <span className="text-gray-300 font-medium">{new Date(rep.created_at).toLocaleDateString("es")}</span>
                   </div>
               </div>

               <div className="mt-auto grid grid-cols-2 gap-3">
                   <button 
                       onClick={() => handleAction(rep.id, 'dismiss')}
                       className="bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs uppercase tracking-widest py-3 rounded-xl transition-colors border border-gray-700 flex items-center justify-center gap-2"
                   >
                       <CheckCircle size={16} className="text-green-500"/> Ignorar
                   </button>
                   <button 
                       onClick={() => handleAction(rep.id, 'ban', rep.reason)}
                       className="bg-red-950/50 hover:bg-red-600 text-red-500 hover:text-white border border-red-900/50 hover:border-red-500 font-bold text-xs uppercase tracking-widest py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                   >
                       <Ban size={16} /> BANEAR
                   </button>
               </div>
               
               <Link 
                   href={`/u/${rep.reported_user?.username}`}
                   target="_blank"
                   className="mt-3 text-center text-blue-400 hover:text-blue-300 text-xs font-bold flex items-center justify-center gap-1 transition-colors"
               >
                   <Eye size={12}/> Ver Perfil
               </Link>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showDetail && selectedUser && (
            <UserDetailModal report={selectedUser} onClose={() => setShowDetail(false)} onAction={handleAction} />
        )}
      </AnimatePresence>
    </div>
  );
}

function UserDetailModal({ report, onClose, onAction }) {
    const [activeTab, setActiveTab] = useState("info");
    const [userPhotos, setUserPhotos] = useState([]);
    const [loadingPhotos, setLoadingPhotos] = useState(false);

    useEffect(() => {
        if (activeTab === "photos") {
            loadUserPhotos();
        }
    }, [activeTab]);

    const loadUserPhotos = async () => {
        setLoadingPhotos(true);
        try {
            const photos = await api.get(`/users/${report.reported_user_id}/posts`);
            const postsWithImages = (photos.posts || []).filter(p => p.image_url);
            setUserPhotos(postsWithImages);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingPhotos(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="w-full max-w-4xl max-h-[90vh] bg-gray-900 rounded-3xl border border-gray-800 shadow-2xl overflow-hidden flex flex-col"
            >
                <div className="flex items-center justify-between p-6 border-b border-gray-800 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gray-800 overflow-hidden border-2 border-orange-500">
                            {report.reported_user?.photo ? (
                                <img src={report.reported_user.photo} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500">
                                    <Users size={32} />
                                </div>
                            )}
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white">@{report.reported_user?.username}</h2>
                            <p className="text-gray-400">{report.reported_user?.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex border-b border-gray-800 shrink-0 px-6">
                    {["info", "report", "photos", "history"].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors ${
                                activeTab === tab 
                                    ? "text-orange-500 border-orange-500" 
                                    : "text-gray-500 border-transparent hover:text-gray-300"
                            }`}
                        >
                            {tab === "info" ? "Información" : 
                             tab === "report" ? "Denuncia" : 
                             tab === "photos" ? "Fotos" : "Historial"}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-auto p-6">
                    {activeTab === "info" && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <InfoCard label="Usuario" value={`@${report.reported_user?.username}`} />
                            <InfoCard label="Nombre" value={report.reported_user?.name || "No definido"} />
                            <InfoCard label="Email" value={report.reported_user?.email || "No disponible"} />
                            <InfoCard label="Género" value={report.reported_user?.gender || "No definido"} />
                            <InfoCard label="Fecha de Registro" value={new Date(report.reported_user?.created_at).toLocaleDateString("es")} />
                            <InfoCard label="Estado" value={report.reported_user?.is_suspended ? "SUSPENDIDO" : "Activo"} />
                            <InfoCard label="VIP" value={report.reported_user?.is_prime ? "Sí" : "No"} />
                            <InfoCard label="Edad" value={report.reported_user?.birth_date ? new Date().getFullYear() - new Date(report.reported_user.birth_date).getFullYear() + " años" : "N/A"} />
                        </div>
                    )}

                    {activeTab === "report" && (
                        <div className="bg-orange-950/20 border border-orange-500/30 rounded-2xl p-6">
                            <div className="flex items-start gap-4 mb-4">
                                <AlertTriangle className="text-orange-500 shrink-0 mt-1" size={24} />
                                <div>
                                    <h3 className="text-lg font-black text-white mb-2">Razón del Reporte</h3>
                                    <p className="text-gray-300 text-lg">{report.reason}</p>
                                </div>
                            </div>
                            <div className="border-t border-orange-500/20 pt-4 mt-4">
                                <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-1">Reportado Por</p>
                                <p className="text-purple-400 font-bold">@{report.reporter?.username}</p>
                            </div>
                            <div className="text-gray-500 text-sm mt-2">
                                {new Date(report.created_at).toLocaleString("es")}
                            </div>
                        </div>
                    )}

                    {activeTab === "photos" && (
                        <div>
                            {loadingPhotos ? (
                                <div className="text-center py-10 text-gray-500 animate-pulse">Cargando fotos...</div>
                            ) : userPhotos.length === 0 ? (
                                <div className="text-center py-10 text-gray-500">No hay fotos publicadas</div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {userPhotos.map(post => (
                                        <div key={post.id} className="aspect-square rounded-xl overflow-hidden border border-gray-800">
                                            <img src={post.image_url} alt="" className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "history" && (
                        <div className="text-center py-10 text-gray-500">
                            <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
                            <p>Historial de reportes anteriores</p>
                            <p className="text-sm mt-2">Próximamente disponible</p>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-800 flex gap-3 shrink-0">
                    <button 
                        onClick={() => onAction(report.id, 'dismiss')}
                        className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl transition-colors border border-gray-700"
                    >
                        <CheckCircle className="inline mr-2" size={18} /> Ignorar Denuncia
                    </button>
                    <button 
                        onClick={() => onAction(report.id, 'ban', report.reason)}
                        className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-colors"
                    >
                        <Ban className="inline mr-2" size={18} /> BANEAR Usuario
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

function InfoCard({ label, value }) {
    return (
        <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
            <p className="text-gray-500 text-[10px] uppercase tracking-widest font-black mb-1">{label}</p>
            <p className="text-white font-bold">{value}</p>
        </div>
    );
}