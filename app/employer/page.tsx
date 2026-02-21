"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DatePickerInput } from "@mantine/dates";
import { IconClock, IconBuildingStore, IconMapPin } from "@tabler/icons-react";
import { supabase } from "@/app/lib/supabaseClient";

type Business = {
  id: string;
  name: string;
  type: string | null;
  address: string;
  is_default: boolean;
};

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
  businessType?: string;
  businessAddress?: string;
};

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function combineDayAndTime(day: Date, hhmm: string) {
  const [hh, mm] = hhmm.split(":").map(Number);
  const out = new Date(day);
  out.setHours(hh || 0, mm || 0, 0, 0);
  return out;
}

function openTimePicker(ref: React.RefObject<HTMLInputElement>) {
  const el = ref.current;
  if (!el) return;
  // @ts-ignore
  if (typeof el.showPicker === "function") el.showPicker();
  else el.click();
}

function formatHHMM(d: Date) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getStaticMapUrl(_address: string) {
  return `https://tile.openstreetmap.org/12/2148/1433.png`;
}

function toJobUI(r: JobRow): JobUI {
  return {
    id: r.id,
    role: r.role,
    location: r.location,
    pay: r.pay,
    startDate: new Date(r.start_date),
    endDate: new Date(r.end_date),
    businessName: r.business_name ?? undefined,
    businessType: r.business_type ?? undefined,
    businessAddress: r.business_address ?? undefined,
  };
}

