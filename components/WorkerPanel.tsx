"use client";

import JobCard from "./JobCard";
import { Job } from "@/app/page";

type Props = {
  jobs: Job[];
  appliedJobs: string[];
  isLoggedIn: boolean;
  searchQuery: string;
  onApply: (jobId: string) => void;
  onSelectJob: (job: Job) => void;
};

export default function WorkerPanel({
  jobs,
  appliedJobs,
  isLoggedIn,
  searchQuery,
  onApply,
  onSelectJob,
}: Props) {
  const q = searchQuery.trim().toLowerCase();

  const filtered = q
    ? jobs.filter(
        (job) =>
          job.role.toLowerCase().includes(q) ||
          job.location.toLowerCase().includes(q)
      )
    : jobs;

  return (
    <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh)] overscroll-contain">
      {filtered.length === 0 ? (
        <p className="text-center text-gray-500">
          Nessuna offerta disponibile
        </p>
      ) : (
        filtered.map((job) => (
          <div
            key={job.id}
            onClick={() => onSelectJob(job)}
            className="cursor-pointer"
          >
            <JobCard
              {...job}
              isLoggedIn={isLoggedIn}
              appliedJobs={appliedJobs}
              onApply={onApply}
            />
          </div>
        ))
      )}
    </div>
  );
}