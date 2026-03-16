"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, UploadCloud, CheckCircle, Smartphone, Building, Hash, Info, RefreshCw, Crown } from "lucide-react";
import { api } from "@/utils/api";
import { useToast } from "@/context/ToastContext";

// Configuración de tu cuenta receptora
const MY_BANK_DETAILS = {
    bank: "Banesco (0134)",
    phone: "0414-1234567",
    rif: "J-12345678-9",
    name: "Cuadralo App C.A."
};

export default function CheckoutModal({ product, onClose }) {
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Tasa BCV y Cálculos
  const [bcvRate, setBcvRate] = useState(null);
  const [amountVES, setAmountVES] = useState(null);
  
  // Formulario
  const [formData, setFormData] = useState({ reference: "", bank: "", phone: "" });
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);

  // Obtener Tasa Euro BCV en tiempo real (Usando API PyDolarVenezuela)
  useEffect(() => {
      const fetchRate = async () => {
          try {
              const res = await fetch("https://pydolarvenezuela-api.vercel.app/api/v1/dollar/page?page=bcv");
              const data = await res.json();
              // Buscamos el valor del EURO
              if (data.monitors && data.monitors.eur) {
                  const rate = data.monitors.eur.price;
                  setBcvRate(rate);
                  setAmountVES((product.price * rate).toFixed(2));
              } else {
                  throw new Error("No Euro data");
              }
          } catch (error) {
              console.error("Error obteniendo tasa BCV:", error);
              // Fallback de emergencia si la API falla
              setBcvRate(43.50); 
              setAmountVES((product.price * 43.50).toFixed(2));
          }
      };
      fetchRate();
  }, [product]);

  const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
          setReceiptFile(file);
          setReceiptPreview(URL.createObjectURL(file));
      }
  };

  const handleSubmitPayment = async () => {
      if (!formData.reference || !formData.bank || !formData.phone || !receiptFile) {
          showToast("Completa todos los campos y sube el comprobante", "error");
          return;
      }

      setLoading(true);
      try {
          // 1. Subir la imagen al servidor
          const receiptUrl = await api.upload(receiptFile);

          // 2. Enviar el reporte de pago
          await api.post("/premium/report-payment", {
              item_type: product.id,
              amount_usd: product.price,
              amount_ves: parseFloat(amountVES),
              rate: bcvRate,
              reference: formData.reference,
              bank: formData.bank,
              phone: formData.phone,
              receipt: receiptUrl
          });

          // 3. Pantalla de Éxito
          setStep(3);
      } catch (error) {
          console.error(error);
          showToast(error.error || "Error procesando el pago", "error");
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg bg-[#0f0518] rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl text-white flex flex-col max-h-[90vh]"
      >
        {/* Cabecera Pestañas Nav */}
        <div className="bg-white/5 border-b border-white/10 p-4 flex items-center justify-between">
            <h3 className="font-bold text-lg flex items-center gap-2">
                {step === 1 ? "Resumen de Compra" : step === 2 ? "Pago Móvil" : "¡Recibido!"}
            </h3>
            <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-all">
                <X size={18} />
            </button>
        </div>

        <div className="p-6 overflow-y-auto scrollbar-hide">
            <AnimatePresence mode="wait">
                
                {/* === PASO 1: DETALLES DEL PRODUCTO Y MÉTODO === */}
                {step === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                        
                        {/* Producto */}
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20">
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-lg text-black">
                                {product.id === 'vip' ? <Crown size={32} /> : <Zap size={32} />}
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-yellow-400 tracking-tight">{product.name}</h4>
                                <p className="text-white/60 text-sm">{product.desc || "Acceso premium a Cuadralo."}</p>
                            </div>
                        </div>

                        {/* Totales */}
                        <div className="bg-black/50 rounded-2xl p-5 border border-white/5">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-white/60">Precio (USD)</span>
                                <span className="text-xl font-black">${product.price.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b border-white/10">
                                <span className="text-white/60 flex items-center gap-1">Tasa Euro BCV {!bcvRate && <RefreshCw size={12} className="animate-spin" />}</span>
                                <span className="text-sm font-bold text-yellow-400">Bs. {bcvRate ? bcvRate.toFixed(2) : "Cargando..."}</span>
                            </div>
                            <div className="flex justify-between items-center pt-3">
                                <span className="text-white font-bold">Total a Pagar</span>
                                <span className="text-2xl font-black text-green-400">Bs. {amountVES || "..."}</span>
                            </div>
                        </div>

                        {/* Selección de Método */}
                        <div>
                            <h4 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-3">Método de Pago</h4>
                            <button onClick={() => setStep(2)} className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cuadralo-pink/50 transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                                        <Smartphone size={20} />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-white">Pago Móvil (Venezuela)</p>
                                        <p className="text-xs text-white/50">Aprobación manual rápida</p>
                                    </div>
                                </div>
                                <ChevronRight className="text-white/30 group-hover:text-cuadralo-pink transition-colors" />
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* === PASO 2: INSTRUCCIONES Y FORMULARIO PAGO MÓVIL === */}
                {step === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                        
                        {/* Instrucciones de Pago */}
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5">
                            <div className="flex items-center gap-2 mb-3 text-blue-400">
                                <Info size={16} />
                                <span className="text-xs font-black uppercase tracking-widest">Datos para transferir</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div><span className="text-white/50 block text-xs">Banco</span><span className="font-bold">{MY_BANK_DETAILS.bank}</span></div>
                                <div><span className="text-white/50 block text-xs">Teléfono</span><span className="font-bold">{MY_BANK_DETAILS.phone}</span></div>
                                <div><span className="text-white/50 block text-xs">Cédula/RIF</span><span className="font-bold">{MY_BANK_DETAILS.rif}</span></div>
                                <div><span className="text-white/50 block text-xs">Monto Exacto</span><span className="font-black text-green-400">Bs. {amountVES}</span></div>
                            </div>
                        </div>

                        {/* Formulario */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1 block">Tu Banco</label>
                                    <div className="relative">
                                        <Building size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/30" />
                                        <input type="text" placeholder="Ej: Mercantil" value={formData.bank} onChange={(e) => setFormData({...formData, bank: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-3 text-sm focus:border-cuadralo-pink outline-none transition-colors" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1 block">Tu Teléfono</label>
                                    <div className="relative">
                                        <Smartphone size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/30" />
                                        <input type="text" placeholder="0412..." value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-3 text-sm focus:border-cuadralo-pink outline-none transition-colors" />
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1 block">Referencia (Últimos 6 dígitos)</label>
                                <div className="relative">
                                    <Hash size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/30" />
                                    <input type="text" placeholder="123456" value={formData.reference} onChange={(e) => setFormData({...formData, reference: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-3 text-sm focus:border-cuadralo-pink outline-none transition-colors" />
                                </div>
                            </div>

                            {/* Subir Capture */}
                            <div>
                                <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2 block">Capture del Pago</label>
                                <div 
                                    onClick={() => fileInputRef.current.click()}
                                    className="border-2 border-dashed border-white/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/5 hover:border-cuadralo-pink/50 transition-colors"
                                >
                                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                                    {receiptPreview ? (
                                        <img src={receiptPreview} alt="Comprobante" className="h-32 object-contain rounded-lg shadow-md" />
                                    ) : (
                                        <>
                                            <UploadCloud size={32} className="text-white/30 mb-2" />
                                            <p className="text-sm font-bold text-white/80">Toca para subir el comprobante</p>
                                            <p className="text-xs text-white/40 mt-1">JPG, PNG (Máx 5MB)</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button onClick={() => setStep(1)} className="px-6 py-4 rounded-xl bg-white/5 text-white font-bold hover:bg-white/10 transition-colors">Volver</button>
                            <button onClick={handleSubmitPayment} disabled={loading} className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-black uppercase tracking-widest text-sm rounded-xl py-4 shadow-lg shadow-blue-500/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
                                {loading ? <RefreshCw className="animate-spin" size={18} /> : "Reportar Pago"}
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* === PASO 3: ÉXITO === */}
                {step === 3 && (
                    <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-10 text-center">
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5, delay: 0.2 }} className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 mb-6">
                            <CheckCircle size={48} />
                        </motion.div>
                        <h2 className="text-2xl font-black text-white mb-2">¡Pago Recibido!</h2>
                        <p className="text-white/60 text-sm max-w-xs mx-auto mb-8">
                            Hemos recibido tu reporte de pago y comprobante. Nuestro equipo lo verificará y tu {product.name} se activará en breve.
                        </p>
                        <button onClick={onClose} className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-colors">
                            Entendido, volver a la app
                        </button>
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}