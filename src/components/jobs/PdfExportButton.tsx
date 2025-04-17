"use client";
import React, { useState, useEffect } from "react";
import { Job, UserProfile } from "@/lib/types";
import MuiButton from "@/components/ui/Button";
import { useAuth } from "@/providers/AuthProvider";
import { PDFDownloadLink } from "@react-pdf/renderer";
import JobListPdfDocument from "./JobListPdfDocument";
import { CircularProgress } from "@mui/material";
import { getUserProfile } from "@/lib/firebase/firebase";

interface PdfExportButtonProps {
  jobs: Job[];
}

export default function PdfExportButton({ jobs }: PdfExportButtonProps) {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState<string>("Nutzer");

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
              console.log(
                "PDF Export: Using profile name:",
                `${firstName} ${lastName}`
              );
            } else {
              console.log(
                "PDF Export: Profile found, but no full name. Using:",
                initialName
              );
            }
          } else if (isMounted) {
            console.log("PDF Export: No profile found. Using:", initialName);
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

  const pdfDocument = <JobListPdfDocument jobs={jobs} userName={displayName} />;

  return (
    <PDFDownloadLink
      document={pdfDocument}
      fileName={pdfFileName}
      style={{ textDecoration: "none" }}
    >
      {({ blob, url, loading, error }) => (
        <MuiButton
          variant="outline"
          size="sm"
          disabled={loading || jobs.length === 0 || !!error}
          startIcon={
            loading ? (
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
          {loading ? "Generiere..." : "Als PDF runterladen"}
        </MuiButton>
      )}
    </PDFDownloadLink>
  );
}
