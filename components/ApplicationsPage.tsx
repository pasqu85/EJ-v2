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
};

type JobRow = {
  id: string;
  role: string;
  location: string;
  pay: string;
  start_date: string;
  end_date: string;
  business_name?: string | null;
  business_address?: string | null;
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
    notes: app.job.business_name ? `Attività: ${app.job.business_name}` : undefined,
  };
}

export default function ApplicationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [apps, setApps] = useState<ApplicationRow[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

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
        .select(
          `
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
  `
        )
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

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24">
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
          <div className="w-10" /> {/* Spacer */}
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
            {jobsData.map(({ job, appliedAt }) => (
              <button
                key={job!.id}
                onClick={() => setSelectedJob(job)}
                className="w-full text-left bg-white !rounded-[24px] p-5 border border-slate-100 shadow-sm active:scale-[0.98] transition-all hover:border-emerald-100"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="w-12 h-12 !rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <IconBriefcase size={22} stroke={2.5} />
                  </div>
<div className="px-3 py-1.5 !rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-600">
  Inviata
</div>
                </div>

                <div className="space-y-1">
                  <h2 className="text-lg font-black text-slate-900 leading-tight">{job!.role}</h2>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <IconMapPin size={14} />
                    <span className="text-xs font-medium">{job!.location}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <IconCalendarEvent size={14} />
                    <span className="text-[11px] font-semibold">
                      {appliedAt.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                  <div className="text-sm font-black text-emerald-600">
                    {job!.pay}
                  </div>
                </div>
              </button>
            ))}
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