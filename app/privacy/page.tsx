"use client";

import { useRouter } from "next/navigation";
import { 
  IconChevronLeft, 
  IconShieldCheck, 
  IconGavel, 
  IconLock, 
  IconAlertTriangle,
  IconScale,
  IconCashOff
} from "@tabler/icons-react";
import { motion } from "framer-motion";

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-12">
      {/* HEADER */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <IconChevronLeft size={24} />
          </button>
          <h1 className="font-black text-slate-800 tracking-tight">
            Note <span className="text-emerald-500">Legali</span>
          </h1>
          <div className="w-8" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-[40px] shadow-sm overflow-hidden"
        >
          {/* BANNER DI AVVERTENZA LEGALE */}
          <div className="bg-slate-900 p-8 text-white">
            <div className="flex items-center gap-3 mb-3">
              <IconScale size={28} className="text-emerald-400" />
              <h2 className="text-2xl font-black italic">Disclaimer Importante</h2>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">
              L'utilizzo di extraJob implica l'accettazione dei seguenti termini. La piattaforma è un mero intermediario tecnico. Leggi attentamente le clausole di esclusione di responsabilità.
            </p>
          </div>

          <div className="p-8 space-y-12">
            
            {/* 1. NATURA DEL RAPPORTO - LA CLAUSOLA CHIAVE */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-slate-900">
                <IconGavel size={22} className="text-emerald-500" />
                <h3 className="text-xl font-black">1. Natura del Servizio e Manleva</h3>
              </div>
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-sm text-slate-600 space-y-3">
                <p>
                  <strong>Intermediazione Passiva:</strong> extraJob fornisce esclusivamente un’infrastruttura tecnologica. Non agisce come agenzia di somministrazione, né come datore di lavoro.
                </p>
                <p>
                  <strong>Clausola di Manleva:</strong> L’Utente (Lavoratore o Datore) accetta di manlevare e tenere totalmente indenne extraJob da qualsiasi pretesa, danno, sanzione o spesa derivante da infortuni, controversie lavorative, o illeciti civili e penali occorsi durante la prestazione lavorativa concordata tra le parti.
                </p>
              </div>
            </section>

            {/* 2. ASSENZA GARANZIA PAGAMENTI */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-slate-900">
                <IconCashOff size={22} className="text-red-500" />
                <h3 className="text-xl font-black">2. Pagamenti e Compensi</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                extraJob <strong>non garantisce</strong> che il Datore di lavoro paghi effettivamente il Lavoratore, né interviene in caso di mancato pagamento. Il compenso, le modalità e la regolarità fiscale dello stesso sono sotto l'esclusiva responsabilità delle parti coinvolte. extraJob non gestisce transazioni di denaro relative alle prestazioni lavorative.
              </p>
            </section>

            {/* 3. SICUREZZA E OBBLIGHI FISCALI */}
            <section className="space-y-4 text-sm text-slate-600">
              <div className="flex items-center gap-2 text-slate-900">
                <IconAlertTriangle size={22} className="text-amber-500" />
                <h3 className="text-xl font-black">3. Sicurezza e Fisco</h3>
              </div>
              <ul className="list-disc pl-5 space-y-2 font-medium">
                <li><strong>Sicurezza:</strong> Il Datore di lavoro dichiara di essere in regola con le norme sulla sicurezza sul lavoro (D.Lgs 81/08) e di possedere le coperture assicurative necessarie.</li>
                <li><strong>Assunzioni:</strong> Le parti si obbligano a regolarizzare il rapporto di lavoro secondo le normative vigenti (Voucher, prestazioni occasionali, contratti a chiamata, etc.). extraJob declina ogni responsabilità per lavoro irregolare o "in nero".</li>
                <li><strong>Verifica Identità:</strong> extraJob non effettua controlli sui precedenti penali o sulla veridicità dei documenti degli utenti. L'interazione avviene a rischio dell'utente.</li>
              </ul>
            </section>

            <hr className="border-slate-100" />

            {/* 4. PRIVACY E DATI (GDPR) */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-slate-900">
                <IconLock size={22} className="text-blue-500" />
                <h3 className="text-xl font-black">4. Trattamento Dati (GDPR)</h3>
              </div>
              <p className="text-sm text-slate-600">
                I dati sono raccolti solo per permettere l'incontro tra domanda e offerta. Il Titolare del trattamento è l'amministratore di extraJob. I dati risiedono su infrastrutture sicure (Supabase/AWS) conformi agli standard UE.
              </p>
              <div className="grid grid-cols-2 gap-3 text-[11px] font-bold uppercase tracking-tight">
                <div className="bg-slate-50 p-3 !rounded-xl text-center">Accesso ai Dati</div>
                <div className="bg-slate-50 p-3 !rounded-xl text-center">Diritto all'Oblio</div>
              </div>
            </section>

            {/* FOOTER */}
            <div className="pt-8 text-center space-y-4">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
                Versione 1.2 — Protezione Legale Attiva
              </p>
            </div>
          </div>
        </motion.div>

        {/* BOTTONE CHIUSURA */}
        <button
          onClick={() => router.back()}
          className="mt-6 w-full py-5 mt-4 !rounded-[24px] font-black bg-slate-900 text-white shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          Accetto e confermo <IconShieldCheck size={20} />
        </button>
      </div>
    </div>
  );
}