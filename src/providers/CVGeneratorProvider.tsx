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
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  updateGeneratedContent: (newContent: any) => void;
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
  isEditing: false,
  setIsEditing: () => {},
  updateGeneratedContent: () => {},
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
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    let isMounted = true;
    console.log("PROVIDER: Initial Data useEffect running");
    const loadInitialData = async () => {
      try {
        const templatesData = await getCVTemplates();
        if (isMounted) {
          setTemplates(templatesData);
          console.log("PROVIDER: Templates loaded", templatesData.length);
        }
      } catch (error) {
        console.error("PROVIDER: Fehler beim Laden der Templates:", error);
        toast.error("CV-Templates konnten nicht geladen werden");
      } finally {
      }
    };

    loadInitialData();
    return () => {
      isMounted = false;
    };
  }, []);

  const loadProfile = useCallback(async () => {
    let isMounted = true;
    console.log("PROVIDER: loadProfile called. User:", !!user);
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const profileData = await getUserProfile(user.uid);
      if (isMounted) {
        setProfile(profileData);
        console.log("PROVIDER: Profile loaded:", !!profileData);
      }
    } catch (error) {
      console.error("PROVIDER: Fehler beim Laden des Profils:", error);
      toast.error("Dein Profil konnte nicht geladen werden");
      if (isMounted) setProfile(null);
    } finally {
      if (isMounted) setLoading(false);
    }
  }, [user]);

  const loadJob = useCallback(
    async (jobId: string) => {
      let isMounted = true;
      console.log(`PROVIDER: loadJob called for ID: ${jobId}. User:`, !!user);
      if (!user) return;
      try {
        const allJobs = await getJobs(user.uid);
        const job = allJobs.find((j) => j.id === jobId);

        if (!job) {
          toast.error("Stellenanzeige konnte nicht gefunden werden");
          if (isMounted) setSelectedJob(null);
        } else {
          console.log("PROVIDER: Job found, setting selectedJob:", job.id);
          if (isMounted) {
            setSelectedJob(job);
            setGeneratedContent(null);
            setIsEditing(false);
          }
        }
      } catch (error) {
        console.error("PROVIDER: Fehler beim Laden der Stellenanzeige:", error);
        toast.error("Stellenanzeige konnte nicht geladen werden");
        if (isMounted) setSelectedJob(null);
      } finally {
      }
    },
    [user]
  );

  useEffect(() => {
    console.log("PROVIDER: Triggering loadProfile on user change/mount.");
    loadProfile();
  }, [loadProfile]);

  const selectTemplate = useCallback(
    (templateId: string) => {
      console.log(`PROVIDER: selectTemplate called for ID: ${templateId}`);
      const template = templates.find((t) => t.id === templateId);
      if (template) {
        setSelectedTemplate(template);
        setGeneratedContent(null);
        setIsEditing(false);
        console.log("PROVIDER: Template selected:", template.id);
      } else {
        console.warn(`PROVIDER: Template with ID ${templateId} not found.`);
      }
    },
    [templates]
  );

  const generateContent = useCallback(async () => {
    console.log("PROVIDER: generateContent called.");
    if (!profile || !selectedTemplate) {
      toast.error("Profil oder Template fehlt für die CV-Generierung");
      console.error("PROVIDER: generateContent - Missing profile or template.");
      return;
    }

    setLoading(true);
    setGeneratedContent(null);
    setIsEditing(false);
    try {
      const content = await generateCV(profile, selectedJob, selectedTemplate);
      setGeneratedContent(content);
      console.log("PROVIDER: Content generated successfully.");
      toast.success("Lebenslauf erfolgreich generiert!");
    } catch (error) {
      console.error("PROVIDER: Fehler bei der CV-Generierung:", error);
      toast.error("Lebenslauf konnte nicht generiert werden.");
      setGeneratedContent(null);
    } finally {
      setLoading(false);
    }
  }, [profile, selectedJob, selectedTemplate]);

  const updateGeneratedContent = useCallback((newContent: any) => {
    console.log("PROVIDER: updateGeneratedContent called.");
    setGeneratedContent(newContent);
    setIsEditing(false);
    toast.success("Änderungen am Lebenslauf gespeichert.");
  }, []);

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
        isEditing,
        setIsEditing,
        updateGeneratedContent,
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
