"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { withdrawApplication } from "@/app/lib/applications";
import { 
  IconCash, 
  IconClock, 
  IconMapPin, 
  IconX, 
  IconBrandWhatsapp, 
  IconNotes,
  IconExternalLink,
  IconAlertCircle
} from "@tabler/icons-react";

// Tipi e Helper (mantenuti per logica)
type Job = {
  id: string;
  role: string;
  location: string;
  pay: string;
  startDate: Date | string;
  endDate: Date | string;
  lat?: number;
  lng?: number;
  notes?: string;
  workerPhone?: string;
};

const toDate = (v: Date | string) => (v instanceof Date ? v : new Date(v));

const whatsappLink = (phone: string, text?: string) => {
  const clean = phone.replace(/[^\d]/g, "");
  return `https://wa.me/${clean}?text=${encodeURIComponent(text || "")}`;
};

export default function JobDetailsSheet({
  job,
  onClose,
  applied,
  onApply,
  onWithdraw,
}: {
  job: Job | null;
  onClose: () => void;
  applied?: boolean;
  onApply?: (id: string) => void;
  onWithdraw?: (id: string) => void;
}) {
  const [withdrawing, setWithdrawing] = useState(false);

  const handleWithdraw = async () => {
    if (!job || withdrawing) return;
    setWithdrawing(true);
    try {
      await withdrawApplication(job.id);
      onWithdraw?.(job.id);
      window.dispatchEvent(new Event("applications-updated"));
      onClose();
    } catch (e: any) {
      alert(e?.message ?? "Errore");
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <AnimatePresence>
      {job && (
        <>
          {/* OVERLAY */}
          <motion.div
            className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !withdrawing && onClose()}
          />

          {/* SHEET */}
          <motion.div
            className="fixed left-0 right-0 bottom-0 z-[110] mx-auto w-full max-w-xl"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            <div className="mx-2 mb-2 rounded-[32px] bg-white shadow-2xl overflow-hidden border border-slate-100">
              
              {/* HANDLE & CLOSE */}
              <div className="relative flex justify-center pt-4">
                <div className="w-12 h-1.5 rounded-full bg-slate-200" />
                <button
                  onClick={onClose}
                  className="absolute right-6 top-4 p-2 rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 transition"
                >
                  <IconX size={20} />
                </button>
              </div>

              <div className="p-6 pt-2 space-y-6 max-h-[85vh] overflow-y-auto">
                
                {/* HEADER */}
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-slate-900 leading-tight">
                    {job.role}
                  </h2>
                  <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                    <IconMapPin size={16} stroke={2.5} />
                    <span className="text-sm">{job.location}</span>
                  </div>
                </div>

                {/* INFO GRID */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-emerald-50/50 p-4 border border-emerald-100/50">
                    <div className="flex items-center gap-2 text-emerald-700 mb-1">
                      <IconCash size={18} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Paga Netta</span>
                    </div>
                    <div className="text-lg font-black text-emerald-900">{job.pay}</div>
                  </div>
                  
                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                      <IconClock size={18} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Orario</span>
                    </div>
                    <div className="text-xs font-bold text-slate-700 leading-relaxed">
                      {toDate(job.startDate).toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric' })} <br/>
                      {toDate(job.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {toDate(job.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                {/* MAP BOX */}
                <div className="space-y-3">
                  <div className="flex justify-between items-end px-1">
                    <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Posizione</h3>
                  </div>
                  <div 
                    className="group relative h-40 rounded-3xl overflow-hidden border-2 border-slate-50 shadow-inner cursor-pointer"
                    onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.location)}`, '_blank')}
                  >
                    <iframe
                      title="Map"
                      className="w-full h-full grayscale-[0.2] contrast-[1.1]"
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(job.location)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                    />
                    <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition" />
                    <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur px-4 py-2 rounded-2xl shadow-sm flex items-center gap-2 text-xs font-bold text-slate-800">
                      <IconExternalLink size={14} /> Mappe
                    </div>
                  </div>
                </div>

                {/* NOTES */}
                {job.notes && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex gap-3">
                    <IconNotes size={20} className="text-slate-400 shrink-0" />
                    <div className="text-sm text-slate-600 italic">"{job.notes}"</div>
                  </div>
                )}

                {/* ACTIONS */}
                <div className="space-y-3 pt-2">
                  {/* WhatsApp (Solo se presente) */}
                  {job.workerPhone && (
                    <a
                      href={whatsappLink(job.workerPhone, `Ciao! Mi candido per "${job.role}"...`)}
                      target="_blank"
                      className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold bg-[#25D366] text-white shadow-lg shadow-green-200 active:scale-95 transition"
                    >
                      <IconBrandWhatsapp size={22} />
                      Scrivi su WhatsApp
                    </a>
                  )}

                  {/* Button Candidatura */}
                  {!applied ? (
                    <button
                      onClick={() => onApply?.(job.id)}
                      className="w-full py-4 rounded-2xl font-black bg-emerald-500 text-white shadow-lg shadow-emerald-200 active:scale-95 transition"
                    >
                      CANDIDATI ORA
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-2 py-4 rounded-2xl font-bold bg-slate-100 text-slate-500 border border-slate-200">
                        CANDIDATURA INVIATA
                      </div>
                      <button
                        onClick={handleWithdraw}
                        disabled={withdrawing}
                        className="w-full py-3 text-xs font-bold text-red-400 hover:text-red-500 transition disabled:opacity-50"
                      >
                        {withdrawing ? "Sto annullando..." : "Annulla la mia candidatura"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}