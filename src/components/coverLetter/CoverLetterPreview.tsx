import React, { useState, useEffect } from "react";
import { UserProfile, Job } from "@/lib/types";
import LoadingSpinner from "@/components/layout/MuiLoadingSpinner";
import MuiButton from "@/components/ui/Button";
import DownloadIcon from "@mui/icons-material/Download";
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
  content: any;
  template: CoverLetterTemplate;
  profile: UserProfile;
  job?: Job | null;
}

const CoverLetterPreview: React.FC<CoverLetterPreviewProps> = ({
  content,
  template,
  profile,
  job,
}) => {
  const [isClient, setIsClient] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(true);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setIsClient(true);

    if (!content || !profile || !template) {
      setIsLoadingPdf(false);
      setPdfError(
        "Fehlende Daten für die PDF-Generierung (Profil, Inhalt oder Template)."
      );
      return;
    }

    const generatePdfBlob = async () => {
      setIsLoadingPdf(true);
      setPdfError(null);
      setPdfBlobUrl(null);
      let generatedUrl: string | null = null;

      console.log("Generating Cover Letter PDF blob with content:", content);

      try {
        const documentElement = (
          <CoverLetterPdfDocument
            profile={profile}
            job={job}
            content={content}
            template={template}
          />
        );

        const blob = await pdf(documentElement).toBlob();
        generatedUrl = URL.createObjectURL(blob);
        setPdfBlobUrl(generatedUrl);
        console.log("Generated Cover Letter Blob URL:", generatedUrl);
      } catch (error: any) {
        console.error("Error generating Cover Letter PDF blob:", error);
        if (
          error.message &&
          error.message.toLowerCase().includes("outside <text> component")
        ) {
          setPdfError(
            `Fehler beim Generieren der PDF: Text außerhalb von <Text> in CoverLetterPdfDocument.tsx gefunden. Details siehe Konsole.`
          );
        } else {
          setPdfError(
            `Fehler beim Generieren der PDF-Vorschau: ${error.message}`
          );
        }
      } finally {
        setIsLoadingPdf(false);
      }

      // Cleanup function
      return () => {
        if (generatedUrl) {
          URL.revokeObjectURL(generatedUrl);
          console.log("Revoked Cover Letter Blob URL:", generatedUrl);
        }
      };
    };

    generatePdfBlob();
  }, [content, profile, job, template]);

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
        sx={{
          minHeight: "70vh",
          border: "1px solid #ccc",
          marginBottom: 2,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: 1,
        }}
      >
        {isLoadingPdf && <LoadingSpinner message="Generiere PDF-Vorschau..." />}
        {pdfError && (
          <Typography color="error" sx={{ padding: 2 }}>
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

      {/* Download Link */}
      {content && profile && template && (
        <PDFDownloadLink
          document={
            <CoverLetterPdfDocument
              profile={profile}
              job={job}
              content={content}
              template={template}
            />
          }
          fileName={pdfFileName}
          style={{ textDecoration: "none" }}
        >
          {({ blob, url, loading, error }) => (
            <MuiButton
              variant="primary"
              size="sm"
              startIcon={
                loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <DownloadIcon />
                )
              }
              disabled={loading || !!error}
              id="cover-letter-download-button"
            >
              {loading ? "Generiere PDF..." : "Als PDF herunterladen"}
            </MuiButton>
          )}
        </PDFDownloadLink>
      )}
      {(!content || !profile || !template) && (
        <Typography variant="caption" color="textSecondary">
          Warte auf Inhalte für den Download...
        </Typography>
      )}
    </Box>
  );
};

export default CoverLetterPreview;
