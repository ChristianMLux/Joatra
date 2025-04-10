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
  getCVTemplates,
  getJobs,
  getCVTemplate,
} from "@/lib/firebase/firebase";
import { UserProfile, CVTemplate, Job } from "@/lib/types";
import { generateCV } from "@/lib/cv/cvGenerator";
import toast from "react-hot-toast";

interface CVGeneratorContextType {
  profile: UserProfile | null;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  selectedJob: Job | null;
  setSelectedJob: React.Dispatch<React.SetStateAction<Job | null>>;
  templates: CVTemplate[];
  selectedTemplate: CVTemplate | null;
  setSelectedTemplate: React.Dispatch<React.SetStateAction<CVTemplate | null>>;
  generatedContent: any | null;
  loading: boolean;
  loadJob: (jobId: string) => Promise<void>;
  loadProfile: () => Promise<void>;
  selectTemplate: (templateId: string) => void;
  generateContent: () => Promise<void>;
}

const CVGeneratorContext = createContext<CVGeneratorContextType>({
  profile: null,
  setProfile: () => {},
  selectedJob: null,
  setSelectedJob: () => {},
  templates: [],
  selectedTemplate: null,
  setSelectedTemplate: () => {},
  generatedContent: null,
  loading: true,
  loadJob: async () => {},
  loadProfile: async () => {},
  selectTemplate: () => {},
  generateContent: async () => {},
});

export function CVGeneratorProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [templates, setTemplates] = useState<CVTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<CVTemplate | null>(
    null
  );
  const [generatedContent, setGeneratedContent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const templatesData = await getCVTemplates();
        setTemplates(templatesData);

        if (templatesData.length > 0 && !selectedTemplate) {
          setSelectedTemplate(templatesData[0]);
        }
      } catch (error) {
        console.error("Fehler beim Laden der CV-Templates:", error);
        toast.error("CV-Templates konnten nicht geladen werden");
      }
    };

    loadTemplates();
  }, [selectedTemplate]);

  const loadProfile = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const profileData = await getUserProfile(user.uid);
      setProfile(profileData);
    } catch (error) {
      console.error("Fehler beim Laden des Profils:", error);
      toast.error("Dein Profil konnte nicht geladen werden");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const loadJob = async (jobId: string) => {
    if (!user) return;

    try {
      setLoading(true);
      const job = (await getJobs(user.uid)).find((j) => j.id === jobId);

      if (!job) {
        toast.error("Stellenanzeige konnte nicht gefunden werden");
        return;
      }

      setSelectedJob(job);
    } catch (error) {
      console.error("Fehler beim Laden der Stellenanzeige:", error);
      toast.error("Stellenanzeige konnte nicht geladen werden");
    } finally {
      setLoading(false);
    }
  };

  const selectTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
    }
  };

  const generateContent = async () => {
    if (!profile || !selectedTemplate) {
      toast.error("Profil oder Template fehlt für die CV-Generierung");
      return;
    }

    try {
      setLoading(true);
      const content = generateCV(profile, selectedJob, selectedTemplate);
      setGeneratedContent(content);
    } catch (error) {
      console.error("Fehler bei der CV-Generierung:", error);
      toast.error("Lebenslauf konnte nicht generiert werden");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CVGeneratorContext.Provider
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
    </CVGeneratorContext.Provider>
  );
}

export function useCVGenerator() {
  return useContext(CVGeneratorContext);
}
