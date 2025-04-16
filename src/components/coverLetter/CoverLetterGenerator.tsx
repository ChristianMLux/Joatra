"use client";

import { useState, useEffect, useCallback } from "react";
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

import CoverLetterContentEditor from "./CoverLetterContentEditor";

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
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Lade Vorschau...</Typography>
      </Box>
    ),
  }
);

type Step = "job" | "template" | "preview";

export default function CoverLetterGenerator() {
  const { user } = useAuth();
  const { jobs, loading: jobsLoading } = useJobs();
  const {
    profile,
    selectedJob,
    setSelectedJob,
    templates,
    selectedTemplate,
    generatedContent,
    loading: providerLoading,
    loadJob,
    loadProfile,
    selectTemplate,
    generateContent,
    isEditing,
  } = useCoverLetterGenerator();

  const router = useRouter();
  const searchParams = useSearchParams();
  const initialJobId = searchParams.get("jobId");

  const [currentStep, setCurrentStep] = useState<Step>("job");
  const [isGenerating, setIsGenerating] = useState(false);

  console.log(
    `--- CL_Generator Render --- Step: ${currentStep}, Job: ${selectedJob?.id}, Template: ${selectedTemplate?.id}, URL JobId: ${initialJobId}, ProviderLoading: ${providerLoading}, JobsLoading: ${jobsLoading}`
  );

  // Effect 1: Initialize profile and load initial job based on URL
  useEffect(() => {
    console.log(
      "CL_GEN: Effect 1 (Init Profile/Job) running. User:",
      !!user,
      "URL JobId:",
      initialJobId
    );
    // Load profile only if user exists and profile isn't loaded yet
    if (user && !profile && !providerLoading) {
      loadProfile();
    }

    if (initialJobId) {
      if (!selectedJob || selectedJob.id !== initialJobId) {
        console.log(`CL_GEN: Effect 1 - Calling loadJob for ${initialJobId}`);
        loadJob(initialJobId);
      }
    } else {
      if (selectedJob) {
        console.log(
          "CL_GEN: Effect 1 - Clearing selectedJob because no URL JobId"
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
    providerLoading,
  ]);

  // Effect 2: Auto-advance or reset step based on selectedJob
  useEffect(() => {
    console.log(
      `CL_GEN: Effect 2 (Step Control) running. Step: ${currentStep}, Job: ${selectedJob?.id}, ProviderLoading: ${providerLoading}, JobsLoading: ${jobsLoading}`
    );

    // Advance from 'job' to 'template' if a job is selected and we are not loading
    if (
      selectedJob &&
      currentStep === "job" &&
      !providerLoading &&
      !jobsLoading
    ) {
      console.log("CL_GEN: Effect 2 - Advancing to 'template' step.");
      setCurrentStep("template");
    }

    // Reset to 'job' step if job becomes unselected (null) while on later steps
    if (
      !selectedJob &&
      (currentStep === "template" || currentStep === "preview")
    ) {
      console.log(
        "CL_GEN: Effect 2 - Resetting to 'job' step because job is null."
      );
      setCurrentStep("job");
    }
  }, [selectedJob, currentStep, providerLoading, jobsLoading]);

  const handleJobSelect = useCallback(
    (job: Job) => {
      console.log(`CL_GEN: handleJobSelect called for Job ID: ${job.id}`);
      router.push(`/cover-letter-generator?jobId=${job.id}`, { scroll: false });
    },
    [router]
  );

  const handleTemplateSelect = useCallback(
    (template: any) => {
      console.log(
        `CL_GEN: handleTemplateSelect called for Template ID: ${template.id}`
      );
      selectTemplate(template.id);
    },
    [selectTemplate]
  );

  const handleNext = useCallback(async () => {
    console.log(`CL_GEN: handleNext called. Current Step: ${currentStep}`);
    if (currentStep === "job" && selectedJob) {
      console.log("CL_GEN: handleNext - Moving job -> template");
      setCurrentStep("template");
    } else if (currentStep === "template" && selectedTemplate) {
      console.log("CL_GEN: handleNext - Moving template -> preview");
      if (!generatedContent) {
        console.log("CL_GEN: handleNext - Calling generateContent");
        setIsGenerating(true);
        try {
          await generateContent();
        } finally {
          setIsGenerating(false);
        }
      } else {
        console.log(
          "CL_GEN: handleNext - Content already generated, skipping generation."
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
    console.log(`CL_GEN: handleBack called. Current Step: ${currentStep}`);
    if (currentStep === "template") {
      console.log("CL_GEN: handleBack - Moving template -> job");
      router.push("/cover-letter-generator", { scroll: false });
    } else if (currentStep === "preview") {
      console.log("CL_GEN: handleBack - Moving preview -> template");
      setCurrentStep("template");
    }
  }, [currentStep, router]);

  const isNextDisabled = () => {
    if (currentStep === "template" && !selectedTemplate) return true;
    if (isGenerating || providerLoading || jobsLoading) return true;
    return false;
  };

  if (providerLoading && !profile) {
    console.log(
      "CL_GEN: Render - Showing initial loading spinner (providerLoading && !profile)"
    );
    return <LoadingSpinner message="Daten werden geladen..." />;
  }

  if (!profile && !providerLoading) {
    console.log(
      "CL_GEN: Render - No profile found after loading, showing create profile message."
    );
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

  return (
    <div className="max-w-6xl mx-auto">
      <Title text="Anschreiben-Generator" className="mb-6" />

      {/* Stepper Component */}
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
        Mit diesem Generator erstellst du ein ATS-optimiertes Anschreiben... Du
        kannst den generierten Text anschließend bearbeiten.
      </Alert>

      {/* Step 1: Job Selection */}
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

      {/* Step 3: Preview and Edit */}
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
            <Box>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>
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

      {/* Navigation Buttons */}
      <Box className="flex justify-between mt-8">
        <MuiButton
          variant="outline"
          onClick={handleBack}
          disabled={
            currentStep === "job" ||
            isGenerating ||
            providerLoading ||
            jobsLoading
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
              providerLoading ||
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

      {/* Render the Editor Modal */}
      <CoverLetterContentEditor />
    </div>
  );
}
