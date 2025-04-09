"use client";

import RecruiterCard from "./RecruiterCard";
import { Recruiter } from "@/lib/types";

interface RecruiterListProps {
  recruiters: Recruiter[];
  onRecruiterUpdate: () => void;
  jobCounts: Record<string, number>;
}

export default function RecruiterList({
  recruiters,
  onRecruiterUpdate,
  jobCounts,
}: RecruiterListProps) {
  if (recruiters.length === 0) {
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
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Keine Vermittler gefunden
        </h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Füge deinen ersten Vermittler hinzu, um den Überblick über deine
          Kontakte zu behalten.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {recruiters.map((recruiter) => (
        <RecruiterCard
          key={recruiter.id}
          recruiter={recruiter}
          onRecruiterUpdate={onRecruiterUpdate}
          jobCount={jobCounts[recruiter.id!] || 0}
        />
      ))}
    </div>
  );
}
