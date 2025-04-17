"use client";

import { useJobs } from "@/lib/hooks/hooks";
import { Job } from "@/lib/types";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState } from "react";
import MuiButton from "../ui/Button";
import Title from "../ui/Title";
import MuiFilterTabs from "./FilterTabs";
import JobList from "./JobList";
import PdfExportButton from "./PdfExportButton";
import ViewToggle from "./ViewToggle";
import LoadingSpinner from "@/components/layout/MuiLoadingSpinner";

export default function JobDashboardContent() {
  const { jobs, loading: jobsLoading, refresh } = useJobs();
  const [viewMode, setViewMode] = useState<"full" | "compact">("full");
  const searchParams = useSearchParams();
  const router = useRouter();

  const statusFilter = searchParams.get("status") || "all";

  const totalCount = jobs.length;
  const statusCounts = jobs.reduce((acc: Record<string, number>, job) => {
    acc[job.status] = (acc[job.status] || 0) + 1;
    return acc;
  }, {});

  const filteredJobs =
    statusFilter === "all"
      ? jobs
      : jobs.filter((job) => job.status === statusFilter);

  const sortedJobs = [...filteredJobs].sort((a: Job, b: Job) => {
    const getTimestamp = (date: string | Date | any) => {
      try {
        if (
          typeof date === "object" &&
          date !== null &&
          "toDate" in date &&
          typeof date.toDate === "function"
        ) {
          return date.toDate().getTime();
        } else if (date instanceof Date) {
          return date.getTime();
        } else if (typeof date === "string") {
          const parsedDate = new Date(date);
          return isNaN(parsedDate.getTime()) ? 0 : parsedDate.getTime();
        }
        return 0;
      } catch (e) {
        console.error("Error parsing date for sorting:", date, e);
        return 0;
      }
    };

    const aTime = getTimestamp(a.applicationDate);
    const bTime = getTimestamp(b.applicationDate);
    return (bTime || 0) - (aTime || 0);
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Title text="Dashboard" className="mb-6" />

        <MuiFilterTabs statusCounts={statusCounts} totalCount={totalCount} />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 my-6">
          {" "}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {" "}
              {statusFilter === "all"
                ? `Alle Bewerbungen (${sortedJobs.length})`
                : `${statusFilter} (${sortedJobs.length})`}
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <PdfExportButton jobs={sortedJobs} />
            <ViewToggle currentView={viewMode} onViewChange={setViewMode} />

            <MuiButton
              variant="outline"
              size="sm"
              onClick={() => refresh()}
              disabled={jobsLoading}
              isLoading={jobsLoading}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 mr-1 ${jobsLoading ? "animate-spin" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {jobsLoading ? "Lädt..." : "Aktualisieren"}
            </MuiButton>

            <Link href="/jobs/add" passHref>
              <MuiButton variant="primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Neue Bewerbung
              </MuiButton>
            </Link>
          </div>
        </div>

        {jobsLoading && !sortedJobs.length ? (
          <LoadingSpinner message="Bewerbungen werden geladen..." />
        ) : (
          <JobList
            jobs={sortedJobs}
            onJobUpdate={refresh}
            viewMode={viewMode}
          />
        )}
      </div>
    </div>
  );
}
