"use client";

import AuthCheck from "@/components/auth/AuthCheck";
import JobList from "@/components/jobs/JobList";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import LoadingSpinner from "@/components/layout/LoadingSpinner";

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <div className="py-12">
          <h1 className="text-4xl font-bold mb-4">Job Tracker</h1>
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
            <Link href="/login" className="btn-primary">
              Anmelden
            </Link>
            <Link href="/register" className="btn-secondary">
              Registrieren
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthCheck>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h1>Dashboard</h1>
          <Link href="/jobs/add" className="btn-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1 inline"
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
          </Link>
        </div>

        <JobList />
      </div>
    </AuthCheck>
  );
}
