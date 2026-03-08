"use client";

import { useState } from "react";
import { DatePickerInput } from "@mantine/dates";
import { NativeSelect } from "@mantine/core";

export type Job = {
  id: string;
  role: string;
  location: string;
  startDate: Date;
  endDate: Date;
  pay: string;
};

const HOURS = Array.from({ length: 24 }, (_, i) =>
  String(i).padStart(2, "0")
);
const MINUTES = ["00", "10", "20", "30", "40", "50"];

function todayYMD() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function combineYMDTime(dayYMD: string, hhmm: string) {
  const [y, m, d] = dayYMD.split("-").map(Number);
  const [hh, mm] = hhmm.split(":").map(Number);

  const out = new Date();
  out.setFullYear(y, (m || 1) - 1, d || 1);
  out.setHours(hh || 0, mm || 0, 0, 0);
  return out;
}

export default function EmployerPanel({
  jobs,
  onAddJob,
}: {
  jobs: Job[];
  onAddJob: (job: Omit<Job, "id">) => void;
}) {
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [pay, setPay] = useState("");

  const [startDay, setStartDay] = useState<string | null>(todayYMD());
  const [startTime, setStartTime] = useState("09:00");

  const [endDay, setEndDay] = useState<string | null>(todayYMD());
  const [endTime, setEndTime] = useState("11:00");

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

    onAddJob({
      role,
      location,
      startDate: s,
      endDate: e,
      pay,
    });

    setRole("");
    setLocation("");
    setPay("");
  };

  return (
    <div className="p-5 space-y-6">
      <h2 className="text-xl font-bold">Pubblica un lavoro</h2>

      <input
        placeholder="Ruolo"
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="w-full p-3 rounded-xl border"
      />

      <input
        placeholder="Luogo"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="w-full p-3 rounded-xl border"
      />

      <input
        placeholder="Compenso"
        value={pay}
        onChange={(e) => setPay(e.target.value)}
        className="w-full p-3 rounded-xl border"
      />

      <button
        onClick={handleSubmit}
        className="w-full bg-blue-500 text-white py-3 rounded-xl"
      >
        Pubblica
      </button>

      {jobs.length > 0 && (
        <div>
          <h3 className="font-bold">Lavori pubblicati</h3>

          {jobs.map((job) => (
            <div key={job.id} className="p-3 bg-white rounded-xl shadow">
              {job.role} — {job.location}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}