// --------------------
// EMPLOYER PANEL
// --------------------
function EmployerPanel({
  businesses,
  selectedBusinessId,
  setSelectedBusinessId,
  useBusiness,
  setUseBusiness,
  jobs,
  onCreateJob,
}: {
  businesses: Business[];
  selectedBusinessId: string | null;
  setSelectedBusinessId: (id: string | null) => void;
  useBusiness: boolean;
  setUseBusiness: (v: boolean) => void;
  jobs: JobUI[];
  onCreateJob: (input: {
    role: string;
    location: string;
    pay: string;
    startDate: Date;
    endDate: Date;
    business?: Business | null;
  }) => Promise<void>;
}) {
  const router = useRouter();

  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [pay, setPay] = useState("");

  const [startDay, setStartDay] = useState<Date | null>(startOfToday());
  const [endDay, setEndDay] = useState<Date | null>(startOfToday());

  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");

  const startTimeRef = useRef<HTMLInputElement>(null);
  const endTimeRef = useRef<HTMLInputElement>(null);

  const selectedBusiness = useMemo(
    () => businesses.find((b) => b.id === selectedBusinessId) ?? null,
    [businesses, selectedBusinessId]
  );

  useEffect(() => {
    if (selectedBusiness && useBusiness) {
      setLocation(selectedBusiness.address);
    }
  }, [selectedBusinessId, useBusiness]);

  const handleSubmit = async () => {
    if (!role.trim() || !pay.trim()) {
      alert("Compila ruolo e paga");
      return;
    }

    const finalLocation =
      selectedBusiness && useBusiness ? selectedBusiness.address : location;

    if (!finalLocation.trim()) {
      alert("Inserisci il luogo");
      return;
    }

    if (!startDay || !endDay || !startTime || !endTime) {
      alert("Seleziona data e ora");
      return;
    }

    const startDate = combineDayAndTime(startDay, startTime);
    const endDate = combineDayAndTime(endDay, endTime);

    if (endDate <= startDate) {
      alert("La fine deve essere dopo l’inizio");
      return;
    }

    await onCreateJob({
      role: role.trim(),
      location: finalLocation.trim(),
      pay: pay.trim(),
      startDate,
      endDate,
      business: selectedBusiness && useBusiness ? selectedBusiness : null,
    });

    // reset
    setRole("");
    setPay("");
    if (!useBusiness) setLocation("");
    setStartDay(startOfToday());
    setEndDay(startOfToday());
    setStartTime("");
    setEndTime("");

    alert("Lavoro pubblicato ✅");
  };

  const mapUrl = selectedBusiness?.address
    ? getStaticMapUrl(selectedBusiness.address)
    : getStaticMapUrl("Italia");

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold tracking-tight leading-none">
        Pubblica un lavoro
      </h2>

      {/* BUSINESSES */}
      {businesses.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-700">La tua attività</div>

            <button
              type="button"
              onClick={() => {
                const next = !useBusiness;
                setUseBusiness(next);
                if (next && selectedBusiness) setLocation(selectedBusiness.address);
              }}
              className={`px-3 py-2 !rounded-full text-sm font-semibold border transition ${
                useBusiness
                  ? "bg-linear-to-r from-blue-500 to-cyan-500 text-white border-blue-400"
                  : "bg-white text-slate-700 border-slate-200"
              }`}
            >
              {useBusiness ? "Usata" : "Usa"}
            </button>
          </div>

          <div
            className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {businesses.map((b) => {
              const active = b.id === selectedBusinessId;

              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    setSelectedBusinessId(b.id);
                    if (useBusiness) setLocation(b.address);
                  }}
                  className={`relative overflow-hidden snap-center shrink-0 w-[88%] sm:w-[420px] text-left !rounded-3xl border transition-all duration-200 ${
                    active ? "border-blue-400" : "border-white/40"
                  }`}
                >
                  <div
                    className="absolute inset-0 z-0"
                    style={{
                      background:
                        "linear-gradient(135deg, #10b981 0%, #3b82f6 50%, #8b5cf6 100%)",
                      opacity: 0.15,
                    }}
                  />
                  <div className="absolute -top-10 -left-10 w-32 h-32 bg-emerald-400/30 rounded-full blur-3xl z-0" />
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-400/30 rounded-full blur-3xl z-0" />

                  <div className="relative p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-3">
                          <span className="h-12 w-12 !rounded-full bg-white/80 text-white flex items-center justify-center shadow-sm border border-white bg-linear-to-r from-blue-500 to-cyan-500">
                            <IconBuildingStore size={22} />
                          </span>

                          <div className="min-w-0">
                            <div className="text-lg font-bold text-slate-900 leading-tight tracking-tight truncate">
                              {b.name}
                            </div>
                            <div className="text-xs font-semibold text-emerald-800/80 uppercase tracking-wider truncate">
                              {b.type || "Attività"}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center gap-2 bg-white/30 w-fit px-3 py-1 !rounded-full border border-white/20">
                          <IconMapPin size={14} className="text-slate-800" />
                          <span className="text-sm font-medium text-slate-800 truncate">
                            {b.address}
                          </span>
                        </div>
                      </div>

                      {active && (
                        <span className="text-xs font-bold px-3 py-1 !rounded-full bg-linear-to-r from-blue-500 to-cyan-500 text-white">
                          Selezionata
                        </span>
                      )}
                    </div>

                    {useBusiness && active && (
                      <div className="mt-4 pt-3 border-t border-white/20">
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-900/80">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Indirizzo attività impostato nel “Luogo”
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="text-xs text-slate-500">
            Gestisci attività in{" "}
            <span
              className="font-semibold text-emerald-700 cursor-pointer"
              onClick={() => router.push("/employer/business")}
            >
              /employer/business
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-xl !rounded-2xl border border-white/50 shadow-sm p-4">
          <div className="text-sm text-slate-700 font-semibold">Nessuna attività registrata</div>
          <div className="text-sm text-slate-500 mt-1">
            Registra la tua attività per riusare l’indirizzo quando pubblichi un lavoro.
          </div>
          <button
            type="button"
            onClick={() => router.push("/employer/business")}
            className="mt-3 w-full !rounded-full bg-emerald-500 text-white font-semibold py-3"
          >
            Registra attività
          </button>
        </div>
      )}

      {/* DATE + TIME */}
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 mt-2">
        <div className="space-y-2">
          <DatePickerInput
            label="Data inizio"
            variant="filled"
            radius="xl"
            dropdownType="modal"
            value={startDay}
            onChange={setStartDay}
          />
          <button
            type="button"
            onClick={() => openTimePicker(startTimeRef)}
            className="group w-full !rounded-2xl border border-white/50 bg-white/70 backdrop-blur-xl shadow-sm px-4 py-3 flex items-center justify-between active:scale-[0.99] transition"
          >
            <div className="flex items-center gap-3">
              <span className="h-10 w-10 !rounded-full bg-emerald-500/10 text-emerald-700 flex items-center justify-center">
                <IconClock size={20} />
              </span>
              <div className="text-left">
                <div className="text-xs text-gray-500">Ora inizio</div>
                <div className="text-sm font-semibold text-gray-900">
                  {startTime ? startTime : "Seleziona"}
                </div>
              </div>
            </div>
            {startTime && (
              <span className="text-xs font-semibold px-3 py-1 !rounded-full bg-emerald-500 text-white">
                OK
              </span>
            )}
          </button>
          <input
            ref={startTimeRef}
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            step={600}
            className="absolute opacity-0 w-px h-px pointer-events-none"
          />
        </div>

        <div className="space-y-2">
          <DatePickerInput
            label="Data fine"
            variant="filled"
            radius="xl"
            dropdownType="modal"
            value={endDay}
            onChange={setEndDay}
            minDate={startDay ?? undefined}
          />
          <button
            type="button"
            onClick={() => openTimePicker(endTimeRef)}
            className="group w-full !rounded-2xl border border-white/50 bg-white/70 backdrop-blur-xl shadow-sm px-4 py-3 flex items-center justify-between active:scale-[0.99] transition"
          >
            <div className="flex items-center gap-3">
              <span className="h-10 w-10 !rounded-full bg-blue-500/10 text-blue-700 flex items-center justify-center">
                <IconClock size={20} />
              </span>
              <div className="text-left">
                <div className="text-xs text-gray-500">Ora fine</div>
                <div className="text-sm font-semibold text-gray-900">
                  {endTime ? endTime : "Seleziona"}
                </div>
              </div>
            </div>
            {endTime && (
              <span className="text-xs font-semibold px-3 py-1 !rounded-full bg-blue-500 text-white">
                OK
              </span>
            )}
          </button>
          <input
            ref={endTimeRef}
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            step={600}
            className="absolute opacity-0 w-px h-px pointer-events-none"
          />
        </div>
      </div>

      {/* INPUTS */}
      <input
        placeholder="Ruolo (es. Cameriere)"
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="w-full p-3 !rounded-xl border mt-2"
      />
      <input
        placeholder="Luogo"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        disabled={!!selectedBusiness && useBusiness}
        className={`w-full p-3 !rounded-xl border mt-2 ${
          selectedBusiness && useBusiness ? "bg-gray-100 text-gray-600" : ""
        }`}
      />
      <input
        placeholder="Paga (es. 10€/h)"
        value={pay}
        onChange={(e) => setPay(e.target.value)}
        className="w-full p-3 !rounded-xl border mt-2"
      />

      <button
        onClick={handleSubmit}
        className="w-full text-white py-3 !rounded-xl font-semibold mt-3 bg-linear-to-r from-blue-500 to-cyan-500"
      >
        Pubblica
      </button>

      {/* JOBS */}
      {jobs.length > 0 && (
        <div className="mt-6">
          <h3 className="font-bold mb-2 text-2xl tracking-tight leading-none">
            I miei lavori
          </h3>
          <ul className="space-y-2">
            {jobs.map((job) => (
              <li key={job.id} className="bg-white p-3 !rounded-xl shadow">
                <div className="font-bold">{job.role}</div>
                <div className="text-sm text-gray-500">
                  {job.location} • {job.pay}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {job.startDate.toLocaleDateString()} {formatHHMM(job.startDate)} →{" "}
                  {formatHHMM(job.endDate)}
                </div>

                {job.businessName && job.businessAddress && (
                  <div className="text-xs text-emerald-700 mt-2">
                    {job.businessName} • {job.businessAddress}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// --------------------
// PAGE (DB-only)
// --------------------
export default function EmployerPage() {
  const router = useRouter();

  const [authChecked, setAuthChecked] = useState(false);
  const [employerId, setEmployerId] = useState<string | null>(null);

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
  const [useBusiness, setUseBusiness] = useState(true);

  const [jobs, setJobs] = useState<JobUI[]>([]);

  useEffect(() => {
    let mounted = true;

    async function initEmployer() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!mounted) return;

      if (!user) {
        setAuthChecked(true);
        router.replace("/");
        return;
      }

      const { data: prof } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!mounted) return;

      if (prof?.role !== "employer") {
        setAuthChecked(true);
        router.replace("/");
        return;
      }

      setEmployerId(user.id);

      // 1) load businesses
      const { data: bList, error: bErr } = await supabase
        .from("businesses")
        .select("id, name, type, address, is_default")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (!mounted) return;

      if (bErr) console.error("businesses:", bErr);

      const list = (bList ?? []) as Business[];
      setBusinesses(list);

      const def = list.find((b) => b.is_default) ?? list[0] ?? null;
      if (def) setSelectedBusinessId(def.id);

      // 2) load jobs
      const { data: jList, error: jErr } = await supabase
        .from("jobs")
        .select("*")
        .eq("employer_id", user.id)
        .order("created_at", { ascending: false });

      if (!mounted) return;

      if (jErr) console.error("jobs:", jErr);
      setJobs(((jList ?? []) as JobRow[]).map(toJobUI));

      setAuthChecked(true);
    }

    initEmployer();

    return () => {
      mounted = false;
    };
  }, [router]);

  const onCreateJob = async (input: {
    role: string;
    location: string;
    pay: string;
    startDate: Date;
    endDate: Date;
    business?: Business | null;
  }) => {
    if (!employerId) return;

    const payload = {
      employer_id: employerId,
      role: input.role,
      location: input.location,
      pay: input.pay,
      start_date: input.startDate.toISOString(),
      end_date: input.endDate.toISOString(),
      business_id: input.business?.id ?? null,
      business_name: input.business?.name ?? null,
      business_type: input.business?.type ?? null,
      business_address: input.business?.address ?? null,
    };

    const { data, error } = await supabase
      .from("jobs")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    setJobs((prev) => [toJobUI(data as JobRow), ...prev]);
  };

  if (!authChecked) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-white border rounded-2xl px-5 py-4 shadow-sm">
          Caricamento…
        </div>
      </div>
    );
  }

  if (!employerId) return null;

  return (
    <EmployerPanel
      businesses={businesses}
      selectedBusinessId={selectedBusinessId}
      setSelectedBusinessId={setSelectedBusinessId}
      useBusiness={useBusiness}
      setUseBusiness={setUseBusiness}
      jobs={jobs}
      onCreateJob={onCreateJob}
    />
  );
}