"use client";

import JobCard from "./JobCard";
import { Job } from "@/lib/types";

interface JobListProps {
  jobs: Job[];
  onJobUpdate: () => void;
  viewMode: "full" | "compact";
}

export default function JobList({ jobs, onJobUpdate, viewMode }: JobListProps) {
  if (jobs.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 mx-auto text-gray-400 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Keine Bewerbungen gefunden
        </h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Füge deine erste Bewerbung hinzu, um den Überblick über deinen
          Jobsuchprozess zu behalten.
        </p>
      </div>
    );
  }

  if (viewMode === "compact") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {jobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            onJobUpdate={onJobUpdate}
            viewMode="compact"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-[1rem]">
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          onJobUpdate={onJobUpdate}
          viewMode="full"
        />
      ))}
    </div>
  );
}
