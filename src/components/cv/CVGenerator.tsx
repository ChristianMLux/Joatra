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
import CVContentEditor from "./CVContentEditor";
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
        minHeight: "50vh",
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
  const { jobs, loading: jobsLoading } = useJobs();
  const {
    profile,
    selectedJob,
    setSelectedJob,
    templates,
    selectedTemplate,
    generatedContent,
    loading: cvLoading,
    loadJob,
    loadProfile,
    selectTemplate,
    generateContent,
    isEditing,
  } = useCVGenerator();

  const router = useRouter();
  const searchParams = useSearchParams();
  const initialJobId = searchParams.get("jobId");

  const [currentStep, setCurrentStep] = useState<Step>("job");
  const [isGenerating, setIsGenerating] = useState(false);

  console.log(
    `--- CVGenerator Render --- Step: ${currentStep}, Job: ${selectedJob?.id}, Template: ${selectedTemplate?.id}, URL JobId: ${initialJobId}, CVLoading: ${cvLoading}, JobsLoading: ${jobsLoading}`
  );

  // Effect 1: Initialize profile and load initial job based on URL
  useEffect(() => {
    console.log(
      "CVGEN: Effect 1 (Init Profile/Job) running. User:",
      !!user,
      "URL JobId:",
      initialJobId
    );
    if (user && !profile && !cvLoading) {
      console.log("CVGEN: Effect 1 - Calling loadProfile");
      loadProfile();
    }

    if (initialJobId) {
      if (!selectedJob || selectedJob.id !== initialJobId) {
        console.log(`CVGEN: Effect 1 - Calling loadJob for ${initialJobId}`);
        loadJob(initialJobId);
      }
    } else {
      if (selectedJob) {
        console.log(
          "CVGEN: Effect 1 - Clearing selectedJob because no URL JobId"
        );
        setSelectedJob(null);
      }
    }
  }, [
    user,
    initialJobId,
    loadProfile,
    loadJob,
    selectedJob,
    setSelectedJob,
    profile,
    cvLoading,
  ]);

  // Effect 2: Auto-advance or reset step based on selectedJob
  useEffect(() => {
    console.log(
      `CVGEN: Effect 2 (Step Control) running. Step: ${currentStep}, Job: ${selectedJob?.id}, CVLoading: ${cvLoading}, JobsLoading: ${jobsLoading}`
    );

    if (selectedJob && currentStep === "job" && !cvLoading && !jobsLoading) {
      console.log("CVGEN: Effect 2 - Advancing to 'template' step.");
      setCurrentStep("template");
    }

    if (
      !selectedJob &&
      (currentStep === "template" || currentStep === "preview")
    ) {
      console.log(
        "CVGEN: Effect 2 - Resetting to 'job' step because job is null."
      );
      setCurrentStep("job");
    }
  }, [selectedJob, currentStep, cvLoading, jobsLoading]);

  const handleJobSelect = useCallback(
    (job: Job) => {
      console.log(`CVGEN: handleJobSelect called for Job ID: ${job.id}`);
      router.push(`/cv-generator?jobId=${job.id}`, { scroll: false });
    },
    [router]
  );

  const handleTemplateSelect = useCallback(
    (template: CVTemplate) => {
      console.log(
        `CVGEN: handleTemplateSelect called for Template ID: ${template.id}`
      );
      selectTemplate(template.id);
    },
    [selectTemplate]
  );

  const handleNext = useCallback(async () => {
    console.log(`CVGEN: handleNext called. Current Step: ${currentStep}`);
    if (currentStep === "job" && selectedJob) {
      console.log("CVGEN: handleNext - Moving job -> template");
      setCurrentStep("template");
    } else if (currentStep === "template" && selectedTemplate) {
      console.log("CVGEN: handleNext - Moving template -> preview");
      if (!generatedContent) {
        console.log("CVGEN: handleNext - Calling generateContent");
        setIsGenerating(true);
        try {
          await generateContent();
        } finally {
          setIsGenerating(false);
        }
      } else {
        console.log(
          "CVGEN: handleNext - Content already generated, skipping generation."
        );
      }
      setCurrentStep("preview");
    }
  }, [
    currentStep,
    selectedJob,
    selectedTemplate,
    generatedContent,
    generateContent,
  ]);

  const handleBack = useCallback(() => {
    console.log(`CVGEN: handleBack called. Current Step: ${currentStep}`);
    if (currentStep === "template") {
      console.log("CVGEN: handleBack - Moving template -> job");
      router.push("/cv-generator", { scroll: false });
    } else if (currentStep === "preview") {
      console.log("CVGEN: handleBack - Moving preview -> template");
      setCurrentStep("template");
    }
  }, [currentStep, router]);

  const isNextDisabled = () => {
    if (currentStep === "job" && !selectedJob) return true;
    if (currentStep === "template" && !selectedTemplate) return true;
    if (isGenerating || cvLoading || jobsLoading) return true;
    return false;
  };

  if (cvLoading && !profile) {
    console.log(
      "CVGEN: Render - Showing initial loading spinner (cvLoading && !profile)"
    );
    return <LoadingSpinner message="Daten werden geladen..." />;
  }

  if (!profile && !cvLoading) {
    console.log(
      "CVGEN: Render - No profile found after loading, showing create profile message."
    );
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

      {/* Stepper Component */}
      <Paper>
        <Stepper
          activeStep={
            currentStep === "job" ? 0 : currentStep === "template" ? 1 : 2
          }
          alternativeLabel
        >
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

      {/* Informational Alert */}
      <Alert severity="info" className="mb-6">
        Mit diesem Generator erstellst du einen ATS-optimierten Lebenslauf... Du
        kannst den generierten Text anschließend bearbeiten.
      </Alert>

      {/* Step 1: Job Selection */}
      {currentStep === "job" && (
        <Box className="mb-6">
          <Typography variant="h5" component="h2" gutterBottom>
            1. Wähle eine Stelle aus (Optional)
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Wähle eine deiner gespeicherten Stellen... allgemeinen Lebenslauf zu
            erstellen.
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
              onClick={() => setCurrentStep("template")}
            >
              Ohne Jobauswahl fortfahren
            </MuiButton>
          </Box>
        </Box>
      )}

      {/* Step 2: Template Selection */}
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

      {/* Step 3: Preview and Edit */}
      {currentStep === "preview" &&
        (() => {
          {
            console.log(
              "CVGEN: Render - Rendering Preview Step Content. Content:",
              !!generatedContent,
              "Template:",
              !!selectedTemplate,
              "Profile:",
              !!profile
            );
          }

          return (
            <Box className="mb-6">
              <Typography variant="h5" component="h2" gutterBottom>
                3. Vorschau, Bearbeiten und Download
              </Typography>
              <Typography variant="body1" color="textSecondary" paragraph>
                Überprüfe deinen generierten Lebenslauf...
              </Typography>

              {isGenerating || (cvLoading && !generatedContent) ? (
                <Box>
                  <CircularProgress />
                  <Typography sx={{ ml: 2 }}>
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
          );
        })()}

      {/* Navigation Buttons */}
      <Box className="flex justify-between mt-8">
        <MuiButton
          variant="outline"
          onClick={handleBack}
          disabled={
            currentStep === "job" || isGenerating || cvLoading || jobsLoading
          }
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
              cvLoading ||
              jobsLoading
            }
            isLoading={isGenerating}
          >
            {isGenerating ? "Generiere..." : "Weiter"}
          </MuiButton>
        ) : (
          <MuiButton
            variant="primary"
            disabled={true}
            sx={{ visibility: "hidden" }}
          >
            Weiter
          </MuiButton>
        )}
      </Box>

      <CVContentEditor />
    </div>
  );
}
