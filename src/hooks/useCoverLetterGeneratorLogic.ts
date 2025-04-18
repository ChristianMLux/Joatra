import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCoverLetterGenerator } from "@/providers/CoverLetterGeneratorProvider";
import { Job, UserProfile } from "@/lib/types";
import toast from "react-hot-toast";

// Definiere den Typ für CoverLetterTemplate lokal oder importiere ihn
interface CoverLetterTemplate {
  id: string;
  name: string;
  description: string;
  language: "de" | "en";
  style: "formal" | "modern" | "creative";
  atsOptimized: boolean;
  din5008Compliant?: boolean;
}

type Step = "job" | "template" | "preview";

interface UseCoverLetterGeneratorLogicReturn {
  currentStep: Step;
  isGenerating: boolean;
  profile: UserProfile | null;
  selectedJob: Job | null;
  templates: CoverLetterTemplate[];
  selectedTemplate: CoverLetterTemplate | null;
  generatedContent: any | null;
  isEditing: boolean;
  providerLoading: boolean;
  handleJobSelect: (job: Job) => void;
  handleTemplateSelect: (template: CoverLetterTemplate) => void;
  handleNext: () => Promise<void>;
  handleBack: () => void;
  handleSkipJobSelection: () => void;
}

export function useCoverLetterGeneratorLogic(): UseCoverLetterGeneratorLogicReturn {
  const {
    profile,
    selectedJob,
    setSelectedJob,
    templates,
    selectedTemplate,
    generatedContent,
    loading: providerLoading,
    loadJob,
    loadProfile, // Wird aktuell nicht direkt im Hook aufgerufen
    selectTemplate,
    generateContent,
    isEditing,
  } = useCoverLetterGenerator();

  const [currentStep, setCurrentStep] = useState<Step>("job");
  const [isGenerating, setIsGenerating] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const initialJobId = searchParams.get("jobId");

  // Effekt: Job laden basierend auf URL
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
    if (selectedJob && currentStep === "job" && !providerLoading) {
      setCurrentStep("template");
    }
    if (
      !selectedJob &&
      (currentStep === "template" || currentStep === "preview")
    ) {
      setCurrentStep("job");
    }
  }, [selectedJob, currentStep, providerLoading]);

  // Callbacks für UI-Interaktionen
  const handleJobSelect = useCallback(
    (job: Job) => {
      router.push(`/cover-letter-generator?jobId=${job.id}`, { scroll: false });
    },
    [router]
  );

  const handleTemplateSelect = useCallback(
    (template: CoverLetterTemplate) => {
      selectTemplate(template.id);
    },
    [selectTemplate]
  );

  const handleNext = useCallback(async () => {
    if (currentStep === "job") {
      setCurrentStep("template");
    } else if (currentStep === "template" && selectedTemplate) {
      if (!generatedContent) {
        setIsGenerating(true);
        try {
          await generateContent();
        } catch (error) {
          toast.error("Fehler beim Generieren des Anschreibens.");
        } finally {
          setIsGenerating(false);
        }
      }
      setCurrentStep("preview");
    }
  }, [currentStep, selectedTemplate, generatedContent, generateContent]);

  const handleBack = useCallback(() => {
    if (currentStep === "template") {
      router.push("/cover-letter-generator", { scroll: false });
    } else if (currentStep === "preview") {
      setCurrentStep("template");
    }
  }, [currentStep, router]);

  const handleSkipJobSelection = useCallback(() => {
    setSelectedJob(null);
    router.push("/cover-letter-generator", { scroll: false });
    setCurrentStep("template");
  }, [router, setSelectedJob]);

  return {
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
  };
}
