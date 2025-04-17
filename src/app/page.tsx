"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import AuthCheck from "@/components/auth/AuthCheck";
import JobList from "@/components/jobs/JobList";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { useJobs } from "@/lib/hooks/hooks";
import LoadingSpinner from "@/components/layout/MuiLoadingSpinner";
import Title from "@/components/ui/Title";
import MuiFilterTabs from "@/components/jobs/FilterTabs";
import ViewToggle from "@/components/jobs/ViewToggle";
import MuiButton from "@/components/ui/Button";
import { useRouter, useSearchParams } from "next/navigation";
import { Job } from "@/lib/types";
import PdfExportButton from "@/components/jobs/PdfExportButton";

function JobDashboardContent() {
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
      if (typeof date === "object" && "toDate" in date) {
        return date.toDate().getTime();
      } else if (date instanceof Date) {
        return date.getTime();
      } else if (typeof date === "string") {
        return new Date(date).getTime();
      }
      return 0;
    };

    const aTime = getTimestamp(a.applicationDate);
    const bTime = getTimestamp(b.applicationDate);
    return bTime - aTime;
  });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <Title text="Dashboard" className="mb-6" />

        <MuiFilterTabs statusCounts={statusCounts} totalCount={totalCount} />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900">
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
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
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
              Aktualisieren
            </MuiButton>

            <Link href="/jobs/add">
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

        {jobsLoading ? (
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

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const { refresh } = useJobs();
  const initialLoadRef = useRef(false);

  useEffect(() => {
    if (user && !initialLoadRef.current) {
      refresh();
      initialLoadRef.current = true;
    }
  }, [user, refresh]);

  if (authLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <div className="py-12">
          <Title text="Joatra" size="2xl" className="mb-4" />
          <p className="text-xl text-gray-600 mb-8">
            Behalte alle deine Bewerbungen im Blick und organisiere deinen
            Jobsuchprozess ganz einfach.
          </p>

          <div className="max-w-md mx-auto bg-blue-50 p-6 rounded-lg mb-8">
            <h2 className="text-2xl font-bold mb-4">Features</h2>
            <ul className="text-left">
              <li className="mb-2 flex items-baseline">
                <svg
                  className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Füge Bewerbungen mit allen wichtigen Details hinzu</span>
              </li>
              <li className="mb-2 flex items-baseline">
                <svg
                  className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Verfolge den Status jeder Bewerbung</span>
              </li>
              <li className="mb-2 flex items-baseline">
                <svg
                  className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Speichere wichtige URLs und Notizen</span>
              </li>
              <li className="flex items-baseline">
                <svg
                  className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Organisiere und filtere deine Bewerbungen</span>
              </li>
            </ul>
          </div>

          <div className="flex justify-center space-x-4">
            <Link href="/login">
              <MuiButton variant="primary">Anmelden</MuiButton>
            </Link>
            <Link href="/register">
              <MuiButton variant="outline">Registrieren</MuiButton>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthCheck>
      <Suspense
        fallback={<LoadingSpinner message="Dashboard wird geladen..." />}
      >
        <JobDashboardContent />
      </Suspense>
    </AuthCheck>
  );
}
