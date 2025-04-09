"use client";

import { useState } from "react";
import { exportJobsToPDF } from "@/lib/pdf/pdfExport";
import { Job } from "@/lib/types";
import MuiButton from "@/components/ui/Button";
import { useAuth } from "@/providers/AuthProvider";

interface PdfExportButtonProps {
  jobs: Job[];
}

export default function PdfExportButton({ jobs }: PdfExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { user } = useAuth();

  const handleExport = async () => {
    try {
      setIsExporting(true);

      const userName = user?.email ? user.email.split("@")[0] : "Nutzer";

      exportJobsToPDF({
        jobs,
        userName,
      });
    } catch (error) {
      console.error("Fehler beim Exportieren der PDF:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <MuiButton
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={isExporting || jobs.length === 0}
    >
      {isExporting ? (
        <>Wird exportiert...</>
      ) : (
        <>
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
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Als PDF
        </>
      )}
    </MuiButton>
  );
}
