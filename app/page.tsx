"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { IconBriefcase, IconBuildingStore, IconChevronRight, IconClock } from "@tabler/icons-react";
import WorkerPanel from "@/components/WorkerPanel";
import Login from "../components/Login";
import JobCard from "../components/JobCard";
import ProfilePage from "../components/ProfilePage";
import ApplicationsPage from "../components/ApplicationsPage";
import JobDetailsSheet from "@/components/JobDetailsSheet";

import { STORAGE_KEYS } from "@/app/lib/storageKeys";
import { MiniCalendar, DatePickerInput } from "@mantine/dates";
import { ActionIcon, NativeSelect, TextInput } from "@mantine/core";
import { useRouter } from "next/navigation";
import { supabase } from "./lib/supabaseClient";
import BottomBar from "@/components/BottomBar";
import { applyToJob, getMyAppliedJobIds, withdrawApplication } from "@/app/lib/applications";
// import EmployerPanel from "@/components/EmployerPanel";

// -------------------------
// TYPES
// -------------------------
type UserRole = "worker" | "employer" | null;
type Tab = "home" | "applications" | "profile";

export type Job = {
  id: string;
  role: string;
  location: string;
  startDate: Date;
  endDate: Date;
  pay: string;
  businessName?: string;  
  business_name?: string;
};

// -------------------------
// CONSTANTS
// -------------------------
const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = ["00", "10", "20", "30", "40", "50"];

// -------------------------
// HELPERS
// -------------------------
function generateId() {
  try {
    // @ts-ignore
    if (typeof crypto !== "undefined" && crypto?.randomUUID) return crypto.randomUUID();
  } catch { }
  return "id-" + Date.now() + "-" + Math.floor(Math.random() * 1e6);
}

