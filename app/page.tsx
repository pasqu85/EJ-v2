"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { IconBriefcase, IconBuildingStore, IconChevronRight } from "@tabler/icons-react";

import Login from "../components/Login";
import JobCard from "../components/JobCard";
import ProfilePage from "../components/ProfilePage";
import ApplicationsPage from "../components/ApplicationsPage";
import JobDetailsSheet from "@/components/JobDetailsSheet";

import { STORAGE_KEYS } from "@/app/lib/storageKeys";
import { MiniCalendar, DatePickerInput } from "@mantine/dates";
import { NativeSelect } from "@mantine/core";
import { useRouter } from "next/navigation";
import { supabase } from "./lib/supabaseClient";
import BottomBar from "@/components/BottomBar";
import { applyToJob, getMyAppliedJobIds, withdrawApplication } from "@/app/lib/applications";

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

// -------------------------
// EMPLOYER PANEL
// -------------------------
function EmployerPanel({
  jobs,
  onAddJob,
}: {
  jobs: Job[];
  onAddJob: (job: Omit<Job, "id">) => void;
}) {
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [pay, setPay] = useState("");

  // UI state (string, mobile friendly)
  const [startDay, setStartDay] = useState<string | null>(todayYMD());
  const [startTime, setStartTime] = useState<string>("09:00");

  const [endDay, setEndDay] = useState<string | null>(todayYMD());
  const [endTime, setEndTime] = useState<string>("11:00");

  const handleSubmit = () => {
    if (!role || !location || !pay) {
      alert("Compila tutti i campi.");
      return;
    }
    if (!startDay || !endDay) {
      alert("Seleziona date valide.");
      return;
    }

    const s = combineYMDTime(startDay, startTime);
    const e = combineYMDTime(endDay, endTime);

    if (e <= s) {
      alert("La fine deve essere dopo l’inizio.");
      return;
    }

    onAddJob({ role, location, startDate: s, endDate: e, pay });

    // reset
    setRole("");
    setLocation("");
    setPay("");
    setStartDay(todayYMD());
    setEndDay(todayYMD());
    setStartTime("09:00");
    setEndTime("11:00");

    alert("Lavoro pubblicato ✅");
  };

  return (
    <div className="p-5 space-y-6 text-left">
      <h2 className="text-xl font-bold">Pubblica un lavoro</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-3">
          <DatePickerInput
            label="Data inizio"
            variant="filled"
            radius="xl"
            dropdownType="modal"
            value={startDay}
            onChange={setStartDay as any}
          />

          <div
            className="grid grid-cols-2 gap-3 no-context-menu"
            onContextMenuCapture={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >

            <NativeSelect
              label="Ora"
              size="md"
              radius="xl"
              value={startTime.split(":")[0]}
              onChange={(e) =>
                setStartTime(`${e.currentTarget.value}:${startTime.split(":")[1]}`)
              }
              data={HOURS.map((h) => ({ value: h, label: h }))}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            />

            <NativeSelect
              label="Min"
              size="md"
              radius="xl"
              value={startTime.split(":")[1]}
              onChange={(e) =>
                setStartTime(`${startTime.split(":")[0]}:${e.currentTarget.value}`)
              }
              data={MINUTES.map((m) => ({ value: m, label: m }))}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            />
          </div>
        </div>

        <div className="space-y-3">
          <DatePickerInput
            label="Data fine"
            variant="filled"
            radius="xl"
            dropdownType="modal"
            value={endDay}
            onChange={setEndDay as any}
          />

          <div className="grid grid-cols-2 gap-3">
            <NativeSelect
              label="Ora"
              value={endTime.split(":")[0]}
              onChange={(e) => setEndTime(`${e.currentTarget.value}:${endTime.split(":")[1]}`)}
              data={HOURS}
            />
            <NativeSelect
              label="Min"
              value={endTime.split(":")[1]}
              onChange={(e) => setEndTime(`${endTime.split(":")[0]}:${e.currentTarget.value}`)}
              data={MINUTES}
            />
          </div>
        </div>
      </div>

      <input
        placeholder="Ruolo (es. Cameriere)"
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="w-full p-3 !rounded-xl border outline-none"
      />

      <input
        placeholder="Luogo"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="w-full p-3 !rounded-xl border outline-none"
      />

      <input
        placeholder="Paga (es. 10€/h)"
        value={pay}
        onChange={(e) => setPay(e.target.value)}
        className="w-full p-3 !rounded-xl border outline-none"
      />

      <button
        onClick={handleSubmit}
        className="w-full bg-blue-500 text-white py-3 !rounded-xl font-semibold"
      >
        Pubblica
      </button>

      {jobs.length > 0 && (
        <div className="mt-6">
          <h3 className="font-bold mb-2">Lavori pubblicati</h3>
          <ul className="space-y-2">
            {jobs.map((job) => (
              <li key={job.id} className="bg-white p-3 !rounded-xl shadow">
                <div className="font-bold">{job.role}</div>
                <div className="text-sm text-gray-500">
                  {job.location} • {job.pay}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

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
      .select("id, role, location, pay, start_date, end_date")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("loadJobsFromDb error:", error);
      return;
    }

    const mapped: Job[] =
      (data ?? []).map((j: any) => ({
        id: j.id,
        role: j.role,
        location: j.location,
        pay: j.pay,
        startDate: new Date(j.start_date),
        endDate: new Date(j.end_date),
      })) ?? [];

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
  useEffect(() => {
    if (isLoggedIn && userRole === "employer") {
      router.replace("/employer");
    }
  }, [isLoggedIn, userRole, router]);

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

    await supabase
      .from("applications")
      .insert({
        worker_id: user.id,
        job_id: jobId,
        status: "applied",
      });

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
    // solo employer loggato
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;
    if (!user) return;

    const payload = {
      employer_id: user.id,
      role: job.role,
      location: job.location,
      pay: job.pay,
      start_date: job.startDate.toISOString(),
      end_date: job.endDate.toISOString(),
    };

    const { error } = await supabase.from("jobs").insert(payload);

    if (error) {
      console.error("addJob error:", error);
      alert("Errore pubblicazione lavoro");
      return;
    }

    await loadJobsFromDb();
  };

  function openSearch() {
    setIsSearchOpen(true);
    setSearchQuery("");
  }

  // -------------------------
  // RENDER HOME TAB (UI IDENTICA)
  // -------------------------
  const renderHome = () => {
    // ✅ NON LOGGATO: welcome -> scelta -> login
    if (!isLoggedIn) {
      // STEP 1: scelta
      if (!entryChoice) {
        return (
          <div className="min-h-[85vh] flex items-center justify-center p-6 bg-slate-50/50">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-md space-y-8"
            >
              {/* Testata della Welcome */}
              <div className="text-center space-y-2">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                  extra<span className="text-emerald-500">Job</span>
                </h1>
                <p className="text-slate-500 font-medium">
                  La tua prossima opportunità inizia qui. <br />
                  Scegli come vuoi procedere:
                </p>
              </div>

              <div className="space-y-4">
                {/* OPZIONE WORKER */}
                <button
                  onClick={() => setEntryChoice("worker")}
                  className="group relative w-full flex items-center gap-4 p-5 mb-4 !rounded-[28px] border-2 border-transparent hover:border-emerald-500 shadow-xl shadow-slate-200/50 transition-all active:scale-[0.98]"
                >
                  <div className="flex-shrink-0 w-14 h-14 !rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <IconBriefcase size={30} stroke={2} />
                  </div>

                  <div className="flex-grow text-left">
                    <div className="text-lg font-black text-slate-800 leading-tight">Cerco Lavoro</div>
                    <div className="text-xs text-slate-500 font-medium">Trova extra e turni subito</div>
                  </div>

                  <div className="text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all">
                    <IconChevronRight size={24} stroke={3} />
                  </div>
                </button>

                {/* OPZIONE EMPLOYER */}
                <button
                  onClick={() => setEntryChoice("employer")}
                  className="group relative w-full flex items-center gap-4 p-5 !rounded-[28px] border-2 border-transparent hover:border-blue-500 shadow-xl shadow-slate-200/50 transition-all active:scale-[0.98]"
                >
                  <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <IconBuildingStore size={30} stroke={2} />
                  </div>

                  <div className="flex-grow text-left">
                    <div className="text-lg font-black text-slate-800 leading-tight">Offro Lavoro</div>
                    <div className="text-xs text-slate-500 font-medium">Pubblica annunci e trova staff</div>
                  </div>

                  <div className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all">
                    <IconChevronRight size={24} stroke={3} />
                  </div>
                </button>
              </div>

              <div className="text-center pt-4">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Semplice • Veloce • Trasparente
                </p>
              </div>
            </motion.div>
          </div>
        );
      }

      // STEP 2: login con ruolo pre-selezionato
      const isEmployer = entryChoice === "employer";

      return (
        <div className="p-2">
          <div className="max-w-md mx-auto mb-3">
            <button
              onClick={() => setEntryChoice(null)}
              className="text-sm px-4 py-2 !rounded-full bg-white border shadow-sm"
            >
              ← Indietro
            </button>
          </div>

          <Login
            onLogin={handleLogin}
            defaultRole={isEmployer ? "employer" : "worker"}
            lockRole
          />
        </div>
      );
    }

    // ✅ LOGGATO ma role non ancora arrivato
    if (isLoggedIn && !userRole) {
      return (
        <div className="p-4 space-y-4">
          <h2 className="text-xl font-bold text-center">Caricamento profilo…</h2>
        </div>
      );
    }

    // worker
    if (isLoggedIn && userRole === "worker") {
      const q = searchQuery.trim().toLowerCase();
      const filtered = q
        ? jobs.filter(
          (job) =>
            job.role.toLowerCase().includes(q) ||
            job.location.toLowerCase().includes(q)
        )
        : jobs;

      return (
        <>
          <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh)] overscroll-contain">
            {filtered.length === 0 ? (
              <p className="text-center text-gray-500">Nessuna offerta disponibile</p>
            ) : (
              filtered.map((job) => (
                <div key={job.id} onClick={() => setSelectedJob(job)} className="cursor-pointer">
                  <JobCard
                    {...job}
                    isLoggedIn={isLoggedIn}
                    appliedJobs={appliedJobs}
                    onApply={handleApply}
                  />
                </div>
              ))
            )}
          </div>
        </>
      );
    }

    // employer (questa parte teoricamente non la vedi perché redirect /employer)
    if (isLoggedIn && userRole === "employer") {
      return (
        <div className="p-5">
          <EmployerPanel jobs={jobs} onAddJob={addJob} />
        </div>
      );
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
