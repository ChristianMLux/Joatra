"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { useCVGenerator } from "@/providers/CVGeneratorProvider";
import { useJobs } from "@/lib/hooks/hooks";
import { CVTemplate, Job } from "@/lib/types";
import LoadingSpinner from "@/components/layout/MuiLoadingSpinner";
import Title from "@/components/ui/Title";
import MuiButton from "@/components/ui/Button";
import CVTemplateSelector from "./CVTemplateSelector";
import CVJobSelector from "./CVJobSelector";
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
import toast from "react-hot-toast";

const CVPreview = dynamic(() => import("./CVPreview"), {
  ssr: false,
  loading: () => (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 4,
      }}
    >
      <CircularProgress />
      <Typography sx={{ ml: 2 }}>Lade Vorschau...</Typography>
    </Box>
  ),
});

type Step = "job" | "template" | "preview";

export default function CVGenerator() {
  const { user } = useAuth();
  const { jobs } = useJobs();
  const {
    profile,
    selectedJob,
    templates,
    selectedTemplate,
    generatedContent,
    loading: cvLoading,
    loadJob,
    loadProfile,
    selectTemplate,
    generateContent,
  } = useCVGenerator();

  const router = useRouter();
  const searchParams = useSearchParams();
  const initialJobId = searchParams.get("jobId");

  const [currentStep, setCurrentStep] = useState<Step>("job");
  const [isGenerating, setIsGenerating] = useState(false);
  const [componentLoading, setComponentLoading] = useState(true);

  console.log("--- CVGenerator Render ---", {
    currentStep,
    selectedJobId: selectedJob?.id,
    initialJobId,
    componentLoading,
    cvLoading,
    isGenerating,
  });

  useEffect(() => {
    const initialize = async () => {
      if (!user) {
        setComponentLoading(false);
        return;
      }
      setComponentLoading(true);

      try {
        await loadProfile();

        if (initialJobId) {
          await loadJob(initialJobId);
        }
      } catch (error) {
        toast.error("Error during initialization:", error ? error : "");
      } finally {
        setComponentLoading(false);
      }
    };

    initialize();
  }, [user, initialJobId]);

  useEffect(() => {
    if (selectedJob && currentStep === "job" && !componentLoading) {
      setCurrentStep("template");
    }
  }, [selectedJob, profile, currentStep, componentLoading]);

  const handleJobSelect = (job: Job) => {
    router.push(`/cv-generator?jobId=${job.id}`, { scroll: false });
  };

  const handleTemplateSelect = (template: CVTemplate) => {
    selectTemplate(template.id);
  };

  const handleNext = async () => {
    if (currentStep === "job" && selectedJob) {
      setCurrentStep("template");
    } else if (currentStep === "template" && selectedTemplate) {
      if (!generatedContent) {
        setIsGenerating(true);
        await generateContent();
        setIsGenerating(false);
      }
      setCurrentStep("preview");
    }
  };

  const handleBack = () => {
    if (currentStep === "template") {
      router.push("/cv-generator", { scroll: false });
      setCurrentStep("job");
    } else if (currentStep === "preview") {
      setCurrentStep("template");
    }
  };

  const isNextDisabled = () => {
    if (currentStep === "job" && !selectedJob) return true;
    if (currentStep === "template" && !selectedTemplate) return true;
    if (isGenerating || cvLoading || componentLoading) return true;
    return false;
  };

  if (componentLoading && !profile) {
    return <LoadingSpinner message="Daten werden geladen..." />;
  }

  if (!profile) {
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

  return (
    <div className="max-w-6xl mx-auto">
      <Title text="CV-Generator" className="mb-6" />

      <Paper
        elevation={0}
        className="mb-8 p-6 rounded-lg border border-gray-200"
      >
        <Stepper
          activeStep={
            currentStep === "job" ? 0 : currentStep === "template" ? 1 : 2
          }
          alternativeLabel
        >
          <Step key="job-step">
            <StepLabel>Stelle auswählen</StepLabel>
          </Step>
          <Step key="template-step">
            <StepLabel>Template auswählen</StepLabel>
          </Step>
          <Step key="preview-step">
            <StepLabel>CV-Vorschau</StepLabel>
          </Step>
        </Stepper>
      </Paper>

      <Alert severity="info" className="mb-6">
        Mit diesem Generator erstellst du einen ATS-optimierten Lebenslauf, der
        auf eine bestimmte Stelle zugeschnitten ist. Die relevanten Keywords
        werden automatisch extrahiert und deine Fähigkeiten entsprechend
        priorisiert.
      </Alert>

      {currentStep === "job" && (
        <Box className="mb-6">
          <Typography variant="h5" component="h2" gutterBottom>
            1. Wähle eine Stelle aus
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Für welche deiner gespeicherten Stellen möchtest du einen Lebenslauf
            generieren?
          </Typography>
          {useJobs().loading ? (
            <LoadingSpinner message="Jobs werden geladen..." />
          ) : (
            <CVJobSelector
              jobs={jobs}
              selectedJobId={selectedJob?.id}
              onSelect={handleJobSelect}
            />
          )}
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
          {cvLoading ? (
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
            3. Vorschau und Download
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Überprüfe deinen generierten Lebenslauf. Du kannst ihn herunterladen
            oder zurückgehen, um Änderungen vorzunehmen.
          </Typography>

          {isGenerating || !generatedContent ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                p: 4,
              }}
            >
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>
                Lebenslauf wird generiert...
              </Typography>
            </Box>
          ) : (
            <CVPreview
              content={generatedContent}
              template={selectedTemplate!}
              profile={profile!}
              job={selectedJob}
            />
          )}
        </Box>
      )}

      <Box className="flex justify-between mt-8">
        <MuiButton
          variant="outline"
          onClick={handleBack}
          disabled={
            currentStep === "job" ||
            isGenerating ||
            cvLoading ||
            componentLoading
          }
        >
          Zurück
        </MuiButton>

        {currentStep !== "preview" ? (
          <MuiButton
            variant="primary"
            onClick={handleNext}
            disabled={isNextDisabled()}
            isLoading={isGenerating}
          >
            {isGenerating ? "Generiere..." : "Weiter"}
          </MuiButton>
        ) : (
          <MuiButton
            variant="primary"
            onClick={() => {
              const downloadButton = document.querySelector(
                "#cv-download-button"
              ) as HTMLButtonElement;
              downloadButton?.click();
            }}
            disabled={
              isGenerating || !generatedContent || cvLoading || componentLoading
            }
          >
            Herunterladen
          </MuiButton>
        )}
      </Box>
    </div>
  );
}