function todayYMD() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`; // YYYY-MM-DD
}

function combineYMDTime(dayYMD: string, hhmm: string) {
  const [y, m, d] = dayYMD.split("-").map(Number);
  const [hh, mm] = hhmm.split(":").map(Number);

  const out = new Date();
  out.setFullYear(y, (m || 1) - 1, d || 1);
  out.setHours(hh || 0, mm || 0, 0, 0);
  return out;
}

function reviveJobs(raw: string | null): Job[] {
  const parsed = raw ? (JSON.parse(raw) as any[]) : [];
  return parsed.map((j) => ({
    ...j,
    startDate: new Date(j.startDate),
    endDate: new Date(j.endDate),
  }));
}


// ✅ fuori dal component: no hook-order issues
const computeNumberOfDays = (width: number) => {
  const MIN = 6;
  const MAX = 20;
  const DAY_MIN_PX = 96;
  const usable = Math.max(320, width) - 320;
  const calculated = Math.floor(usable / DAY_MIN_PX);
  return Math.max(MIN, Math.min(MAX, calculated || 7));
};
// 1. COMPONENTE DI SUPPORTO (Mettilo qui, fuori dagli altri)
function TimeStepper({ 
  label, 
  value, 
  onChange 
}: { 
  label: string; 
  value: string; 
  onChange: (newTime: string) => void 
}) {
  const [hh, mm] = value.split(":").map(Number);

  const adjust = (type: 'h' | 'm', delta: number) => {
    if (type === 'h') {
      let newH = (hh + delta + 24) % 24;
      onChange(`${String(newH).padStart(2, "0")}:${String(mm).padStart(2, "0")}`);
    } else {
      let newM = (mm + delta + 60) % 60;
      onChange(`${String(hh).padStart(2, "0")}:${String(newM).padStart(2, "0")}`);
    }
  };

  return (
    <div className="flex flex-col gap-2 p-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
      <span className="text-xs font-bold text-slate-400 ml-2 uppercase tracking-tight">{label}</span>
      <div className="flex items-center justify-around gap-2">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => adjust('h', -1)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold active:bg-slate-200">-</button>
          <span className="text-lg font-black w-8 text-center">{String(hh).padStart(2, "0")}</span>
          <button type="button" onClick={() => adjust('h', 1)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold active:bg-slate-200">+</button>
        </div>
        <span className="font-bold text-slate-300 text-xl">:</span>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => adjust('m', -10)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold active:bg-slate-200">-</button>
          <span className="text-lg font-black w-8 text-center">{String(mm).padStart(2, "0")}</span>
          <button type="button" onClick={() => adjust('m', 10)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold active:bg-slate-200">+</button>
        </div>
      </div>
    </div>
  );
}

// 2. IL TUO PANNELLO EMPLOYER



// -------------------------
// EMPLOYER PANEL
// -------------------------
// function EmployerPanel({
//   jobs,
//   onAddJob,
// }: {
//   jobs: Job[];
//   onAddJob: (job: Omit<Job, "id">) => void;
// }) {
//   const [role, setRole] = useState("");
//   const [location, setLocation] = useState("");
//   const [pay, setPay] = useState("");
//   const [businessName, setBusinessName] = useState('');

//   const [startDate, setStartDate] = useState<Date | null>(new Date());
//   const [startTime, setStartTime] = useState<string>("09:00");

//   const [endDate, setEndDate] = useState<Date | null>(new Date());
//   const [endTime, setEndTime] = useState<string>("11:00");

//   const handleFinalSubmit = (event: React.FormEvent) => {
//     event.preventDefault();
//     if (!role || !location || !pay || !businessName || !startDate || !endDate) {
//       alert("Compila tutti i campi.");
//       return;
//     }

//     const sYMD = startDate.toISOString().split('T')[0];
//     const eYMD = endDate.toISOString().split('T')[0];
//     const s = combineYMDTime(sYMD, startTime);
//     const e = combineYMDTime(eYMD, endTime);

//     if (e <= s) {
//       alert("La fine deve essere dopo l’inizio.");
//       return;
//     }

//     onAddJob({ role, location, startDate: s, endDate: e, pay, businessName });
//   };

//   return (
//     <div className="p-5 space-y-8 text-left pb-32">
//       <h2 className="text-2xl font-black text-slate-800">Crea Annuncio</h2>

//       <form onSubmit={handleFinalSubmit} className="space-y-6">
        
//         {/* SEZIONE INIZIO */}
//         <div className="space-y-4">
//           <DatePickerInput
//             label="Giorno di inizio"
//             placeholder="Quando inizia?"
//             value={startDate}
//             onChange={setStartDate}
//             radius="xl"
//             size="md"
//             dropdownType="modal" // Il calendario in modal è l'unica cosa che Safari digerisce bene
//           />
//           <TimeStepper label="Ora di Inizio" value={startTime} onChange={setStartTime} />
//         </div>

//         <hr className="border-slate-100" />

//         {/* SEZIONE FINE */}
//         <div className="space-y-4">
//           <DatePickerInput
//             label="Giorno di fine"
//             placeholder="Quando finisce?"
//             value={endDate}
//             onChange={setEndDate}
//             radius="xl"
//             size="md"
//             dropdownType="modal"
//           />
//           <TimeStepper label="Ora di Fine" value={endTime} onChange={setEndTime} />
//         </div>

//         {/* DETTAGLI */}
//         <div className="space-y-4 pt-4">
//           <TextInput label="Attività" placeholder="Nome locale" radius="xl" size="md" value={businessName} onChange={(e) => setBusinessName(e.currentTarget.value)} />
//           <TextInput label="Ruolo" placeholder="Cosa cerchi?" radius="xl" size="md" value={role} onChange={(e) => setRole(e.currentTarget.value)} />
//           <TextInput label="Città / Via" placeholder="Dove?" radius="xl" size="md" value={location} onChange={(e) => setLocation(e.currentTarget.value)} />
//           <TextInput label="Paga Totale" placeholder="Es: 100€" radius="xl" size="md" value={pay} onChange={(e) => setPay(e.currentTarget.value)} />
//         </div>

//         <button 
//           type="submit"
//           className="w-full bg-blue-600 text-white py-4 rounded-[2rem] font-black shadow-xl shadow-blue-100 active:scale-95 transition-all"
//         >
//           PROCEDI AL PAGAMENTO
//         </button>
//       </form>
//     </div>
//   );
// }

// -------------------------
// HOME
// -------------------------
export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // AUTH + ROLE
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [authUserId, setAuthUserId] = useState<string | null>(null);

  // DATA
  const [jobs, setJobs] = useState<Job[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [sessionChecked, setSessionChecked] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  // Spotlight search
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  // Calendar (lasciato come nel tuo codice)
  const [selDay, setSelDay] = useState<Date | null>(new Date());
  const [numberOfDays, setNumberOfDays] = useState<number>(() => {
    if (typeof window === "undefined") return 7;
    return computeNumberOfDays(window.innerWidth);
  });

  type EntryChoice = "worker" | "employer" | null;

  const [entryChoice, setEntryChoice] = useState<EntryChoice>(null);

  const syncAppliedJobs = async () => {
    try {
      const ids = await getMyAppliedJobIds();
      setAppliedJobs(ids);
    } catch (e) {
      console.error("syncAppliedJobs error:", e);
      setAppliedJobs([]);
    }
  };
  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!mounted) return;
      if (!user) return;

      await syncAppliedJobs();
    })();

    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onJobs = () => loadJobsFromDb();
    const onApps = async () => {
      try {
        const ids = await getMyAppliedJobIds();
        setAppliedJobs(ids);
      } catch {
        setAppliedJobs([]);
      }
    };

    window.addEventListener("jobs-updated", onJobs);
    window.addEventListener("applications-updated", onApps);

    return () => {
      window.removeEventListener("jobs-updated", onJobs);
      window.removeEventListener("applications-updated", onApps);
    };
  }, []);

  useEffect(() => {
    const handler = () => syncAppliedJobs();
    window.addEventListener("applications-updated", handler);
    return () => window.removeEventListener("applications-updated", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!mounted) return;

      if (user) {
        // se sei worker, sincronizza candidature
        await syncAppliedJobs();
      } else {
        setAppliedJobs([]);
      }
    })();

    return () => { mounted = false; };
  }, []);

  //bottom bar
  useEffect(() => {
    let mounted = true;

    async function sync() {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      const session = data.session;
      setHasSession(!!session);
      setSessionChecked(true);

      if (!session) {
        // ✅ sei loggato? no -> reset UI
        setIsLoggedIn(false);
        setUserRole(null);
        setActiveTab("home");
        setAppliedJobs([]);
        setSelectedJob(null);
      }
    }

    sync();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      setHasSession(!!session);
      setSessionChecked(true);

      if (!session) {
        // ✅ logout -> reset UI e niente bottom bar
        setIsLoggedIn(false);
        setUserRole(null);
        setActiveTab("home");
        setAppliedJobs([]);
        setSelectedJob(null);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // -------------------------
  // LOADERS (DB)
  // -------------------------
async function loadJobsFromDb() {
  const { data, error } = await supabase
    .from("jobs")
    .select("id, role, location, pay, start_date, end_date, business_name") // business_name deve esistere in DB
    .order("created_at", { ascending: false });

  if (error) return;

  const mapped: Job[] = (data ?? []).map((j: any) => ({
    id: j.id,
    role: j.role,
    location: j.location,
    pay: j.pay,
    startDate: new Date(j.start_date), // Fondamentale per le ore
    endDate: new Date(j.end_date),     // Fondamentale per le ore
    business_name: j.business_name,
  }));

  setJobs(mapped);
}

  async function loadAppliedFromDb(userId: string) {
    const { data, error } = await supabase
      .from("applications")
      .select("job_id")
      .eq("worker_id", userId);

    if (error) {
      console.error("loadAppliedFromDb error:", error);
      return;
    }

    setAppliedJobs((data ?? []).map((r: any) => r.job_id));
  }

  async function loadRoleFromDb(userId: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("loadRoleFromDb error:", error);
      setUserRole(null);
      return;
    }

    setUserRole((data?.role as UserRole) ?? null);
  }

  // -------------------------
  // INIT AUTH (NO LOCALSTORAGE)
  // -------------------------
  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getSession();

      if (!mounted) return;

      setHasSession(!!data.session);
      setSessionChecked(true);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function init() {
      const { data } = await supabase.auth.getSession();
      const sessionUser = data.session?.user ?? null;

      if (!mounted) return;

      if (!sessionUser) {
        setIsLoggedIn(false);
        setAuthUserId(null);
        setUserRole(null);
        setAppliedJobs([]);
        setJobs([]);
        return;
      }

      setIsLoggedIn(true);
      setAuthUserId(sessionUser.id);

      await loadRoleFromDb(sessionUser.id);
      await loadJobsFromDb();
      await loadAppliedFromDb(sessionUser.id);
    }

    init();

    // ascolta login/logout
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null;

      // ✅ Se torno da Google, applico il ruolo scelto prima del redirect
      if (session?.user) {
        const pendingRole = localStorage.getItem("EXTRAJOB_PENDING_ROLE") as
          | "worker"
          | "employer"
          | null;

        if (pendingRole) {
          await supabase
            .from("profiles")
            .upsert({ id: session.user.id, role: pendingRole }, { onConflict: "id" });

          localStorage.removeItem("EXTRAJOB_PENDING_ROLE");
        }
      }

      if (!mounted) return;

      if (!u) {
        setIsLoggedIn(false);
        setAuthUserId(null);
        setUserRole(null);
        setAppliedJobs([]);
        setJobs([]);
        setSelectedJob(null);
        setActiveTab("home");
        return;
      }

      setIsLoggedIn(true);
      setAuthUserId(u.id);

      await loadRoleFromDb(u.id);
      await loadJobsFromDb();
      await loadAppliedFromDb(u.id);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // responsive calendar
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => setNumberOfDays(computeNumberOfDays(window.innerWidth));
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // close spotlight when tab changes
  useEffect(() => {
    setIsSearchOpen(false);
    setSearchQuery("");
  }, [activeTab]);

  // open spotlight if ?search=1
  useEffect(() => {
    const shouldOpen = searchParams.get("search") === "1";
    if (shouldOpen) setIsSearchOpen(true);
  }, [searchParams]);

  // redirect employer (DB role)
  // useEffect(() => {
  //   if (isLoggedIn && userRole === "employer") {
  //     router.replace("/employer");
  //   }
  // }, [isLoggedIn, userRole, router]);

  // -------------------------
  // ACTIONS (DB)
  // -------------------------
  function handleLogin(_role: "worker" | "employer") {
    // Non settiamo più localStorage.
    // Il vero “logged” arriva da onAuthStateChange sopra.
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/"); // niente /login (eviti 404)
  }

  const handleApply = async (jobId: string) => {
    const {
      data: { user },
      error: uErr,
    } = await supabase.auth.getUser();

    if (uErr) {
      console.error(uErr);
      return;
    }

    if (!user) {
      alert("Devi essere loggato");
      return;
    }

    // ✅ inserisce candidatura nel DB
    const { error } = await supabase
      .from("applications")
      .insert({
        worker_id: user.id,
        job_id: jobId,
        status: "applied",
      });

    // evita errore se già candidato
    // @ts-ignore
    if (error && error.code !== "23505") {
      console.error(error);
      alert("Errore candidatura");
      return;
    }

    // await supabase
    //   .from("applications")
    //   .insert({
    //     worker_id: user.id,
    //     job_id: jobId,
    //     status: "applied",
    //   });

    // ✅ manda email al datore
    await fetch("/api/send-application-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId }),
    });

    // aggiorna UI locale
    setAppliedJobs((prev) => [...prev, jobId]);

    // notifica ApplicationsPage
    window.dispatchEvent(new Event("applications-updated"));
  };

  const handleWithdraw = async (jobId: string) => {
    try {
      await withdrawApplication(jobId);
      await syncAppliedJobs(); // ✅ torna “Candidati”
      window.dispatchEvent(new Event("applications-updated"));
    } catch (e: any) {
      alert(e?.message ?? "Errore annullamento candidatura");
    }
  };

const addJob = async (job: Omit<Job, "id">) => {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  
  if (!user) {
    alert("Devi essere loggato per pubblicare un lavoro");
    return;
  }

  try {
    // 1. Chiamata all'API per creare la sessione di pagamento
    const response = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        jobData: {
          role: job.role,
          location: job.location,
          pay: job.pay,
          startDate: job.startDate.toISOString(),
          endDate: job.endDate.toISOString(),
          businessName: job.businessName, // Passiamo il nome attività come 'businessName'
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Errore durante la creazione della sessione");
    }

    // 2. Se l'API restituisce un URL, reindirizziamo l'utente su Stripe
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("Non è stato possibile generare il link di pagamento.");
    }

  } catch (err: any) {
    console.error("ERRORE PUBBLICAZIONE:", err);
    alert(`Errore: ${err.message}`);
  }
};


  function openSearch() {
    setIsSearchOpen(true);
    setSearchQuery("");
  }

  // -------------------------
  // RENDER HOME TAB (UI IDENTICA)
  // -------------------------
const renderHome = () => {
  // --- 1. UTENTE NON LOGGATO ---
  if (!isLoggedIn) {
    if (!entryChoice) {
      return (
        <div className="relative min-h-[90vh] flex flex-col items-center justify-center p-6 overflow-hidden">
          {/* Sfondi decorativi per dare profondità */}
          <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-emerald-200/30 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-blue-200/30 rounded-full blur-[100px]" />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md z-10"
          >
            <div className="text-center mb-12 space-y-3">
              <motion.h1 
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                className="text-5xl font-black text-slate-900 tracking-tighter"
              >
                extra<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-blue-600">Job</span>
              </motion.h1>
              <p className="text-slate-500 font-bold tracking-tight">Il lavoro extra, semplificato.</p>
            </div>

            <div className="grid gap-5">
              {/* BOTTONE WORKER */}
              <button
                onClick={() => setEntryChoice("worker")}
                className="group relative overflow-hidden w-full flex items-center gap-5 p-10 backdrop-blur-md !rounded-[32px] border-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-emerald-600 hover:border-emerald-500/30 transition-all duration-300 active:scale-95"
              >
                <div className="w-14 h-14 !rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-200 group-hover:rotate-6 transition-transform">
                  <IconBriefcase size={30} stroke={2.5} />
                </div>
                <div className="text-left">
                  <div className="font-black text-slate-800 text-xl tracking-tight">Cerco Lavoro</div>
                  <div className="text-sm font-bold text-slate-400">Trova turni extra oggi</div>
                </div>
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                   <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">→</div>
                </div>
              </button>

              {/* BOTTONE EMPLOYER */}
              <button
                onClick={() => setEntryChoice("employer")}
                className="group relative overflow-hidden w-full flex items-center gap-5 p-10 backdrop-blur-md !rounded-[32px] border-blue shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-blue-600 hover:border-blue-500/30 transition-all duration-300 active:scale-95"
              >
                <div className="w-14 h-14 !rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200 group-hover:rotate-6 transition-transform">
                  <IconBuildingStore size={30} stroke={2.5} />
                </div>
                <div className="text-left">
                  <div className="font-black text-slate-800 text-xl tracking-tight">Offro Lavoro</div>
                  <div className="text-sm font-bold text-slate-400">Pubblica e trova staff</div>
                </div>
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                   <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">→</div>
                </div>
              </button>
            </div>
          </motion.div>
        </div>
      );
    }

    // STEP 2: Login con Header "Back" pulito
    return (
      <div className="min-h-screen bg-slate-50/50 p-6 flex flex-col">
        <div className="w-full max-w-md mx-auto mb-8">
          <button
            onClick={() => setEntryChoice(null)}
            className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest"
          >
            <div className="w-8 h-8 rounded-full bg-white border flex items-center justify-center shadow-sm">←</div>
            Cambia ruolo
          </button>
        </div>
        <div className="flex-1">
          <Login
            onLogin={() => {}} 
            defaultRole={entryChoice}
            lockRole
          />
        </div>
      </div>
    );
  }

  // --- 2. LOADING STATE (Bello pulito) ---
  if (isLoggedIn && !userRole) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-100 rounded-full"></div>
          <div className="absolute top-0 w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <div className="text-center">
            <p className="font-black text-slate-900 text-xl tracking-tight">Stiamo arrivando...</p>
            <p className="text-sm font-bold text-slate-400">Caricamento del tuo profilo</p>
        </div>
      </div>
    );
  }

  // --- 3. WORKER ---
  if (userRole === "worker") {
    return (
      <WorkerPanel
        jobs={jobs}
        appliedJobs={appliedJobs}
        isLoggedIn={isLoggedIn}
        searchQuery={searchQuery}
        onApply={handleApply}
        onSelectJob={(job) => setSelectedJob(job)}
      />
    );
  }

  // --- 4. EMPLOYER ---
  if (userRole === "employer") {
    // return (
    //   // <div className="max-w-xl mx-auto px-4">
    //   //    <EmployerPanel 
    //   //       businesses={businesses} // Passa le props che servono al file che abbiamo unito prima
    //   //       selectedBusinessId={selectedBusinessId}
    //   //       setSelectedBusinessId={setSelectedBusinessId}
    //   //       useBusiness={useBusiness}
    //   //       setUseBusiness={setUseBusiness}
    //   //       jobs={jobs}
    //   //     />
    //   // </div>
    // );
  }

  return null;
};

  // -------------------------
  // MAIN RENDER (UI IDENTICA)
  // -------------------------
  return (
    <main className="min-h-screen bg-slate-100">
      {isLoggedIn && (
        <header className="bg-white py-2 px-5 shadow-md sticky top-0 z-10 flex items-center justify-between">
          <h1 className="text-3xl font-bold pointer">
            extra<span className="text-emerald-500">Job</span>
          </h1>
        </header>
      )}

      {activeTab === "home" && renderHome()}
      {isLoggedIn && activeTab === "applications" && <ApplicationsPage />}
      {isLoggedIn && activeTab === "profile" && <ProfilePage />}

      {searchParams.get("search") === "1" && (
        <div
          className="
      fixed inset-0 z-50
      !bg-grey-100/80
      backdrop-blur-sm
      flex items-start justify-center pt-28
    "
          onClick={() => router.push("/")}
        >
          <div className="w-[90%] max-w-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-center mb-2">
              <div className="w-10 h-1.5 !rounded-full bg-gray-300" />
            </div>

            <div
              className="bg-white !rounded-2xl shadow-2xl px-5 py-4"
              onTouchStart={(e) => setTouchStartY(e.touches[0].clientY)}
              onTouchMove={(e) => {
                if (touchStartY === null) return;
                const diff = e.touches[0].clientY - touchStartY;
                if (diff > 80) {
                  setIsSearchOpen(false);
                  setTouchStartY(null);
                }
              }}
              onTouchEnd={() => setTouchStartY(null)}
            >
              <input
                autoFocus
                type="text"
                placeholder="Cerca lavoro o città…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setIsSearchOpen(false);
                }}
                className="w-full text-lg outline-none"
              />
            </div>

            {searchQuery.trim() !== "" && (
              <div className="mt-3 bg-white !rounded-2xl shadow-xl overflow-hidden">
                {jobs.filter(
                  (job) =>
                    job.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    job.location.toLowerCase().includes(searchQuery.toLowerCase())
                ).length === 0 ? (
                  <p className="p-4 text-sm text-gray-500">Nessun risultato</p>
                ) : (
                  jobs
                    .filter(
                      (job) =>
                        job.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        job.location.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .slice(0, 5)
                    .map((job) => (
                      <button
                        key={job.id}
                        className="w-full text-left px-4 py-3 !hover:bg-gray-100 transition"
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchQuery("");
                          setSelectedJob(job);
                        }}
                      >
                        <div className="font-semibold">{job.role}</div>
                        <div className="text-sm text-gray-500">
                          {job.location} • {job.pay}
                        </div>
                      </button>
                    ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <JobDetailsSheet
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
        applied={selectedJob ? appliedJobs.includes(selectedJob.id) : false}
        onApply={(id) => handleApply(id)}
        onWithdraw={async (id) => {
          // ✅ subito UI
          setAppliedJobs((prev) => prev.filter((x) => x !== id));

          // ✅ riallinea dal DB
          await syncAppliedJobs();
        }}
      />
      {/* {sessionChecked && hasSession && userRole === "worker" && (
  <BottomBar
    activeTab={activeTab}
    onChange={(t) => setActiveTab(t)}
    onSearch={() => setIsSearchOpen(true)}
    onBackHome={() => setActiveTab("home")}
  />
)} */}
    </main>
  );
}
