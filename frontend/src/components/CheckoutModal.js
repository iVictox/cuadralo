"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    X, ChevronRight, UploadCloud, CheckCircle, Smartphone, 
    Building, Hash, Info, RefreshCw, Crown, Zap, 
    Lock, ShieldCheck, Check, ArrowRight
} from "lucide-react";
import { api } from "@/utils/api";
import { useToast } from "@/context/ToastContext";

const MY_BANK_DETAILS = {
    bank: "Banesco (0134)",
    phone: "0414-1234567",
    rif: "J-12345678-9",
    name: "Cuadralo App C.A."
};

const VZLA_BANKS = [
    { code: "0156", name: "100% Banco" },
    { code: "0172", name: "Bancamiga" },
    { code: "0114", name: "Bancaribe" },
    { code: "0171", name: "Banco Activo" },
    { code: "0166", name: "Banco Agrícola" },
    { code: "0175", name: "Banco Bicentenario" },
    { code: "0128", name: "Banco Caroní" },
    { code: "0102", name: "Banco de Venezuela" },
    { code: "0163", name: "Banco del Tesoro" },
    { code: "0115", name: "Banco Exterior" },
    { code: "0138", name: "Banco Plaza" },
    { code: "0157", name: "Bancosur" },
    { code: "0134", name: "Banesco" },
    { code: "0177", name: "BANFANB" },
    { code: "0174", name: "Banplus" },
    { code: "0168", name: "Bancrecer" },
    { code: "0151", name: "BFC Banco Fondo Común" },
    { code: "0191", name: "BNC Nacional de Crédito" },
    { code: "0105", name: "Mercantil" },
    { code: "0169", name: "Mi Banco" },
    { code: "0108", name: "Provincial" },
    { code: "0104", name: "Venezolano de Crédito" },
];

