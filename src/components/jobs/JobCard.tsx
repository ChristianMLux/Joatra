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

export default function JobCard({ job, onJobUpdate }: JobCardProps) {
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  // Formatieren des Datums für die Anzeige
  const formatDate = (date: string | Date | Timestamp | undefined) => {
    if (!date) return "Kein Datum";

    let dateObj: Date;

    // Falls das Datum als Timestamp von Firebase kommt
    if (typeof date === "object" && "toDate" in date) {
      dateObj = date.toDate();
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      // Falls das Datum als String vorliegt
      dateObj = new Date(date);
    }

    // Überprüfen, ob das Datum gültig ist
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

  return (
    <div className="card hover:shadow-lg transition-shadow duration-200">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold mb-1 text-gray-900">
            {job.jobTitle}
          </h3>
          <p className="text-gray-700 font-medium">{job.company}</p>
        </div>
        <StatusBadge status={job.status} />
      </div>

      <div className="mt-4 flex items-center text-sm text-gray-600">
        <span className="mr-4">
          <span className="font-medium">Bewerbung:</span>{" "}
          {formatDate(job.applicationDate)}
        </span>
      </div>

      {job.jobUrl && (
        <div className="mt-2">
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

      {job.notes && (
        <div className="mt-3 p-3 bg-gray-50 rounded-md text-sm text-gray-700">
          <p className="font-medium mb-1">Notizen:</p>
          <p className="whitespace-pre-wrap">{job.notes}</p>
        </div>
      )}

      <div className="mt-4 border-t pt-4 flex justify-between items-center">
        <div className="relative">
          <button
            className="btn-primary text-sm py-1 flex items-center"
            onClick={() => setIsChangingStatus(!isChangingStatus)}
            disabled={isChangingStatus}
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
          </button>

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
          <button
            className="btn-secondary text-sm py-1"
            onClick={() => router.push(`/jobs/${job.id}`)}
          >
            Bearbeiten
          </button>
          <button
            className="btn-danger text-sm py-1"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Wird gelöscht..." : "Löschen"}
          </button>
        </div>
      </div>
    </div>
  );
}
