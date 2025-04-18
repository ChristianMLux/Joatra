"use client";

import LoadingSpinner from "@/components/layout/MuiLoadingSpinner";
import Title from "@/components/ui/Title";
import MuiButton from "@/components/ui/Button";
import CVTemplateSelector from "./CVTemplateSelector";
import CVJobSelector from "./CVJobSelector";
import CVContentEditor from "./CVContentEditor";
import { useCVGeneratorLogic } from "@/hooks/useCVGeneratorLogic";
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

const CVPreview = dynamic(() => import("./CVPreview"), {
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
      <CircularProgress />{" "}
      <Typography sx={{ ml: 2 }}>Lade Vorschau...</Typography>
    </Box>
  ),
});

export default function CVGenerator() {
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
    cvLoading,
    handleJobSelect,
    handleTemplateSelect,
    handleNext,
    handleBack,
  } = useCVGeneratorLogic();

  if (cvLoading && !profile) {
    return <LoadingSpinner message="Daten werden geladen..." />;
  }

  if (!profile && !cvLoading) {
    return (
      <Box className="max-w-4xl mx-auto text-center py-12">
        <Title text="Kein Profil gefunden" className="mb-6" />
        <Typography variant="body1" color="textSecondary" paragraph>
          Um den CV-Generator nutzen zu können, musst du zunächst dein Profil
          anlegen.
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
      <Title text="CV-Generator" className="mb-6" />

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
        Mit diesem Generator erstellst du einen ATS-optimierten Lebenslauf.
        Wähle optional eine Stelle aus, um den Inhalt darauf zuzuschneiden. Du
        kannst den generierten Text anschließend bearbeiten.
      </Alert>

      {currentStep === "job" && (
        <Box className="mb-6">
          <Typography variant="h5" component="h2" gutterBottom>
            1. Wähle eine Stelle aus (Optional)
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Wähle eine deiner gespeicherten Stellen, um den Lebenslauf darauf
            zuzuschneiden, oder überspringe diesen Schritt für einen allgemeinen
            Lebenslauf.
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
              onClick={handleNext}
              disabled={cvLoading}
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
            Wähle ein passendes Design für deinen Lebenslauf.
          </Typography>
          {cvLoading && !templates.length ? (
            <LoadingSpinner message="Templates werden geladen..." />
          ) : (
            <CVTemplateSelector
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
            Überprüfe deinen generierten Lebenslauf. Klicke auf "Bearbeiten", um
            Texte anzupassen, oder lade ihn direkt herunter.
          </Typography>

          {isGenerating || (cvLoading && !generatedContent) ? (
            <Box sx={{ textAlign: "center", my: 5 }}>
              <CircularProgress />
              <Typography sx={{ ml: 2, display: "inline-block" }}>
                {isGenerating
                  ? "Lebenslauf wird generiert..."
                  : "Lade Inhalt..."}
              </Typography>
            </Box>
          ) : generatedContent && selectedTemplate && profile ? (
            <CVPreview
              template={selectedTemplate}
              profile={profile}
              job={selectedJob}
            />
          ) : (
            !isGenerating &&
            !cvLoading && (
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
          disabled={currentStep === "job" || isGenerating || cvLoading}
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
              cvLoading
            }
            isLoading={isGenerating}
          >
            {isGenerating ? "Generiere..." : "Weiter"}
          </MuiButton>
        ) : (
          <Box sx={{ width: "88px" }} /> // Platzhalter
        )}
      </Box>

      <CVContentEditor />
    </div>
  );
}
