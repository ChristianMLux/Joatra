"use client";
import { useState } from "react";
import JobCard from "./JobCard";
import LoadingSpinner from "../layout/LoadingSpinner";
import { useJobs } from "@/lib/hooks/hooks";
import { Job } from "@/lib/types";

type StatusType =
  | "Alle"
  | "Beworben"
  | "Interview"
  | "Abgelehnt"
  | "Angenommen";

export default function JobList() {
  const { jobs, loading } = useJobs();
  const [statusFilter, setStatusFilter] = useState<StatusType>("Alle");

  const handleJobUpdate = async () => {};

  const filteredJobs =
    statusFilter === "Alle"
      ? jobs
      : jobs.filter((job) => job.status === statusFilter);

  if (loading) {
    return <LoadingSpinner message="Jobs werden geladen..." />;
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          Deine Bewerbungen ({jobs.length})
        </h2>

        <div className="flex items-center">
          <span className="mr-2 text-sm font-medium text-gray-700">
            Status Filter:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusType)}
            className="input-field text-sm py-1 px-3"
          >
            <option value="Alle">Alle</option>
            <option value="Beworben">Beworben</option>
            <option value="Interview">Interview</option>
            <option value="Abgelehnt">Abgelehnt</option>
            <option value="Angenommen">Angenommen</option>
          </select>
        </div>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-gray-600 mb-4">Keine Bewerbungen gefunden.</p>
          {statusFilter !== "Alle" ? (
            <p className="text-sm text-gray-500">
              Versuche einen anderen Status-Filter oder füge neue Bewerbungen
              hinzu.
            </p>
          ) : (
            <p className="text-sm text-gray-500">
              Beginne damit, deine erste Bewerbung hinzuzufügen.
            </p>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
          {filteredJobs.map((job: Job) => (
            <JobCard key={job.id} job={job} onJobUpdate={handleJobUpdate} />
          ))}
        </div>
      )}
    </div>
  );
}
