"use client";

import LoadingSpinner from "@/components/layout/MuiLoadingSpinner";
import Title from "@/components/ui/Title";
import MuiButton from "@/components/ui/Button";
import CoverLetterContentEditor from "./CoverLetterContentEditor";
import { useCoverLetterGeneratorLogic } from "@/hooks/useCoverLetterGeneratorLogic";
import { useJobs } from "@/lib/hooks/hooks";
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

// Dynamische Imports für UI-Komponenten
const CVJobSelector = dynamic(() => import("../cv/CVJobSelector"), {
  ssr: false,
  loading: () => <LoadingSpinner message="Job-Auswahl wird geladen..." />,
});
const CoverLetterTemplateSelector = dynamic(
  () => import("@/components/coverLetter/CoverLetterTemplateSelector"),
  {
    ssr: false,
    loading: () => <LoadingSpinner message="Templates werden geladen..." />,
  }
);
const CoverLetterPreview = dynamic(
  () => import("@/components/coverLetter/CoverLetterPreview"),
  {
    ssr: false,
    loading: () => (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: 4,
          minHeight: "50vh",
        }}
      >
        {" "}
        <CircularProgress />{" "}
        <Typography sx={{ ml: 2 }}>Lade Vorschau...</Typography>{" "}
      </Box>
    ),
  }
);

export default function CoverLetterGenerator() {
  const router = useRouter();
  const { jobs, loading: jobsLoading } = useJobs();

  const {
    currentStep,
    isGenerating,
    profile,
    selectedJob,
    templates,
    selectedTemplate,
    generatedContent,
    isEditing,
    providerLoading,
    handleJobSelect,
    handleTemplateSelect,
    handleNext,
    handleBack,
    handleSkipJobSelection,
  } = useCoverLetterGeneratorLogic();

  if (providerLoading && !profile) {
    return <LoadingSpinner message="Daten werden geladen..." />;
  }

  if (!profile && !providerLoading) {
    return (
      <Box className="max-w-4xl mx-auto text-center py-12">
        <Title text="Kein Profil gefunden" className="mb-6" />
        <Typography variant="body1" color="textSecondary" paragraph>
          Um den Anschreiben-Generator nutzen zu können, musst du zunächst dein
          Profil anlegen.
        </Typography>
        <MuiButton
          variant="primary"
          onClick={() => router.push("/profile/create")}
          className="mt-4"
        >
          Profil erstellen
        </MuiButton>
      </Box>
    );
  }

  const activeStep =
    currentStep === "job" ? 0 : currentStep === "template" ? 1 : 2;

  return (
    <div className="max-w-6xl mx-auto">
      <Title text="Anschreiben-Generator" className="mb-6" />

      <Paper
        elevation={0}
        className="mb-8 p-6 rounded-lg border border-gray-200"
      >
        <Stepper activeStep={activeStep} alternativeLabel>
          <Step key="job-step">
            <StepLabel>Stelle auswählen (Optional)</StepLabel>
          </Step>
          <Step key="template-step">
            <StepLabel>Template auswählen</StepLabel>
          </Step>
          <Step key="preview-step">
            <StepLabel>Vorschau & Bearbeiten</StepLabel>
          </Step>
        </Stepper>
      </Paper>

      <Alert severity="info" className="mb-6">
        Mit diesem Generator erstellst du ein professionelles Anschreiben. Wähle
        optional eine Stelle aus, um den Inhalt darauf zuzuschneiden. Du kannst
        den generierten Text anschließend bearbeiten.
      </Alert>

      {currentStep === "job" && (
        <Box className="mb-6">
          <Typography variant="h5" component="h2" gutterBottom>
            1. Wähle eine Stelle aus (Optional)
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Für welche deiner gespeicherten Stellen möchtest du ein Anschreiben
            generieren? Überspringe diesen Schritt für ein allgemeines
            Anschreiben.
          </Typography>
          {jobsLoading ? (
            <LoadingSpinner message="Jobs werden geladen..." />
          ) : (
            <CVJobSelector
              jobs={jobs}
              selectedJobId={selectedJob?.id}
              onSelect={handleJobSelect}
            />
          )}
          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
            <MuiButton
              variant="secondary"
              onClick={handleSkipJobSelection}
              disabled={providerLoading}
            >
              Ohne Jobauswahl fortfahren
            </MuiButton>
          </Box>
        </Box>
      )}

      {currentStep === "template" && (
        <Box className="mb-6">
          <Typography variant="h5" component="h2" gutterBottom>
            2. Wähle ein Template aus
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Wähle ein passendes Design für dein Anschreiben.
          </Typography>
          {providerLoading && !templates.length ? (
            <LoadingSpinner message="Templates werden geladen..." />
          ) : (
            <CoverLetterTemplateSelector
              templates={templates}
              selectedTemplateId={selectedTemplate?.id}
              onSelect={handleTemplateSelect}
            />
          )}
        </Box>
      )}

      {currentStep === "preview" && (
        <Box className="mb-6">
          <Typography variant="h5" component="h2" gutterBottom>
            3. Vorschau, Bearbeiten und Download
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Überprüfe dein generiertes Anschreiben. Klicke auf "Bearbeiten", um
            den Text anzupassen, oder lade es direkt herunter.
          </Typography>

          {isGenerating || (providerLoading && !generatedContent) ? (
            <Box sx={{ textAlign: "center", my: 5 }}>
              <CircularProgress />
              <Typography sx={{ ml: 2, display: "inline-block" }}>
                {isGenerating
                  ? "Anschreiben wird generiert..."
                  : "Lade Inhalt..."}
              </Typography>
            </Box>
          ) : generatedContent && selectedTemplate && profile ? (
            <CoverLetterPreview
              template={selectedTemplate}
              profile={profile}
              job={selectedJob}
            />
          ) : (
            !isGenerating &&
            !providerLoading && (
              <Typography sx={{ textAlign: "center", my: 5 }}>
                Kein Inhalt zum Anzeigen. Bitte gehe zurück und wähle ein
                Template aus oder generiere den Inhalt.
              </Typography>
            )
          )}
        </Box>
      )}

      <Box className="flex justify-between mt-8">
        <MuiButton
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === "job" || isGenerating || providerLoading}
        >
          Zurück
        </MuiButton>

        {currentStep !== "preview" ? (
          <MuiButton
            variant="primary"
            onClick={handleNext}
            disabled={
              (currentStep === "template" && !selectedTemplate) ||
              isGenerating ||
              providerLoading
            }
            isLoading={isGenerating}
          >
            {isGenerating ? "Generiere..." : "Weiter"}
          </MuiButton>
        ) : (
          <Box sx={{ width: "88px" }} /> // Platzhalter
        )}
      </Box>

      <CoverLetterContentEditor />
    </div>
  );
}
