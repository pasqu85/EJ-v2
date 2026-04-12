"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";
import AddJobStepper from "@/components/AddJobStepper";
import { Modal, ActionIcon, Text, Badge, Center, Loader } from "@mantine/core";
import { IconPlus, IconMapPin, IconCalendarEvent, IconChevronRight, IconClock } from "@tabler/icons-react";
import { motion } from "framer-motion";



// --- TIPI ---
interface Business {
  id: string;
  name: string;
  address: string;
  type?: string | null;
  is_default?: boolean;
}

type JobRow = {
  id: string;
  employer_id: string;
  role: string;
  location: string;
  pay: string;
  start_date: string;
  end_date: string;
  business_id: string | null;
  business_name: string | null;
  business_type: string | null;
  business_address: string | null;
  created_at: string;
};

type JobUI = {
  id: string;
  role: string;
  location: string;
  pay: string;
  startDate: Date;
  endDate: Date;
  businessName?: string;
};

function toJobUI(r: JobRow): JobUI {
  return {
    id: r.id,
    role: r.role,
    location: r.location,
    pay: r.pay,
    startDate: new Date(r.start_date),
    endDate: new Date(r.end_date),
    businessName: r.business_name ?? undefined,
  };
}

// --------------------
// EMPLOYER PANEL
// --------------------
function EmployerPanel({ businesses, jobs }: { businesses: Business[], jobs: JobUI[] }) {
  const [opened, setOpened] = useState(false);

  const handleCreateJob = async (jobData: any) => {
    const { data } = await supabase.auth.getSession();
    const userId = data.session?.user.id;
    if (!userId) return alert("Sessione scaduta");

    const res = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobData, userId }),
    });

    const json = await res.json();
    if (json.url) window.location.href = json.url;
    else alert("Errore pagamento");
  };

  
  useEffect(() => {
  const handleOpen = () => setOpened(true);
  window.addEventListener("open-job-stepper", handleOpen);
  return () => window.removeEventListener("open-job-stepper", handleOpen);
}, []);

  return (
    <div className="relative min-h-screen bg-slate-50/50 p-6 overflow-hidden">
      {/* Sfondi decorativi per coerenza con la Home */}
      <div className="absolute top-[-5%] right-[-5%] w-72 h-72 bg-blue-100/40 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-[10%] left-[-5%] w-64 h-64 bg-emerald-100/40 rounded-full blur-[100px] -z-10" />

      <div className="max-w-2xl mx-auto z-10">
        <header className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Dashboard</h2>
            <p className="text-slate-500 font-bold">Gestisci i tuoi annunci attivi</p>
          </div>
          <Badge size="lg" radius="md" variant="light" color="blue" className="h-8">
            {jobs.length} Annunci
          </Badge>
        </header>

        <div className="space-y-5">
          {jobs.length > 0 ? (
            jobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-white/80 backdrop-blur-sm p-6 !rounded-[32px] border-2 border-white shadow-xl shadow-slate-200/50 hover:border-blue-500/20 transition-all cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <Text className="text-2xl font-black text-slate-800 tracking-tight leading-none">
                      {job.role}
                    </Text>
                    <div className="flex items-center gap-1.5 text-slate-400 font-bold text-sm">
                      <IconMapPin size={16} stroke={2.5} className="text-blue-500" />
                      {job.businessName || job.location}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-blue-500 tracking-tighter">
                      {job.pay}
                    </div>
                    <Badge color="emerald" variant="dot" size="sm" className="font-bold">Attivo</Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl">
                      <IconCalendarEvent size={16} className="text-slate-500" />
                      <Text className="text-xs font-black text-slate-600 uppercase">
                        {job.startDate.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}
                      </Text>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl">
                      <IconClock size={16} className="text-slate-500" />
                      <Text className="text-xs font-black text-slate-600 uppercase">
                        {job.startDate.getHours()}:00 — {job.endDate.getHours()}:00
                      </Text>
                    </div>
                  </div>
                  <ActionIcon variant="light" radius="xl" color="blue" className="group-hover:translate-x-1 transition-transform">
                    <IconChevronRight size={20} />
                  </ActionIcon>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-20 bg-white/50 border-2 border-dashed border-slate-200 rounded-[40px]">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                 <IconPlus size={40} />
              </div>
              <Text className="text-slate-500 font-black text-xl">Nessun annuncio</Text>
              <Text className="text-slate-400 font-bold">Inizia cliccando il tasto +</Text>
            </div>
          )}
        </div>
      </div>

      <Modal 
        opened={opened} 
        onClose={() => setOpened(false)} 
        title={<Text className="font-black text-2xl tracking-tighter">Nuovo Annuncio</Text>}
        size="lg"
        radius="2.5rem"
        padding="xl"
        overlayProps={{ backgroundOpacity: 0.6, blur: 8 }}
      >
        <AddJobStepper 
          businesses={businesses} 
          onComplete={handleCreateJob} 
        />
      </Modal>
    </div>
  );
}

// --------------------
// PAGE (Main)
// --------------------
export default function EmployerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [employerId, setEmployerId] = useState<string | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [jobs, setJobs] = useState<JobUI[]>([]);

  useEffect(() => {
    async function initEmployer() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.replace("/");

      const { data: prof } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (prof?.role !== "employer") return router.replace("/");

      setEmployerId(user.id);

      const { data: bList } = await supabase.from("businesses").select("id, name, type, address, is_default").eq("owner_id", user.id);
      setBusinesses((bList ?? []) as Business[]);

      const { data: jList } = await supabase.from("jobs").select("*").eq("employer_id", user.id).order("created_at", { ascending: false });
      setJobs(((jList ?? []) as JobRow[]).map(toJobUI));
      setLoading(false);
    }
    initEmployer();
  }, [router]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
      <Text className="font-black text-slate-400 tracking-widest uppercase text-xs">Caricamento</Text>
    </div>
  );

  return <EmployerPanel businesses={businesses} jobs={jobs} />;
}