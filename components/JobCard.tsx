"use client";

import { Job } from "../.next/types/job";

type JobCardProps = Job & {
  isLoggedIn: boolean;
  appliedJobs: string[];
  onApply: (id: string) => void;
};

export default function JobCard({
  id,
  role,
  location,
  startDate,
  endDate,
  pay,
  isLoggedIn,
  appliedJobs,
  onApply,
}: JobCardProps) {
  const alreadyApplied = appliedJobs.includes(id);

  const formattedDate = (date: Date) => (
    date instanceof Date ? date : new Date(date)).toLocaleString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace(", ", " ");


  const handleApply = () => {
    if (!isLoggedIn) {
      alert("Devi accedere per candidarti");
      return;
    }

    if (!alreadyApplied) {
      onApply(id);
    }
  };

  return (
    <div className="inset-3 rounded-[16px] backdrop-blur-[5px] border p-4">
      <div className="row">
        <div className="col-auto icon d-flex align-items-center">
          {alreadyApplied && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-emerald-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
          {!alreadyApplied && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
        </div>
        <div className="col">
          <h3 className="font-bold text-lg">{role}</h3>
          <p className="text-sm text-gray-600">{location}</p>

          <div className="mt-2 text-sm">
            📅 {formattedDate(startDate)} - {formattedDate(endDate)}
          </div>
        </div>
        <div className="d-flex align-items-center col-auto me-3">
          <p className="font-semibold m-0 text-blue-600 price">{pay} &euro;</p>
        </div>
        <div className="col-md-auto col-sm-12">
          <button
        onClick={handleApply}
        disabled={alreadyApplied}
        className={`mt-3 w-full py-2 rounded-xl action-button font-semibold bg-emerald shadow-lg shadow-emerald-500/50
          ${
            alreadyApplied
              ? "bg-gray-300 text-gray-600 cursor-not-allowed bg-cyan-500 shadow-lg shadow-cyan-500/50"
              : "bg-green-500 text-white"
          }`}
      >
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            role="img"
            aria-label="Icona lavoro, borsa 24 ore"
            className="h-6 w-6 text-gray-700"
            fill="none"
            stroke="currentColor"
          >
            <title>Icona lavoro (borsa 24 ore)</title>
            <rect x="3" y="7" width="14" height="10" rx="2" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7 7V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="show-mobile">
            {alreadyApplied ? "Candidatura inviata" : "Candidati ora"}
          </span>
      </button>
          
        </div>
      </div>
    </div>
  );
}
