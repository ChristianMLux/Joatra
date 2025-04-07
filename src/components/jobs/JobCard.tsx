"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateJob, deleteJob } from "@/lib/firebase/firebase";
import StatusBadge from "./StatusBadge";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { JobCardProps } from "@/lib/types";
import { Timestamp } from "firebase/firestore";
import Button from "@/components/ui/Button";

export default function JobCard({ job, onJobUpdate, viewMode }: JobCardProps) {
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const formatDate = (date: string | Date | Timestamp | undefined) => {
    if (!date) return "Kein Datum";

    let dateObj: Date;

    if (typeof date === "object" && "toDate" in date) {
      dateObj = date.toDate();
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      dateObj = new Date(date);
    }

    if (isNaN(dateObj.getTime())) {
      return "Ungültiges Datum";
    }

    return format(dateObj, "dd. MMMM yyyy", { locale: de });
  };

  const handleStatusChange = async (
    newStatus: "Beworben" | "Interview" | "Abgelehnt" | "Angenommen"
  ) => {
    setIsChangingStatus(true);

    try {
      await updateJob(job.id!, { status: newStatus });
      onJobUpdate();
      toast.success(`Status auf "${newStatus}" geändert`);
    } catch (error) {
      console.error("Fehler beim Ändern des Status:", error);
      toast.error("Fehler beim Ändern des Status");
    } finally {
      setIsChangingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        "Bist du sicher, dass du diese Bewerbung löschen möchtest?"
      )
    ) {
      setIsDeleting(true);

      try {
        await deleteJob(job.id!);
        onJobUpdate();
        toast.success("Bewerbung erfolgreich gelöscht");
      } catch (error) {
        console.error("Fehler beim Löschen der Bewerbung:", error);
        toast.error("Fehler beim Löschen der Bewerbung");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  if (viewMode === "compact") {
    return (
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 border border-gray-100">
        <div className="flex justify-between items-start mb-2">
          <h3
            className="text-lg font-medium text-gray-900 truncate"
            title={job.jobTitle}
          >
            {job.jobTitle}
          </h3>
          <StatusBadge status={job.status} />
        </div>

        <p className="text-sm text-gray-700 mb-3 truncate" title={job.company}>
          {job.company}
          {job.location ? ` • ${job.location}` : ""}
        </p>

        <div className="flex items-center text-xs text-gray-500 mb-4">
          <span>{formatDate(job.applicationDate)}</span>
          {job.salary?.min && (
            <span className="ml-2 pl-2 border-l border-gray-300">
              {job.salary.min}
              {job.salary.max ? `-${job.salary.max}` : "+"}{" "}
              {job.salary.currency || "€"}
            </span>
          )}
        </div>

        <div className="flex justify-between space-x-2">
          <Button
            variant="outline"
            size="sm"
            fullWidth
            onClick={() => router.push(`/jobs/${job.id}`)}
          >
            Details
          </Button>
          <Button
            variant={
              job.status === "Abgelehnt"
                ? "danger"
                : job.status === "Angenommen"
                  ? "success"
                  : "primary"
            }
            size="sm"
            onClick={() => setIsChangingStatus(!isChangingStatus)}
            disabled={isChangingStatus}
          >
            Status
          </Button>
        </div>

        {isChangingStatus && (
          <div className="absolute z-10 mt-1 right-4 w-48 bg-white rounded-md shadow-lg">
            <ul className="py-1">
              {["Beworben", "Interview", "Abgelehnt", "Angenommen"].map(
                (status) => (
                  <li key={status}>
                    <button
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${job.status === status ? "bg-blue-50 text-blue-600" : "text-gray-700"}`}
                      onClick={() =>
                        handleStatusChange(
                          status as
                            | "Beworben"
                            | "Interview"
                            | "Abgelehnt"
                            | "Angenommen"
                        )
                      }
                    >
                      {status}
                    </button>
                  </li>
                )
              )}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 mb-4 overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold mb-1 text-gray-900">
              {job.jobTitle}
            </h3>
            <p className="text-gray-700 font-medium">
              {job.company}
              {job.location && (
                <span className="ml-2 text-gray-500">• {job.location}</span>
              )}
            </p>
          </div>
          <StatusBadge status={job.status} />
        </div>

        <div className="mt-4 flex flex-wrap items-center text-sm text-gray-600 gap-4">
          <span className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="font-medium">Bewerbung:</span>{" "}
            {formatDate(job.applicationDate)}
          </span>

          {job.salary?.min && (
            <span className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-medium">Gehalt:</span> {job.salary.min}
              {job.salary.max ? `-${job.salary.max}` : "+"}{" "}
              {job.salary.currency || "€"}
            </span>
          )}

          {job.contactPerson?.name && (
            <span className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span className="font-medium">Kontakt:</span>{" "}
              {job.contactPerson.name}
              {job.contactPerson.position && (
                <span className="text-gray-500 ml-1">
                  ({job.contactPerson.position})
                </span>
              )}
            </span>
          )}
        </div>

        {job.jobUrl && (
          <div className="mt-3">
            <a
              href={job.jobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm inline-flex items-center"
            >
              Stelle ansehen
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 ml-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        )}

        {job.techStack && job.techStack.length > 0 && (
          <div className="mt-3">
            <p className="text-sm font-medium text-gray-700 mb-1">
              Tech Stack:
            </p>
            <div className="flex flex-wrap gap-1">
              {job.techStack.map((tech, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {job.status === "Abgelehnt" && job.rejectionReason && (
          <div className="mt-3 p-3 bg-red-50 rounded-md text-sm text-red-800 border border-red-100">
            <p className="font-medium mb-1">Ablehnungsgrund:</p>
            <p className="whitespace-pre-wrap">{job.rejectionReason}</p>
          </div>
        )}

        {job.notes && (
          <div className="mt-3 p-3 bg-gray-50 rounded-md text-sm text-gray-700">
            <p className="font-medium mb-1">Notizen:</p>
            <p className="whitespace-pre-wrap">{job.notes}</p>
          </div>
        )}
      </div>

      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
        <div className="relative">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsChangingStatus(!isChangingStatus)}
            disabled={isChangingStatus}
            className="flex items-center"
          >
            Status ändern
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 ml-1 transition-transform ${isChangingStatus ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </Button>

          {isChangingStatus && (
            <div className="absolute z-10 mt-1 w-48 bg-white rounded-md shadow-lg">
              <ul className="py-1">
                {["Beworben", "Interview", "Abgelehnt", "Angenommen"].map(
                  (status) => (
                    <li key={status}>
                      <button
                        className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${job.status === status ? "bg-blue-50 text-blue-600" : "text-gray-700"}`}
                        onClick={() =>
                          handleStatusChange(
                            status as
                              | "Beworben"
                              | "Interview"
                              | "Abgelehnt"
                              | "Angenommen"
                          )
                        }
                      >
                        {status}
                      </button>
                    </li>
                  )
                )}
              </ul>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/jobs/${job.id}`)}
          >
            Bearbeiten
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Wird gelöscht..." : "Löschen"}
          </Button>
        </div>
      </div>
    </div>
  );
}
