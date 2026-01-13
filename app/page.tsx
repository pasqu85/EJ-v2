"use client";

import { useEffect, useState } from "react";
import JobCard from "../components/JobCard";
import Login from "../components/Login";
import { STORAGE_KEYS } from "./lib/storageKeys";
import { DateTimePicker } from "@mantine/dates";
import { MiniCalendar } from '@mantine/dates';

// Helpers: add hours and round minutes to nearest step (default: round up to next 10 minutes)
function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function roundMinutes(date: Date, step = 10, method: 'ceil' | 'floor' | 'nearest' = 'ceil'): Date {
  const d = new Date(date);
  const minutes = d.getMinutes();
  const remainder = minutes % step;
  if (remainder === 0) {
    d.setSeconds(0);
    d.setMilliseconds(0);
    return d;
  }
  if (method === 'ceil') {
    d.setMinutes(minutes + (step - remainder));
  } else if (method === 'floor') {
    d.setMinutes(minutes - remainder);
  } else {
    d.setMinutes(Math.round(minutes / step) * step);
  }
  d.setSeconds(0);
  d.setMilliseconds(0);
  return d;
}

function addHoursAndRound(date: Date, hours: number, step = 10) {
  return roundMinutes(addHours(date, hours), step, 'ceil');
}

/**
 * Returns current time plus optional hours offset, with minutes rounded to `step` minutes (default 10).
 * Usage: `hours(2)` -> now + 2 hours, minutes rounded up to nearest 10.
 */
function hours(offsetHours = 0, step = 10) {
  return addHoursAndRound(new Date(), offsetHours, step);
}

// Robust UUID generator with fallbacks for mobile environments
function generateId() {
  try {
    if (typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID === 'function') {
      return (crypto as any).randomUUID();
    }

    // Use getRandomValues if available for cryptographically strong randomness
    if (typeof crypto !== 'undefined' && typeof (crypto as any).getRandomValues === 'function') {
      const bytes = (crypto as any).getRandomValues(new Uint8Array(16));
      // Per RFC 4122 v4
      bytes[6] = (bytes[6] & 0x0f) | 0x40;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;
      const hex: string[] = [];
      for (let i = 0; i < bytes.length; i++) {
        hex.push(bytes[i].toString(16).padStart(2, '0'));
      }
      return (
        hex.slice(0, 4).join('') + '-' +
        hex.slice(4, 6).join('') + '-' +
        hex.slice(6, 8).join('') + '-' +
        hex.slice(8, 10).join('') + '-' +
        hex.slice(10, 16).join('')
      );
    }

    // Last resort: math-based pseudo-random UUID (not cryptographically secure)
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  } catch (e) {
    // Fallback safe string
    return 'id-' + Date.now() + '-' + Math.floor(Math.random() * 1e6);
  }
} 

type UserRole = "worker" | "employer" | null;

export type Job = {
  id: string;
  role: string;
  location: string;
  startDate: Date;
  endDate: Date;
  pay: string;
};

