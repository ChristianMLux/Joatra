"use client";

import { useRef, useState } from "react";
import { UserProfile, Job } from "@/lib/types";
import { Box, Paper, Typography, CircularProgress } from "@mui/material";
import MuiButton from "@/components/ui/Button";
import { exportCoverLetterToPDF } from "@/lib/coverLetter/coverLetterExport";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";

interface CoverLetterPreviewProps {
  content: any;
  template: {
    id: string;
    name: string;
    description: string;
    language: "de" | "en";
    style: "formal" | "modern" | "creative";
    atsOptimized: boolean;
    din5008Compliant?: boolean;
  };
  profile: UserProfile;
  job?: Job | null;
}

// --- DIN 5008 Styling Constants ---
const FONT_FAMILY_FORMAL = "'Times New Roman', Times, serif";
const FONT_FAMILY_MODERN = "'Arial', Helvetica, sans-serif";
const BASE_FONT_SIZE = "11pt";
const SMALLER_FONT_SIZE = "9pt";
const LINE_HEIGHT = 1.5;

const spacing = {
  oneLine: `${1 * LINE_HEIGHT}em`,
  twoLines: `${2 * LINE_HEIGHT}em`,
  threeLines: `${3 * LINE_HEIGHT}em`,
};

export default function CoverLetterPreview({
  content,
  template,
  profile,
  job,
}: CoverLetterPreviewProps) {
  const coverLetterRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (coverLetterRef.current && !isDownloading) {
      setIsDownloading(true);
      try {
        await exportCoverLetterToPDF({
          element: coverLetterRef.current,
          fileName: `Anschreiben_${profile.personalDetails.firstName}_${profile.personalDetails.lastName}_${job ? job.company.replace(/[^a-z0-9]/gi, "_") : "allgemein"}`,
          template: template,
        });
      } catch (error) {
        console.error("Download failed in CoverLetterPreview:", error);
      } finally {
        setIsDownloading(false);
      }
    }
  };

  if (!content || !content.personalDetailsBlock) {
    return (
      <Box className="p-8 text-center border rounded-lg bg-gray-50">
        <Typography variant="body1" color="textSecondary">
          Anschreiben-Inhalt wird geladen oder konnte nicht generiert werden.
          Bitte warten oder erneut versuchen.
        </Typography>
      </Box>
    );
  }

  const fontFamily =
    template.style === "formal" ? FONT_FAMILY_FORMAL : FONT_FAMILY_MODERN;

  const cleanMarkdown = (text: string | undefined): string => {
    return text ? text.replace(/\*\*/g, "") : "";
  };

  return (
    <Box>
      <Box className="mb-4 flex justify-end gap-2">
        <MuiButton
          variant="outline"
          startIcon={<EditIcon />}
          href={profile.id ? `/profile/edit` : `/profile/create`}
          size="sm"
        >
          Profil bearbeiten
        </MuiButton>
        <MuiButton
          id="cover-letter-download-button"
          variant="primary"
          startIcon={
            isDownloading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <DownloadIcon />
            )
          }
          onClick={handleDownload}
          disabled={isDownloading}
          size="sm"
        >
          {isDownloading ? "Wird erstellt..." : "Als PDF herunterladen"}
        </MuiButton>
      </Box>

      {/* Cover Letter Paper */}
      <Paper
        elevation={0}
        ref={coverLetterRef}
        className="border border-gray-200 rounded-lg max-w-4xl mx-auto bg-white"
        sx={{
          padding: "25mm", // Standard DIN margins (approx 25mm left/right, 20mm top/bottom often used)
          width: "210mm",
          minHeight: "297mm",
          boxSizing: "border-box",
          fontFamily: fontFamily,
          fontSize: BASE_FONT_SIZE,
          lineHeight: LINE_HEIGHT,
          color: "#000000",
          "& *": {
            fontFamily: "inherit",
            fontSize: "inherit",
            lineHeight: "inherit",
            color: "inherit",
          },
        }}
      >
        {/* Sender Line (Optional, above address block - DIN 5008 Rücksendeangabe) */}
        <Typography
          sx={{ fontSize: SMALLER_FONT_SIZE, height: spacing.oneLine }}
        >
          {`${profile.personalDetails.firstName} ${profile.personalDetails.lastName} · ${profile.personalDetails.address} · ${profile.personalDetails.postalCode} ${profile.personalDetails.city}`}
        </Typography>
        {/* Space before Recipient */}
        <Box sx={{ height: spacing.twoLines }} /> {/* Simulates empty lines */}
        {/* Recipient Block */}
        <Box sx={{ marginBottom: spacing.twoLines, whiteSpace: "pre-line" }}>
          {/* Render Company Address Block */}
          {content.companyAddressBlock}
          {/* Add more lines manually if needed to fill the 6 lines */}
          {/* Example: Add empty lines if content is short */}
          {(content.companyAddressBlock?.match(/\n/g) || []).length < 5 && (
            <Box
              sx={{
                height: `${(5 - (content.companyAddressBlock?.match(/\n/g) || []).length) * LINE_HEIGHT}em`,
              }}
            />
          )}
        </Box>
        {/* Date Block (Right Aligned) */}
        <Box sx={{ textAlign: "right", marginBottom: spacing.twoLines }}>
          {content.date}
        </Box>
        {/* Subject Block */}
        <Typography sx={{ fontWeight: "bold", marginBottom: spacing.twoLines }}>
          {cleanMarkdown(content.subject)} {/* Clean potential markdown */}
        </Typography>
        {/* Salutation */}
        <Typography sx={{ marginBottom: spacing.oneLine }}>
          {content.salutation}
        </Typography>
        {/* Introduction */}
        <Typography
          sx={{ marginBottom: spacing.oneLine, whiteSpace: "pre-line" }}
        >
          {content.introduction}
        </Typography>
        {/* Main Body Paragraphs */}
        {typeof content.mainBody === "string" ? (
          content.mainBody
            .split(/\n\s*\n/)
            .map((paragraph: string, index: number) => (
              <Typography
                key={`main-${index}`}
                sx={{ marginBottom: spacing.oneLine, whiteSpace: "pre-line" }}
              >
                {paragraph}
              </Typography>
            ))
        ) : (
          <Typography
            sx={{ marginBottom: spacing.oneLine, whiteSpace: "pre-line" }}
          >
            {content.mainBody}
          </Typography>
        )}
        {/* Closing */}
        {(() => {
          const closingParts =
            typeof content.closing === "string"
              ? content.closing.split(/\n\s*\n/)
              : [];
          const greeting = closingParts[0] || "";
          const name = closingParts[closingParts.length - 1] || "";

          return (
            <Box sx={{ marginTop: spacing.oneLine }}>
              <Typography>{greeting}</Typography>
              <Box sx={{ height: spacing.threeLines }} />{" "}
              {/* Signature space */}
              <Typography>{name}</Typography>
            </Box>
          );
        })()}
        {/* Anlagen (Optional) */}
        {/* <Box sx={{ marginTop: spacing.oneLine }}>
            <Typography component="span" sx={{fontWeight: 'bold'}}>Anlagen</Typography>
         </Box> */}
      </Paper>

      {/* Keywords Box */}
      <Box className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg max-w-4xl mx-auto">
        {/* ... keywords rendering ... */}
        <Typography variant="subtitle2" className="mb-2">
          Verwendete Keywords:
        </Typography>
        <Box className="flex flex-wrap gap-1">
          {content.keywords?.map((keyword: string, index: number) => (
            <span
              key={index}
              className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded"
            >
              {keyword}
            </span>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
