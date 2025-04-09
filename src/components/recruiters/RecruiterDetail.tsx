"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getRecruiter,
  getJobsByRecruiter,
  deleteRecruiter,
} from "@/lib/firebase/firebase";
import { useAuth } from "@/providers/AuthProvider";
import toast from "react-hot-toast";
import { Recruiter, Job } from "@/lib/types";
import LoadingSpinner from "@/components/layout/MuiLoadingSpinner";
import MuiButton from "@/components/ui/Button";
import Title from "@/components/ui/Title";
import JobList from "@/components/jobs/JobList";
import Link from "next/link";

interface RecruiterDetailProps {
  recruiterId: string;
}

export default function RecruiterDetail({ recruiterId }: RecruiterDetailProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [recruiter, setRecruiter] = useState<Recruiter | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (user && recruiterId) {
        try {
          setLoading(true);
          const recruiterData = await getRecruiter(recruiterId);

          if (!recruiterData) {
            toast.error("Vermittler nicht gefunden");
            router.push("/recruiters");
            return;
          }

          if (recruiterData.userId !== user.uid) {
            toast.error("Du hast keinen Zugriff auf diesen Vermittler");
            router.push("/recruiters");
            return;
          }

          setRecruiter(recruiterData);

          const jobsData = await getJobsByRecruiter(user.uid, recruiterId);
          setJobs(jobsData);
        } catch (error) {
          console.error("Fehler beim Laden der Daten:", error);
          toast.error("Fehler beim Laden der Daten");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [recruiterId, user, router]);

  const handleDelete = async () => {
    if (
      window.confirm(
        "Bist du sicher, dass du diesen Vermittler löschen möchtest?"
      )
    ) {
      setIsDeleting(true);

      try {
        await deleteRecruiter(recruiterId);
        toast.success("Vermittler erfolgreich gelöscht");
        router.push("/recruiters");
      } catch (error) {
        console.error("Fehler beim Löschen des Vermittlers:", error);
        toast.error("Fehler beim Löschen des Vermittlers");
        setIsDeleting(false);
      }
    }
  };

  if (loading) {
    return <LoadingSpinner message="Vermittler wird geladen..." />;
  }

  if (!recruiter) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Title text={recruiter.name} size="lg" />
        <div className="flex space-x-2">
          <MuiButton
            variant="outline"
            size="sm"
            onClick={() => router.push(`/recruiters/${recruiterId}/edit`)}
          >
            Bearbeiten
          </MuiButton>
          <MuiButton
            variant="danger"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Wird gelöscht..." : "Löschen"}
          </MuiButton>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-8">
        <div className="mb-4">
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            Informationen
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Name</p>
              <p className="text-gray-900">{recruiter.name}</p>
            </div>

            {recruiter.company && (
              <div>
                <p className="text-sm font-medium text-gray-500">Unternehmen</p>
                <p className="text-gray-900">{recruiter.company}</p>
              </div>
            )}
          </div>
        </div>

        {recruiter.notes && (
          <div className="mb-4">
            <h3 className="text-md font-medium text-gray-900 mb-2">Notizen</h3>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-gray-700 whitespace-pre-wrap">
                {recruiter.notes}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium text-gray-900">
            Stellen von diesem Vermittler
          </h2>
          <Link href={`/jobs/add?recruiterId=${recruiterId}`}>
            <MuiButton variant="primary" size="sm">
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Neue Stelle hinzufügen
            </MuiButton>
          </Link>
        </div>

        {jobs.length > 0 ? (
          <JobList
            jobs={jobs}
            onJobUpdate={async () => {
              if (user) {
                const updatedJobs = await getJobsByRecruiter(
                  user.uid,
                  recruiterId
                );
                setJobs(updatedJobs);
              }
            }}
            viewMode="full"
          />
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <p className="text-gray-500">
              Noch keine Stellen von diesem Vermittler. Füge eine neue Stelle
              hinzu.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