function EmployerPanel({
  jobs,
  addJob,
}: {
  jobs: Job[];
  addJob: (job: Omit<Job, "id">) => void;
}) {
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(hours(0));
  const [endDate, setEndDate] = useState<Date | null>(hours(2));
  const [pay, setPay] = useState("");

  // --- QUI COMINCIA IL PEZZO CHE ABBIAMO MODIFICATO ---
  const handleSubmit = () => {
    // Trasformiamo i valori in oggetti Date sicuri per evitare l'errore .toLocaleTimeString
    const sDate = startDate instanceof Date ? startDate : startDate ? new Date(startDate) : null;
    const eDate = endDate instanceof Date ? endDate : endDate ? new Date(endDate) : null;

    if (!role || !location || !sDate || !eDate || !pay) {
      alert("Compila tutti i campi correttamente.");
      return;
    }

    if (eDate <= sDate) {
      alert("L'orario di fine deve essere dopo quello di inizio!");
      return;
    }

    const orarioInizio = sDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const orarioFine = eDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dataFormattata = sDate.toLocaleDateString();

    addJob({
      role,
      location,
      startDate: sDate, 
      endDate: eDate,
      pay: pay
    });

    // Reset del form
    setRole("");
    setLocation("");
    setStartDate(hours(0));
    setEndDate(hours(2));
    setPay("");
    
    alert("Lavoro pubblicato!");
  };
  // --- QUI FINISCE IL PEZZO MODIFICATO ---

  return (
    <div className="p-5 space-y-6 text-left">
      <h2 className="text-xl font-bold">Pubblica un lavoro</h2>

      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
          <DateTimePicker 
            label="Inizio"
            variant="filled" 
            radius="xl" 
            size="md"
            placeholder="Data e ora inizio"
            dropdownType="modal" // <--- Questa è la chiave per il mobile!
            value={startDate}
            timePickerProps={{
              minutesStep: 10,
              withDropdown: true,
              popoverProps: { withinPortal: false },
              format: '24h',
            }}
            onChange={(e) => setStartDate(new Date(e?.toString() || ""))}
          />

          <DateTimePicker 
            label="Fine"
            variant="filled" 
            radius="xl" 
            size="md"
            placeholder="Data e ora fine"
            value={endDate}
            presets={[
              { label: '10:00', value: new Date().toString() },
              { label: 'Lunch', value: new Date(new Date().setHours(13, 0, 0, 0)).toString() },
            ]}
            dropdownType="modal" // <--- Questa è la chiave per il mobile!
            timePickerProps={{
              minutesStep: 10,
              withDropdown: true,
              popoverProps: { withinPortal: false },
              format: '24h',
            }}
            onChange={(e) => setEndDate(new Date(e?.toString() || ""))}
            minDate={startDate || undefined}
          />

        </div>
        
        <input
          placeholder="Ruolo (es. Cameriere)"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full p-3 rounded-xl border outline-none"
        />

        <input
          placeholder="Luogo"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full p-3 rounded-xl border outline-none"
        />

        <input
          placeholder="Paga (es. 10€/h)"
          value={pay}
          onChange={(e) => setPay(e.target.value)}
          className="w-full p-3 rounded-xl border outline-none"
        />

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-500 text-white py-3 mt-5 rounded-xl font-semibold"
        >
          Pubblica
        </button>
      </div>

      {jobs.length > 0 && (
        <div className="mt-8">
          <h3 className="font-bold mb-2 text-left">Lavori pubblicati</h3>
          <ul className="space-y-2">
            {jobs.map((job) => (
              <li key={job.id} className="bg-white p-3 rounded-xl shadow text-left">
                <div className="font-bold">{job.role}</div>
                <div className="text-sm text-gray-500">{job.location} • {job.pay}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  // 🔹 Caricamento iniziale da localStorage
  useEffect(() => {
    const storedJobs = localStorage.getItem(STORAGE_KEYS.JOBS);
    const storedApplied = localStorage.getItem(STORAGE_KEYS.APPLIED_JOBS);
    const storedLogin = localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN);
    const storedRole = localStorage.getItem(STORAGE_KEYS.USER_ROLE);

    if (storedJobs) setJobs(JSON.parse(storedJobs));
    if (storedApplied) setAppliedJobs(JSON.parse(storedApplied));
    if (storedLogin) setIsLoggedIn(storedLogin === "true");
    if (storedRole) setUserRole(storedRole as UserRole);
  }, []);

  // 🔹 Login / Logout
  const handleLogin = (role: UserRole) => {
    setIsLoggedIn(true);
    setUserRole(role);

    localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, "true");
    localStorage.setItem(STORAGE_KEYS.USER_ROLE, role!);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setAppliedJobs(localStorage.getItem(STORAGE_KEYS.APPLIED_JOBS) ? JSON.parse(localStorage.getItem(STORAGE_KEYS.APPLIED_JOBS)!) : []);

    localStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN);
    localStorage.removeItem(STORAGE_KEYS.USER_ROLE);
    //localStorage.removeItem(STORAGE_KEYS.APPLIED_JOBS);
  };

  // 🔹 Selezione ruolo
  const selectRole = (role: UserRole) => {
    setUserRole(role);
    localStorage.setItem(STORAGE_KEYS.USER_ROLE, role!);
  };

  // 🔹 Candidatura
  const handleApply = (id: string) => {
    if (appliedJobs.includes(id)) return;

    const updated = [...appliedJobs, id];
    setAppliedJobs(updated);
    localStorage.setItem(STORAGE_KEYS.APPLIED_JOBS, JSON.stringify(updated));
  };

  // 🔹 Aggiunta offerta
  const addJob = (job: Omit<Job, "id">) => {
    const newJob: Job = { id: generateId(), ...job };
    const updatedJobs = [newJob, ...jobs];
    setJobs(updatedJobs);
    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(updatedJobs));
  };

  const [selDay, setSelDay] = useState<Date | null>(new Date());
  const [value, onChange] = useState<Date | null>(new Date());

  // Responsive number of days shown in MiniCalendar based on window width
  const computeNumberOfDays = (width: number) => {
    const MIN = 6; // minimo giorni da mostrare
    const MAX = 20; // massimo giorni da mostrare
    const DAY_MIN_PX = 96; // larghezza stimata per ogni giorno (regola se necessario)

    // riservo uno spazio per margini/controlli (es. 320px), poi calcolo quanti giorni ci stanno
    const usable = Math.max(320, width) - 320;
    const calculated = Math.floor(usable / DAY_MIN_PX);
    const result = Math.max(MIN, Math.min(MAX, calculated || 7));
    return result;
  };

  const [numberOfDays, setNumberOfDays] = useState<number>(() => {
    if (typeof window === "undefined") return 7;
    return computeNumberOfDays(window.innerWidth);
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => setNumberOfDays(computeNumberOfDays(window.innerWidth));
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <main className="min-h-screen">
      {/* HEADER */}
      {isLoggedIn && (
        <header className="bg-white py-2 px-5 shadow-md sticky top-0 z-10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
            <div>
              <h1 className="text-3xl font-bold pointer">
                extra<span className="text-emerald-500">Job</span>
              </h1>
              <p className="text-gray-600 text-sm">
                Trova o offri lavoro extra, quando serve.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Input ricerca solo per lavoratori loggati */}
              {/* SEARCH */}
              {isLoggedIn && userRole === "worker" && (
                <div className="relative">
                  {/* Icona lente */}
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className="p-2 rounded-full hover:bg-gray-100 transition"
                  >
                    <span className="material-symbols-outlined text-xl">search</span>
                  </button>

                  {/* Overlay stile Spotlight */}
                  {isSearchOpen && (
                    <div
                      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-start justify-center pt-32"
                      onClick={() => setIsSearchOpen(false)}
                    >
                      <div
                        className="w-[90%] max-w-xl"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* INPUT */}
                        <div className="flex justify-center mb-2">
  <div className="w-10 h-1.5 rounded-full bg-gray-300" />
</div>

                        <div className="bg-white rounded-2xl shadow-2xl px-5 py-4 animate-spotlight"
                          onTouchStart={(e) => {
    setTouchStartY(e.touches[0].clientY);
  }}
  onTouchMove={(e) => {
    if (touchStartY === null) return;

    const diff = e.touches[0].clientY - touchStartY;

    // swipe down > 80px → chiudi spotlight
    if (diff > 80) {
      setIsSearchOpen(false);
      setTouchStartY(null);
    }
  }}
  onTouchEnd={() => setTouchStartY(null)}>
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

                        {/* RISULTATI */}
                        {searchQuery.trim() !== "" && (
                          <div className="mt-3 bg-white rounded-2xl shadow-xl overflow-hidden animate-spotlight">
                            {jobs.filter(
                              (job) =>
                                job.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                job.location.toLowerCase().includes(searchQuery.toLowerCase())
                            ).length === 0 ? (
                              <p className="p-4 text-sm text-gray-500">
                                Nessun risultato
                              </p>
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
                                    className="w-full text-left px-4 py-3 hover:bg-gray-100 transition"
                                    onClick={() => {
                                      setIsSearchOpen(false);
                                      setSearchQuery("");
                                      // qui potrai navigare o scrollare al job
                                    }}
                                  >
                                    <div className="font-semibold">
                                      {job.role}
                                    </div>
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

                </div>
              )}

              <div className="flex gap-2">
                {isLoggedIn && (
                  <button
                    onClick={isLoggedIn ? handleLogout : () => handleLogin("worker")}
                    className="bg-emerald-500 text-white px-4 py-2 rounded-xl font-semibold"
                  >
                    {isLoggedIn ? "Esci" : "Accedi"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>
      )}
      {/* 🔐 SE NON LOGGATO */}
      {!isLoggedIn && (
        <div className="p-5">
          <Login onLogin={handleLogin} />
        </div>
      )}

      {/* 👤 SCELTA RUOLO */}
      {isLoggedIn && !userRole && (
        <div className="p-5 space-y-4">
          <h2 className="text-xl font-bold text-center">Chi sei?</h2>

          <button
            onClick={() => selectRole("worker")}
            className="w-full bg-emerald-500 text-white py-3 rounded-xl font-semibold"
          >
            👷‍♂️ Cerco lavoro extra
          </button>

          <button
            onClick={() => selectRole("employer")}
            className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold"
          >
            🏢 Cerco personale
          </button>
        </div>
      )}
      {isLoggedIn && userRole === "worker" && (
        <MiniCalendar
          value={selDay}
          onChange={(e) => {
            setSelDay(new Date(e?.toString() || ""));
            console.log('Giorno selezionato:', e);
          }}
          numberOfDays={numberOfDays}
          className="mx-auto my-4"
        />
      )}
      {/* 👷‍♂️ LAVORATORE */}
      {isLoggedIn && userRole === "worker" && (

        <div className="p-5 space-y-4 overflow-y-auto max-h-[calc(100vh-150px)] overscroll-contain">
          {jobs.filter(
            (job) =>
              job.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
              job.location.toLowerCase().includes(searchQuery.toLowerCase())
          ).length === 0 ? (
            <p className="text-center text-gray-500">
              Nessuna offerta disponibile
            </p>
          ) : (
            jobs
              .filter(
                (job) =>
                  job.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  job.location.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((job) => (
                <JobCard
                  key={job.id}
                  {...job}
                  isLoggedIn={isLoggedIn}
                  appliedJobs={appliedJobs}
                  onApply={handleApply}
                />
              ))
          )}
        </div>
      )}

      {/* 🏢 DATORE */}
      {isLoggedIn && userRole === "employer" && (
        <div className="p-5 text-center text-gray-600">
          <EmployerPanel jobs={jobs} addJob={addJob} />
        </div>
      )}
    </main>
  );
}
