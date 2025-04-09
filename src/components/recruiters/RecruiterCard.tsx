"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteRecruiter } from "@/lib/firebase/firebase";
import toast from "react-hot-toast";
import { RecruiterCardProps } from "@/lib/types";
import MuiButton from "@/components/ui/Button";

export default function RecruiterCard({
  recruiter,
  onRecruiterUpdate,
  jobCount = 0,
}: RecruiterCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (
      window.confirm(
        "Bist du sicher, dass du diesen Vermittler löschen möchtest?"
      )
    ) {
      setIsDeleting(true);

      try {
        await deleteRecruiter(recruiter.id!);
        onRecruiterUpdate();
        toast.success("Vermittler erfolgreich gelöscht");
      } catch (error) {
        console.error("Fehler beim Löschen des Vermittlers:", error);
        toast.error("Fehler beim Löschen des Vermittlers");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-5 border border-gray-100">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-medium text-gray-900">{recruiter.name}</h3>
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
          {jobCount} {jobCount === 1 ? "Stelle" : "Stellen"}
        </span>
      </div>

      {recruiter.company && (
        <p className="text-sm text-gray-600 mb-3">{recruiter.company}</p>
      )}

      {recruiter.notes && (
        <div className="mt-3 p-3 bg-gray-50 rounded-md text-sm text-gray-700 mb-4">
          <p className="whitespace-pre-wrap">{recruiter.notes}</p>
        </div>
      )}

      <div className="flex justify-end space-x-2 mt-4">
        <MuiButton
          variant="outline"
          size="sm"
          onClick={() => router.push(`/recruiters/${recruiter.id}`)}
        >
          Details
        </MuiButton>
        <MuiButton
          variant="outline"
          size="sm"
          onClick={() => router.push(`/recruiters/${recruiter.id}/edit`)}
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
  );
}
