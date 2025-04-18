"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Job, UserProfile } from "@/lib/types";
import MuiButton from "@/components/ui/Button";
import { useAuth } from "@/providers/AuthProvider";
import { pdf } from "@react-pdf/renderer";
import JobListPdfDocument from "./JobListPdfDocument";
import { CircularProgress } from "@mui/material";
import { getUserProfile } from "@/lib/firebase/firebase";
import { saveAs } from "file-saver";
import toast from "react-hot-toast";

interface PdfExportButtonProps {
  jobs: Job[];
}

export default function PdfExportButton({ jobs }: PdfExportButtonProps) {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState<string>("Nutzer");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    if (user?.uid) {
      const initialName = user.email ? user.email.split("@")[0] : "Nutzer";
      setDisplayName(initialName);

      getUserProfile(user.uid)
        .then((profile) => {
          if (isMounted && profile?.personalDetails) {
            const { firstName, lastName } = profile.personalDetails;
            if (firstName && lastName) {
              setDisplayName(`${firstName} ${lastName}`);
            }
          }
        })
        .catch((error) => {
          console.error("Error fetching user profile for PDF export:", error);
          if (isMounted) {
            setDisplayName(initialName);
          }
        });
    } else {
      if (isMounted) {
        setDisplayName("Nutzer");
      }
    }
    return () => {
      isMounted = false;
    };
  }, [user]);

  const pdfFileName = `Bewerbungen_${displayName.replace(/\s+/g, "_")}.pdf`;

  const pdfDocument = useMemo(() => {
    return <JobListPdfDocument jobs={jobs} userName={displayName} />;
  }, [jobs, displayName]);

  const handleManualExport = useCallback(async () => {
    if (!pdfDocument || isGenerating) return;

    setIsGenerating(true);
    console.log("PDF Export: Starting manual PDF generation...");
    toast.loading("PDF wird generiert...", { id: "pdf-generating" });

    try {
      const blob = await pdf(pdfDocument).toBlob();
      console.log("PDF Export: Blob generated successfully.");

      saveAs(blob, pdfFileName);
      console.log("PDF Export: Download triggered.");
      toast.success("PDF erfolgreich generiert!", { id: "pdf-generating" });
    } catch (error) {
      console.error("PDF Export: Error generating or saving PDF:", error);
      toast.error("Fehler beim Erstellen der PDF.", { id: "pdf-generating" });
    } finally {
      setIsGenerating(false);
      console.log("PDF Export: Finished manual PDF generation attempt.");
    }
  }, [pdfDocument, pdfFileName, isGenerating]);

  return (
    <MuiButton
      variant="outline"
      size="sm"
      onClick={handleManualExport}
      disabled={isGenerating || jobs.length === 0}
      startIcon={
        isGenerating ? (
          <CircularProgress size={16} color="inherit" />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            style={{ marginRight: "4px" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
        )
      }
    >
      {isGenerating ? "Generiere..." : "Als PDF runterladen"}
    </MuiButton>
  );
}
