"use client";

import { useState, useEffect } from "react";
import AuthCheck from "@/components/auth/AuthCheck";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { useRecruiters } from "@/providers/RecruitersProvider";
import LoadingSpinner from "@/components/layout/LoadingSpinner";
import Title from "@/components/ui/Title";
import Button from "@/components/ui/Button";
import RecruiterList from "@/components/recruiters/RecruiterList";
import { getJobsByRecruiter } from "@/lib/firebase/firebase";

export default function RecruitersPage() {
  const { user, loading: authLoading } = useAuth();
  const { recruiters, loading: recruitersLoading, refresh } = useRecruiters();
  const [jobCounts, setJobCounts] = useState<Record<string, number>>({});
  const [loadingCounts, setLoadingCounts] = useState(false);

  useEffect(() => {
    const fetchJobCounts = async () => {
      if (user && recruiters.length > 0) {
        setLoadingCounts(true);
        const counts: Record<string, number> = {};

        for (const recruiter of recruiters) {
          if (recruiter.id) {
            const jobs = await getJobsByRecruiter(user.uid, recruiter.id);
            counts[recruiter.id] = jobs.length;
          }
        }

        setJobCounts(counts);
        setLoadingCounts(false);
      }
    };

    fetchJobCounts();
  }, [recruiters, user]);

  if (authLoading || recruitersLoading || loadingCounts) {
    return <LoadingSpinner />;
  }

  return (
    <AuthCheck>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-6">
            <Title text="Vermittler" className="mb-2" />
            <Link href="/recruiters/add">
              <Button variant="primary">
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
                Neuer Vermittler
              </Button>
            </Link>
          </div>

          <p className="text-gray-600 mb-6">
            Behalte den Überblick über alle Personalvermittler, mit denen du in
            Kontakt stehst.
          </p>

          <RecruiterList
            recruiters={recruiters}
            onRecruiterUpdate={refresh}
            jobCounts={jobCounts}
          />
        </div>
      </div>
    </AuthCheck>
  );
}
