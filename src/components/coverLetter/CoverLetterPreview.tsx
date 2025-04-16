import React, { useState, useEffect } from "react";
import { UserProfile, Job } from "@/lib/types";
import LoadingSpinner from "@/components/layout/MuiLoadingSpinner";
import MuiButton from "@/components/ui/Button";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import { CircularProgress, Box, Typography, Paper } from "@mui/material";

import { pdf, PDFDownloadLink } from "@react-pdf/renderer";
import CoverLetterPdfDocument from "./CoverLetterPdfDocument";

import {
  pdfjs,
  Document as PdfDisplayDoc,
  Page as PdfDisplayPage,
} from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

import { useCoverLetterGenerator } from "@/providers/CoverLetterGeneratorProvider";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface CoverLetterTemplate {
  id: string;
  name: string;
  description: string;
  language: "de" | "en";
  style: "formal" | "modern" | "creative";
  atsOptimized: boolean;
  din5008Compliant?: boolean;
}

interface CoverLetterPreviewProps {
  template: CoverLetterTemplate;
  profile: UserProfile;
  job?: Job | null;
}

const CoverLetterPreview: React.FC<CoverLetterPreviewProps> = ({
  template,
  profile,
  job,
}) => {
  const { generatedContent, setIsEditing, isEditing } =
    useCoverLetterGenerator();

  const [isClient, setIsClient] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(true);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setIsClient(true);

    if (!generatedContent || !profile || !template) {
      setIsLoadingPdf(false);
      setPdfBlobUrl(null);
      if (!profile) setPdfError("Profil-Daten fehlen für die PDF-Generierung.");
      if (!template)
        setPdfError("Template-Daten fehlen für die PDF-Generierung.");
      if (!generatedContent)
        setPdfError("Kein Inhalt zum Anzeigen oder Bearbeiten vorhanden.");
      return;
    }

    const generatePdfBlob = async () => {
      setIsLoadingPdf(true);
      setPdfError(null);
      setPdfBlobUrl(null);
      let generatedUrl: string | null = null;

      console.log(
        "CL_PREVIEW: Generating PDF blob with content:",
        generatedContent
      );

      try {
        const documentElement = (
          <CoverLetterPdfDocument
            profile={profile}
            job={job}
            content={generatedContent}
            template={template}
          />
        );

        const blob = await pdf(documentElement).toBlob();
        generatedUrl = URL.createObjectURL(blob);
        setPdfBlobUrl(generatedUrl);
        console.log("CL_PREVIEW: Generated Blob URL:", generatedUrl);
      } catch (error: any) {
        console.error("CL_PREVIEW: Error generating PDF blob:", error);
        setPdfError(
          `Fehler beim Generieren der PDF-Vorschau: ${error.message}`
        );
      } finally {
        setIsLoadingPdf(false);
      }
      return () => {
        if (generatedUrl) {
          URL.revokeObjectURL(generatedUrl);
          console.log("CL_PREVIEW: Revoked Blob URL:", generatedUrl);
        }
      };
    };

    generatePdfBlob();
  }, [generatedContent, profile, job, template]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setCurrentPage(1);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, numPages || 1));
  };

  if (!isClient) {
    return <LoadingSpinner message="Vorschau wird vorbereitet..." />;
  }

  const pdfFileName = `Anschreiben_${profile?.personalDetails?.firstName || "NoName"}_${profile?.personalDetails?.lastName || "NoName"}_${job ? job.company.replace(/[^a-z0-9]/gi, "_") : "allgemein"}.pdf`;

  return (
    <Box>
      {/* PDF Display Area */}
      <Paper
        elevation={0}
        sx={{
          minHeight: "70vh",
          border: "1px solid",
          borderColor: "divider",
          marginBottom: 2,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: 1,
          bgcolor: "grey.50",
        }}
      >
        {isLoadingPdf && <LoadingSpinner message="Generiere PDF-Vorschau..." />}
        {pdfError && !isLoadingPdf && (
          <Typography color="error" sx={{ padding: 2, textAlign: "center" }}>
            {pdfError}
          </Typography>
        )}

        {pdfBlobUrl && !isLoadingPdf && !pdfError && (
          <PdfDisplayDoc
            file={pdfBlobUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={(error) =>
              setPdfError(`Fehler beim Laden des PDF: ${error.message}`)
            }
            loading={<LoadingSpinner message="Lade PDF..." />}
            error={
              <Typography color="error" sx={{ padding: 2 }}>
                PDF konnte nicht geladen werden.
              </Typography>
            }
          >
            <PdfDisplayPage
              pageNumber={currentPage}
              width={Math.min(window.innerWidth * 0.8, 800)}
            />
          </PdfDisplayDoc>
        )}
        {!isLoadingPdf && !pdfBlobUrl && !pdfError && (
          <Typography sx={{ padding: 2 }}>
            Keine PDF-Vorschau verfügbar.
          </Typography>
        )}
      </Paper>

      {/* Pagination Controls */}
      {pdfBlobUrl && !isLoadingPdf && !pdfError && numPages && numPages > 1 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mb: 2,
          }}
        >
          <MuiButton
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPage <= 1}
          >
            Zurück
          </MuiButton>
          <Typography sx={{ mx: 2 }}>
            Seite {currentPage} von {numPages}
          </Typography>
          <MuiButton
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage >= numPages}
          >
            Weiter
          </MuiButton>
        </Box>
      )}

      {/* Action Buttons Area */}
      <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 1 }}>
        {/* --- Edit Button --- */}
        {generatedContent && !isEditing && (
          <MuiButton
            variant="outline"
            size="sm"
            startIcon={<EditIcon />}
            onClick={() => setIsEditing(true)}
            disabled={isLoadingPdf || !!pdfError}
          >
            Bearbeiten
          </MuiButton>
        )}

        {/* Download Link/Button */}
        {generatedContent && profile && template && (
          <PDFDownloadLink
            document={
              <CoverLetterPdfDocument
                profile={profile}
                job={job}
                content={generatedContent}
                template={template}
              />
            }
            fileName={pdfFileName}
            style={{ textDecoration: "none" }}
          >
            {({
              blob,
              url,
              loading: downloadLoading,
              error: downloadError,
            }) => (
              <MuiButton
                variant="primary"
                size="sm"
                startIcon={
                  downloadLoading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <DownloadIcon />
                  )
                }
                disabled={
                  downloadLoading ||
                  !!downloadError ||
                  isLoadingPdf ||
                  !!pdfError
                }
                id="cover-letter-download-button"
              >
                {downloadLoading ? "Generiere PDF..." : "Als PDF herunterladen"}
              </MuiButton>
            )}
          </PDFDownloadLink>
        )}
        {!generatedContent && !isLoadingPdf && !pdfError && (
          <Typography variant="caption" color="textSecondary">
            Generiere Inhalt für Vorschau und Download...
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default CoverLetterPreview;
