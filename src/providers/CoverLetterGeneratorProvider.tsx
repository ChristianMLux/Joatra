"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useAuth } from "./AuthProvider";
import {
  getUserProfile,
  getCoverLetterTemplates,
  getJobs,
} from "@/lib/firebase/firebase";
import { UserProfile, Job } from "@/lib/types";
import toast from "react-hot-toast";
import { generateCoverLetterAction } from "@/app/actions/coverLetterActions";

interface CoverLetterTemplate {
  id: string;
  name: string;
  description: string;
  language: "de" | "en";
  style: "formal" | "modern" | "creative";
  atsOptimized: boolean;
  din5008Compliant?: boolean;
}

interface CoverLetterGeneratorContextType {
  profile: UserProfile | null;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  selectedJob: Job | null;
  setSelectedJob: React.Dispatch<React.SetStateAction<Job | null>>;
  templates: CoverLetterTemplate[];
  selectedTemplate: CoverLetterTemplate | null;
  setSelectedTemplate: React.Dispatch<
    React.SetStateAction<CoverLetterTemplate | null>
  >;
  generatedContent: any | null;
  loading: boolean;
  loadJob: (jobId: string) => Promise<void>;
  loadProfile: () => Promise<void>;
  selectTemplate: (templateId: string) => void;
  generateContent: () => Promise<void>;
}

const defaultTemplates: CoverLetterTemplate[] = [
  {
    id: "formal-de",
    name: "Formales Anschreiben (Deutsch)",
    description:
      "Standard-Anschreiben nach DIN 5008 Norm für deutsche Bewerbungen",
    language: "de",
    style: "formal",
    atsOptimized: true,
    din5008Compliant: true,
  },
  {
    id: "modern-de",
    name: "Modernes Anschreiben (Deutsch)",
    description:
      "Zeitgemäßes Anschreiben mit klarer Struktur und modernem Layout",
    language: "de",
    style: "modern",
    atsOptimized: true,
    din5008Compliant: true,
  },
  {
    id: "formal-en",
    name: "Formal Cover Letter (English)",
    description: "Standard cover letter format for international applications",
    language: "en",
    style: "formal",
    atsOptimized: true,
  },
  {
    id: "creative-en",
    name: "Creative Cover Letter (English)",
    description:
      "Stand out with a unique but professional cover letter for creative positions",
    language: "en",
    style: "creative",
    atsOptimized: true,
  },
];

const CoverLetterGeneratorContext =
  createContext<CoverLetterGeneratorContextType>({
    profile: null,
    setProfile: () => {},
    selectedJob: null,
    setSelectedJob: () => {},
    templates: defaultTemplates,
    selectedTemplate: null,
    setSelectedTemplate: () => {},
    generatedContent: null,
    loading: true,
    loadJob: async () => {},
    loadProfile: async () => {},
    selectTemplate: () => {},
    generateContent: async () => {},
  });

export function CoverLetterGeneratorProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [templates, setTemplates] =
    useState<CoverLetterTemplate[]>(defaultTemplates);
  const [selectedTemplate, setSelectedTemplate] =
    useState<CoverLetterTemplate | null>(null);
  const [generatedContent, setGeneratedContent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTemplates = async () => {
      console.log("Provider: Loading templates...");
      try {
        const templatesData = await getCoverLetterTemplates();
        if (templatesData && templatesData.length > 0) {
          console.log("Provider: Templates loaded from Firestore.");
          setTemplates(templatesData);
        } else {
          console.warn(
            "Provider: No templates from Firestore, using defaults."
          );
          setTemplates(defaultTemplates);
        }
      } catch (error) {
        console.error(
          "Provider: Fehler beim Laden der Anschreiben-Templates:",
          error
        );
        toast.error(
          "Anschreiben-Templates konnten nicht geladen werden. Nutze Fallback."
        );
        setTemplates(defaultTemplates);
      }
    };
    loadTemplates();
  }, []);

  const loadProfile = useCallback(async () => {
    console.log("Provider: loadProfile called", { userId: user?.uid });
    if (!user) {
      setProfile(null);
      setLoading(false);
      console.log("Provider: No user, profile set to null, loading false.");
      return;
    }
    setLoading(true);
    try {
      const profileData = await getUserProfile(user.uid);
      console.log("Provider: Fetched profile data:", profileData);
      setProfile(profileData);
    } catch (error) {
      console.error("Provider: Fehler beim Laden des Profils:", error);
      toast.error("Dein Profil konnte nicht geladen werden");
      setProfile(null);
    } finally {
      console.log("Provider: Finished loading profile, loading false.");
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const loadJob = async (jobId: string) => {
    console.log("Provider: loadJob called", { jobId });
    if (!user) return;
    try {
      const allJobs = await getJobs(user.uid);
      const job = allJobs.find((j) => j.id === jobId);

      if (!job) {
        toast.error("Stellenanzeige konnte nicht gefunden werden");
        setSelectedJob(null);
        return;
      }
      console.log("Provider: Job found:", job);
      setSelectedJob(job);
    } catch (error) {
      console.error("Provider: Fehler beim Laden der Stellenanzeige:", error);
      toast.error("Stellenanzeige konnte nicht geladen werden");
      setSelectedJob(null);
    }
  };

  const selectTemplate = (templateId: string) => {
    console.log("Provider: selectTemplate called", { templateId });
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      console.log("Provider: Template selected:", template);
      setSelectedTemplate(template);
      setGeneratedContent(null);
    } else {
      console.warn("Provider: Template ID not found:", templateId);
    }
  };

  const generateContent = async () => {
    console.log("Provider: generateContent called");
    if (!profile || !selectedTemplate) {
      toast.error("Profil oder Template fehlt für die Anschreiben-Generierung");
      console.error("Provider: generateContent - Missing profile or template", {
        profile,
        selectedTemplate,
      });
      return;
    }

    const payload = {
      profileData: profile,
      jobData: selectedJob,
      templateData: {
        language: selectedTemplate.language,
        style: selectedTemplate.style,
        din5008Compliant: selectedTemplate.din5008Compliant,
      },
    };

    console.log(
      "Provider: Calling generateCoverLetterAction with payload:",
      payload
    );
    setGeneratedContent(null);

    try {
      const result = await generateCoverLetterAction(payload);
      console.log("Provider: Received result from Server Action:", result);

      if (result.success && result.content) {
        setGeneratedContent(result.content);
        toast.success("Anschreiben erfolgreich generiert!");
      } else {
        toast.error(
          result.error || "Anschreiben konnte nicht generiert werden."
        );
        setGeneratedContent(null);
      }
    } catch (error) {
      console.error(
        "Provider: Fehler bei der Anschreiben-Generierung (Server Action Call):",
        error
      );
      toast.error("Ein unerwarteter Fehler ist aufgetreten.");
      setGeneratedContent(null);
    } finally {
    }
  };

  return (
    <CoverLetterGeneratorContext.Provider
      value={{
        profile,
        setProfile,
        selectedJob,
        setSelectedJob,
        templates,
        selectedTemplate,
        setSelectedTemplate,
        generatedContent,
        loading,
        loadJob,
        loadProfile,
        selectTemplate,
        generateContent,
      }}
    >
      {children}
    </CoverLetterGeneratorContext.Provider>
  );
}

export function useCoverLetterGenerator() {
  return useContext(CoverLetterGeneratorContext);
}