export default function CheckoutModal({ product, onClose, onSuccess }) {
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const [bcvRate, setBcvRate] = useState(null);
  const [amountVES, setAmountVES] = useState(null);
  
  const [formData, setFormData] = useState({ reference: "", bank: "", phone: "" });
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);

  useEffect(() => {
      const fetchRate = async () => {
          try {
              const res = await api.get("/premium/rate");
              if (res.rate) {
                  setBcvRate(res.rate);
                  setAmountVES((product.price * res.rate).toFixed(2));
              } else {
                  throw new Error("Tasa no recibida");
              }
          } catch (error) {
              console.error("Fallo obteniendo la tasa del servidor:", error);
              const emergencyRate = 512.22; 
              setBcvRate(emergencyRate); 
              setAmountVES((product.price * emergencyRate).toFixed(2));
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
          const receiptUrl = await api.upload(receiptFile);

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

          setStep(3);
      } catch (error) {
          console.error(error);
          showToast(error.error || "Error procesando el pago", "error");
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 bg-zinc-950/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        className="relative w-full max-w-4xl bg-white rounded-[2rem] overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] text-zinc-900 flex flex-col max-h-[95vh]"
      >
        {/* Header Superior - Identidad Cuádralo Pay */}
        <div className="bg-white border-b border-zinc-100 p-5 flex items-center justify-between shrink-0 z-10 relative">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-800 shadow-sm border border-zinc-200">
                    <ShieldCheck size={22} strokeWidth={2} />
                </div>
                <div>
                    <h3 className="font-black text-xl text-zinc-900 leading-none mb-1 tracking-tight">Cuádralo Pay</h3>
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                        <Lock size={10} /> Pasarela de pago oficial
                    </p>
                </div>
            </div>
            <button onClick={onClose} className="p-2.5 bg-white hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 rounded-full transition-all border border-transparent hover:border-zinc-200">
                <X size={20} strokeWidth={2.5} />
            </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white relative">
            <AnimatePresence mode="wait">
                
                {/* =========================================
                    PASO 1: RESUMEN DE COMPRA
                ============================================= */}
                {step === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col md:flex-row min-h-full">
                        
                        {/* Columna Izquierda */}
                        <div className="w-full md:w-5/12 bg-zinc-50/50 p-6 sm:p-8 md:p-10 flex flex-col border-r border-zinc-100">
                            <span className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-4 block">Estás comprando</span>
                            
                            <div className="flex items-start gap-4 mb-8">
                                <div className="w-16 h-16 shrink-0 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-[0_4px_15px_rgba(217,119,6,0.2)] text-white border border-yellow-500/30">
                                    {product.id === 'vip' ? <Crown size={32} strokeWidth={2.5} /> : <Zap size={32} strokeWidth={2.5} />}
                                </div>
                                <div>
                                    <h4 className="text-2xl font-black text-zinc-900 tracking-tight leading-none mb-2">{product.name}</h4>
                                    <p className="text-zinc-600 text-sm font-medium leading-relaxed">{product.desc}</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm mb-6">
                                <h5 className="text-sm font-black text-zinc-900 mb-4 flex items-center gap-2">
                                    <CheckCircle size={18} className="text-green-600" /> Beneficios incluidos:
                                </h5>
                                <ul className="space-y-4">
                                    {product.id === 'vip' ? (
                                        <>
                                            <BenefitRow text="Acceso al Radar (Mira a quién le gustas)" />
                                            <BenefitRow text="Likes y Swipes Ilimitados diarios" />
                                            <BenefitRow text="Rebobinar perfiles ilimitadamente" />
                                            <BenefitRow text="Bono: 1 Destello mensual gratis" />
                                            <BenefitRow text="Bono: 3 Rompehielos mensuales gratis" />
                                        </>
                                    ) : (
                                        <BenefitRow text="Mejoras específicas del paquete" />
                                    )}
                                </ul>
                            </div>
                        </div>

                        {/* Columna Derecha */}
                        <div className="w-full md:w-7/12 bg-white p-6 sm:p-8 md:p-10 flex flex-col relative">
                            <h4 className="text-xl font-black text-zinc-900 mb-6">Resumen del Pago</h4>

                            {/* Ticket de Pago */}
                            <div className="bg-zinc-50 rounded-3xl p-6 border border-zinc-200 mb-8">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-zinc-600 font-bold">Subtotal ({product.name})</span>
                                    <span className="text-lg font-black text-zinc-900">${product.price.toFixed(2)} USD</span>
                                </div>
                                <div className="flex justify-between items-center pb-4 border-b border-zinc-200 border-dashed">
                                    <span className="text-zinc-500 font-semibold flex items-center gap-2">
                                        Tasa de cambio BCV
                                        {!bcvRate && <RefreshCw size={14} className="animate-spin text-zinc-400" />}
                                    </span>
                                    <span className="text-sm font-black text-zinc-700">
                                        x {bcvRate ? bcvRate.toLocaleString('es-VE', { minimumFractionDigits: 2 }) : "..."} Bs.
                                    </span>
                                </div>
                                <div className="flex justify-between items-end pt-5">
                                    <div>
                                        <span className="text-zinc-900 font-black block text-lg">Total a Pagar</span>
                                        <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest">En Moneda Local</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-4xl font-black text-zinc-900 tracking-tighter">
                                            Bs. {amountVES ? parseFloat(amountVES).toLocaleString('es-VE', { minimumFractionDigits: 2 }) : "..."}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Selector de Pago */}
                            <div>
                                <span className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-3 block">Selecciona tu método</span>
                                <button 
                                    onClick={() => setStep(2)} 
                                    className="w-full flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white border-2 border-zinc-200 hover:border-zinc-900 hover:shadow-md transition-all group cursor-pointer"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-800 border border-zinc-200 group-hover:scale-105 transition-transform">
                                            <Smartphone size={24} strokeWidth={2} />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-black text-zinc-900 text-lg">Pago Móvil Nacional</p>
                                            <p className="text-sm text-zinc-500 font-semibold">Transferencia en Bolívares</p>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-zinc-50 border border-zinc-200 flex items-center justify-center group-hover:bg-zinc-900 group-hover:border-zinc-900 transition-colors">
                                        <ArrowRight size={20} className="text-zinc-400 group-hover:text-white" strokeWidth={2.5} />
                                    </div>
                                </button>
                            </div>

                            {/* Enlaces Legales */}
                            <div className="mt-auto pt-8 flex flex-col items-center justify-center text-center">
                                <p className="text-xs font-semibold text-zinc-400 mb-3">
                                    Al procesar el pago, aceptas nuestras políticas de seguridad.
                                </p>
                                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-bold text-zinc-500">
                                    <a href="#" className="hover:text-zinc-900 underline decoration-transparent hover:decoration-zinc-900 transition-colors">Términos de Servicio</a>
                                    <span className="hidden sm:inline text-zinc-300">•</span>
                                    <a href="#" className="hover:text-zinc-900 underline decoration-transparent hover:decoration-zinc-900 transition-colors">Política de Privacidad</a>
                                    <span className="hidden sm:inline text-zinc-300">•</span>
                                    <a href="#" className="hover:text-zinc-900 underline decoration-transparent hover:decoration-zinc-900 transition-colors">Reembolsos</a>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* =========================================
                    PASO 2: FORMULARIO DE PAGO MÓVIL
                ============================================= */}
                {step === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="p-6 sm:p-8 md:p-10">
                        <div className="flex items-center gap-3 mb-8">
                            <button onClick={() => setStep(1)} className="p-2 bg-white hover:bg-zinc-100 border border-zinc-200 rounded-full text-zinc-700 transition-colors shadow-sm">
                                <ChevronRight size={20} className="rotate-180" strokeWidth={2.5} />
                            </button>
                            <h4 className="text-2xl font-black text-zinc-900">Reportar Pago Móvil</h4>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                            
                            {/* Info del Banco */}
                            <div>
                                <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-6 sm:p-8 relative h-full shadow-sm">
                                    
                                    <div className="flex items-center gap-2 mb-6 text-zinc-800 border-b border-zinc-200 pb-4">
                                        <Info size={20} strokeWidth={2.5} />
                                        <span className="text-sm font-black uppercase tracking-widest">Datos de Transferencia</span>
                                    </div>
                                    
                                    <div className="space-y-5">
                                        <div><span className="text-zinc-500 block text-xs font-black uppercase tracking-widest mb-1">Banco</span><span className="text-xl font-black text-zinc-900">{MY_BANK_DETAILS.bank}</span></div>
                                        <div><span className="text-zinc-500 block text-xs font-black uppercase tracking-widest mb-1">Teléfono</span><span className="text-xl font-black text-zinc-900">{MY_BANK_DETAILS.phone}</span></div>
                                        <div><span className="text-zinc-500 block text-xs font-black uppercase tracking-widest mb-1">Cédula / RIF</span><span className="text-xl font-black text-zinc-900">{MY_BANK_DETAILS.rif}</span></div>
                                        <div className="pt-4 border-t border-zinc-200">
                                            <span className="text-zinc-900 block text-xs font-black uppercase tracking-widest mb-1">Monto a Enviar Exacto</span>
                                            <span className="text-4xl font-black text-zinc-900 tracking-tighter">Bs. {amountVES ? parseFloat(amountVES).toLocaleString('es-VE', { minimumFractionDigits: 2 }) : ""}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Formulario */}
                            <div className="space-y-5">
                                <div>
                                    <label className="text-xs font-black text-zinc-600 uppercase tracking-widest mb-2 block">Banco Emisor</label>
                                    <div className="relative">
                                        <Building size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-400 pointer-events-none" />
                                        <select 
                                            value={formData.bank} 
                                            onChange={(e) => setFormData({...formData, bank: e.target.value})} 
                                            className="w-full bg-white border-2 border-zinc-200 rounded-2xl py-4 pl-12 pr-4 text-base font-bold text-zinc-900 focus:border-zinc-900 focus:ring-4 focus:ring-zinc-100 outline-none transition-all appearance-none cursor-pointer shadow-sm"
                                        >
                                            <option value="" disabled>Selecciona tu banco...</option>
                                            {VZLA_BANKS.map((b) => (
                                                <option key={b.code} value={`${b.name} (${b.code})`}>{b.name} ({b.code})</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-black text-zinc-600 uppercase tracking-widest mb-2 block">Tu Teléfono</label>
                                        <div className="relative">
                                            <Smartphone size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-400" />
                                            <input type="text" placeholder="0412..." value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full bg-white border-2 border-zinc-200 rounded-2xl py-4 pl-12 pr-4 text-base font-bold text-zinc-900 focus:border-zinc-900 focus:ring-4 focus:ring-zinc-100 outline-none transition-all shadow-sm" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-black text-zinc-600 uppercase tracking-widest mb-2 block">Referencia</label>
                                        <div className="relative">
                                            <Hash size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-400" />
                                            <input type="text" placeholder="Ej: 849302" value={formData.reference} onChange={(e) => setFormData({...formData, reference: e.target.value})} className="w-full bg-white border-2 border-zinc-200 rounded-2xl py-4 pl-12 pr-4 text-base font-bold text-zinc-900 focus:border-zinc-900 focus:ring-4 focus:ring-zinc-100 outline-none transition-all shadow-sm" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-black text-zinc-600 uppercase tracking-widest mb-2 block">Comprobante (Capture)</label>
                                    <div 
                                        onClick={() => fileInputRef.current.click()}
                                        className="border-2 border-dashed border-zinc-300 bg-zinc-50 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-zinc-100 hover:border-zinc-900 transition-colors shadow-sm"
                                    >
                                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                                        {receiptPreview ? (
                                            <img src={receiptPreview} alt="Comprobante" className="h-32 object-contain rounded-xl shadow-md border border-zinc-200" />
                                        ) : (
                                            <>
                                                <UploadCloud size={36} className="text-zinc-700 mb-3" />
                                                <p className="text-base font-black text-zinc-900">Subir imagen del pago</p>
                                                <p className="text-xs text-zinc-500 mt-1 font-bold">Formatos: JPG, PNG</p>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <button onClick={handleSubmitPayment} disabled={loading} className="w-full bg-zinc-900 hover:bg-black text-white font-black uppercase tracking-widest text-base rounded-2xl py-5 shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 mt-4">
                                    {loading ? <RefreshCw className="animate-spin" size={24} /> : <><CheckCircle size={24} /> Enviar Reporte Seguro</>}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* =========================================
                    PASO 3: ÉXITO
                ============================================= */}
                {step === 3 && (
                    <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-20 px-6 text-center h-full">
                        <div className="relative mb-8">
                            <div className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full" />
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.6, delay: 0.2 }} className="relative w-32 h-32 bg-green-50 rounded-full flex items-center justify-center text-green-600 border-[8px] border-white shadow-xl">
                                <CheckCircle size={64} strokeWidth={2.5} />
                            </motion.div>
                        </div>
                        <h2 className="text-4xl font-black text-zinc-900 mb-4 tracking-tight">¡Pago Recibido!</h2>
                        <p className="text-zinc-500 text-lg font-semibold max-w-md mx-auto mb-10 leading-relaxed">
                            Hemos recibido tu reporte exitosamente. Nuestro equipo verificará la transacción y tu <span className="font-black text-zinc-900">{product.name}</span> se activará en tu cuenta en breve.
                        </p>
                        <button onClick={onSuccess || onClose} className="px-10 py-5 bg-zinc-900 text-white font-black uppercase tracking-widest text-sm rounded-2xl hover:bg-black hover:shadow-xl transition-all active:scale-95">
                            Volver a Cuádralo
                        </button>
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

function BenefitRow({ text }) {
    return (
        <li className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-green-50 border border-green-100 flex items-center justify-center text-green-600 shrink-0 shadow-sm">
                <Check size={14} strokeWidth={3} />
            </div>
            <span className="text-zinc-700 text-base font-bold">{text}</span>
        </li>
    );
}