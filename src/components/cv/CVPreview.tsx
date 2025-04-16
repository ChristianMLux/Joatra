import React, { useState, useEffect } from "react";
import { UserProfile, Job, CVTemplate } from "@/lib/types";
import LoadingSpinner from "@/components/layout/MuiLoadingSpinner";
import MuiButton from "@/components/ui/Button";
import DownloadIcon from "@mui/icons-material/Download";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { CircularProgress, Box, Typography, Paper } from "@mui/material";

import { pdf } from "@react-pdf/renderer";
import CVPdfDocument from "./CVPdfDocument";
import EnhancedCVPdfDocument from "./EnhancedCVPdfDocument";

import {
  pdfjs,
  Document as PdfDisplayDoc,
  Page as PdfDisplayPage,
} from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface CVPreviewProps {
  content: any;
  template: CVTemplate;
  profile: UserProfile;
  job?: Job | null;
}

const CVPreview: React.FC<CVPreviewProps> = ({
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
  const PdfComponent =
    template.type === "enhanced" ? EnhancedCVPdfDocument : CVPdfDocument;

  useEffect(() => {
    setIsClient(true);

    if (!content || !profile) {
      setIsLoadingPdf(false);
      if (!profile) setPdfError("Profil-Daten fehlen für die PDF-Generierung.");
      if (!content)
        setPdfError("Generierte Inhaltsdaten fehlen für die PDF-Generierung.");
      return;
    }

    const generatePdfBlob = async () => {
      setIsLoadingPdf(true);
      setPdfError(null);
      setPdfBlobUrl(null);
      let generatedUrl: string | null = null;

      console.log("Generating PDF blob with content:", content);

      try {
        const documentElement = (
          <PdfComponent
            profile={profile}
            job={job}
            content={content}
            template={template}
          />
        );

        const blob = await pdf(documentElement).toBlob();
        generatedUrl = URL.createObjectURL(blob);
        setPdfBlobUrl(generatedUrl);
        console.log("Generated Blob URL:", generatedUrl);
      } catch (error: any) {
        console.error("Error generating PDF blob:", error);
        if (
          error.message &&
          error.message.toLowerCase().includes("outside <text> component")
        ) {
          setPdfError(
            `Fehler beim Generieren der PDF: Text außerhalb von <Text> in CVPdfDocument.tsx gefunden. Details siehe Konsole.`
          );
        } else {
          setPdfError(
            `Fehler beim Generieren der PDF-Vorschau: ${error.message}`
          );
        }
      } finally {
        setIsLoadingPdf(false);
      }

      return () => {
        if (generatedUrl) {
          URL.revokeObjectURL(generatedUrl);
          console.log("Revoked Blob URL:", generatedUrl);
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

  const pdfFileName = `CV_${profile?.personalDetails?.firstName || "NoName"}_${profile?.personalDetails?.lastName || "NoName"}_${job ? job.company.replace(/[^a-z0-9]/gi, "_") : "allgemein"}.pdf`;

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
            {/* Render only the current page */}
            <PdfDisplayPage
              pageNumber={currentPage}
              width={Math.min(window.innerWidth * 0.8, 800)}
            />
          </PdfDisplayDoc>
        )}
        {/* Show message if PDF couldn't be generated/loaded */}
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
      {content && profile && (
        <PDFDownloadLink
          document={
            <PdfComponent
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
              id="cv-download-button"
            >
              {loading ? "Generiere PDF..." : "Als PDF herunterladen"}
            </MuiButton>
          )}
        </PDFDownloadLink>
      )}
      {!content && (
        <Typography variant="caption" color="textSecondary">
          Warte auf Inhalte für den Download...
        </Typography>
      )}
    </Box>
  );
};

export default CVPreview;
