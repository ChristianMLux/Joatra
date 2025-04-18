import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCVGenerator } from "@/providers/CVGeneratorProvider";
import { Job, CVTemplate, UserProfile } from "@/lib/types";
import toast from "react-hot-toast";

type Step = "job" | "template" | "preview";

interface UseCVGeneratorLogicReturn {
  currentStep: Step;
  isGenerating: boolean;
  profile: UserProfile | null;
  selectedJob: Job | null;
  templates: CVTemplate[];
  selectedTemplate: CVTemplate | null;
  generatedContent: any | null;
  isEditing: boolean;
  cvLoading: boolean;
  handleJobSelect: (job: Job) => void;
  handleTemplateSelect: (template: CVTemplate) => void;
  handleNext: () => Promise<void>;
  handleBack: () => void;
}

export function useCVGeneratorLogic(): UseCVGeneratorLogicReturn {
  const {
    profile,
    selectedJob,
    setSelectedJob,
    templates,
    selectedTemplate,
    generatedContent,
    loading: cvLoading,
    loadJob,
    loadProfile, // Wird aktuell nicht direkt im Hook aufgerufen, aber im Context
    selectTemplate,
    generateContent,
    isEditing,
  } = useCVGenerator();

  const [currentStep, setCurrentStep] = useState<Step>("job");
  const [isGenerating, setIsGenerating] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const initialJobId = searchParams.get("jobId");

  // Effekt: Job laden basierend auf URL-Parameter
  useEffect(() => {
    if (initialJobId) {
      if (!selectedJob || selectedJob.id !== initialJobId) {
        loadJob(initialJobId);
      }
    } else {
      if (selectedJob) {
        setSelectedJob(null);
        setCurrentStep("job");
      }
    }
  }, [initialJobId, selectedJob, loadJob, setSelectedJob]);

  // Effekt: Schrittsteuerung basierend auf Auswahl
  useEffect(() => {
    if (selectedJob && currentStep === "job" && !cvLoading) {
      setCurrentStep("template");
    }
    if (
      !selectedJob &&
      (currentStep === "template" || currentStep === "preview")
    ) {
      setCurrentStep("job");
    }
  }, [selectedJob, currentStep, cvLoading]);

  // Callbacks für UI-Interaktionen
  const handleJobSelect = useCallback(
    (job: Job) => {
      router.push(`/cv-generator?jobId=${job.id}`, { scroll: false });
    },
    [router]
  );

  const handleTemplateSelect = useCallback(
    (template: CVTemplate) => {
      selectTemplate(template.id);
    },
    [selectTemplate]
  );

  const handleNext = useCallback(async () => {
    if (currentStep === "job") {
      setCurrentStep("template");
    } else if (currentStep === "template" && selectedTemplate) {
      if (!generatedContent) {
        // Nur generieren, wenn noch kein Inhalt da ist
        setIsGenerating(true);
        try {
          await generateContent();
        } catch (error) {
          toast.error("Fehler beim Generieren des Lebenslaufs.");
        } finally {
          setIsGenerating(false);
        }
      }
      setCurrentStep("preview");
    }
  }, [currentStep, selectedTemplate, generatedContent, generateContent]);

  const handleBack = useCallback(() => {
    if (currentStep === "template") {
      router.push("/cv-generator", { scroll: false });
    } else if (currentStep === "preview") {
      setCurrentStep("template");
    }
  }, [currentStep, router]);

  return {
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
  };
}
