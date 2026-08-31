"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";
import JobDetailsSheet from "@/components/JobDetailsSheet";
import {
  IconChevronLeft,
  IconBriefcase,
  IconMapPin,
  IconCalendarEvent,
  IconLoader2,
  IconInbox
} from "@tabler/icons-react";

type Job = {
  id: string;
  role: string;
  location: string;
  pay: string;
  startDate: Date | string;
  endDate: Date | string;
  notes?: string;
  businessName?: string;
};

type ApplicationRow = {
  id: string;
  job_id: string;
  created_at: string;
  job: {
    id: string;
    role: string;
    location: string;
    pay: string;
    start_date: string;
    end_date: string;
    business_name?: string | null;
    businessName?: string;
    business_address?: string | null;
  } | null;
};

function toJob(app: ApplicationRow): Job | null {
  if (!app.job) return null;

  return {
    id: app.job.id,
    role: app.job.role,
    location: app.job.business_address || app.job.location,
    pay: app.job.pay,
    startDate: new Date(app.job.start_date),
    endDate: new Date(app.job.end_date),
    businessName: app.job.business_name || undefined,
  };
}

export default function ApplicationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [apps, setApps] = useState<ApplicationRow[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Stato per tracciare le rotazioni 3D associate all'ID di ciascuna card
  const [tiltStyles, setTiltStyles] = useState<{ [key: string]: { rotateX: number; rotateY: number } }>({});

  const aliveRef = useRef(true);
  const loadingRef = useRef(false);

  async function load() {
    if (loadingRef.current) return;
    loadingRef.current = true;
    if (aliveRef.current) setLoading(true);

    try {
      const { data: { user }, error: uErr } = await supabase.auth.getUser();
      if (uErr) throw uErr;
      if (!user) {
        if (aliveRef.current) { setApps([]); setLoading(false); }
        router.replace("/");
        return;
      }

      const { data, error } = await supabase
        .from("applications")
        .select(`
          id,
          job_id,
          created_at,
          job:jobs!applications_job_id_fkey (
            id,
            role,
            location,
            pay,
            start_date,
            end_date,
            business_name,
            business_address
          )
        `)
        .eq("worker_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!aliveRef.current) return;

      const safe = (data ?? []) as unknown as ApplicationRow[];
      setApps(safe);
      setLoading(false);

    } catch (e) {
      console.error(e);
      if (aliveRef.current) setLoading(false);
    } finally {
      loadingRef.current = false;
    }
  }

  useEffect(() => {
    aliveRef.current = true;
    load();
    const handler = () => load();
    window.addEventListener("applications-updated", handler);
    return () => {
      aliveRef.current = false;
      window.removeEventListener("applications-updated", handler);
    };
  }, []);

  const jobsData = useMemo(() => {
    return apps
      .map((app) => ({
        job: toJob(app),
        appliedAt: new Date(app.created_at),
      }))
      .filter((item): item is { job: Job; appliedAt: Date } => item.job !== null);
  }, [apps]);

  // GESTIONE TRACCIAMENTO MOUSE PER EFFETTO 3D TILT
  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = x / rect.width - 0.5;
    const centerY = y / rect.height - 0.5;

    const maxTilt = 15; // Intensità dell'inclinazione (gradi)

    setTiltStyles((prev) => ({
      ...prev,
      [id]: {
        rotateX: -centerY * maxTilt,
        rotateY: centerX * maxTilt,
      }
    }));
  };

  const handleMouseLeave = (id: string) => {
    setTiltStyles((prev) => ({
      ...prev,
      [id]: { rotateX: 0, rotateY: 0 }
    }));
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24" style={{ perspective: "1000px" }}>
      {/* HEADER DINAMICO */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10 px-4 py-4">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 !rounded-full hover:bg-slate-50 text-slate-400 transition"
          >
            <IconChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-black text-slate-800 tracking-tight">Le mie Candidature</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-xl mx-auto p-4 mt-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center pt-20 text-slate-400">
            <IconLoader2 className="animate-spin mb-4" size={32} />
            <p className="text-sm font-medium">Caricamento...</p>
          </div>
        ) : jobsData.length === 0 ? (
          <div className="bg-white !rounded-[32px] p-10 border border-dashed border-slate-200 text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 !rounded-3xl bg-slate-50 flex items-center justify-center text-slate-300">
              <IconInbox size={32} />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-lg">Ancora nulla qui</p>
              <p className="text-sm text-slate-500">Inizia a candidarti per visualizzare i tuoi progressi.</p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="mt-2 bg-emerald-500 text-white px-6 py-2.5 !rounded-full font-bold text-sm shadow-lg shadow-emerald-100 mb-4"
            >
              Trova lavoro
            </button>
          </div>
        ) : (
          <div className="space-y-4">
{jobsData.map(({ job, appliedAt }) => {
  const currentTilt = tiltStyles[job.id] || { rotateX: 0, rotateY: 0 };
  const isTilting = currentTilt.rotateX !== 0 || currentTilt.rotateY !== 0;

  return (
    <button
      key={job.id}
      onClick={() => setSelectedJob(job)}
      onMouseMove={(e) => handleMouseMove(e, job.id)}
      onMouseLeave={() => handleMouseLeave(job.id)}
      style={{
        position: "relative",
        display: "block",
        width: "100%",
        textAlign: "left",
        backgroundColor: "#ffffff",
        borderRadius: "24px",
        padding: "20px",
        border: "1px solid #f1f5f9",
        marginBottom: "16px",
        
        // ATTIVAZIONE REALE DEL 3D HACK PER I BROWSER
        transform: `perspective(1000px) rotateX(${currentTilt.rotateX}deg) rotateY(${currentTilt.rotateY}deg) scale3d(${isTilting ? 1.04 : 1}, ${isTilting ? 1.04 : 1}, 1)`,
        transformStyle: "preserve-3d",
        WebkitTransformStyle: "preserve-3d",
        
        // OMBRA DINAMICA: aumenta quando il mouse è sopra per dare l'effetto "sollevamento"
        boxShadow: isTilting 
          ? "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" 
          : "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        
        // TRANSIZIONE
        transition: isTilting 
          ? "transform 0.08s ease-out, box-shadow 0.15s ease" 
          : "transform 0.5s ease, box-shadow 0.5s ease",
      }}
      className="active:scale-[0.97] hover:border-emerald-200"
    >
      {/* Elementi interni con Parallasse Forzato */}
      <div className="flex justify-between items-start mb-3" style={{ transform: "translateZ(30px)", transformStyle: "preserve-3d" }}>
        <div className="flex flex-col gap-1">
          {job.businessName && (
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
              {job.businessName}
            </span>
          )}
          <div className="w-12 h-12 !rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <IconBriefcase size={22} stroke={2.5} />
          </div>
        </div>
        <div className="px-3 py-1.5 !rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-600">
          Inviata
        </div>
      </div>

      <div className="space-y-1" style={{ transform: "translateZ(20px)" }}>
        <h2 className="text-lg font-black text-slate-900 leading-tight">{job.role}</h2>
        <div className="flex items-center gap-1.5 text-slate-500">
          <IconMapPin size={14} />
          <span className="text-xs font-medium">{job.location}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between" style={{ transform: "translateZ(15px)" }}>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-slate-400">
            <IconCalendarEvent size={14} />
            <span className="text-[11px] font-semibold">
              {appliedAt.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}
            </span>
          </div>
          <div className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 !rounded-md w-fit">
            {new Date(job.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(job.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        <div className="text-sm font-black text-emerald-600">
          {job.pay} €
        </div>
      </div>
    </button>
  );
})}
          </div>
        )}
      </div>

      <JobDetailsSheet
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
        applied
      />
    </div>
  );
}