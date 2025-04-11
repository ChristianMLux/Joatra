"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { useCoverLetterGenerator } from "@/providers/CoverLetterGeneratorProvider";
import { useJobs } from "@/lib/hooks/hooks";
import { Job } from "@/lib/types";
import LoadingSpinner from "@/components/layout/MuiLoadingSpinner";
import Title from "@/components/ui/Title";
import MuiButton from "@/components/ui/Button";
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

const CVJobSelector = dynamic(() => import("../cv/CVJobSelector"), {
  ssr: false,
  loading: () => <LoadingSpinner message="Komponente wird geladen..." />,
});

const CoverLetterTemplateSelector = dynamic(
  () => import("@/components/coverLetter/CoverLetterTemplateSelector"),
  {
    ssr: false,
    loading: () => <LoadingSpinner message="Komponente wird geladen..." />,
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
        }}
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Lade Vorschau...</Typography>
      </Box>
    ),
  }
);

type Step = "job" | "template" | "preview";

export default function CoverLetterGenerator() {
  const { user } = useAuth();
  const { jobs } = useJobs();
  const {
    profile,
    selectedJob,
    templates,
    selectedTemplate,
    generatedContent,
    loading: providerLoading,
    loadJob,
    loadProfile,
    selectTemplate,
    generateContent,
  } = useCoverLetterGenerator();

  const router = useRouter();
  const searchParams = useSearchParams();
  const initialJobId = searchParams.get("jobId");

  const [currentStep, setCurrentStep] = useState<Step>("job");
  const [isGenerating, setIsGenerating] = useState(false);

  console.log("--- CoverLetterGenerator Render ---", {
    currentStep,
    selectedJobId: selectedJob?.id,
    selectedTemplateId: selectedTemplate?.id,
    initialJobId,
    providerLoading,
    isGenerating,
    profileExists: !!profile,
  });

  useEffect(() => {
    console.log("Effect: Initialize Profile & Job - Running", {
      user,
      initialJobId,
    });
    const initialize = async () => {
      if (!user) {
        console.log("Effect: Initialize Profile & Job - No user, skipping");
        return;
      }

      if (initialJobId && !selectedJob) {
        console.log(
          `Effect: Initialize Profile & Job - Loading job ${initialJobId}`
        );
        try {
          await loadJob(initialJobId);
          console.log(
            `Effect: Initialize Profile & Job - Job ${initialJobId} loaded`
          );
        } catch (error) {
          console.error(
            `Effect: Initialize Profile & Job - Error loading job ${initialJobId}`,
            error
          );
          toast.error("Fehler beim Laden des ausgewählten Jobs.");
        }
      } else {
        console.log(
          "Effect: Initialize Profile & Job - No initialJobId or job already selected"
        );
      }
    };

    initialize();
  }, [user, initialJobId, loadJob, selectedJob]);

  useEffect(() => {
    console.log("Effect: Auto-advance - Checking", {
      selectedJob: !!selectedJob,
      currentStep,
      providerLoading,
    });
    if (selectedJob && currentStep === "job" && !providerLoading) {
      console.log("Effect: Auto-advance - Advancing to 'template' step");
      setCurrentStep("template");
    }
    if (
      !selectedJob &&
      (currentStep === "template" || currentStep === "preview")
    ) {
      console.log(
        "Effect: Auto-advance - No job selected, resetting to 'job' step"
      );
      setCurrentStep("job");
    }
  }, [selectedJob, currentStep, providerLoading]);

  const handleJobSelect = (job: Job) => {
    console.log("handleJobSelect called", { jobId: job.id });
    router.push(`/cover-letter-generator?jobId=${job.id}`, { scroll: false });
  };

  const handleTemplateSelect = (template: any) => {
    console.log("handleTemplateSelect called", { templateId: template.id });
    selectTemplate(template.id);
  };

  const handleNext = async () => {
    console.log("handleNext called", { currentStep });
    if (currentStep === "job" && selectedJob) {
      console.log("handleNext: Moving from 'job' to 'template'");
      setCurrentStep("template");
    } else if (currentStep === "template" && selectedTemplate) {
      console.log("handleNext: Moving from 'template' to 'preview'");
      if (!generatedContent) {
        console.log("handleNext: Generating content...");
        setIsGenerating(true);
        try {
          await generateContent();
          console.log("handleNext: Content generation finished.");
        } catch (error) {
          console.error("handleNext: Error generating content", error);
        } finally {
          setIsGenerating(false);
        }
      } else {
        console.log("handleNext: Content already exists, skipping generation.");
      }
      setCurrentStep("preview");
    }
  };

  const handleBack = () => {
    console.log("handleBack called", { currentStep });
    if (currentStep === "template") {
      console.log("handleBack: Moving from 'template' to 'job'");
      router.push("/cover-letter-generator", { scroll: false });
    } else if (currentStep === "preview") {
      console.log("handleBack: Moving from 'preview' to 'template'");
      setCurrentStep("template");
    }
  };

  const isNextDisabled = () => {
    if (providerLoading || isGenerating) return true;
    if (currentStep === "job" && !selectedJob) return true;
    if (currentStep === "template" && !selectedTemplate) return true;
    return false;
  };

  if (providerLoading && !profile) {
    console.log("Render: Showing initial loading spinner");
    return <LoadingSpinner message="Daten werden geladen..." />;
  }

  if (!profile) {
    console.log("Render: No profile found after loading");
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

  console.log("Render: Rendering main UI for step:", currentStep);
  return (
    <div className="max-w-6xl mx-auto">
      <Title text="Anschreiben-Generator" className="mb-6" />

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
            <StepLabel>Anschreiben-Vorschau</StepLabel>
          </Step>
        </Stepper>
      </Paper>

      <Alert severity="info" className="mb-6">
        Mit diesem Generator erstellst du ein ATS-optimiertes Anschreiben, das
        auf eine bestimmte Stelle zugeschnitten ist. Die relevanten Keywords
        werden automatisch extrahiert und in die passenden Textblöcke
        integriert.
      </Alert>

      {currentStep === "job" && (
        <Box className="mb-6">
          <Typography variant="h5" component="h2" gutterBottom>
            1. Wähle eine Stelle aus
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Für welche deiner gespeicherten Stellen möchtest du ein Anschreiben
            generieren?
          </Typography>
          {useJobs().loading ? ( // Use loading state from useJobs hook
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
            Wähle ein passendes Design für dein Anschreiben.
          </Typography>
          {providerLoading ? (
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
            3. Vorschau und Download
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Überprüfe dein generiertes Anschreiben. Du kannst es herunterladen
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
                {isGenerating
                  ? "Anschreiben wird generiert..."
                  : "Lade Inhalt..."}
              </Typography>
            </Box>
          ) : (
            <CoverLetterPreview
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
          disabled={currentStep === "job" || isGenerating || providerLoading}
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
                "#cover-letter-download-button"
              ) as HTMLButtonElement;
              downloadButton?.click();
            }}
            disabled={isGenerating || !generatedContent || providerLoading}
          >
            Herunterladen
          </MuiButton>
        )}
      </Box>
    </div>
  );
}
